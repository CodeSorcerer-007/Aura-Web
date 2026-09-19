import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { authRouter } from './routes/auth.js';
import { syncRouter } from './routes/sync.js';
import { rateLimit } from './middleware/rateLimit.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration (allow specific origins in production, or fallback to *)
const allowedOrigin = process.env.ALLOWED_ORIGIN || '*';
app.use(cors({
    origin: allowedOrigin === '*' ? '*' : allowedOrigin.split(',').map(s => s.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser with 5MB limit
app.use(express.json({ limit: '5mb' }));

// Rate Limiters
const authLimiter = rateLimit(15, 60000);  // 15 requests per minute for auth
const syncLimiter = rateLimit(60, 60000);  // 60 requests per minute for sync

// Health Check
const healthHandler = (req, res) => {
    res.json({
        status: 'healthy',
        app: 'Aura Cloud Sync Engine',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
};
app.get('/api/health', healthHandler);
app.get('/api/v1/health', healthHandler);
app.get('/health', healthHandler);
app.get('/v1/health', healthHandler);

// API v1 Routes
app.use('/api/v1/auth', authLimiter, authRouter);
app.use('/api/v1/sync', syncLimiter, syncRouter);
app.use('/v1/auth', authLimiter, authRouter);
app.use('/v1/sync', syncLimiter, syncRouter);

// Backward-compatibility and direct serverless routes
app.use('/api/auth', authLimiter, authRouter);
app.use('/api/sync', syncLimiter, syncRouter);
app.use('/auth', authLimiter, authRouter);
app.use('/sync', syncLimiter, syncRouter);

// Serve static frontend files in production if dist/ exists (standalone server)
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
    app.use(express.static(distPath));
    app.use((req, res, next) => {
        if (req.path.startsWith('/api')) return next();
        res.sendFile(path.join(distPath, 'index.html'));
    });
}

// Start server if executed directly
if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🌌 Aura Cloud Backend running on http://localhost:${PORT}`);
        console.log(`   Health check: http://localhost:${PORT}/api/v1/health`);
    });
}

export default app;

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/adapter.js';

export const authRouter = express.Router();

if (process.env.NODE_ENV === 'production' && !process.env.JWT_SECRET) {
    throw new Error('FATAL: JWT_SECRET environment variable must be set in production mode.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'aura-mindful-sanctuary-secret-key-2026';

// Middleware to authenticate JWT token
export const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await db.getUserById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'User not found or session expired' });
        }
        req.user = { id: user.id, username: user.username };
        next();
    } catch {
        return res.status(403).json({ error: 'Invalid or expired token' });
    }
};

// POST /api/auth/register
authRouter.post('/register', async (req, res) => {
    try {
        const { username, password, securityQuestion, securityAnswer } = req.body;

        if (!username || typeof username !== 'string' || username.trim().length < 3) {
            return res.status(400).json({ error: 'Username must be at least 3 characters long' });
        }
        if (!password || typeof password !== 'string' || password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters long' });
        }

        const cleanUsername = username.trim();
        const existing = await db.getUserByUsername(cleanUsername);
        if (existing) {
            return res.status(409).json({ error: 'Username is already taken. Please choose another or sign in.' });
        }

        const passwordHash = await bcrypt.hash(password, 10);
        
        let securityAnswerHash = '';
        if (securityAnswer && typeof securityAnswer === 'string') {
            securityAnswerHash = await bcrypt.hash(securityAnswer.trim().toLowerCase(), 10);
        }

        const userId = `aura_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        const newUser = await db.createUser({
            id: userId,
            username: cleanUsername,
            passwordHash,
            securityQuestion: securityQuestion || 'What is your secret sanctuary word?',
            securityAnswerHash
        });

        const token = jwt.sign(
            { id: newUser.id, username: newUser.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.status(201).json({
            message: 'Welcome to Aura!',
            token,
            user: {
                id: newUser.id,
                username: newUser.username,
                createdAt: newUser.createdAt
            }
        });
    } catch (err) {
        console.error('Registration error:', err);
        return res.status(500).json({ error: 'Failed to create account. Please try again.' });
    }
});

// POST /api/auth/login
authRouter.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        const user = await db.getUserByUsername(username.trim());
        if (!user) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        return res.json({
            message: 'Signed in successfully',
            token,
            user: {
                id: user.id,
                username: user.username,
                createdAt: user.createdAt
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        return res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

// GET /api/auth/me
authRouter.get('/me', authenticateToken, async (req, res) => {
    return res.json({
        user: req.user
    });
});

// POST /api/auth/forgot-password/get-question
authRouter.post('/forgot-password/get-question', async (req, res) => {
    try {
        const { username } = req.body;
        if (!username) {
            return res.status(400).json({ error: 'Please provide your username' });
        }

        const user = await db.getUserByUsername(username.trim());
        if (!user) {
            return res.status(404).json({ error: 'No account found with this username' });
        }

        return res.json({
            username: user.username,
            securityQuestion: user.securityQuestion || 'What is your secret sanctuary word?'
        });
    } catch (err) {
        console.error('Get security question error:', err);
        return res.status(500).json({ error: 'Unable to process request' });
    }
});

// POST /api/auth/forgot-password/reset
authRouter.post('/forgot-password/reset', async (req, res) => {
    try {
        const { username, securityAnswer, newPassword } = req.body;

        if (!username || !securityAnswer || !newPassword) {
            return res.status(400).json({ error: 'Username, security answer, and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters long' });
        }

        const user = await db.getUserByUsername(username.trim());
        if (!user) {
            return res.status(404).json({ error: 'Account not found' });
        }

        if (!user.securityAnswerHash) {
            return res.status(400).json({ error: 'No recovery answer was set for this account. Please reach out for assistance.' });
        }

        const isAnswerCorrect = await bcrypt.compare(securityAnswer.trim().toLowerCase(), user.securityAnswerHash);
        if (!isAnswerCorrect) {
            return res.status(403).json({ error: 'Incorrect answer to the security question. Please try again.' });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await db.updateUserPassword(user.id, newPasswordHash);

        return res.json({
            message: 'Password reset successfully. You can now sign in with your new password.'
        });
    } catch (err) {
        console.error('Password reset error:', err);
        return res.status(500).json({ error: 'Failed to reset password' });
    }
});

// POST /api/auth/change-password (Authenticated)
authRouter.post('/change-password', authenticateToken, async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ error: 'Current password and new password are required' });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: 'New password must be at least 6 characters' });
        }

        const user = await db.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isValid) {
            return res.status(401).json({ error: 'Current password is incorrect' });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        await db.updateUserPassword(user.id, newPasswordHash);

        return res.json({ message: 'Password updated successfully.' });
    } catch (err) {
        console.error('Change password error:', err);
        return res.status(500).json({ error: 'Failed to update password' });
    }
});

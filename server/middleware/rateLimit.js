// --- Lightweight In-Memory Rate Limiter with LRU Memory Bounding ---

const ipBuckets = new Map();
const MAX_BUCKETS = 5000;

// Periodic cleanup of stale entries every 60 seconds
setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of ipBuckets.entries()) {
        bucket.timestamps = bucket.timestamps.filter(ts => now - ts < 120000);
        if (bucket.timestamps.length === 0) {
            ipBuckets.delete(key);
        }
    }
}, 60000);

/**
 * Creates a rate-limiting middleware.
 * @param {number} maxRequests - Maximum number of requests allowed within the window.
 * @param {number} windowMs - Time window in milliseconds.
 * @returns Express middleware
 */
export const rateLimit = (maxRequests = 10, windowMs = 60000) => {
    return (req, res, next) => {
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
        const key = `${ip}:${maxRequests}:${windowMs}`;
        const now = Date.now();

        // Enforce maximum bucket capacity to protect against memory exhaustion
        if (!ipBuckets.has(key) && ipBuckets.size >= MAX_BUCKETS) {
            const oldestKey = ipBuckets.keys().next().value;
            if (oldestKey) ipBuckets.delete(oldestKey);
        }

        if (!ipBuckets.has(key)) {
            ipBuckets.set(key, { timestamps: [] });
        }

        const bucket = ipBuckets.get(key);
        // Remove timestamps outside the window
        bucket.timestamps = bucket.timestamps.filter(ts => now - ts < windowMs);

        if (bucket.timestamps.length >= maxRequests) {
            const retryAfter = Math.ceil((bucket.timestamps[0] + windowMs - now) / 1000);
            res.set('Retry-After', String(retryAfter));
            return res.status(429).json({
                error: 'Too many requests. Please wait before trying again.',
                retryAfter
            });
        }

        bucket.timestamps.push(now);
        next();
    };
};

import express from 'express';
import { db } from '../db/adapter.js';
import { authenticateToken } from './auth.js';

export const syncRouter = express.Router();

// GET /api/sync/pull — Retrieve all user data from cloud
syncRouter.get('/pull', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const cloudData = await db.getUserData(userId);

        if (!cloudData) {
            return res.json({
                isNewUser: true,
                data: null,
                message: 'No cloud data found for this account yet.'
            });
        }

        return res.json({
            isNewUser: false,
            data: cloudData,
            lastSyncedAt: cloudData.lastSyncedAt || null
        });
    } catch (err) {
        console.error('Error pulling cloud data:', err);
        return res.status(500).json({ error: 'Failed to retrieve cloud data' });
    }
});

// POST /api/sync/push — Save and sync all user data to cloud
syncRouter.post('/push', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const payload = req.body;
        if (!payload || typeof payload !== 'object') {
            return res.status(400).json({ error: 'Invalid data payload' });
        }

        // Conflict detection: if cloud has newer data than client's last known sync, reject unless forced
        const existingCloudData = await db.getUserData(userId);
        if (existingCloudData && existingCloudData.lastSyncedAt && !req.query.force) {
            const clientUpdatedAt = payload.clientUpdatedAt || payload.lastSyncedAt;
            if (clientUpdatedAt) {
                const clientTime = new Date(clientUpdatedAt).getTime();
                const serverTime = new Date(existingCloudData.lastSyncedAt).getTime();
                if (serverTime - clientTime > 5000) {
                    return res.status(409).json({
                        error: 'Conflict detected: Server has newer data.',
                        conflict: true,
                        serverLastSyncedAt: existingCloudData.lastSyncedAt,
                        cloudData: existingCloudData
                    });
                }
            }
        }

        // Clean and structured storage of all 100% Aura feature states
        const cleanedData = {
            clientUpdatedAt: payload.clientUpdatedAt || new Date().toISOString(),
            tasks: Array.isArray(payload.tasks) ? payload.tasks : [],
            templates: Array.isArray(payload.templates) ? payload.templates : [],
            stats: payload.stats && typeof payload.stats === 'object' ? payload.stats : {},
            unlockedAchievements: Array.isArray(payload.unlockedAchievements) ? payload.unlockedAchievements : [],
            grove: Array.isArray(payload.grove) ? payload.grove : [],
            customCategories: payload.customCategories && typeof payload.customCategories === 'object' ? payload.customCategories : {},
            journalEntries: Array.isArray(payload.journalEntries) ? payload.journalEntries : [],
            settings: {
                shutdownTime: payload.settings?.shutdownTime || '21:00',
                soundEffectsEnabled: payload.settings?.soundEffectsEnabled ?? true,
                autoArchiveEnabled: payload.settings?.autoArchiveEnabled ?? true,
                notificationsEnabled: payload.settings?.notificationsEnabled ?? false,
                hasLaunched: payload.settings?.hasLaunched ?? true
            },
            theme: {
                currentTheme: payload.theme?.currentTheme || 'aura',
                customThemes: Array.isArray(payload.theme?.customThemes) ? payload.theme.customThemes : []
            },
            version: '2.0.0',
            lastUpdatedBy: req.user.username
        };

        const saved = await db.saveUserData(userId, cleanedData);

        return res.json({
            success: true,
            lastSyncedAt: saved.lastSyncedAt
        });
    } catch (err) {
        console.error('Error pushing data to cloud:', err);
        return res.status(500).json({ error: 'Failed to save cloud sync' });
    }
});

// POST /api/sync/migrate — Upload initial local guest data into new cloud account
syncRouter.post('/migrate', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const localData = req.body;

        const existingCloudData = await db.getUserData(userId);
        
        // If user already has cloud data, don't accidentally overwrite unless explicitly asked
        if (existingCloudData && !req.query.force) {
            return res.json({
                alreadyHasCloudData: true,
                message: 'Account already has cloud data. Keeping existing cloud state.'
            });
        }

        const saved = await db.saveUserData(userId, localData);
        return res.json({
            success: true,
            message: 'Local journey migrated to cloud successfully!',
            lastSyncedAt: saved.lastSyncedAt
        });
    } catch (err) {
        console.error('Error migrating data:', err);
        return res.status(500).json({ error: 'Failed to migrate local data' });
    }
});

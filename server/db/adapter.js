import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = process.env.VERCEL
    ? path.join('/tmp', 'aura_data')
    : (process.env.DATA_DIR || path.join(__dirname, '..', 'data'));
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const USER_DATA_DIR = path.join(DATA_DIR, 'userdata');

// Ensure data directories exist
const ensureDirectories = () => {
    try {
        if (!fs.existsSync(DATA_DIR)) {
            fs.mkdirSync(DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(USER_DATA_DIR)) {
            fs.mkdirSync(USER_DATA_DIR, { recursive: true });
        }
        if (!fs.existsSync(USERS_FILE)) {
            fs.writeFileSync(USERS_FILE, JSON.stringify([], null, 2), 'utf8');
        }
    } catch (err) {
        console.warn('ensureDirectories warning:', err.message);
    }
};

ensureDirectories();

// In-memory cache for speed with disk persistence
let usersCache = null;

const loadUsers = () => {
    try {
        ensureDirectories();
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        usersCache = JSON.parse(data || '[]');
        return usersCache;
    } catch (err) {
        console.error('Error loading users file:', err);
        return [];
    }
};

const saveUsers = (users) => {
    try {
        ensureDirectories();
        usersCache = users;
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
        return true;
    } catch (err) {
        console.error('Error saving users file:', err);
        return false;
    }
};

// --- Universal Database Adapter API ---
export const db = {
    async getUserByUsername(username) {
        if (!username) return null;
        const users = loadUsers();
        const normalized = username.trim().toLowerCase();
        return users.find(u => u.username.toLowerCase() === normalized) || null;
    },

    async getUserById(id) {
        if (!id) return null;
        const users = loadUsers();
        return users.find(u => u.id === id) || null;
    },

    async createUser({ id, username, passwordHash, securityQuestion, securityAnswerHash }) {
        const users = loadUsers();
        const newUser = {
            id,
            username: username.trim(),
            passwordHash,
            securityQuestion: securityQuestion || 'What is your secret sanctuary word?',
            securityAnswerHash: securityAnswerHash || '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        users.push(newUser);
        saveUsers(users);
        return newUser;
    },

    async updateUserPassword(id, newPasswordHash) {
        const users = loadUsers();
        const userIndex = users.findIndex(u => u.id === id);
        if (userIndex === -1) return false;
        users[userIndex].passwordHash = newPasswordHash;
        users[userIndex].updatedAt = new Date().toISOString();
        return saveUsers(users);
    },

    async getUserData(userId) {
        try {
            ensureDirectories();
            if (!userId || typeof userId !== 'string') return null;
            const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
            if (!safeUserId) return null;

            const filePath = path.resolve(USER_DATA_DIR, `${safeUserId}.json`);
            if (!filePath.startsWith(path.resolve(USER_DATA_DIR))) {
                throw new Error('Path traversal attempt detected');
            }

            if (!fs.existsSync(filePath)) {
                return null;
            }
            const raw = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(raw);
        } catch (err) {
            console.error(`Error reading data for user ${userId}:`, err);
            return null;
        }
    },

    async saveUserData(userId, dataPayload) {
        try {
            ensureDirectories();
            if (!userId || typeof userId !== 'string') return null;
            const safeUserId = userId.replace(/[^a-zA-Z0-9_-]/g, '');
            if (!safeUserId) return null;

            const filePath = path.resolve(USER_DATA_DIR, `${safeUserId}.json`);
            if (!filePath.startsWith(path.resolve(USER_DATA_DIR))) {
                throw new Error('Path traversal attempt detected');
            }

            const payload = {
                ...dataPayload,
                lastSyncedAt: new Date().toISOString()
            };
            fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
            return payload;
        } catch (err) {
            console.error(`Error saving data for user ${userId}:`, err);
            return null;
        }
    }
};

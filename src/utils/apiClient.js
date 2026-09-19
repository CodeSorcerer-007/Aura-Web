// --- Unified API Client for Aura Cloud ---

const TOKEN_KEY = 'aura_auth_token';
const API_BASE = '/api/v1';

export const getStoredToken = () => {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
};

export const setStoredToken = (token) => {
    try {
        if (token) {
            localStorage.setItem(TOKEN_KEY, token);
        } else {
            localStorage.removeItem(TOKEN_KEY);
        }
    } catch (e) {
        console.error('Error saving auth token:', e);
    }
};

const request = async (endpoint, options = {}) => {
    const token = getStoredToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        ...options.headers
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            const errorMsg = data.error || data.message || `Request failed (${response.status})`;
            const err = new Error(errorMsg);
            err.status = response.status;
            err.data = data;
            throw err;
        }

        return data;
    } catch (err) {
        if (err.name === 'TypeError' && err.message.includes('fetch')) {
            const networkErr = new Error('Cannot reach server. You may be offline.');
            networkErr.isOffline = true;
            throw networkErr;
        }
        throw err;
    }
};

export const api = {
    auth: {
        async register(username, password, securityQuestion, securityAnswer) {
            return request('/auth/register', {
                method: 'POST',
                body: JSON.stringify({ username, password, securityQuestion, securityAnswer })
            });
        },

        async login(username, password) {
            return request('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ username, password })
            });
        },

        async getMe() {
            return request('/auth/me', {
                method: 'GET'
            });
        },

        async getSecurityQuestion(username) {
            return request('/auth/forgot-password/get-question', {
                method: 'POST',
                body: JSON.stringify({ username })
            });
        },

        async resetPassword(username, securityAnswer, newPassword) {
            return request('/auth/forgot-password/reset', {
                method: 'POST',
                body: JSON.stringify({ username, securityAnswer, newPassword })
            });
        },

        async changePassword(currentPassword, newPassword) {
            return request('/auth/change-password', {
                method: 'POST',
                body: JSON.stringify({ currentPassword, newPassword })
            });
        }
    },

    sync: {
        async pull() {
            return request('/sync/pull', {
                method: 'GET'
            });
        },

        async push(payload) {
            return request('/sync/push', {
                method: 'POST',
                body: JSON.stringify(payload)
            });
        },

        async migrate(localPayload) {
            return request('/sync/migrate', {
                method: 'POST',
                body: JSON.stringify(localPayload)
            });
        }
    }
};

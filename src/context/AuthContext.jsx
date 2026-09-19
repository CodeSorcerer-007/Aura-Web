import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getStoredToken, setStoredToken } from '../utils/apiClient';

const AuthContext = createContext(null);

const GUEST_KEY = 'aura_is_guest';

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(getStoredToken());
    const [isGuest, setIsGuest] = useState(() => {
        try {
            return localStorage.getItem(GUEST_KEY) === 'true';
        } catch {
            return false;
        }
    });
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [syncStatus, setSyncStatus] = useState('synced'); // 'synced' | 'syncing' | 'offline' | 'guest'
    const [lastSyncedAt, setLastSyncedAt] = useState(null);
    const [isEntranceOpen, setIsEntranceOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);

    // Verify stored token on initial load
    useEffect(() => {
        const verifySession = async () => {
            const savedToken = getStoredToken();
            if (savedToken) {
                try {
                    const res = await api.auth.getMe();
                    if (res && res.user) {
                        setUser(res.user);
                        setToken(savedToken);
                        setIsGuest(false);
                        try { localStorage.setItem(GUEST_KEY, 'false'); } catch {}
                        setSyncStatus('synced');
                    }
                } catch (err) {
                    console.warn('Session expired or invalid:', err.message);
                    setStoredToken(null);
                    setToken(null);
                    setUser(null);
                    if (!isGuest) {
                        setIsEntranceOpen(true);
                    }
                }
            } else if (!isGuest) {
                // First-time user, open Entrance page
                setIsEntranceOpen(true);
            } else {
                setSyncStatus('guest');
            }
            setIsAuthLoading(false);
        };

        verifySession();
    }, [isGuest]);

    // Sign In
    const login = useCallback(async (username, password) => {
        const res = await api.auth.login(username, password);
        setStoredToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setIsGuest(false);
        try { localStorage.setItem(GUEST_KEY, 'false'); } catch {}
        setIsEntranceOpen(false);
        setSyncStatus('synced');
        return res;
    }, []);

    // Register / Create Account
    const register = useCallback(async (username, password, securityQuestion, securityAnswer) => {
        const res = await api.auth.register(username, password, securityQuestion, securityAnswer);
        setStoredToken(res.token);
        setToken(res.token);
        setUser(res.user);
        setIsGuest(false);
        try { localStorage.setItem(GUEST_KEY, 'false'); } catch {}
        setIsEntranceOpen(false);
        setSyncStatus('synced');
        return res;
    }, []);

    // Sign Out
    const logout = useCallback(() => {
        setStoredToken(null);
        setToken(null);
        setUser(null);
        setIsGuest(false);
        try { localStorage.removeItem(GUEST_KEY); } catch {}
        setSyncStatus('guest');
        setIsEntranceOpen(true);
    }, []);

    // Continue As Guest (Local offline mode)
    const continueAsGuest = useCallback(() => {
        setIsGuest(true);
        try { localStorage.setItem(GUEST_KEY, 'true'); } catch {}
        setIsEntranceOpen(false);
        setSyncStatus('guest');
    }, []);

    // Open entrance modal anytime (e.g. from header "Sign In")
    const openEntrance = useCallback(() => {
        setIsEntranceOpen(true);
    }, []);

    const closeEntrance = useCallback(() => {
        // Only allow closing if user is already authenticated or is a guest
        if (user || isGuest) {
            setIsEntranceOpen(false);
        }
    }, [user, isGuest]);

    // Password Recovery Methods
    const getSecurityQuestion = useCallback(async (username) => {
        return api.auth.getSecurityQuestion(username);
    }, []);

    const resetPassword = useCallback(async (username, securityAnswer, newPassword) => {
        return api.auth.resetPassword(username, securityAnswer, newPassword);
    }, []);

    const changePassword = useCallback(async (currentPassword, newPassword) => {
        return api.auth.changePassword(currentPassword, newPassword);
    }, []);

    const value = {
        user,
        token,
        isAuthenticated: !!user,
        isGuest,
        isAuthLoading,
        syncStatus,
        setSyncStatus,
        lastSyncedAt,
        setLastSyncedAt,
        isEntranceOpen,
        setIsEntranceOpen,
        openEntrance,
        closeEntrance,
        isChangePasswordOpen,
        setIsChangePasswordOpen,
        login,
        register,
        logout,
        continueAsGuest,
        getSecurityQuestion,
        resetPassword,
        changePassword
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

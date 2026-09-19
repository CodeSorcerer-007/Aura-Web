import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { playHarmonicUiSound } from '../hooks/useSoundEffects';
import { defaultCategories } from '../utils/constants';
import { useUI } from './UIContext';

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const ui = useUI();

    const [customCategories, setCustomCategories, categoriesLoaded] = usePreferences('aura-custom-categories', {});
    const [hasLaunched, setHasLaunched, launchedLoaded] = usePreferences('aura-launched', false);
    const [journalEntries, setJournalEntries, journalLoaded] = usePreferences('aura-journal-entries', []);
    const [shutdownTime, setShutdownTime, shutdownTimeLoaded] = usePreferences('aura-shutdown-time', '21:00');
    const [soundEffectsEnabled, setSoundEffectsEnabled, soundEffectsLoaded] = usePreferences('aura-sound-effects', true);
    const [autoArchiveEnabled, setAutoArchiveEnabled, autoArchiveLoaded] = usePreferences('aura-auto-archive', true);
    const [notificationsEnabled, setNotificationsEnabled, notificationsLoaded] = usePreferences('aura-notifications-enabled', false);
    const [monolithTaskId, setMonolithTaskId] = usePreferences('aura-monolith-task-id', null);
    const [tunnelVision, setTunnelVision] = usePreferences('aura-tunnel-vision', false);

    const settingsDataLoaded = categoriesLoaded && launchedLoaded && journalLoaded &&
        shutdownTimeLoaded && soundEffectsLoaded && autoArchiveLoaded && notificationsLoaded;

    const allCategories = useMemo(() => ({ ...defaultCategories, ...customCategories }), [customCategories]);

    // Sound effect helper with harmonic scale & Monolith awareness
    const playSoundEffect = useCallback((effect, isMonolith = false) => {
        playHarmonicUiSound(effect, soundEffectsEnabled, isMonolith);
    }, [soundEffectsEnabled]);

    // Notification permission handler
    const handleSetNotifications = useCallback(async (enabled) => {
        setNotificationsEnabled(enabled);
        if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                ui.setToastMessage({ type: 'success', text: 'Notifications enabled!' });
                setNotificationsEnabled(true);
            } else {
                ui.setToastMessage({ type: 'error', text: 'Notifications were denied.' });
                setNotificationsEnabled(false);
            }
        }
    }, [setNotificationsEnabled, ui]);

    const value = {
        settingsDataLoaded,
        customCategories,
        setCustomCategories,
        allCategories,
        hasLaunched,
        setHasLaunched,
        journalEntries,
        setJournalEntries,
        shutdownTime,
        setShutdownTime,
        soundEffectsEnabled,
        setSoundEffectsEnabled,
        autoArchiveEnabled,
        setAutoArchiveEnabled,
        notificationsEnabled,
        setNotificationsEnabled,
        handleSetNotifications,
        monolithTaskId,
        setMonolithTaskId,
        tunnelVision,
        setTunnelVision,
        playSoundEffect
    };

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) throw new Error('useSettings must be used within SettingsProvider');
    return context;
};

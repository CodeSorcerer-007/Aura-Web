import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { playHarmonicUiSound } from '../hooks/useSoundEffects';
import { defaultCategories } from '../utils/constants';
import { useNotification } from './NotificationContext';

// ---------------------------------------------------------------------------
// Pruning constant for journal entries.
// At one entry per day, 730 entries covers ~2 years of continuous daily use —
// well within the 5 MB localStorage budget, and far more than most users will
// ever accumulate.
// ---------------------------------------------------------------------------
const MAX_JOURNAL_ENTRIES = 730;

const SettingsContext = createContext(null);

export const SettingsProvider = ({ children }) => {
    const notification = useNotification();

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

    // Prune journal entries once on mount so localStorage never hits quota.
    useEffect(() => {
        if (!settingsDataLoaded) return;
        if (journalEntries.length > MAX_JOURNAL_ENTRIES) {
            // Keep the most recent entries (newest are appended, so keep the tail)
            setJournalEntries(prev => prev.slice(prev.length - MAX_JOURNAL_ENTRIES));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settingsDataLoaded]); // intentionally run once after load

    const allCategories = useMemo(() => ({ ...defaultCategories, ...customCategories }), [customCategories]);

    // Sound effect helper with harmonic scale & Monolith awareness
    const playSoundEffect = useCallback((effect, isMonolith = false, extraMeta = {}) => {
        playHarmonicUiSound(effect, soundEffectsEnabled, isMonolith, extraMeta);
    }, [soundEffectsEnabled]);

    // Notification permission handler
    const handleSetNotifications = useCallback(async (enabled) => {
        setNotificationsEnabled(enabled);
        if (enabled && 'Notification' in window && Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                notification.setToastMessage({ type: 'success', text: 'Notifications enabled!' });
                setNotificationsEnabled(true);
            } else {
                notification.setToastMessage({ type: 'error', text: 'Notifications were denied.' });
                setNotificationsEnabled(false);
            }
        }
    }, [setNotificationsEnabled, notification]);

    // Memoize to prevent all SettingsContext consumers from re-rendering when
    // unrelated state (e.g. tasks in a sibling context) triggers a provider
    // re-render higher in the tree.
    const value = useMemo(() => ({
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
    }), [
        settingsDataLoaded,
        customCategories, setCustomCategories,
        allCategories,
        hasLaunched, setHasLaunched,
        journalEntries, setJournalEntries,
        shutdownTime, setShutdownTime,
        soundEffectsEnabled, setSoundEffectsEnabled,
        autoArchiveEnabled, setAutoArchiveEnabled,
        notificationsEnabled, setNotificationsEnabled,
        handleSetNotifications,
        monolithTaskId, setMonolithTaskId,
        tunnelVision, setTunnelVision,
        playSoundEffect
    ]);

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

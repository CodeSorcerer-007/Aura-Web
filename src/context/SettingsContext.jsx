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
    const { setToastMessage } = useNotification();

    const [customCategories, setCustomCategories, categoriesLoaded] = usePreferences('aura-custom-categories', {});
    const [hasLaunched, setHasLaunched, launchedLoaded] = usePreferences('aura-launched', false);
    const [journalEntries, setJournalEntries, journalLoaded] = usePreferences('aura-journal-entries', []);
    const [shutdownTime, setShutdownTime, shutdownTimeLoaded] = usePreferences('aura-shutdown-time', '21:00');
    const [soundEffectsEnabled, setSoundEffectsEnabled, soundEffectsLoaded] = usePreferences('aura-sound-effects', true);
    const [autoArchiveEnabled, setAutoArchiveEnabled, autoArchiveLoaded] = usePreferences('aura-auto-archive', true);
    const [notificationsEnabled, setNotificationsEnabled, notificationsLoaded] = usePreferences('aura-notifications-enabled', false);
    const [monolithTaskId, setMonolithTaskId] = usePreferences('aura-monolith-task-id', null);
    const [tunnelVision, setTunnelVision] = usePreferences('aura-tunnel-vision', false);
    const [alwaysFullScreen, setAlwaysFullScreen, alwaysFullScreenLoaded] = usePreferences('aura-always-fullscreen', true);
    const [isFullscreen, setIsFullscreen] = React.useState(() => {
        if (typeof document !== 'undefined') {
            return !!document.fullscreenElement;
        }
        return false;
    });

    const toggleFullScreen = useCallback(() => {
        try {
            if (typeof document === 'undefined') return;
            if (!document.fullscreenElement) {
                document.documentElement?.requestFullscreen?.().catch(() => {});
            } else {
                document.exitFullscreen?.().catch(() => {});
            }
        } catch {}
    }, []);

    // Fullscreen event listener
    useEffect(() => {
        if (typeof document === 'undefined') return;
        const handleFsChange = () => {
            setIsFullscreen(!!document.fullscreenElement);
        };
        document.addEventListener('fullscreenchange', handleFsChange);
        document.addEventListener('webkitfullscreenchange', handleFsChange);
        handleFsChange();
        return () => {
            document.removeEventListener('fullscreenchange', handleFsChange);
            document.removeEventListener('webkitfullscreenchange', handleFsChange);
        };
    }, []);

    // Auto-enter fullscreen if alwaysFullScreen is enabled
    useEffect(() => {
        if (!alwaysFullScreen || typeof document === 'undefined') return;

        if (!document.fullscreenElement) {
            // Attempt immediate request (works in trusted/PWA/standalone contexts)
            document.documentElement?.requestFullscreen?.().catch(() => {
                // When browser requires user gesture, trigger on first interaction
                const enterOnFirstGesture = () => {
                    if (!document.fullscreenElement && alwaysFullScreen) {
                        document.documentElement?.requestFullscreen?.().catch(() => {});
                    }
                    window.removeEventListener('pointerdown', enterOnFirstGesture);
                    window.removeEventListener('keydown', enterOnFirstGesture);
                };
                window.addEventListener('pointerdown', enterOnFirstGesture, { once: true });
                window.addEventListener('keydown', enterOnFirstGesture, { once: true });
            });
        }
    }, [alwaysFullScreen]);

    const settingsDataLoaded = categoriesLoaded && launchedLoaded && journalLoaded &&
        shutdownTimeLoaded && soundEffectsLoaded && autoArchiveLoaded && notificationsLoaded && alwaysFullScreenLoaded;

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
                setToastMessage({ type: 'success', text: 'Notifications enabled!' });
                setNotificationsEnabled(true);
            } else {
                setToastMessage({ type: 'error', text: 'Notifications were denied.' });
                setNotificationsEnabled(false);
            }
        }
    }, [setNotificationsEnabled, setToastMessage]);

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
        alwaysFullScreen,
        setAlwaysFullScreen,
        isFullscreen,
        toggleFullScreen,
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
        alwaysFullScreen, setAlwaysFullScreen,
        isFullscreen, toggleFullScreen,
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

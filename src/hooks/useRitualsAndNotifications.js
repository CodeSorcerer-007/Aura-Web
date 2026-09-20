import { useState, useEffect, useMemo, useCallback } from 'react';
import { getTodayDateString } from '../utils/dateUtils';
import { getShutdownRitualMessages } from '../utils/constants';
import { getAllStoredAttachments, putAllAttachments } from '../utils/db';
import { usePreferences } from './usePreferences';

export const useRitualsAndNotifications = ({
    tasksCompletedToday,
    notificationsEnabled,
    setNotificationsEnabled,
    tasks,
    setTasks,
    templates,
    setTemplates,
    stats,
    setStats,
    unlockedAchievements,
    setUnlockedAchievements,
    grove,
    setGrove,
    customCategories,
    setCustomCategories,
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
    // Fix 2: import/export now round-trips focusHistory through React state
    focusHistory,
    setFocusHistory,
    notification
}) => {
    const [shutdownRitual, setShutdownRitual] = useState({ active: false, step: 0 });

    // Notification Helpers
    const showNotification = useCallback((title, options) => {
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, options);
        }
    }, [notificationsEnabled]);

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

    // Shutdown Ritual Messages & Assistant Prompts
    const shutdownRitualMessages = useMemo(
        () => getShutdownRitualMessages(tasksCompletedToday),
        [tasksCompletedToday]
    );

    // lastShutdownNotifiedDate — persisted via usePreferences so it follows the
    // same consistent storage pattern as every other setting in the app.
    const [lastShutdownNotifiedDate, setLastShutdownNotifiedDate] = usePreferences(
        'aura-last-shutdown-notified-date', ''
    );

    // Web Push Evening Shutdown Reminder Scheduler
    useEffect(() => {
        if (!shutdownTime) return;

        const checkShutdownTime = () => {
            const now = new Date();
            const todayDate = getTodayDateString();
            const currentHours = now.getHours().toString().padStart(2, '0');
            const currentMinutes = now.getMinutes().toString().padStart(2, '0');
            const currentTimeStr = `${currentHours}:${currentMinutes}`;

            // Compare currentTime with configured shutdownTime (e.g. "21:00")
            if (currentTimeStr === shutdownTime && lastShutdownNotifiedDate !== todayDate) {
                setLastShutdownNotifiedDate(todayDate);
                // 1. Trigger Web Push / Native browser notification
                if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
                    try {
                        new Notification("Aura — Evening Wind Down 🌙", {
                            body: `It's ${shutdownTime}. Time to wrap up your focus, reflect on your accomplishments, and begin your evening shutdown ritual.`,
                            icon: "/icon-192.png",
                            tag: "aura-shutdown-reminder"
                        });
                    } catch (e) {
                        console.warn("Notification error:", e);
                    }
                }

                // 2. Activate shutdown ritual in notification with tranquil assistant prompt
                setShutdownRitual({ active: true, step: 0 });
                notification.setToastMessage?.({
                    type: 'info',
                    text: `Evening shutdown time (${shutdownTime}) reached. Time to wind down 🌙`
                });
            }
        };

        const interval = setInterval(checkShutdownTime, 20000);
        checkShutdownTime();

        return () => clearInterval(interval);
    }, [shutdownTime, notificationsEnabled, lastShutdownNotifiedDate, notification, setLastShutdownNotifiedDate]);

    // Test shutdown notification on demand
    const testShutdownReminder = useCallback(async () => {
        if ('Notification' in window) {
            if (Notification.permission !== 'granted') {
                const perm = await Notification.requestPermission();
                if (perm !== 'granted') {
                    notification.setToastMessage?.({ type: 'error', text: 'Browser notification permission denied.' });
                    return;
                }
            }
            try {
                new Notification("Aura — Evening Wind Down 🌙", {
                    body: `It's ${shutdownTime}. Time to wrap up your focus, reflect on your accomplishments, and begin your evening shutdown ritual.`,
                    icon: "/icon-192.png"
                });
            } catch (e) {
                console.warn(e);
            }
        }
        setShutdownRitual({ active: true, step: 0 });
        notification.setToastMessage?.({ type: 'success', text: 'Evening reminder triggered! Check your notification 🌙' });
    }, [shutdownTime, notification]);

    useEffect(() => {
        if (shutdownRitual.active) {
            notification.setAssistantMessage({ message: shutdownRitualMessages[shutdownRitual.step] });
        } else if (!shutdownRitual.active && notification.assistantMessage?.message?.startsWith("Let's wind down")) {
            notification.setAssistantMessage(null);
        }
    }, [shutdownRitual, shutdownRitualMessages, notification]);

    // Export Handler with Lossless Attachments
    const handleExport = useCallback(async () => {
        let vaultAttachments = {};
        try {
            vaultAttachments = await getAllStoredAttachments();
        } catch (err) {
            console.warn('Could not read attachments for export:', err);
        }

        const data = {
            tasks,
            templates,
            stats,
            unlockedAchievements,
            grove,
            customCategories,
            hasLaunched,
            journalEntries,
            focusHistory,
            shutdownTime,
            soundEffectsEnabled,
            autoArchiveEnabled,
            notificationsEnabled,
            ...(Object.keys(vaultAttachments).length > 0 ? { vaultAttachments } : {})
        };
        const jsonString = JSON.stringify(data, null, 2);
        const blob = new Blob([jsonString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `aura-backup-${getTodayDateString()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        notification.setToastMessage({ type: 'success', text: 'Lossless backup exported successfully!' });
    }, [
        tasks,
        templates,
        stats,
        unlockedAchievements,
        grove,
        customCategories,
        hasLaunched,
        journalEntries,
        focusHistory,
        shutdownTime,
        soundEffectsEnabled,
        autoArchiveEnabled,
        notificationsEnabled,
        notification
    ]);

    // Import Handler with Lossless Attachments Rehydration
    const handleImportFile = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = async (event) => {
            try {
                const data = JSON.parse(event.target.result);
                if (data.tasks) setTasks(data.tasks);
                if (data.templates) setTemplates(data.templates);
                if (data.stats) setStats(data.stats);
                if (data.unlockedAchievements) setUnlockedAchievements(data.unlockedAchievements);
                if (data.grove) setGrove(data.grove);
                if (data.customCategories) setCustomCategories(data.customCategories);
                if (data.hasLaunched !== undefined) setHasLaunched(data.hasLaunched);
                if (data.journalEntries) setJournalEntries(data.journalEntries);
                if (Array.isArray(data.focusHistory)) setFocusHistory(data.focusHistory);
                if (data.shutdownTime) setShutdownTime(data.shutdownTime);
                if (data.soundEffectsEnabled !== undefined) setSoundEffectsEnabled(data.soundEffectsEnabled);
                if (data.autoArchiveEnabled !== undefined) setAutoArchiveEnabled(data.autoArchiveEnabled);
                if (data.notificationsEnabled !== undefined) setNotificationsEnabled(data.notificationsEnabled);

                // Restore any embedded attachments or voice notes into IndexedDB
                if (data.vaultAttachments && typeof data.vaultAttachments === 'object') {
                    try {
                        await putAllAttachments(data.vaultAttachments);
                    } catch (attErr) {
                        console.warn('Error restoring vault attachments:', attErr);
                    }
                }

                notification.setToastMessage({ type: 'success', text: 'Data & attachments restored successfully!' });
            } catch (error) {
                console.error("Error parsing import file:", error);
                notification.setToastMessage({ type: 'error', text: 'Failed to import data. Invalid file format.' });
            }
        };
        reader.readAsText(file);
    }, [
        setTasks,
        setTemplates,
        setStats,
        setUnlockedAchievements,
        setGrove,
        setCustomCategories,
        setHasLaunched,
        setJournalEntries,
        setFocusHistory,
        setShutdownTime,
        setSoundEffectsEnabled,
        setAutoArchiveEnabled,
        setNotificationsEnabled,
        notification
    ]);

    return {
        shutdownRitual,
        setShutdownRitual,
        shutdownRitualMessages,
        showNotification,
        handleSetNotifications,
        handleExport,
        handleImportFile,
        testShutdownReminder
    };
};

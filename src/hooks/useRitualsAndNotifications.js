import { useState, useEffect, useMemo, useCallback } from 'react';
import { getTodayDateString } from '../utils/dateUtils';
import { getShutdownRitualMessages } from '../utils/constants';

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
    ui
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
                ui.setToastMessage({ type: 'success', text: 'Notifications enabled!' });
                setNotificationsEnabled(true);
            } else {
                ui.setToastMessage({ type: 'error', text: 'Notifications were denied.' });
                setNotificationsEnabled(false);
            }
        }
    }, [setNotificationsEnabled, ui]);

    // Shutdown Ritual Messages & Assistant Prompts
    const shutdownRitualMessages = useMemo(
        () => getShutdownRitualMessages(tasksCompletedToday),
        [tasksCompletedToday]
    );

    useEffect(() => {
        if (shutdownRitual.active) {
            ui.setAssistantMessage({ message: shutdownRitualMessages[shutdownRitual.step] });
        } else if (!shutdownRitual.active && ui.assistantMessage?.message?.startsWith("Let's wind down")) {
            ui.setAssistantMessage(null);
        }
    }, [shutdownRitual, shutdownRitualMessages, ui]);

    // Export Handler
    const handleExport = useCallback(() => {
        const data = {
            tasks,
            templates,
            stats,
            unlockedAchievements,
            grove,
            customCategories,
            hasLaunched,
            journalEntries,
            shutdownTime,
            soundEffectsEnabled,
            autoArchiveEnabled,
            notificationsEnabled
        };
        const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
        const link = document.createElement('a');
        link.href = jsonString;
        link.download = `aura-backup-${getTodayDateString()}.json`;
        link.click();
        ui.setToastMessage({ type: 'success', text: 'Data exported successfully!' });
    }, [
        tasks,
        templates,
        stats,
        unlockedAchievements,
        grove,
        customCategories,
        hasLaunched,
        journalEntries,
        shutdownTime,
        soundEffectsEnabled,
        autoArchiveEnabled,
        notificationsEnabled,
        ui
    ]);

    // Import Handler
    const handleImportFile = useCallback((e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
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
                if (data.shutdownTime) setShutdownTime(data.shutdownTime);
                if (data.soundEffectsEnabled !== undefined) setSoundEffectsEnabled(data.soundEffectsEnabled);
                if (data.autoArchiveEnabled !== undefined) setAutoArchiveEnabled(data.autoArchiveEnabled);
                if (data.notificationsEnabled !== undefined) setNotificationsEnabled(data.notificationsEnabled);
                ui.setToastMessage({ type: 'success', text: 'Data imported successfully!' });
            } catch (error) {
                console.error("Error parsing import file:", error);
                ui.setToastMessage({ type: 'error', text: 'Failed to import data. Invalid file format.' });
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
        setShutdownTime,
        setSoundEffectsEnabled,
        setAutoArchiveEnabled,
        setNotificationsEnabled,
        ui
    ]);

    return {
        shutdownRitual,
        setShutdownRitual,
        shutdownRitualMessages,
        showNotification,
        handleSetNotifications,
        handleExport,
        handleImportFile
    };
};

import React, { createContext, useContext, useMemo, useCallback } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { playUiSound } from '../hooks/useAmbientSound';
import { defaultCategories, motivationalQuotes, demoTasks } from '../utils/constants';
import { getTodayDateString } from '../utils/dateUtils';
import { useUI } from './UIContext';
import { useTaskOperations } from '../hooks/useTaskOperations';
import { useStatsAndGrove } from '../hooks/useStatsAndGrove';
import { useRitualsAndNotifications } from '../hooks/useRitualsAndNotifications';

const TaskContext = createContext(null);

export const TaskProvider = ({ children, ui: propUI }) => {
    const contextUI = useUI();
    const ui = propUI || contextUI;

    // Persistent storage via usePreferences
    const [tasks, setTasks, tasksLoaded] = usePreferences('aura-tasks', demoTasks);
    const [templates, setTemplates, templatesLoaded] = usePreferences('aura-templates', []);
    const [stats, setStats, statsLoaded] = usePreferences('aura-stats', {
        streak: 1,
        goldenSeeds: 0,
        lastActiveDate: getTodayDateString(),
        focusedTasksCompleted: 0
    });
    const [unlockedAchievements, setUnlockedAchievements, achievementsLoaded] = usePreferences('aura-achievements', []);
    const [grove, setGrove, groveLoaded] = usePreferences('aura-grove', []);
    const [customCategories, setCustomCategories, categoriesLoaded] = usePreferences('aura-custom-categories', {});
    const [hasLaunched, setHasLaunched, launchedLoaded] = usePreferences('aura-launched', false);
    const [journalEntries, setJournalEntries, journalLoaded] = usePreferences('aura-journal-entries', []);
    const [shutdownTime, setShutdownTime, shutdownTimeLoaded] = usePreferences('aura-shutdown-time', '21:00');
    const [soundEffectsEnabled, setSoundEffectsEnabled, soundEffectsLoaded] = usePreferences('aura-sound-effects', true);
    const [autoArchiveEnabled, setAutoArchiveEnabled, autoArchiveLoaded] = usePreferences('aura-auto-archive', true);
    const [notificationsEnabled, setNotificationsEnabled, notificationsLoaded] = usePreferences('aura-notifications-enabled', false);

    const allDataLoaded = tasksLoaded && templatesLoaded && statsLoaded && achievementsLoaded &&
        groveLoaded && categoriesLoaded && launchedLoaded && journalLoaded &&
        shutdownTimeLoaded && soundEffectsLoaded && autoArchiveLoaded && notificationsLoaded;

    const allCategories = useMemo(() => ({ ...defaultCategories, ...customCategories }), [customCategories]);

    // UI Sound Effect Helper
    const playSoundEffect = useCallback((effect) => {
        playUiSound(effect, soundEffectsEnabled);
    }, [soundEffectsEnabled]);

    // Modular Hook: Task Operations (CRUD, attachments, templates, subtasks, pinning)
    const {
        addTask,
        toggleTask,
        togglePin,
        saveWin,
        deleteTask,
        archiveTask,
        restoreTask,
        saveTaskDetail,
        setTaskDependency,
        addAttachmentToTask,
        deleteAttachmentFromTask,
        saveTemplate,
        reorderTask,
        toggleSubtask
    } = useTaskOperations({
        tasks,
        setTasks,
        templates,
        setTemplates,
        setGrove,
        ui,
        playSoundEffect
    });

    // Modular Hook: Stats, Momentum & Grove
    const {
        tasksCompletedToday,
        momentumProgress,
        dailyStats,
        handlePlantSeed,
        finishPlanting,
        handleFocusComplete
    } = useStatsAndGrove({
        tasks,
        setTasks,
        stats,
        setStats,
        unlockedAchievements,
        setUnlockedAchievements,
        grove,
        setGrove,
        allDataLoaded,
        autoArchiveEnabled,
        playSoundEffect,
        showNotification: (title, opts) => {
            if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(title, opts);
            }
        },
        toggleTask,
        ui
    });

    // Modular Hook: Rituals, Notifications, Export & Import
    const {
        shutdownRitual,
        setShutdownRitual,
        shutdownRitualMessages,
        handleSetNotifications,
        handleExport,
        handleImportFile
    } = useRitualsAndNotifications({
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
    });

    const dailyQuote = useMemo(() => {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return motivationalQuotes[dayOfYear % motivationalQuotes.length];
    }, []);

    const value = {
        allDataLoaded,
        tasks,
        setTasks,
        templates,
        setTemplates,
        stats,
        setStats,
        unlockedAchievements,
        grove,
        setGrove,
        customCategories,
        setCustomCategories,
        allCategories,
        hasLaunched,
        journalEntries,
        setJournalEntries,
        shutdownTime,
        setShutdownTime,
        soundEffectsEnabled,
        setSoundEffectsEnabled,
        autoArchiveEnabled,
        setAutoArchiveEnabled,
        notificationsEnabled,
        handleSetNotifications,
        shutdownRitual,
        setShutdownRitual,
        shutdownRitualMessages,
        dailyQuote,
        dailyStats,
        momentumProgress,
        addTask,
        toggleTask,
        togglePin,
        deleteTask,
        archiveTask,
        restoreTask,
        saveTaskDetail,
        setTaskDependency,
        addAttachmentToTask,
        deleteAttachmentFromTask,
        saveTemplate,
        handlePlantSeed,
        finishPlanting,
        reorderTask,
        toggleSubtask,
        saveWin,
        handleFocusComplete,
        handleExport,
        handleImportFile
    };

    return (
        <TaskContext.Provider value={value}>
            {children}
        </TaskContext.Provider>
    );
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTasks must be used within TaskProvider');
    return context;
};

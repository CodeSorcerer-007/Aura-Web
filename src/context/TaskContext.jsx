import React, { createContext, useContext, useMemo, useCallback, useEffect } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { motivationalQuotes, demoTasks } from '../utils/constants';
import { getTodayDateString } from '../utils/dateUtils';
import { useUI } from './UIContext';
import { useSettings } from './SettingsContext';
import { useGrove } from './GroveContext';
import { useTaskOperations } from '../hooks/useTaskOperations';
import { useStatsAndGrove } from '../hooks/useStatsAndGrove';
import { useRitualsAndNotifications } from '../hooks/useRitualsAndNotifications';
import {
    recordDailySnapshot,
    getRollingSnapshots,
    getSnapshotDataById,
    exportSafetyVaultToFile
} from '../utils/snapshotVault';

const TaskContext = createContext(null);

export const TaskProvider = ({ children, ui: propUI }) => {
    const contextUI = useUI();
    const ui = propUI || contextUI;

    // Consume sibling contexts
    const settings = useSettings();
    const groveCtx = useGrove();

    // Task-specific persistent local storage
    const [tasks, setTasks, tasksLoaded] = usePreferences('aura-tasks', demoTasks);
    const [templates, setTemplates, templatesLoaded] = usePreferences('aura-templates', []);
    const [tomorrowSeed, setTomorrowSeed] = usePreferences('aura-tomorrow-seed', null);

    const allDataLoaded = tasksLoaded && templatesLoaded &&
        settings.settingsDataLoaded && groveCtx.groveDataLoaded;

    // Plant Tomorrow's Seed helper
    const plantTomorrowSeed = useCallback((text) => {
        if (!text || !text.trim()) return;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        setTomorrowSeed({ text: text.trim(), date: tomorrowStr });
        settings.playSoundEffect('add');
        ui.setToastMessage({
            type: 'success',
            text: '🌱 Seed planted under night blanket. Sweet dreams.'
        });
    }, [setTomorrowSeed, settings, ui]);

    // Tomorrow's Seed blossoming check on new day
    useEffect(() => {
        if (!allDataLoaded || !tomorrowSeed || !tomorrowSeed.text) return;
        const todayStr = getTodayDateString();
        if (tomorrowSeed.date <= todayStr) {
            const seedText = tomorrowSeed.text;
            const newTaskId = crypto.randomUUID();
            const seedTask = {
                id: newTaskId,
                createdAt: new Date().toISOString(),
                text: seedText,
                completed: false,
                priority: 3,
                category: 'General',
                timeOfDay: 'morning',
                deadline: todayStr,
                subtasks: [],
                win: null,
                completionDate: null,
                recurring: null,
                dependsOn: null,
                notes: 'Planted as Tomorrow\'s Seed during evening wind-down.',
                attachments: [],
                voiceNotes: [],
                tags: ['seed'],
                isPinned: true,
                focusSessions: 0,
                isArchived: false
            };
            setTasks(prev => [seedTask, ...prev]);
            settings.setMonolithTaskId(newTaskId);
            setTomorrowSeed(null);
            ui.setToastMessage({
                type: 'success',
                text: '🌱 Good morning! Your seed blossomed into Today\'s Monolith.'
            });
        }
    }, [allDataLoaded, tomorrowSeed, setTasks, settings, setTomorrowSeed, ui]);

    // Modular Hook: Task Operations (CRUD, attachments, templates, subtasks, pinning)
    const taskOps = useTaskOperations({
        tasks,
        setTasks,
        templates,
        setTemplates,
        setGrove: groveCtx.setGrove,
        ui,
        playSoundEffect: settings.playSoundEffect
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
        stats: groveCtx.stats,
        setStats: groveCtx.setStats,
        unlockedAchievements: groveCtx.unlockedAchievements,
        setUnlockedAchievements: groveCtx.setUnlockedAchievements,
        grove: groveCtx.grove,
        setGrove: groveCtx.setGrove,
        allDataLoaded,
        autoArchiveEnabled: settings.autoArchiveEnabled,
        playSoundEffect: settings.playSoundEffect,
        showNotification: (title, opts) => {
            if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(title, opts);
            }
        },
        toggleTask: taskOps.toggleTask,
        ui
    });

    // Modular Hook: Rituals, Notifications, Export & Import
    const {
        shutdownRitual,
        setShutdownRitual,
        shutdownRitualMessages,
        handleExport,
        handleImportFile,
        testShutdownReminder
    } = useRitualsAndNotifications({
        tasksCompletedToday,
        notificationsEnabled: settings.notificationsEnabled,
        setNotificationsEnabled: settings.setNotificationsEnabled,
        tasks,
        setTasks,
        templates,
        setTemplates,
        stats: groveCtx.stats,
        setStats: groveCtx.setStats,
        unlockedAchievements: groveCtx.unlockedAchievements,
        setUnlockedAchievements: groveCtx.setUnlockedAchievements,
        grove: groveCtx.grove,
        setGrove: groveCtx.setGrove,
        customCategories: settings.customCategories,
        setCustomCategories: settings.setCustomCategories,
        hasLaunched: settings.hasLaunched,
        setHasLaunched: settings.setHasLaunched,
        journalEntries: settings.journalEntries,
        setJournalEntries: settings.setJournalEntries,
        shutdownTime: settings.shutdownTime,
        setShutdownTime: settings.setShutdownTime,
        soundEffectsEnabled: settings.soundEffectsEnabled,
        setSoundEffectsEnabled: settings.setSoundEffectsEnabled,
        autoArchiveEnabled: settings.autoArchiveEnabled,
        setAutoArchiveEnabled: settings.setAutoArchiveEnabled,
        ui
    });

    // Build complete state payload for snapshot and safety vault
    const buildFullSnapshotPayload = useCallback(() => ({
        tasks,
        templates,
        stats: groveCtx.stats,
        unlockedAchievements: groveCtx.unlockedAchievements,
        grove: groveCtx.grove,
        customCategories: settings.customCategories,
        journalEntries: settings.journalEntries,
        settings: {
            shutdownTime: settings.shutdownTime,
            soundEffectsEnabled: settings.soundEffectsEnabled,
            autoArchiveEnabled: settings.autoArchiveEnabled,
            notificationsEnabled: settings.notificationsEnabled
        }
    }), [
        tasks, templates,
        groveCtx.stats, groveCtx.unlockedAchievements, groveCtx.grove,
        settings.customCategories, settings.journalEntries,
        settings.shutdownTime, settings.soundEffectsEnabled,
        settings.autoArchiveEnabled, settings.notificationsEnabled
    ]);

    // Record rolling daily snapshot
    useEffect(() => {
        if (!allDataLoaded) return;
        const timer = setTimeout(() => {
            recordDailySnapshot(buildFullSnapshotPayload());
        }, 1500);
        return () => clearTimeout(timer);
    }, [allDataLoaded, buildFullSnapshotPayload]);

    const restoreSnapshotById = useCallback(async (snapshotId) => {
        const data = await getSnapshotDataById(snapshotId);
        if (!data) return false;
        if (data.tasks) setTasks(data.tasks);
        if (data.templates) setTemplates(data.templates);
        if (data.stats) groveCtx.setStats(data.stats);
        if (data.unlockedAchievements) groveCtx.setUnlockedAchievements(data.unlockedAchievements);
        if (data.grove) groveCtx.setGrove(data.grove);
        if (data.customCategories) settings.setCustomCategories(data.customCategories);
        if (data.journalEntries) settings.setJournalEntries(data.journalEntries);
        if (data.settings?.shutdownTime) settings.setShutdownTime(data.settings.shutdownTime);
        if (data.settings?.soundEffectsEnabled !== undefined) settings.setSoundEffectsEnabled(data.settings.soundEffectsEnabled);
        if (data.settings?.autoArchiveEnabled !== undefined) settings.setAutoArchiveEnabled(data.settings.autoArchiveEnabled);
        if (data.settings?.notificationsEnabled !== undefined) settings.setNotificationsEnabled(data.settings.notificationsEnabled);
        ui.setToastMessage({ type: 'success', text: 'Snapshot restored successfully!' });
        return true;
    }, [setTasks, setTemplates, groveCtx, settings, ui]);

    const handleSaveSafetyVault = useCallback(async () => {
        const payload = buildFullSnapshotPayload();
        const res = await exportSafetyVaultToFile(payload);
        if (res && res.success) {
            ui.setToastMessage({ type: 'success', text: 'Safety Vault saved to disk!' });
        }
    }, [buildFullSnapshotPayload, ui]);

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
        tomorrowSeed,
        setTomorrowSeed,
        plantTomorrowSeed,
        dailyQuote,
        // Task operations (spread from hook)
        ...taskOps,
        // Stats & Grove computed values
        momentumProgress,
        dailyStats,
        handlePlantSeed,
        finishPlanting,
        handleFocusComplete,
        // Rituals & Safety Vault
        shutdownRitual,
        setShutdownRitual,
        shutdownRitualMessages,
        handleExport,
        handleImportFile,
        testShutdownReminder,
        getRollingSnapshots,
        restoreSnapshotById,
        handleSaveSafetyVault
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

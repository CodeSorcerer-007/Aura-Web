import React, { createContext, useContext, useMemo, useCallback, useEffect, useRef } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { motivationalQuotes } from '../utils/constants';
import { getTodayDateString } from '../utils/dateUtils';
import { useNotification } from './NotificationContext';
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

export const TaskProvider = ({ children }) => {
    const notification = useNotification();
    const { setToastMessage } = notification;

    // Consume sibling contexts
    const settings = useSettings();
    const { monolithTaskId, setMonolithTaskId, playSoundEffect, settingsDataLoaded } = settings;

    const groveCtx = useGrove();
    const { groveDataLoaded } = groveCtx;

    // Task-specific persistent state — defaults to clean empty slate
    const [tasks, setTasks, tasksLoaded] = usePreferences('aura-tasks', []);
    const [templates, setTemplates, templatesLoaded] = usePreferences('aura-templates', []);
    const [tomorrowSeed, setTomorrowSeed] = usePreferences('aura-tomorrow-seed', null);

    // Auto-remove any legacy demo data once on initial hydration so the app remains 100% clean
    const demoCleanedRef = useRef(false);
    useEffect(() => {
        if (!tasksLoaded || demoCleanedRef.current) return;
        demoCleanedRef.current = true;
        setTasks(prev => {
            const hasDemo = prev.some(t => typeof t.id === 'string' && t.id.startsWith('demo-task-'));
            return hasDemo ? prev.filter(t => typeof t.id !== 'string' || !t.id.startsWith('demo-task-')) : prev;
        });
    }, [tasksLoaded, setTasks]);

    // Ensure monolith task reference is cleared if the task no longer exists or is archived
    useEffect(() => {
        if (!tasksLoaded || !monolithTaskId) return;
        const exists = tasks.some(t => t.id === monolithTaskId && !t.isArchived);
        if (!exists) {
            setMonolithTaskId(null);
        }
    }, [tasksLoaded, tasks, monolithTaskId, setMonolithTaskId]);

    const allDataLoaded = tasksLoaded && templatesLoaded &&
        settingsDataLoaded && groveDataLoaded;

    // Plant Tomorrow's Seed helper
    const plantTomorrowSeed = useCallback((text) => {
        if (!text || !text.trim()) return;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];
        setTomorrowSeed({ text: text.trim(), date: tomorrowStr });
        playSoundEffect('add');
        setToastMessage({
            type: 'success',
            text: '🌱 Seed planted under night blanket. Sweet dreams.'
        });
    }, [setTomorrowSeed, playSoundEffect, setToastMessage]);

    // -------------------------------------------------------------------------
    // Tomorrow's Seed blossoming — including midnight cross-over fix.
    // visibilitychange + window focus listeners re-check so the tab doesn't
    // need a full reload after midnight.
    // -------------------------------------------------------------------------
    const seedCheckRef = useRef(false);

    const checkAndBlossom = useCallback(() => {
        if (!allDataLoaded || !tomorrowSeed || !tomorrowSeed.text) return;
        if (seedCheckRef.current) return;

        const todayStr = getTodayDateString();
        if (tomorrowSeed.date <= todayStr) {
            seedCheckRef.current = true;
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
                notes: "Planted as Tomorrow's Seed during evening wind-down.",
                attachments: [],
                voiceNotes: [],
                tags: ['seed'],
                isPinned: true,
                focusSessions: 0,
                isArchived: false
            };
            setTasks(prev => [seedTask, ...prev]);
            setMonolithTaskId(newTaskId);
            setTomorrowSeed(null);
            setToastMessage({
                type: 'success',
                text: '🌱 Good morning! Your seed blossomed into Today\'s Monolith.'
            });
        }
    }, [allDataLoaded, tomorrowSeed, setTasks, setMonolithTaskId, setTomorrowSeed, setToastMessage]);

    useEffect(() => { seedCheckRef.current = false; }, [tomorrowSeed]);
    useEffect(() => { checkAndBlossom(); }, [checkAndBlossom]);

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === 'visible') {
                seedCheckRef.current = false;
                checkAndBlossom();
            }
        };
        const onFocus = () => { seedCheckRef.current = false; checkAndBlossom(); };
        document.addEventListener('visibilitychange', onVisible);
        window.addEventListener('focus', onFocus);
        return () => {
            document.removeEventListener('visibilitychange', onVisible);
            window.removeEventListener('focus', onFocus);
        };
    }, [checkAndBlossom]);

    // Modular Hook: Task Operations
    const taskOps = useTaskOperations({
        setTasks,
        templates,
        setTemplates,
        setGrove: groveCtx.setGrove,
        notification,
        playSoundEffect: settings.playSoundEffect,
        monolithTaskId: settings.monolithTaskId,
        setMonolithTaskId: settings.setMonolithTaskId,
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
        focusHistory: groveCtx.focusHistory,
        setFocusHistory: groveCtx.setFocusHistory,
        momentumAwardedDate: groveCtx.momentumAwardedDate,
        setMomentumAwardedDate: groveCtx.setMomentumAwardedDate,
        allDataLoaded,
        autoArchiveEnabled: settings.autoArchiveEnabled,
        playSoundEffect: settings.playSoundEffect,
        showNotification: (title, opts) => {
            if (settings.notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
                new Notification(title, opts);
            }
        },
        toggleTask: taskOps.toggleTask,
        notification,
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
        focusHistory: groveCtx.focusHistory,
        setFocusHistory: groveCtx.setFocusHistory,
        shutdownTime: settings.shutdownTime,
        setShutdownTime: settings.setShutdownTime,
        soundEffectsEnabled: settings.soundEffectsEnabled,
        setSoundEffectsEnabled: settings.setSoundEffectsEnabled,
        autoArchiveEnabled: settings.autoArchiveEnabled,
        setAutoArchiveEnabled: settings.setAutoArchiveEnabled,
        notification,
    });

    // Snapshot / Safety Vault
    const buildFullSnapshotPayload = useCallback(() => ({
        tasks, templates,
        stats: groveCtx.stats,
        unlockedAchievements: groveCtx.unlockedAchievements,
        grove: groveCtx.grove,
        focusHistory: groveCtx.focusHistory,
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
        groveCtx.stats, groveCtx.unlockedAchievements, groveCtx.grove, groveCtx.focusHistory,
        settings.customCategories, settings.journalEntries,
        settings.shutdownTime, settings.soundEffectsEnabled,
        settings.autoArchiveEnabled, settings.notificationsEnabled
    ]);

    useEffect(() => {
        if (!allDataLoaded) return;
        const timer = setTimeout(() => recordDailySnapshot(buildFullSnapshotPayload()), 1500);
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
        if (data.focusHistory) groveCtx.setFocusHistory(data.focusHistory);
        if (data.customCategories) settings.setCustomCategories(data.customCategories);
        if (data.journalEntries) settings.setJournalEntries(data.journalEntries);
        if (data.settings?.shutdownTime) settings.setShutdownTime(data.settings.shutdownTime);
        if (data.settings?.soundEffectsEnabled !== undefined) settings.setSoundEffectsEnabled(data.settings.soundEffectsEnabled);
        if (data.settings?.autoArchiveEnabled !== undefined) settings.setAutoArchiveEnabled(data.settings.autoArchiveEnabled);
        if (data.settings?.notificationsEnabled !== undefined) settings.setNotificationsEnabled(data.settings.notificationsEnabled);
        notification.setToastMessage({ type: 'success', text: 'Snapshot restored successfully!' });
        return true;
    }, [setTasks, setTemplates, groveCtx, settings, notification]);

    const handleSaveSafetyVault = useCallback(async () => {
        const payload = buildFullSnapshotPayload();
        const res = await exportSafetyVaultToFile(payload);
        if (res?.success) {
            notification.setToastMessage({ type: 'success', text: 'Safety Vault saved to disk!' });
        }
    }, [buildFullSnapshotPayload, notification]);

    const dailyQuote = useMemo(() => {
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return motivationalQuotes[dayOfYear % motivationalQuotes.length];
    }, []);

    // Memoize the context value so that consumers only re-render when the
    // specific slices they use actually change.  Without this, every render of
    // TaskProvider (triggered by any state update anywhere in the tree) would
    // produce a new object reference and force all 35+ consumers to re-render
    // even if nothing they care about changed.
    const value = useMemo(() => ({
        allDataLoaded,
        tasks, setTasks,
        templates, setTemplates,
        tomorrowSeed, setTomorrowSeed,
        plantTomorrowSeed,
        dailyQuote,
        ...taskOps,
        momentumProgress,
        dailyStats,
        handlePlantSeed,
        finishPlanting,
        handleFocusComplete,
        shutdownRitual, setShutdownRitual,
        shutdownRitualMessages,
        handleExport, handleImportFile,
        testShutdownReminder,
        getRollingSnapshots,
        restoreSnapshotById,
        handleSaveSafetyVault
    }), [
        allDataLoaded,
        tasks, setTasks,
        templates, setTemplates,
        tomorrowSeed, setTomorrowSeed,
        plantTomorrowSeed,
        dailyQuote,
        taskOps,
        momentumProgress,
        dailyStats,
        handlePlantSeed,
        finishPlanting,
        handleFocusComplete,
        shutdownRitual, setShutdownRitual,
        shutdownRitualMessages,
        handleExport, handleImportFile,
        testShutdownReminder,
        restoreSnapshotById,
        handleSaveSafetyVault,
    ]);

    return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = () => {
    const context = useContext(TaskContext);
    if (!context) throw new Error('useTasks must be used within TaskProvider');
    return context;
};

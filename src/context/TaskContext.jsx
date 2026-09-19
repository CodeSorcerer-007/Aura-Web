import React, { createContext, useContext, useMemo, useCallback, useRef, useEffect } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { motivationalQuotes, demoTasks } from '../utils/constants';
import { getTodayDateString } from '../utils/dateUtils';
import { useUI } from './UIContext';
import { useAuth } from './AuthContext';
import { useSettings } from './SettingsContext';
import { useGrove } from './GroveContext';
import { api } from '../utils/apiClient';
import { useTaskOperations } from '../hooks/useTaskOperations';
import { useStatsAndGrove } from '../hooks/useStatsAndGrove';
import { useRitualsAndNotifications } from '../hooks/useRitualsAndNotifications';

const TaskContext = createContext(null);

export const TaskProvider = ({ children, ui: propUI }) => {
    const contextUI = useUI();
    const ui = propUI || contextUI;

    // Consume sibling contexts
    const settings = useSettings();
    const groveCtx = useGrove();

    // Task-specific persistent storage
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

    // Cloud Synchronization via AuthContext & ApiClient
    const auth = useAuth();
    const { user, setSyncStatus, setLastSyncedAt } = auth || {};
    const initialPullDoneRef = useRef(false);

    // Build the sync payload from all contexts
    const buildSyncPayload = useCallback(() => ({
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

    // Initial pull when user logs in
    useEffect(() => {
        if (!user || !allDataLoaded) {
            initialPullDoneRef.current = false;
            return;
        }

        const pullCloudData = async () => {
            try {
                setSyncStatus?.('syncing');
                const res = await api.sync.pull();
                if (res && res.data) {
                    if (res.data.tasks) setTasks(res.data.tasks);
                    if (res.data.templates) setTemplates(res.data.templates);
                    if (res.data.stats) groveCtx.setStats(res.data.stats);
                    if (res.data.unlockedAchievements) groveCtx.setUnlockedAchievements(res.data.unlockedAchievements);
                    if (res.data.grove) groveCtx.setGrove(res.data.grove);
                    if (res.data.customCategories) settings.setCustomCategories(res.data.customCategories);
                    if (res.data.journalEntries) settings.setJournalEntries(res.data.journalEntries);
                    if (res.data.settings?.shutdownTime) settings.setShutdownTime(res.data.settings.shutdownTime);
                    if (res.data.settings?.soundEffectsEnabled !== undefined) settings.setSoundEffectsEnabled(res.data.settings.soundEffectsEnabled);
                    if (res.data.settings?.autoArchiveEnabled !== undefined) settings.setAutoArchiveEnabled(res.data.settings.autoArchiveEnabled);
                    if (res.data.settings?.notificationsEnabled !== undefined) settings.setNotificationsEnabled(res.data.settings.notificationsEnabled);
                    setLastSyncedAt?.(res.lastSyncedAt || new Date().toISOString());
                } else if (res && res.isNewUser) {
                    await api.sync.push(buildSyncPayload());
                    setLastSyncedAt?.(new Date().toISOString());
                }
                setSyncStatus?.('synced');
            } catch (err) {
                console.warn('Initial cloud pull:', err);
                setSyncStatus?.(err.isOffline ? 'offline' : 'synced');
            } finally {
                initialPullDoneRef.current = true;
            }
        };

        pullCloudData();
    }, [user, allDataLoaded, groveCtx, settings, setTasks, setTemplates, setSyncStatus, setLastSyncedAt, buildSyncPayload]);

    const lastPayloadStringRef = useRef('');

    // Debounced push to cloud whenever state changes
    useEffect(() => {
        if (!user || !allDataLoaded || !initialPullDoneRef.current) return;

        const timer = setTimeout(async () => {
            try {
                const payload = buildSyncPayload();
                const payloadString = JSON.stringify(payload);
                if (payloadString === lastPayloadStringRef.current) {
                    return; // No mutations detected, bypass redundant sync
                }

                setSyncStatus?.('syncing');
                const res = await api.sync.push(payload);
                lastPayloadStringRef.current = payloadString;
                if (res && res.lastSyncedAt) {
                    setLastSyncedAt?.(res.lastSyncedAt);
                }
                setSyncStatus?.('synced');
            } catch (err) {
                console.warn('Auto-sync error:', err);
                setSyncStatus?.(err.isOffline ? 'offline' : 'synced');
            }
        }, 1000);

        return () => clearTimeout(timer);
    }, [user, allDataLoaded, buildSyncPayload, setSyncStatus, setLastSyncedAt]);

    // Manual on-demand sync trigger
    const triggerSync = useCallback(async () => {
        if (!user) return;
        try {
            setSyncStatus?.('syncing');
            const res = await api.sync.push(buildSyncPayload());
            if (res && res.lastSyncedAt) {
                setLastSyncedAt?.(res.lastSyncedAt);
            }
            setSyncStatus?.('synced');
            ui?.setToastMessage?.('Cloud synced successfully');
        } catch (err) {
            setSyncStatus?.(err.isOffline ? 'offline' : 'synced');
            ui?.setToastMessage?.(err.message || 'Sync failed');
        }
    }, [user, buildSyncPayload, ui, setSyncStatus, setLastSyncedAt]);

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
        // Rituals
        shutdownRitual,
        setShutdownRitual,
        shutdownRitualMessages,
        handleExport,
        handleImportFile,
        triggerSync,
        testShutdownReminder
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

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { playUiSound } from '../hooks/useAmbientSound';
import {
    defaultCategories,
    motivationalQuotes,
    achievementsList,
    demoTasks,
    getShutdownRitualMessages
} from '../utils/constants';
import { getTodayDateString, parseIntelligentDeadline } from '../utils/dateUtils';
import { setFile, deleteFile } from '../utils/db';
import { useUI } from './UIContext';

const TaskContext = createContext(null);

export const TaskProvider = ({ children, ui: propUI }) => {
    const contextUI = useUI();
    const ui = propUI || contextUI;
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

    const [shutdownRitual, setShutdownRitual] = useState({ active: false, step: 0 });

    const allDataLoaded = tasksLoaded && templatesLoaded && statsLoaded && achievementsLoaded &&
        groveLoaded && categoriesLoaded && launchedLoaded && journalLoaded &&
        shutdownTimeLoaded && soundEffectsLoaded && autoArchiveLoaded && notificationsLoaded;

    const allCategories = useMemo(() => ({ ...defaultCategories, ...customCategories }), [customCategories]);

    // UI Sound Effect Helper
    const playSoundEffect = useCallback((effect) => {
        playUiSound(effect, soundEffectsEnabled);
    }, [soundEffectsEnabled]);

    // Notification Helpers
    const showNotification = useCallback((title, options) => {
        if (notificationsEnabled && 'Notification' in window && Notification.permission === 'granted') {
            new Notification(title, options);
        }
    }, [notificationsEnabled]);

    const handleSetNotifications = async (enabled) => {
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
    };

    // Auto Archive & Streak Updates on Day Change
    useEffect(() => {
        if (!allDataLoaded) return;

        const today = getTodayDateString();
        const lastActive = stats.lastActiveDate;
        const tasksCompletedToday = tasks.some(t => t.completionDate === today);

        if (lastActive !== today) {
            if (autoArchiveEnabled) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];
                setTasks(currentTasks =>
                    currentTasks.map(t => (t.completionDate === yesterdayStr ? { ...t, isArchived: true } : t))
                );
            }

            if (tasksCompletedToday) {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = yesterday.toISOString().split('T')[0];

                if (lastActive === yesterdayStr) {
                    setStats(prev => ({ ...prev, streak: prev.streak + 1, lastActiveDate: today }));
                } else {
                    setStats(prev => ({ ...prev, streak: 1, lastActiveDate: today }));
                }
            }
        }
    }, [allDataLoaded, tasks, stats.lastActiveDate, autoArchiveEnabled]);

    // Check Achievements
    useEffect(() => {
        if (!allDataLoaded) return;
        for (const achievement of achievementsList) {
            if (!unlockedAchievements.includes(achievement.id) && achievement.check(tasks, stats, grove)) {
                setUnlockedAchievements(prev => [...prev, achievement.id]);
                ui.setAchievementToast(achievement);
                playSoundEffect('achievement');
                setTimeout(() => ui.setAchievementToast(null), 4000);
            }
        }
    }, [tasks, stats, grove, unlockedAchievements, allDataLoaded, playSoundEffect, ui]);

    // Check Momentum Goal
    const tasksCompletedToday = useMemo(() => tasks.filter(t => t.completionDate === getTodayDateString()).length, [tasks]);
    const MOMENTUM_GOAL = 5;
    const momentumProgress = Math.min(tasksCompletedToday / MOMENTUM_GOAL, 1);

    useEffect(() => {
        if (allDataLoaded && tasksCompletedToday >= MOMENTUM_GOAL) {
            const today = getTodayDateString();
            const awardedDateKey = 'momentum-awarded-date';
            const lastAwardedDate = localStorage.getItem(awardedDateKey);
            if (lastAwardedDate !== today) {
                setStats(prev => ({ ...prev, goldenSeeds: prev.goldenSeeds + 1 }));
                localStorage.setItem(awardedDateKey, today);
            }
        }
    }, [tasksCompletedToday, allDataLoaded]);

    // Shutdown Ritual Content & Assistant Messages
    const shutdownRitualMessages = useMemo(() => getShutdownRitualMessages(tasksCompletedToday), [tasksCompletedToday]);

    useEffect(() => {
        if (shutdownRitual.active) {
            ui.setAssistantMessage({ message: shutdownRitualMessages[shutdownRitual.step] });
        } else if (!shutdownRitual.active && ui.assistantMessage?.message?.startsWith("Let's wind down")) {
            ui.setAssistantMessage(null);
        }
    }, [shutdownRitual, shutdownRitualMessages]);

    // Task Actions
    const addTask = (text, applyTemplate = null) => {
        playSoundEffect('add');

        if (applyTemplate) {
            const template = templates.find(t => t.name === applyTemplate);
            if (!template) return;
            const newTasks = template.tasks.map(t => ({
                ...t,
                id: Date.now() + Math.random(),
                subtasks: [],
                win: null,
                completionDate: null,
                notes: '',
                attachments: [],
                tags: [],
                isPinned: false,
                focusSessions: 0,
                isArchived: false
            }));
            setTasks(prev => [...prev, ...newTasks]);
            ui.setTemplateSuggestion(null);
            return;
        }

        if (ui.templateSuggestion) {
            ui.setTemplateSuggestion(null);
        }
        
        const matchingTemplate = templates.find(t => text.toLowerCase().includes(t.name.toLowerCase()));
        if (matchingTemplate) {
            ui.setTemplateSuggestion({ templateName: matchingTemplate.name, taskText: text });
            return;
        }

        let { deadline, cleanedText, recurring } = parseIntelligentDeadline(text);

        const tagRegex = /@(\w+)/g;
        const tags = [...cleanedText.matchAll(tagRegex)].map(match => match[1]);
        cleanedText = cleanedText.replace(tagRegex, '').trim();

        let priority = 2;
        if (cleanedText.includes('!')) {
            priority = 3;
            cleanedText = cleanedText.replace(/!/g, '').trim();
        }
        if (cleanedText.toLowerCase().includes('urgent')) {
            priority = 3;
            cleanedText = cleanedText.replace(/urgent/ig, '').trim();
        }
        if (cleanedText.toLowerCase().includes('low priority')) {
            priority = 1;
            cleanedText = cleanedText.replace(/low priority/ig, '').trim();
        }

        let category = 'General';
        const categoryMatch = cleanedText.match(/#(\w+)/);
        if (categoryMatch) {
            category = categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1);
            cleanedText = cleanedText.replace(/#\w+/, '').trim();
        }

        let time = 'afternoon';
        if (cleanedText.toLowerCase().includes('morning')) {
            time = 'morning';
            cleanedText = cleanedText.replace(/morning/ig, '').trim();
        }
        if (cleanedText.toLowerCase().includes('evening') || cleanedText.toLowerCase().includes('night')) {
            time = 'evening';
            cleanedText = cleanedText.replace(/evening|night/ig, '').trim();
        }

        const newTask = {
            id: Date.now(),
            text: cleanedText.replace(/  +/g, ' ').trim(),
            completed: false,
            priority,
            category,
            timeOfDay: time,
            deadline,
            subtasks: [],
            win: null,
            completionDate: null,
            recurring,
            notes: '',
            attachments: [],
            tags,
            isPinned: false,
            focusSessions: 0,
            isArchived: false
        };

        setTasks(prevTasks => [...prevTasks, newTask]);
    };

    const toggleTask = (id) => {
        const taskToToggle = tasks.find(t => t.id === id);
        if (!taskToToggle) return;

        const isCompleting = !taskToToggle.completed;
        if (isCompleting) {
            playSoundEffect('complete');
        }

        const newTasks = tasks.map(t => {
            if (t.id === id) {
                if (t.recurring) {
                    const nextDate = new Date(t.deadline || getTodayDateString());
                    if (t.recurring.type === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                    if (t.recurring.type === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                    if (t.recurring.type === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                    return { ...t, deadline: nextDate.toISOString().split('T')[0] };
                }
                return { ...t, completed: !t.completed, completionDate: t.completed ? null : getTodayDateString() };
            }
            return t;
        });

        if (taskToToggle.recurring) {
            const completedInstance = {
                ...taskToToggle,
                id: Date.now(),
                completed: true,
                recurring: null,
                completionDate: getTodayDateString()
            };
            newTasks.push(completedInstance);
        }

        if (isCompleting) {
            setGrove(prevGrove => {
                const latestTreeIndex = prevGrove.findLastIndex(tree => tree.growthPoints < tree.maxGrowth);
                if (latestTreeIndex > -1) {
                    const newGrove = [...prevGrove];
                    newGrove[latestTreeIndex] = {
                        ...newGrove[latestTreeIndex],
                        growthPoints: newGrove[latestTreeIndex].growthPoints + 1
                    };
                    return newGrove;
                }
                return prevGrove;
            });

            if (taskToToggle.priority >= 2 && !taskToToggle.recurring) {
                ui.setWinModalTaskId(id);
            }
        }
        
        setTasks(newTasks);
    };

    const togglePin = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
    };

    const saveWin = (id, winText) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, win: winText } : t));
        ui.setWinModalTaskId(null);
    };

    const deleteTask = async (id) => {
        const taskToDelete = tasks.find(t => t.id === id);
        if (taskToDelete && taskToDelete.attachments) {
            for (const att of taskToDelete.attachments) {
                await deleteFile(att.id);
            }
        }
        setTasks(tasks.filter(task => task.id !== id));
    };

    const archiveTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, isArchived: true } : t));
    };

    const restoreTask = (id) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, isArchived: false } : t));
    };

    const saveTaskDetail = (id, newText, newNotes, newTags) => {
        setTasks(tasks.map(t => t.id === id ? { ...t, text: newText, notes: newNotes, tags: newTags } : t));
    };

    const setTaskDependency = (taskId, dependencyId) => {
        setTasks(tasks.map(t => t.id === taskId ? { ...t, dependsOn: dependencyId } : t));
    };

    const addAttachmentToTask = async (taskId, file) => {
        const fileId = crypto.randomUUID();
        const attachmentMeta = { id: fileId, name: file.name, type: file.type };
        await setFile(fileId, file);

        setTasks(currentTasks =>
            currentTasks.map(task => {
                if (task.id === taskId) {
                    const attachments = task.attachments || [];
                    return { ...task, attachments: [...attachments, attachmentMeta] };
                }
                return task;
            })
        );
    };

    const deleteAttachmentFromTask = async (taskId, attachment) => {
        await deleteFile(attachment.id);
        setTasks(currentTasks =>
            currentTasks.map(task => {
                if (task.id === taskId) {
                    return {
                        ...task,
                        attachments: task.attachments.filter(att => att.id !== attachment.id),
                    };
                }
                return task;
            })
        );
    };

    const saveTemplate = (category, tasksToSave) => {
        const templateTasks = tasksToSave.map(t => ({
            text: t.text,
            category: t.category,
            priority: t.priority,
            timeOfDay: t.timeOfDay
        }));
        setTemplates(prev => [...prev, { name: category, tasks: templateTasks }]);
        ui.setToastMessage({ type: 'success', text: `Saved template: ${category}` });
    };

    const handlePlantSeed = () => {
        if (stats.goldenSeeds > 0) {
            setStats(prev => ({ ...prev, goldenSeeds: prev.goldenSeeds - 1 }));
            ui.setIsPlanting(true);
        }
    };

    const finishPlanting = () => {
        const unlockedTrees = ['oak'];
        if (unlockedAchievements.includes('streak_3')) unlockedTrees.push('pine');
        if (unlockedAchievements.includes('focused_finish')) unlockedTrees.push('cherry');
        const randomType = unlockedTrees[Math.floor(Math.random() * unlockedTrees.length)];
        
        setGrove(prev => [...prev, { id: Date.now(), growthPoints: 0, maxGrowth: 10, type: randomType }]);
        ui.setIsPlanting(false);
    };

    const reorderTask = (taskId, direction) => {
        const tasksToSort = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);
        
        const index = tasksToSort.findIndex(t => t.id === taskId);
        if (index === -1) return;
        
        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= tasksToSort.length) return;
        
        const [movedTask] = tasksToSort.splice(index, 1);
        tasksToSort.splice(newIndex, 0, movedTask);
        
        setTasks([...tasksToSort, ...completedTasks]);
    };

    const toggleSubtask = (taskId, subtaskText) => {
        setTasks(tasks.map(task => {
            if (task.id === taskId) {
                const newSubtasks = task.subtasks.map(st =>
                    st.text === subtaskText ? { ...st, completed: !st.completed } : st
                );
                return { ...task, subtasks: newSubtasks };
            }
            return task;
        }));
    };

    const handleFocusComplete = (taskId) => {
        toggleTask(taskId);
        setStats(s => ({ ...s, focusedTasksCompleted: s.focusedTasksCompleted + 1 }));
        setTasks(prevTasks => prevTasks.map(t =>
            t.id === taskId ? { ...t, focusSessions: (t.focusSessions || 0) + 1 } : t
        ));
        showNotification("Focus session complete!", {
            body: `Great work on: ${tasks.find(t => t.id === taskId)?.text}`,
        });
    };

    // Export / Import
    const handleExport = () => {
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
    };

    const handleImportFile = (e) => {
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
                if (data.hasLaunched) setHasLaunched(data.hasLaunched);
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
    };

    const dailyQuote = useMemo(() => { 
        const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / (1000 * 60 * 60 * 24));
        return motivationalQuotes[dayOfYear % motivationalQuotes.length];
    }, []);

    const dailyStats = useMemo(() => {
        const todayStr = getTodayDateString();
        const completedToday = tasks.filter(t => t.completionDate === todayStr).length;
        const focusToday = tasks.reduce((acc, task) => {
            if (task.completionDate === todayStr) {
                return acc + (task.focusSessions || 0);
            }
            return acc;
        }, 0);
        return { completed: completedToday, focusSessions: focusToday, achievements: unlockedAchievements.length };
    }, [tasks, unlockedAchievements]);

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

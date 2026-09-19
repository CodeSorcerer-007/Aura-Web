import { useEffect, useMemo, useCallback } from 'react';
import { getTodayDateString } from '../utils/dateUtils';
import { achievementsList } from '../utils/constants';

export const useStatsAndGrove = ({
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
    showNotification,
    toggleTask,
    ui
}) => {
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
    }, [allDataLoaded, tasks, stats.lastActiveDate, autoArchiveEnabled, setTasks, setStats]);

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
    }, [tasks, stats, grove, unlockedAchievements, allDataLoaded, playSoundEffect, ui, setUnlockedAchievements]);

    // Daily Momentum Goal
    const MOMENTUM_GOAL = 5;
    const tasksCompletedToday = useMemo(
        () => tasks.filter(t => t.completionDate === getTodayDateString()).length,
        [tasks]
    );
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
    }, [tasksCompletedToday, allDataLoaded, setStats]);

    const handlePlantSeed = useCallback(() => {
        if (stats.goldenSeeds > 0) {
            setStats(prev => ({ ...prev, goldenSeeds: prev.goldenSeeds - 1 }));
            ui.setIsPlanting(true);
        }
    }, [stats.goldenSeeds, setStats, ui]);

    const finishPlanting = useCallback(() => {
        const unlockedTrees = ['oak'];
        if (unlockedAchievements.includes('streak_3')) unlockedTrees.push('pine');
        if (unlockedAchievements.includes('focused_finish')) unlockedTrees.push('cherry');
        const randomType = unlockedTrees[Math.floor(Math.random() * unlockedTrees.length)];

        setGrove(prev => [...prev, { id: Date.now(), growthPoints: 0, maxGrowth: 10, type: randomType }]);
        ui.setIsPlanting(false);
    }, [unlockedAchievements, setGrove, ui]);

    const handleFocusComplete = useCallback((taskId) => {
        toggleTask(taskId);
        setStats(s => ({ ...s, focusedTasksCompleted: s.focusedTasksCompleted + 1 }));
        setTasks(prevTasks => prevTasks.map(t =>
            t.id === taskId ? { ...t, focusSessions: (t.focusSessions || 0) + 1 } : t
        ));

        // Append timestamped log to offline focus history
        try {
            const task = tasks.find(t => t.id === taskId);
            const history = JSON.parse(localStorage.getItem('aura-focus-history') || '[]');
            history.push({
                timestamp: new Date().toISOString(),
                taskId,
                category: task?.category || 'General',
                durationMinutes: 25
            });
            localStorage.setItem('aura-focus-history', JSON.stringify(history));
        } catch (e) {
            console.error('Failed to log focus history to localStorage:', e);
        }

        showNotification("Focus session complete!", {
            body: `Great work on: ${tasks.find(t => t.id === taskId)?.text}`,
        });
    }, [toggleTask, setStats, setTasks, showNotification, tasks]);

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

    return {
        tasksCompletedToday,
        momentumProgress,
        dailyStats,
        handlePlantSeed,
        finishPlanting,
        handleFocusComplete
    };
};

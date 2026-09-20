import { useEffect, useRef, useMemo, useCallback } from 'react';
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
    // Fix 2: receive focusHistory through props instead of reading localStorage directly
    focusHistory,
    setFocusHistory,
    // Fix 8: receive momentumAwardedDate through props instead of reading localStorage directly
    momentumAwardedDate,
    setMomentumAwardedDate,
    allDataLoaded,
    autoArchiveEnabled,
    playSoundEffect,
    showNotification,
    toggleTask,
    notification
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

    // Achievement toast auto-dismiss timer ref — tracked so we can clear it on
    // unmount, preventing a "setState on unmounted component" leak if the hook
    // tears down before the 4-second window expires.
    const achievementTimerRef = useRef(null);

    // Check Achievements
    useEffect(() => {
        if (!allDataLoaded) return;
        for (const achievement of achievementsList) {
            if (!unlockedAchievements.includes(achievement.id) && achievement.check(tasks, stats, grove)) {
                setUnlockedAchievements(prev => [...prev, achievement.id]);
                notification.setAchievementToast(achievement);
                playSoundEffect('achievement');
                // Clear any running dismiss timer before setting a new one so
                // multiple back-to-back unlocks don't race each other.
                if (achievementTimerRef.current) clearTimeout(achievementTimerRef.current);
                achievementTimerRef.current = setTimeout(() => {
                    notification.setAchievementToast(null);
                    achievementTimerRef.current = null;
                }, 4000);
            }
        }
    }, [tasks, stats, grove, unlockedAchievements, allDataLoaded, playSoundEffect, notification, setUnlockedAchievements]);

    // Clean up on unmount
    useEffect(() => {
        return () => {
            if (achievementTimerRef.current) clearTimeout(achievementTimerRef.current);
        };
    }, []);

    // Daily Momentum Goal
    const MOMENTUM_GOAL = 5;
    const tasksCompletedToday = useMemo(
        () => tasks.filter(t => t.completionDate === getTodayDateString()).length,
        [tasks]
    );
    const momentumProgress = Math.min(tasksCompletedToday / MOMENTUM_GOAL, 1);

    // Fix 8: Use context-provided momentumAwardedDate instead of raw localStorage key.
    useEffect(() => {
        if (!allDataLoaded) return;
        if (tasksCompletedToday >= MOMENTUM_GOAL) {
            const today = getTodayDateString();
            if (momentumAwardedDate !== today) {
                setStats(prev => ({ ...prev, goldenSeeds: prev.goldenSeeds + 1 }));
                setMomentumAwardedDate(today);
            }
        }
    }, [tasksCompletedToday, allDataLoaded, momentumAwardedDate, setMomentumAwardedDate, setStats]);

    const handlePlantSeed = useCallback(() => {
        if (stats.goldenSeeds > 0) {
            setStats(prev => ({ ...prev, goldenSeeds: prev.goldenSeeds - 1 }));
            notification.setIsPlanting(true);
        }
    }, [stats.goldenSeeds, setStats, notification]);

    const finishPlanting = useCallback(() => {
        const unlockedTrees = ['oak'];
        if (unlockedAchievements.includes('streak_3')) unlockedTrees.push('pine');
        if (unlockedAchievements.includes('focused_finish')) unlockedTrees.push('cherry');
        const randomType = unlockedTrees[Math.floor(Math.random() * unlockedTrees.length)];

        setGrove(prev => [...prev, { id: Date.now(), growthPoints: 0, maxGrowth: 10, type: randomType }]);
        notification.setIsPlanting(false);
    }, [unlockedAchievements, setGrove, notification]);

    // Fix 2: handleFocusComplete now writes to React state (setFocusHistory) instead
    // of directly to localStorage, eliminating the dual-write drift that caused
    // ReviewView to fall back to fragile task-level estimation.
    const handleFocusComplete = useCallback((taskId) => {
        toggleTask(taskId);
        setStats(s => ({ ...s, focusedTasksCompleted: s.focusedTasksCompleted + 1 }));
        setTasks(prevTasks => prevTasks.map(t =>
            t.id === taskId ? { ...t, focusSessions: (t.focusSessions || 0) + 1 } : t
        ));

        // Append timestamped entry to the React-managed focus history
        const task = tasks.find(t => t.id === taskId);
        setFocusHistory(prev => [
            ...prev,
            {
                timestamp: new Date().toISOString(),
                taskId,
                category: task?.category || 'General',
                durationMinutes: 25
            }
        ]);

        showNotification('Focus session complete!', {
            body: `Great work on: ${task?.text ?? ''}`,
        });
    }, [toggleTask, setStats, setTasks, setFocusHistory, showNotification, tasks]);

    const dailyStats = useMemo(() => {
        const todayStr = getTodayDateString();
        const completedToday = tasks.filter(t => t.completionDate === todayStr).length;
        // Fix 2: derive focusSessions for today from the canonical focusHistory state
        const focusToday = focusHistory.filter(h => h.timestamp?.startsWith(todayStr)).length;
        return { completed: completedToday, focusSessions: focusToday, achievements: unlockedAchievements.length };
    }, [tasks, focusHistory, unlockedAchievements]);

    return {
        tasksCompletedToday,
        momentumProgress,
        dailyStats,
        handlePlantSeed,
        finishPlanting,
        handleFocusComplete
    };
};

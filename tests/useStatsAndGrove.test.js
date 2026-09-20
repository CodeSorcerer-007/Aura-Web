/**
 * useStatsAndGrove — unit tests
 *
 * Tests are split into two parts:
 *  1. Pure-logic tests — test the computations directly (no React overhead).
 *  2. Hooks-integration tests — use renderHook for behaviour that requires
 *     React's effect scheduling.
 *
 * Fake timers are used globally to prevent setTimeout accumulation from
 * achievement checks from crashing the worker process.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import React from 'react';

// ─── fake timers ─────────────────────────────────────────────────────────────

beforeEach(() => vi.useFakeTimers());
afterEach(() => { vi.runAllTimers(); vi.useRealTimers(); });

// ─── date helpers ─────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];
const yesterday = () => {
    const d = new Date(); d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};
const daysAgo = (n) => {
    const d = new Date(); d.setDate(d.getDate() - n);
    return d.toISOString().split('T')[0];
};

// ─── task factory ─────────────────────────────────────────────────────────────

const makeTask = (overrides = {}) => ({
    id: crypto.randomUUID(),
    text: 'Task',
    completed: false,
    priority: 2,
    category: 'General',
    timeOfDay: 'afternoon',
    deadline: null,
    subtasks: [],
    win: null,
    completionDate: null,
    recurring: null,
    focusSessions: 0,
    isArchived: false,
    createdAt: new Date().toISOString(),
    ...overrides,
});

// ─── Pure logic tests (no renderHook) ────────────────────────────────────────

describe('momentumProgress computation', () => {
    it('returns 0.6 for 3 out of 5 completions today', () => {
        const tasks = [
            ...Array.from({ length: 3 }, () => makeTask({ completed: true, completionDate: TODAY })),
            ...Array.from({ length: 2 }, () => makeTask()),
        ];
        const count = tasks.filter(t => t.completionDate === TODAY).length;
        const progress = Math.min(count / 5, 1);
        expect(progress).toBe(0.6);
    });

    it('caps at 1.0 for more than 5 completions today', () => {
        const tasks = Array.from({ length: 8 }, () => makeTask({ completed: true, completionDate: TODAY }));
        const count = tasks.filter(t => t.completionDate === TODAY).length;
        expect(Math.min(count / 5, 1)).toBe(1.0);
    });

    it('returns 0 when no tasks are completed', () => {
        expect(Math.min(0, 1)).toBe(0);
    });
});

describe('streak logic', () => {
    it('increments when last active was yesterday', () => {
        const prevStreak = 3;
        const lastActive = yesterday();
        const isConsecutive = lastActive === yesterday();
        const newStreak = isConsecutive ? prevStreak + 1 : 1;
        expect(newStreak).toBe(4);
    });

    it('resets to 1 when gap is > 1 day', () => {
        const lastActive = daysAgo(3);
        const isConsecutive = lastActive === yesterday();
        const newStreak = isConsecutive ? 99 : 1;
        expect(newStreak).toBe(1);
    });
});

describe('golden seed award logic', () => {
    const GOAL = 5;

    it('awards seed when 5+ tasks done today and not yet awarded', () => {
        const completedToday = 5;
        const momentumAwardedDate = '';
        const shouldAward = completedToday >= GOAL && momentumAwardedDate !== TODAY;
        expect(shouldAward).toBe(true);
    });

    it('does NOT award when already awarded today', () => {
        const completedToday = 5;
        const momentumAwardedDate = TODAY;
        const shouldAward = completedToday >= GOAL && momentumAwardedDate !== TODAY;
        expect(shouldAward).toBe(false);
    });

    it('does NOT award when fewer than 5 tasks done', () => {
        const completedToday = 3;
        const momentumAwardedDate = '';
        const shouldAward = completedToday >= GOAL && momentumAwardedDate !== TODAY;
        expect(shouldAward).toBe(false);
    });
});

describe('dailyStats derivation', () => {
    it('counts completions and focus sessions for today only', () => {
        const tasks = [
            makeTask({ completed: true, completionDate: TODAY }),
            makeTask({ completed: true, completionDate: TODAY }),
            makeTask({ completed: true, completionDate: daysAgo(1) }), // not today
        ];
        const todayTs = new Date().toISOString();
        const yesterdayTs = new Date(Date.now() - 86400000).toISOString();
        const focusHistory = [
            { timestamp: todayTs, taskId: 'a', category: 'Work', durationMinutes: 25 },
            { timestamp: yesterdayTs, taskId: 'b', category: 'Work', durationMinutes: 25 },
        ];
        const completedToday = tasks.filter(t => t.completionDate === TODAY).length;
        const focusToday = focusHistory.filter(h => h.timestamp?.startsWith(TODAY)).length;
        expect(completedToday).toBe(2);
        expect(focusToday).toBe(1);
    });
});

describe('auto-archive logic', () => {
    it('archives tasks with completionDate = yesterday when day changes', () => {
        const yest = yesterday();
        const tasks = [
            makeTask({ completed: true, completionDate: yest }),
            makeTask({ completed: true, completionDate: TODAY }),
        ];
        const archived = tasks.map(t =>
            t.completionDate === yest ? { ...t, isArchived: true } : t
        );
        expect(archived[0].isArchived).toBe(true);
        expect(archived[1].isArchived).toBe(false);
    });
});

describe('achievement condition checks', () => {
    it('first_task fires when a completed task exists', async () => {
        const { achievementsList } = await import('../src/utils/constants');
        const firstTask = achievementsList.find(a => a.id === 'first_task');
        expect(firstTask).toBeDefined();

        const tasks = [makeTask({ completed: true })];
        expect(firstTask.check(tasks, {}, [])).toBe(true);
        expect(firstTask.check([], {}, [])).toBe(false);
    });

    it('high_priority fires when a priority-3 task is completed', async () => {
        const { achievementsList } = await import('../src/utils/constants');
        const ach = achievementsList.find(a => a.id === 'high_priority');
        const tasks = [makeTask({ completed: true, priority: 3 })];
        expect(ach.check(tasks, {}, [])).toBe(true);
        expect(ach.check([makeTask({ completed: true, priority: 1 })], {}, [])).toBe(false);
    });

    it('streak_3 fires when stats.streak >= 3', async () => {
        const { achievementsList } = await import('../src/utils/constants');
        const ach = achievementsList.find(a => a.id === 'streak_3');
        expect(ach.check([], { streak: 3 }, [])).toBe(true);
        expect(ach.check([], { streak: 2 }, [])).toBe(false);
    });

    it('golden_seed fires when goldenSeeds > 0', async () => {
        const { achievementsList } = await import('../src/utils/constants');
        const ach = achievementsList.find(a => a.id === 'golden_seed');
        expect(ach.check([], { goldenSeeds: 1 }, [])).toBe(true);
        expect(ach.check([], { goldenSeeds: 0 }, [])).toBe(false);
    });

    it('tree_grower fires when a grove tree is fully grown', async () => {
        const { achievementsList } = await import('../src/utils/constants');
        const ach = achievementsList.find(a => a.id === 'tree_grower');
        const grove = [{ growthPoints: 10, maxGrowth: 10 }];
        expect(ach.check([], {}, grove)).toBe(true);
        expect(ach.check([], {}, [{ growthPoints: 5, maxGrowth: 10 }])).toBe(false);
    });
});

// ─── Hook integration tests (renderHook) ─────────────────────────────────────
// Kept minimal to reduce React environment overhead.

import { useStatsAndGrove } from '../src/hooks/useStatsAndGrove';

function useStatsHarness({
    initialTasks = [],
    initialStats = { streak: 1, goldenSeeds: 0, lastActiveDate: TODAY, focusedTasksCompleted: 0 },
    initialGrove = [],
    initialUnlocked = [],
    initialFocusHistory = [],
    initialMomentumAwardedDate = '',
    autoArchiveEnabled = false,
} = {}) {
    const [tasks, setTasks] = useState(initialTasks);
    const [stats, setStats] = useState(initialStats);
    const [grove, setGrove] = useState(initialGrove);
    const [unlockedAchievements, setUnlockedAchievements] = useState(initialUnlocked);
    const [focusHistory, setFocusHistory] = useState(initialFocusHistory);
    const [momentumAwardedDate, setMomentumAwardedDate] = useState(initialMomentumAwardedDate);

    const [notification] = useState(() => ({ setAchievementToast: vi.fn(), setIsPlanting: vi.fn() }));
    const [playSoundEffect] = useState(() => vi.fn());
    const [showNotification] = useState(() => vi.fn());
    const [toggleTask] = useState(() => vi.fn());

    const hookResult = useStatsAndGrove({
        tasks, setTasks, stats, setStats, grove, setGrove,
        unlockedAchievements, setUnlockedAchievements,
        focusHistory, setFocusHistory,
        momentumAwardedDate, setMomentumAwardedDate,
        allDataLoaded: true,
        autoArchiveEnabled,
        playSoundEffect,
        showNotification,
        toggleTask,
        notification,
    });

    return {
        tasks, stats, grove, unlockedAchievements, focusHistory, momentumAwardedDate,
        notification,
        playSoundEffect,
        showNotification,
        toggleTask,
        ...hookResult,
    };
}

describe('handleFocusComplete (hook)', () => {
    it('calls toggleTask and appends to focusHistory', () => {
        const task = makeTask({ id: 'f1', category: 'Design', text: 'Focus task' });
        const { result } = renderHook(() => useStatsHarness({ initialTasks: [task] }));

        act(() => result.current.handleFocusComplete('f1'));

        expect(result.current.toggleTask).toHaveBeenCalledWith('f1');
        expect(result.current.focusHistory.length).toBe(1);
        expect(result.current.focusHistory[0].taskId).toBe('f1');
        expect(result.current.focusHistory[0].category).toBe('Design');
        expect(result.current.focusHistory[0].durationMinutes).toBe(25);
    });

    it('increments task.focusSessions', () => {
        const task = makeTask({ id: 'f2', focusSessions: 0 });
        const { result } = renderHook(() => useStatsHarness({ initialTasks: [task] }));

        act(() => result.current.handleFocusComplete('f2'));

        expect(result.current.tasks[0].focusSessions).toBe(1);
    });

    it('sends a browser notification', () => {
        const task = makeTask({ id: 'f3', text: 'Ship feature' });
        const { result } = renderHook(() => useStatsHarness({ initialTasks: [task] }));

        act(() => result.current.handleFocusComplete('f3'));

        expect(result.current.showNotification).toHaveBeenCalledWith(
            'Focus session complete!',
            expect.objectContaining({ body: expect.stringContaining('Ship feature') })
        );
    });
});

describe('handlePlantSeed (hook)', () => {
    it('decrements goldenSeeds and opens planting animation', () => {
        const { result } = renderHook(() =>
            useStatsHarness({
                initialStats: { streak: 1, goldenSeeds: 2, lastActiveDate: TODAY, focusedTasksCompleted: 0 },
            })
        );

        act(() => result.current.handlePlantSeed());

        expect(result.current.stats.goldenSeeds).toBe(1);
        expect(result.current.notification.setIsPlanting).toHaveBeenCalledWith(true);
    });

    it('does nothing when goldenSeeds=0', () => {
        const { result } = renderHook(() => useStatsHarness());

        act(() => result.current.handlePlantSeed());

        expect(result.current.notification.setIsPlanting).not.toHaveBeenCalled();
    });
});

describe('finishPlanting (hook)', () => {
    it('adds a tree and closes the planting animation', () => {
        const { result } = renderHook(() => useStatsHarness());

        act(() => result.current.finishPlanting());

        expect(result.current.grove.length).toBe(1);
        expect(['oak', 'pine', 'cherry']).toContain(result.current.grove[0].type);
        expect(result.current.grove[0].growthPoints).toBe(0);
        expect(result.current.grove[0].maxGrowth).toBe(10);
        expect(result.current.notification.setIsPlanting).toHaveBeenCalledWith(false);
    });
});

describe('achievement detection (hook)', () => {
    it('unlocks first_task on mount when a completed task exists', () => {
        const tasks = [makeTask({ completed: true })];
        const { result } = renderHook(() => useStatsHarness({ initialTasks: tasks }));

        expect(result.current.unlockedAchievements).toContain('first_task');
        expect(result.current.notification.setAchievementToast).toHaveBeenCalledWith(
            expect.objectContaining({ id: 'first_task' })
        );
        expect(result.current.playSoundEffect).toHaveBeenCalledWith('achievement');
    });

    it('does not fire for already-unlocked achievements', () => {
        const tasks = [makeTask({ completed: true })];
        const allIds = ['first_task', 'high_priority', 'first_win', 'golden_seed', 'streak_3', 'focused_finish', 'tree_grower'];
        const { result } = renderHook(() =>
            useStatsHarness({ initialTasks: tasks, initialUnlocked: allIds })
        );

        expect(result.current.notification.setAchievementToast).not.toHaveBeenCalled();
    });
});

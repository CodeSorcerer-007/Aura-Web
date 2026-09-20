import { describe, it, expect } from 'vitest';
import {
    defaultCategories,
    motivationalQuotes,
    achievementsList,
    baseThemes,
    getShutdownRitualMessages,
    demoTasks
} from '../src/utils/constants';

describe('constants and master data', () => {
    it('has all required default categories with color properties', () => {
        expect(Object.keys(defaultCategories)).toContain('Work');
        expect(Object.keys(defaultCategories)).toContain('Personal');
        expect(Object.keys(defaultCategories)).toContain('General');

        for (const [, val] of Object.entries(defaultCategories)) {
            expect(val).toHaveProperty('bg');
            expect(val).toHaveProperty('border');
            expect(val).toHaveProperty('text');
            expect(val).toHaveProperty('glowColor');
        }
    });

    it('contains motivational quotes with author and non-empty quote', () => {
        expect(motivationalQuotes.length).toBeGreaterThanOrEqual(5);
        for (const q of motivationalQuotes) {
            expect(typeof q.quote).toBe('string');
            expect(typeof q.author).toBe('string');
            expect(q.quote.length).toBeGreaterThan(0);
        }
    });

    it('evaluates achievement conditions accurately', () => {
        const firstTaskAch = achievementsList.find(a => a.id === 'first_task');
        expect(firstTaskAch.check([{ completed: false }])).toBe(false);
        expect(firstTaskAch.check([{ completed: true }])).toBe(true);

        const highPriorityAch = achievementsList.find(a => a.id === 'high_priority');
        expect(highPriorityAch.check([{ completed: true, priority: 2 }])).toBe(false);
        expect(highPriorityAch.check([{ completed: true, priority: 3 }])).toBe(true);

        const goldenSeedAch = achievementsList.find(a => a.id === 'golden_seed');
        expect(goldenSeedAch.check([], { goldenSeeds: 0 })).toBe(false);
        expect(goldenSeedAch.check([], { goldenSeeds: 2 })).toBe(true);

        const streakAch = achievementsList.find(a => a.id === 'streak_3');
        expect(streakAch.check([], { streak: 2 })).toBe(false);
        expect(streakAch.check([], { streak: 3 })).toBe(true);

        const treeGrowerAch = achievementsList.find(a => a.id === 'tree_grower');
        expect(treeGrowerAch.check([], {}, [{ growthPoints: 50, maxGrowth: 100 }])).toBe(false);
        expect(treeGrowerAch.check([], {}, [{ growthPoints: 100, maxGrowth: 100 }])).toBe(true);
    });

    it('defines base themes with id, name, bg, text', () => {
        expect(baseThemes.length).toBeGreaterThanOrEqual(10);
        for (const t of baseThemes) {
            expect(t.id).toBeDefined();
            expect(t.name).toBeDefined();
            expect(t.bg).toBeDefined();
            expect(t.text).toBeDefined();
        }
    });

    it('formats shutdown ritual messages with completed tasks count', () => {
        const msgs = getShutdownRitualMessages(5);
        expect(msgs).toHaveLength(3);
        expect(msgs[0]).toContain('5 tasks');
    });

    it('has valid structure for all demo tasks', () => {
        expect(demoTasks.length).toBeGreaterThan(0);
        for (const task of demoTasks) {
            expect(task.id).toBeDefined();
            expect(task.text).toBeDefined();
            expect(typeof task.completed).toBe('boolean');
            expect(task.priority).toBeGreaterThanOrEqual(1);
            expect(task.priority).toBeLessThanOrEqual(3);
        }
    });
});

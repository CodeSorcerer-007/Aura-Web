/**
 * GroveContext — provider tests
 *
 * Covers:
 *  - Default state shape on first mount
 *  - Persistence round-trip via localStorage (usePreferences)
 *  - aura-grove pruning: trees beyond MAX_GROVE_TREES are trimmed on mount
 *  - aura-focus-history pruning: entries beyond MAX_FOCUS_HISTORY are trimmed on mount
 *  - groveDataLoaded is true after synchronous hydration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';
import { GroveProvider, useGrove } from '../src/context/GroveContext';

const wrapper = ({ children }) => <GroveProvider>{children}</GroveProvider>;

// ─── helpers ────────────────────────────────────────────────────────────────

const makeTrees = (n) =>
    Array.from({ length: n }, (_, i) => ({ id: i, growthPoints: i % 10, maxGrowth: 10, type: 'oak' }));

const makeFocusEntries = (n) =>
    Array.from({ length: n }, (_, i) => ({
        timestamp: new Date(Date.now() - i * 60_000).toISOString(),
        taskId: `task-${i}`,
        category: 'General',
        durationMinutes: 25,
    }));

// ─── tests ───────────────────────────────────────────────────────────────────

describe('GroveContext defaults', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    it('returns correct default state shape', () => {
        const { result } = renderHook(() => useGrove(), { wrapper });

        expect(result.current.stats).toMatchObject({
            streak: expect.any(Number),
            goldenSeeds: expect.any(Number),
            lastActiveDate: expect.any(String),
            focusedTasksCompleted: expect.any(Number),
        });
        expect(Array.isArray(result.current.grove)).toBe(true);
        expect(Array.isArray(result.current.focusHistory)).toBe(true);
        expect(Array.isArray(result.current.unlockedAchievements)).toBe(true);
        expect(result.current.groveDataLoaded).toBe(true);
    });

    it('exposes setters for all state slices', () => {
        const { result } = renderHook(() => useGrove(), { wrapper });

        expect(typeof result.current.setStats).toBe('function');
        expect(typeof result.current.setGrove).toBe('function');
        expect(typeof result.current.setFocusHistory).toBe('function');
        expect(typeof result.current.setUnlockedAchievements).toBe('function');
        expect(typeof result.current.setMomentumAwardedDate).toBe('function');
    });
});

describe('GroveContext persistence', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    it('persists grove trees to localStorage via setGrove', async () => {
        const { result } = renderHook(() => useGrove(), { wrapper });

        act(() => {
            result.current.setGrove([{ id: 1, growthPoints: 3, maxGrowth: 10, type: 'cherry' }]);
        });

        const stored = JSON.parse(localStorage.getItem('aura-grove'));
        expect(stored).toHaveLength(1);
        expect(stored[0].type).toBe('cherry');
    });

    it('persists focus history entries to localStorage via setFocusHistory', async () => {
        const { result } = renderHook(() => useGrove(), { wrapper });
        const entry = { timestamp: new Date().toISOString(), taskId: 'abc', category: 'Work', durationMinutes: 25 };

        act(() => {
            result.current.setFocusHistory([entry]);
        });

        const stored = JSON.parse(localStorage.getItem('aura-focus-history'));
        expect(stored).toHaveLength(1);
        expect(stored[0].taskId).toBe('abc');
    });

    it('re-hydrates from localStorage on remount', () => {
        const trees = [{ id: 99, growthPoints: 5, maxGrowth: 10, type: 'pine' }];
        localStorage.setItem('aura-grove', JSON.stringify(trees));

        const { result } = renderHook(() => useGrove(), { wrapper });
        expect(result.current.grove).toEqual(trees);
    });
});

describe('GroveContext pruning', () => {
    beforeEach(() => localStorage.clear());
    afterEach(() => localStorage.clear());

    it('prunes grove trees to MAX_GROVE_TREES (500) on mount when over limit', async () => {
        // Plant 600 trees — should be pruned to 500 on mount
        localStorage.setItem('aura-grove', JSON.stringify(makeTrees(600)));

        const { result } = renderHook(() => useGrove(), { wrapper });

        // Pruning runs in a useEffect; wait for it to apply
        await waitFor(() => expect(result.current.grove.length).toBeLessThanOrEqual(500));
        // The most recent trees (tail of the array) should be preserved
        expect(result.current.grove[result.current.grove.length - 1].id).toBe(599);
    });

    it('does NOT prune grove when under the limit', () => {
        localStorage.setItem('aura-grove', JSON.stringify(makeTrees(10)));

        const { result } = renderHook(() => useGrove(), { wrapper });
        expect(result.current.grove).toHaveLength(10);
    });

    it('prunes focus history to MAX_FOCUS_HISTORY (5000) on mount when over limit', async () => {
        localStorage.setItem('aura-focus-history', JSON.stringify(makeFocusEntries(5100)));

        const { result } = renderHook(() => useGrove(), { wrapper });

        await waitFor(() => expect(result.current.focusHistory.length).toBeLessThanOrEqual(5000));
        // Most recent entries should survive (tail preservation)
        expect(result.current.focusHistory[0].taskId).toBe('task-100');
    });

    it('does NOT prune focus history when under the limit', () => {
        localStorage.setItem('aura-focus-history', JSON.stringify(makeFocusEntries(100)));

        const { result } = renderHook(() => useGrove(), { wrapper });
        expect(result.current.focusHistory).toHaveLength(100);
    });
});

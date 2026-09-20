/**
 * TaskContext — integration tests
 *
 * Covers:
 *  - Tomorrow's Seed blossoming logic (date comparison, midnight re-check)
 *  - restoreSnapshotById state hydration
 *  - Snapshot payload shape and scheduling
 *
 * These tests wire the full context tree (UIProvider → NotificationProvider →
 * ThemeProvider → SettingsProvider → GroveProvider → TaskProvider) so that
 * the real provider hierarchy is exercised without a browser environment.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import React from 'react';

// ─── Mocks ───────────────────────────────────────────────────────────────────

// Silence Tone.js imports in test environment
vi.mock('../src/hooks/useSoundEffects', () => ({
    playHarmonicUiSound: vi.fn(),
}));

vi.mock('../src/hooks/useAmbientSound', () => ({
    resumeAudioContext: vi.fn(),
}));

// Stub snapshotVault so tests don't hit IndexedDB
vi.mock('../src/utils/snapshotVault', () => ({
    recordDailySnapshot: vi.fn(),
    getRollingSnapshots: vi.fn(() => []),
    getSnapshotDataById: vi.fn(async () => null),
    exportSafetyVaultToFile: vi.fn(async () => ({ success: true })),
}));

// ─── helpers ────────────────────────────────────────────────────────────────

const TODAY = new Date().toISOString().split('T')[0];
const yesterday = () => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
};

// ─── context wrapper ─────────────────────────────────────────────────────────

async function buildWrapper() {
    const { UIProvider } = await import('../src/context/UIContext');
    const { NotificationProvider } = await import('../src/context/NotificationContext');
    const { ThemeProvider } = await import('../src/context/ThemeContext');
    const { SettingsProvider } = await import('../src/context/SettingsContext');
    const { GroveProvider } = await import('../src/context/GroveContext');
    const { TaskProvider, useTasks } = await import('../src/context/TaskContext');

    const Wrapper = ({ children }) => (
        <UIProvider>
            <NotificationProvider>
                <ThemeProvider>
                    <SettingsProvider>
                        <GroveProvider>
                            <TaskProvider>{children}</TaskProvider>
                        </GroveProvider>
                    </SettingsProvider>
                </ThemeProvider>
            </NotificationProvider>
        </UIProvider>
    );

    return { Wrapper, useTasks };
}

// ─── seed blossoming ─────────────────────────────────────────────────────────

describe('Tomorrow\'s Seed blossoming', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('does NOT blossom when tomorrowSeed is null', async () => {
        const { Wrapper, useTasks } = await buildWrapper();
        const { result } = renderHook(() => useTasks(), { wrapper: Wrapper });

        await waitFor(() => expect(result.current.allDataLoaded).toBe(true));

        expect(result.current.tomorrowSeed).toBeNull();
        // tasks should remain as demo tasks — nothing blossomed
        const hasSeedTag = result.current.tasks.some(t => t.tags?.includes('seed'));
        expect(hasSeedTag).toBe(false);
    });

    it('blossoms a seed whose date has passed (date <= today)', async () => {
        // Pre-seed localStorage with a seed that was planted yesterday
        const seedPayload = { text: 'Launch product', date: yesterday() };
        localStorage.setItem('aura-tomorrow-seed', JSON.stringify(seedPayload));
        localStorage.setItem('aura-tasks', JSON.stringify([]));

        const { Wrapper, useTasks } = await buildWrapper();
        const { result } = renderHook(() => useTasks(), { wrapper: Wrapper });

        await waitFor(() => expect(result.current.allDataLoaded).toBe(true));

        // After blossoming the seed should be consumed
        await waitFor(() => expect(result.current.tomorrowSeed).toBeNull());

        // A task with the seed text should now exist in the tasks array
        const seededTask = result.current.tasks.find(t => t.text === 'Launch product');
        expect(seededTask).toBeDefined();
        expect(seededTask.tags).toContain('seed');
        expect(seededTask.isPinned).toBe(true);
        expect(seededTask.timeOfDay).toBe('morning');
    });

    it('does NOT blossom a seed whose date is in the future', async () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        localStorage.setItem('aura-tomorrow-seed', JSON.stringify({ text: 'Future task', date: tomorrowStr }));
        localStorage.setItem('aura-tasks', JSON.stringify([]));

        const { Wrapper, useTasks } = await buildWrapper();
        const { result } = renderHook(() => useTasks(), { wrapper: Wrapper });

        await waitFor(() => expect(result.current.allDataLoaded).toBe(true));

        // Seed should still be present — not yet blossomed
        expect(result.current.tomorrowSeed).not.toBeNull();
        expect(result.current.tomorrowSeed.text).toBe('Future task');

        const seededTask = result.current.tasks.find(t => t.text === 'Future task');
        expect(seededTask).toBeUndefined();
    });

    it('plantTomorrowSeed stores the seed with tomorrow\'s date', async () => {
        localStorage.setItem('aura-tasks', JSON.stringify([]));

        const { Wrapper, useTasks } = await buildWrapper();
        const { result } = renderHook(() => useTasks(), { wrapper: Wrapper });

        await waitFor(() => expect(result.current.allDataLoaded).toBe(true));

        act(() => {
            result.current.plantTomorrowSeed('Read 20 pages');
        });

        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        expect(result.current.tomorrowSeed).toEqual({ text: 'Read 20 pages', date: tomorrowStr });
    });

    it('re-checks blossoming on visibilitychange (midnight crossing)', async () => {
        // Start with a seed that will blossom today
        localStorage.setItem('aura-tomorrow-seed', JSON.stringify({ text: 'Midnight task', date: TODAY }));
        localStorage.setItem('aura-tasks', JSON.stringify([]));

        const { Wrapper, useTasks } = await buildWrapper();
        const { result } = renderHook(() => useTasks(), { wrapper: Wrapper });

        await waitFor(() => expect(result.current.allDataLoaded).toBe(true));
        // Seed blossoms on mount
        await waitFor(() => expect(result.current.tomorrowSeed).toBeNull());

        // Simulate a second visibilitychange after the seed has already blossomed
        // — should not duplicate the task
        act(() => {
            Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true });
            document.dispatchEvent(new Event('visibilitychange'));
        });

        const seedTasks = result.current.tasks.filter(t => t.text === 'Midnight task');
        expect(seedTasks.length).toBe(1);
    });
});

// ─── snapshot scheduling ─────────────────────────────────────────────────────

describe('snapshot lifecycle', () => {
    beforeEach(async () => {
        localStorage.clear();
        const { recordDailySnapshot } = await import('../src/utils/snapshotVault');
        vi.mocked(recordDailySnapshot).mockClear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('calls recordDailySnapshot once after allDataLoaded with a 1.5s delay', async () => {
        const { recordDailySnapshot } = await import('../src/utils/snapshotVault');
        const { Wrapper, useTasks } = await buildWrapper();

        // Use fake timers for just this test so we don't wait 1.5s for real
        vi.useFakeTimers({ shouldAdvanceTime: false, toFake: ['setTimeout', 'clearTimeout'] });

        renderHook(() => useTasks(), { wrapper: Wrapper });
        expect(vi.mocked(recordDailySnapshot)).not.toHaveBeenCalled();

        act(() => { vi.advanceTimersByTime(2000); });

        expect(vi.mocked(recordDailySnapshot)).toHaveBeenCalledTimes(1);
        const payload = vi.mocked(recordDailySnapshot).mock.calls[0][0];
        expect(Array.isArray(payload.tasks)).toBe(true);
        expect(typeof payload.settings).toBe('object');

        vi.useRealTimers();
    }, 10000);
});

// ─── restoreSnapshotById ─────────────────────────────────────────────────────

describe('restoreSnapshotById', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
    });

    it('returns false when snapshot is not found', async () => {
        const { getSnapshotDataById } = await import('../src/utils/snapshotVault');
        vi.mocked(getSnapshotDataById).mockResolvedValueOnce(null);

        const { Wrapper, useTasks } = await buildWrapper();
        const { result } = renderHook(() => useTasks(), { wrapper: Wrapper });

        await waitFor(() => expect(result.current.allDataLoaded).toBe(true));

        let restoreResult;
        await act(async () => {
            restoreResult = await result.current.restoreSnapshotById('snap_nonexistent');
        });

        expect(restoreResult).toBe(false);
    });

    it('hydrates tasks and templates from snapshot data', async () => {
        const { getSnapshotDataById } = await import('../src/utils/snapshotVault');
        const restoredTasks = [
            {
                id: 'restored-1', text: 'Restored task', completed: false, priority: 2,
                category: 'General', timeOfDay: 'morning', deadline: null,
                subtasks: [], win: null, completionDate: null, recurring: null,
                notes: '', attachments: [], voiceNotes: [], tags: [], isPinned: false,
                focusSessions: 0, isArchived: false, createdAt: new Date().toISOString()
            }
        ];
        const snapshotData = {
            tasks: restoredTasks,
            templates: [{ name: 'Sprint', tasks: [] }],
            settings: { shutdownTime: '22:00', soundEffectsEnabled: false, autoArchiveEnabled: false, notificationsEnabled: false }
        };
        vi.mocked(getSnapshotDataById).mockResolvedValueOnce(snapshotData);

        const { Wrapper, useTasks } = await buildWrapper();
        const { result } = renderHook(() => useTasks(), { wrapper: Wrapper });

        await waitFor(() => expect(result.current.allDataLoaded).toBe(true));

        await act(async () => {
            await result.current.restoreSnapshotById('snap_test123');
        });

        expect(result.current.tasks).toEqual(restoredTasks);
        expect(result.current.templates).toEqual([{ name: 'Sprint', tasks: [] }]);
    });
});

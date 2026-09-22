/**
 * useRitualsAndNotifications — unit tests
 *
 * Covers:
 *  - Shutdown ritual scheduling via the interval-based time comparator
 *  - testShutdownReminder triggers ritual state
 *  - Export produces a JSON blob with all expected keys
 *  - Import hydrates all state setters with data from the file
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { useRitualsAndNotifications } from '../src/hooks/useRitualsAndNotifications';
import { getTodayDateString } from '../src/utils/dateUtils';

// ─── date helpers ─────────────────────────────────────────────────────────────

const TODAY = getTodayDateString();

// ─── minimal harness ─────────────────────────────────────────────────────────

function makeNotification() {
    return {
        setToastMessage: vi.fn(),
        setAssistantMessage: vi.fn(),
        assistantMessage: null,
    };
}

function makeSetters() {
    return {
        setTasks: vi.fn(),
        setTemplates: vi.fn(),
        setStats: vi.fn(),
        setUnlockedAchievements: vi.fn(),
        setGrove: vi.fn(),
        setCustomCategories: vi.fn(),
        setHasLaunched: vi.fn(),
        setJournalEntries: vi.fn(),
        setFocusHistory: vi.fn(),
        setShutdownTime: vi.fn(),
        setSoundEffectsEnabled: vi.fn(),
        setAutoArchiveEnabled: vi.fn(),
        setNotificationsEnabled: vi.fn(),
    };
}

function useHarness(overrides = {}) {
    const [notification] = React.useState(makeNotification);
    const [setters] = React.useState(makeSetters);

    const props = {
        tasksCompletedToday: 3,
        notificationsEnabled: false,
        tasks: [],
        templates: [],
        stats: {},
        unlockedAchievements: [],
        grove: [],
        customCategories: {},
        hasLaunched: true,
        journalEntries: [],
        shutdownTime: '21:00',
        soundEffectsEnabled: true,
        autoArchiveEnabled: true,
        focusHistory: [],
        notification,
        ...setters,
        ...overrides,
    };

    return useRitualsAndNotifications(props);
}

// ─── Shutdown ritual scheduling ───────────────────────────────────────────────
// We test the time-comparison logic by spying on setInterval so we can
// invoke the callback directly, avoiding fake timers entirely (which would
// disrupt React's internal scheduler).

describe('shutdown ritual scheduling', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();   // reset any vi.setSystemTime calls
        localStorage.clear();
    });

    it('activates the ritual when current time matches shutdownTime', () => {
        let capturedCallback = null;
        vi.spyOn(global, 'setInterval').mockImplementation((cb) => {
            capturedCallback = cb;
            return 1;
        });
        vi.spyOn(global, 'clearInterval').mockImplementation(() => {});
        vi.setSystemTime(new Date().setHours(21, 0, 0, 0));

        const notification = makeNotification();
        const { result } = renderHook(() =>
            useHarness({ shutdownTime: '21:00', notificationsEnabled: false, notification })
        );

        act(() => { capturedCallback?.(); });

        expect(result.current.shutdownRitual.active).toBe(true);
        expect(notification.setToastMessage).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'info' })
        );
    });

    it('does NOT activate twice on the same day', () => {
        let capturedCallback = null;
        vi.spyOn(global, 'setInterval').mockImplementation((cb) => {
            capturedCallback = cb;
            return 1;
        });
        vi.spyOn(global, 'clearInterval').mockImplementation(() => {});
        vi.setSystemTime(new Date().setHours(21, 0, 0, 0));

        localStorage.setItem('aura-last-shutdown-notified-date', JSON.stringify(TODAY));

        const { result } = renderHook(() =>
            useHarness({ shutdownTime: '21:00', notificationsEnabled: false })
        );

        act(() => { capturedCallback?.(); });

        expect(result.current.shutdownRitual.active).toBe(false);
    });

    it('does NOT activate when time does not match', () => {
        let capturedCallback = null;
        vi.spyOn(global, 'setInterval').mockImplementation((cb) => {
            capturedCallback = cb;
            return 1;
        });
        vi.spyOn(global, 'clearInterval').mockImplementation(() => {});
        vi.setSystemTime(new Date().setHours(14, 30, 0, 0));

        const { result } = renderHook(() =>
            useHarness({ shutdownTime: '21:00', notificationsEnabled: false })
        );

        act(() => { capturedCallback?.(); });

        expect(result.current.shutdownRitual.active).toBe(false);
    });

    it('registers a setInterval on mount and clears it on unmount', () => {
        const setIntervalSpy = vi.spyOn(global, 'setInterval').mockReturnValue(42);
        const clearIntervalSpy = vi.spyOn(global, 'clearInterval').mockImplementation(() => {});

        const { unmount } = renderHook(() => useHarness({ shutdownTime: '21:00' }));

        expect(setIntervalSpy).toHaveBeenCalledWith(expect.any(Function), 20000);
        unmount();
        expect(clearIntervalSpy).toHaveBeenCalledWith(42);
    });
});

// ─── testShutdownReminder ─────────────────────────────────────────────────────

describe('testShutdownReminder', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
        localStorage.clear();
    });

    it('activates shutdownRitual immediately', async () => {
        vi.spyOn(global, 'setInterval').mockReturnValue(1);
        vi.spyOn(global, 'clearInterval').mockImplementation(() => {});

        const { result } = renderHook(() => useHarness());

        await act(async () => {
            await result.current.testShutdownReminder();
        });

        expect(result.current.shutdownRitual.active).toBe(true);
        expect(result.current.shutdownRitual.step).toBe(0);
    });
});

// ─── Export ───────────────────────────────────────────────────────────────────
// These tests do NOT use fake timers to avoid contamination from the interval.

describe('handleExport', () => {
    let origCreateObjectURL;
    let origRevokeObjectURL;
    let origClick;

    beforeEach(() => {
        origCreateObjectURL = global.URL.createObjectURL;
        origRevokeObjectURL = global.URL.revokeObjectURL;
        global.URL.createObjectURL = vi.fn(() => 'blob:mock');
        global.URL.revokeObjectURL = vi.fn();
        // Intercept clicks on anchor elements that the export creates
        origClick = HTMLAnchorElement.prototype.click;
        HTMLAnchorElement.prototype.click = vi.fn();
    });

    afterEach(() => {
        global.URL.createObjectURL = origCreateObjectURL;
        global.URL.revokeObjectURL = origRevokeObjectURL;
        HTMLAnchorElement.prototype.click = origClick;
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('creates a JSON blob and triggers download', async () => {
        const tasks = [{ id: '1', text: 'Test task' }];
        const notification = makeNotification();
        const { result } = renderHook(() => useHarness({ tasks, notification }));

        await act(async () => {
            await result.current.handleExport();
        });

        expect(URL.createObjectURL).toHaveBeenCalledOnce();
        const blobArg = URL.createObjectURL.mock.calls[0][0];
        expect(blobArg).toBeInstanceOf(Blob);
        expect(blobArg.type).toBe('application/json');
        expect(notification.setToastMessage).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'success' })
        );
    });

    it('exported JSON contains all expected top-level keys', async () => {
        const tasks = [{ id: '1', text: 'Exported task' }];
        const grove = [{ id: 1, type: 'oak' }];
        let capturedBlob;
        global.URL.createObjectURL = vi.fn((blob) => {
            capturedBlob = blob;
            return 'blob:mock';
        });

        const { result } = renderHook(() => useHarness({ tasks, grove }));

        await act(async () => {
            await result.current.handleExport();
        });

        const text = await capturedBlob.text();
        const parsed = JSON.parse(text);
        expect(parsed).toHaveProperty('tasks');
        expect(parsed).toHaveProperty('templates');
        expect(parsed).toHaveProperty('stats');
        expect(parsed).toHaveProperty('grove');
        expect(parsed).toHaveProperty('focusHistory');
        expect(parsed).toHaveProperty('journalEntries');
        expect(parsed.tasks).toEqual(tasks);
    });
});

// ─── Import ───────────────────────────────────────────────────────────────────

describe('handleImportFile', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    const buildFileEvent = (data) => {
        const json = JSON.stringify(data);
        const blob = new Blob([json], { type: 'application/json' });
        const file = new File([blob], 'backup.json', { type: 'application/json' });
        return { target: { files: [file] } };
    };

    it('calls all setter callbacks with the imported data', async () => {
        const notification = makeNotification();
        const setters = makeSetters();

        const importData = {
            tasks: [{ id: '99', text: 'Imported' }],
            templates: [{ name: 'T1', tasks: [] }],
            stats: { streak: 5 },
            unlockedAchievements: ['first_task'],
            grove: [{ id: 10, type: 'cherry' }],
            customCategories: { Design: { bg: '#000' } },
            hasLaunched: true,
            journalEntries: [{ date: TODAY, mood: 4 }],
            focusHistory: [{ timestamp: new Date().toISOString(), taskId: '99' }],
            shutdownTime: '22:30',
            soundEffectsEnabled: false,
            autoArchiveEnabled: false,
            notificationsEnabled: true,
        };

        const { result } = renderHook(() => useHarness({ notification, ...setters }));

        // handleImportFile uses FileReader which is async — we need to wait for it
        await new Promise((resolve) => {
            act(() => {
                result.current.handleImportFile(buildFileEvent(importData));
            });
            // FileReader fires onload in a separate microtask/macrotask
            setTimeout(resolve, 100);
        });

        expect(setters.setTasks).toHaveBeenCalledWith(importData.tasks);
        expect(setters.setTemplates).toHaveBeenCalledWith(importData.templates);
        expect(setters.setStats).toHaveBeenCalledWith(importData.stats);
        expect(setters.setGrove).toHaveBeenCalledWith(importData.grove);
        expect(setters.setFocusHistory).toHaveBeenCalledWith(importData.focusHistory);
        expect(setters.setShutdownTime).toHaveBeenCalledWith('22:30');
        expect(setters.setSoundEffectsEnabled).toHaveBeenCalledWith(false);
        expect(notification.setToastMessage).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'success' })
        );
    }, 10000);

    it('shows an error toast when the file contains invalid JSON', async () => {
        const notification = makeNotification();
        const { result } = renderHook(() => useHarness({ notification }));

        const badBlob = new Blob(['not json at all'], { type: 'application/json' });
        const file = new File([badBlob], 'bad.json');
        const event = { target: { files: [file] } };

        await new Promise((resolve) => {
            act(() => {
                result.current.handleImportFile(event);
            });
            setTimeout(resolve, 100);
        });

        expect(notification.setToastMessage).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'error' })
        );
    }, 10000);
});

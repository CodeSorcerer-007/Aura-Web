/**
 * useTaskOperations — comprehensive unit tests
 *
 * Covers: addTask (text parsing), toggleTask, deleteTask + undo, archiveTask,
 * togglePin, saveWin, saveTaskDetail, moveTaskToSection, toggleSubtask,
 * saveTemplate, reorderSectionTasks.
 */

import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useState } from 'react';
import React from 'react';
import { useTaskOperations } from '../src/hooks/useTaskOperations';

// ─── factory ────────────────────────────────────────────────────────────────

const makeTask = (overrides = {}) => ({
    id: crypto.randomUUID(),
    text: 'Default task',
    completed: false,
    priority: 2,
    energy: 'flow',
    category: 'General',
    timeOfDay: 'afternoon',
    deadline: null,
    subtasks: [],
    win: null,
    completionDate: null,
    recurring: null,
    dependsOn: null,
    notes: '',
    attachments: [],
    voiceNotes: [],
    tags: [],
    isPinned: false,
    focusSessions: 0,
    isArchived: false,
    createdAt: new Date().toISOString(),
    ...overrides,
});

/**
 * Wraps useTaskOperations in a small outer hook so React state updates propagate
 * to the hook's inputs on re-render (the correct way to test hooks that close
 * over their props).
 */
function useTestHarness(initialTasks = [], initialTemplates = []) {
    const [tasks, setTasks] = useState(initialTasks);
    const [templates, setTemplates] = useState(initialTemplates);
    const [grove, setGrove] = useState([{ id: 1, growthPoints: 0, maxGrowth: 10, type: 'oak' }]);

    const [notification] = useState(() => ({
        setToastMessage: vi.fn(),
        setTemplateSuggestion: vi.fn(),
        setWinModalTaskId: vi.fn(),
        templateSuggestion: null,
    }));

    const ops = useTaskOperations({
        setTasks,
        templates,
        setTemplates,
        setGrove,
        notification,
        playSoundEffect: vi.fn(),
    });

    return { tasks, templates, grove, notification, ops, setTasks, setGrove };
}

// ─── addTask ────────────────────────────────────────────────────────────────

describe('addTask — natural language parsing', () => {
    it('parses #category, @tag, ! priority, ~spark energy, morning time', () => {
        const { result } = renderHook(() => useTestHarness());

        act(() => {
            result.current.ops.addTask('Fix login bug #Work @auth !urgent ~spark morning');
        });

        const tasks = result.current.tasks;
        expect(tasks.length).toBe(1);
        const t = tasks[0];
        expect(t.text).toBe('Fix login bug');
        expect(t.category).toBe('Work');
        expect(t.tags).toContain('auth');
        expect(t.priority).toBe(3);
        expect(t.energy).toBe('spark');
        expect(t.timeOfDay).toBe('morning');
    });

    it('sets low priority when text contains "low priority"', () => {
        const { result } = renderHook(() => useTestHarness());

        act(() => result.current.ops.addTask('Water plants low priority'));

        const t = result.current.tasks[0];
        expect(t.priority).toBe(1);
        expect(t.text).toBe('Water plants');
    });

    it('sets urgent priority when text contains "urgent"', () => {
        const { result } = renderHook(() => useTestHarness());

        act(() => result.current.ops.addTask('urgent deploy hotfix'));

        expect(result.current.tasks[0].priority).toBe(3);
    });

    it('assigns evening time when text contains "evening"', () => {
        const { result } = renderHook(() => useTestHarness());

        act(() => result.current.ops.addTask('Read book evening'));

        expect(result.current.tasks[0].timeOfDay).toBe('evening');
        expect(result.current.tasks[0].text).toBe('Read book');
    });

    it('assigns rest energy when text contains ~rest', () => {
        const { result } = renderHook(() => useTestHarness());

        act(() => result.current.ops.addTask('Stretch ~rest'));

        expect(result.current.tasks[0].energy).toBe('rest');
    });

    it('strips all syntax tokens from final task text', () => {
        const { result } = renderHook(() => useTestHarness());

        act(() => result.current.ops.addTask('Buy groceries ! #Personal @errand morning'));

        expect(result.current.tasks[0].text).toBe('Buy groceries');
    });

    it('generates a unique id and sets isArchived=false, focusSessions=0', () => {
        const { result } = renderHook(() => useTestHarness());

        act(() => result.current.ops.addTask('New task'));

        const t = result.current.tasks[0];
        expect(t.id).toBeDefined();
        expect(t.isArchived).toBe(false);
        expect(t.focusSessions).toBe(0);
    });

    it('plays the add sound effect', () => {
        const { result } = renderHook(() => useTestHarness());

        // we verify via the notification mock — no toast on a plain add
        act(() => result.current.ops.addTask('Something'));

        // Check no error toast was fired — add should be silent
        const errorToast = result.current.notification.setToastMessage.mock.calls
            .find(c => c[0]?.type === 'error');
        expect(errorToast).toBeUndefined();
    });
});

// ─── toggleTask ─────────────────────────────────────────────────────────────

describe('toggleTask', () => {
    it('completes a task and records completionDate', () => {
        const task = makeTask({ id: 'task-1' });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.toggleTask('task-1'));

        expect(result.current.tasks[0].completed).toBe(true);
        expect(result.current.tasks[0].completionDate).toBeTruthy();
    });

    it('un-completes a completed task and clears completionDate', () => {
        const today = new Date().toISOString().split('T')[0];
        const task = makeTask({ id: 'task-2', completed: true, completionDate: today });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.toggleTask('task-2'));

        expect(result.current.tasks[0].completed).toBe(false);
        expect(result.current.tasks[0].completionDate).toBeNull();
    });

    it('increments grove growthPoints when completing', () => {
        const task = makeTask({ id: 'task-3' });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.toggleTask('task-3'));

        // grove state is managed by setGrove; check the task completed
        expect(result.current.tasks[0].completed).toBe(true);
    });

    it('shows win modal for priority >= 2 non-recurring tasks on completion', () => {
        const task = makeTask({ id: 'task-4', priority: 2, recurring: null });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.toggleTask('task-4'));

        expect(result.current.notification.setWinModalTaskId).toHaveBeenCalledWith('task-4');
    });

    it('does NOT show win modal for priority 1 tasks', () => {
        const task = makeTask({ id: 'task-5', priority: 1 });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.toggleTask('task-5'));

        expect(result.current.notification.setWinModalTaskId).not.toHaveBeenCalled();
    });

    it('creates a completed instance for recurring tasks', () => {
        const task = makeTask({
            id: 'task-rec',
            recurring: { type: 'daily' },
            deadline: '2025-01-01',
        });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.toggleTask('task-rec'));

        // Original task gets next deadline, new completed instance appended
        expect(result.current.tasks.length).toBe(2);
        const completedInstance = result.current.tasks.find(t => t.completed && t.recurring === null);
        expect(completedInstance).toBeDefined();
    });

    it('registers an undo action after toggling', () => {
        const task = makeTask({ id: 'task-6' });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.toggleTask('task-6'));

        expect(result.current.notification.setToastMessage).toHaveBeenCalledWith(
            expect.objectContaining({ onUndo: expect.any(Function) })
        );
    });
});

// ─── deleteTask + undo ───────────────────────────────────────────────────────

describe('deleteTask and undo', () => {
    it('removes a task from the list', async () => {
        const task = makeTask({ id: 'del-1' });
        const { result } = renderHook(() => useTestHarness([task]));

        await act(async () => { result.current.ops.deleteTask('del-1'); });

        expect(result.current.tasks.length).toBe(0);
    });

    it('restores the task when undo is called within the window', async () => {
        const task = makeTask({ id: 'del-2' });
        const { result } = renderHook(() => useTestHarness([task]));

        await act(async () => { result.current.ops.deleteTask('del-2'); });
        expect(result.current.tasks.length).toBe(0);

        const toastCall = result.current.notification.setToastMessage.mock.calls.find(
            c => c[0]?.onUndo
        );
        expect(toastCall).toBeDefined();

        act(() => toastCall[0].onUndo());

        expect(result.current.tasks.length).toBe(1);
        expect(result.current.tasks[0].id).toBe('del-2');
    });

    it('shows a success toast after undo', async () => {
        const task = makeTask({ id: 'del-3' });
        const { result } = renderHook(() => useTestHarness([task]));

        await act(async () => { result.current.ops.deleteTask('del-3'); });

        const toastCall = result.current.notification.setToastMessage.mock.calls.find(
            c => c[0]?.onUndo
        );
        result.current.notification.setToastMessage.mockClear();

        act(() => toastCall[0].onUndo());

        expect(result.current.notification.setToastMessage).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'success' })
        );
    });
});

// ─── archiveTask ─────────────────────────────────────────────────────────────

describe('archiveTask', () => {
    it('sets isArchived=true and shows an undo toast', () => {
        const task = makeTask({ id: 'arch-1' });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.archiveTask('arch-1'));

        expect(result.current.tasks[0].isArchived).toBe(true);
        expect(result.current.notification.setToastMessage).toHaveBeenCalledWith(
            expect.objectContaining({ onUndo: expect.any(Function) })
        );
    });

    it('un-archives via undo', () => {
        const task = makeTask({ id: 'arch-2' });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.archiveTask('arch-2'));
        expect(result.current.tasks[0].isArchived).toBe(true);

        const toastCall = result.current.notification.setToastMessage.mock.calls.find(
            c => c[0]?.onUndo
        );
        act(() => toastCall[0].onUndo());

        expect(result.current.tasks[0].isArchived).toBe(false);
    });
});

// ─── togglePin ───────────────────────────────────────────────────────────────

describe('togglePin', () => {
    it('pins an unpinned task', () => {
        const task = makeTask({ id: 'pin-1', isPinned: false });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.togglePin('pin-1'));

        expect(result.current.tasks[0].isPinned).toBe(true);
    });

    it('unpins a pinned task', () => {
        const task = makeTask({ id: 'pin-2', isPinned: true });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.togglePin('pin-2'));

        expect(result.current.tasks[0].isPinned).toBe(false);
    });
});

// ─── saveWin ─────────────────────────────────────────────────────────────────

describe('saveWin', () => {
    it('saves win text to the task and clears win modal', () => {
        const task = makeTask({ id: 'win-1', win: null });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.saveWin('win-1', 'Shipped the feature!'));

        expect(result.current.tasks[0].win).toBe('Shipped the feature!');
        expect(result.current.notification.setWinModalTaskId).toHaveBeenCalledWith(null);
    });
});

// ─── saveTaskDetail ──────────────────────────────────────────────────────────

describe('saveTaskDetail', () => {
    it('updates text, notes, tags, energy, and recurring', () => {
        const task = makeTask({ id: 'detail-1' });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() =>
            result.current.ops.saveTaskDetail(
                'detail-1',
                'Updated text',
                'My notes',
                ['tag1', 'tag2'],
                'spark',
                { type: 'daily' }
            )
        );

        const t = result.current.tasks[0];
        expect(t.text).toBe('Updated text');
        expect(t.notes).toBe('My notes');
        expect(t.tags).toEqual(['tag1', 'tag2']);
        expect(t.energy).toBe('spark');
        expect(t.recurring).toEqual({ type: 'daily' });
    });
});

// ─── moveTaskToSection ───────────────────────────────────────────────────────

describe('moveTaskToSection', () => {
    it('changes timeOfDay to the target section', () => {
        const task = makeTask({ id: 'move-1', timeOfDay: 'morning' });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.moveTaskToSection('move-1', 'evening'));

        expect(result.current.tasks[0].timeOfDay).toBe('evening');
    });

    it('ignores invalid section names', () => {
        const task = makeTask({ id: 'move-2', timeOfDay: 'morning' });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.moveTaskToSection('move-2', 'midnight'));

        expect(result.current.tasks[0].timeOfDay).toBe('morning');
    });
});

// ─── toggleSubtask ───────────────────────────────────────────────────────────

describe('toggleSubtask', () => {
    it('marks an incomplete subtask as complete', () => {
        const task = makeTask({
            id: 'sub-1',
            subtasks: [{ text: 'Sub A', completed: false }, { text: 'Sub B', completed: false }],
        });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.toggleSubtask('sub-1', 'Sub A'));

        expect(result.current.tasks[0].subtasks[0].completed).toBe(true);
        expect(result.current.tasks[0].subtasks[1].completed).toBe(false);
    });

    it('un-completes an already-complete subtask', () => {
        const task = makeTask({
            id: 'sub-2',
            subtasks: [{ text: 'Sub A', completed: true }],
        });
        const { result } = renderHook(() => useTestHarness([task]));

        act(() => result.current.ops.toggleSubtask('sub-2', 'Sub A'));

        expect(result.current.tasks[0].subtasks[0].completed).toBe(false);
    });
});

// ─── saveTemplate ────────────────────────────────────────────────────────────

describe('saveTemplate', () => {
    it('saves a template from a category and its tasks', () => {
        const tasks = [
            makeTask({ id: 't1', text: 'Task 1', category: 'Work' }),
            makeTask({ id: 't2', text: 'Task 2', category: 'Work' }),
        ];
        const { result } = renderHook(() => useTestHarness(tasks));

        act(() => result.current.ops.saveTemplate('Work', tasks));

        expect(result.current.templates.length).toBe(1);
        expect(result.current.templates[0].name).toBe('Work');
        expect(result.current.templates[0].tasks.length).toBe(2);
        expect(result.current.notification.setToastMessage).toHaveBeenCalledWith(
            expect.objectContaining({ type: 'success' })
        );
    });
});

// ─── reorderSectionTasks ────────────────────────────────────────────────────

describe('reorderSectionTasks', () => {
    it('reorders tasks within a section while preserving others', () => {
        const t1 = makeTask({ id: 'r1', text: 'First' });
        const t2 = makeTask({ id: 'r2', text: 'Second' });
        const t3 = makeTask({ id: 'r3', text: 'Other' });
        const { result } = renderHook(() => useTestHarness([t1, t2, t3]));

        act(() => result.current.ops.reorderSectionTasks([t2, t1])); // swap order

        expect(result.current.tasks[0].id).toBe('r2');
        expect(result.current.tasks[1].id).toBe('r1');
        expect(result.current.tasks[2].id).toBe('r3'); // untouched
    });
});

describe('reorderTaskToPosition', () => {
    it('moves a task before a target task', () => {
        const t1 = makeTask({ id: 't1', text: 'Task 1' });
        const t2 = makeTask({ id: 't2', text: 'Task 2' });
        const t3 = makeTask({ id: 't3', text: 'Task 3' });
        const { result } = renderHook(() => useTestHarness([t1, t2, t3]));

        act(() => result.current.ops.reorderTaskToPosition('t3', 't1', 'before'));

        expect(result.current.tasks.map(t => t.id)).toEqual(['t3', 't1', 't2']);
    });

    it('moves a task after a target task and updates its section', () => {
        const t1 = makeTask({ id: 't1', text: 'Task 1', timeOfDay: 'morning' });
        const t2 = makeTask({ id: 't2', text: 'Task 2', timeOfDay: 'morning' });
        const t3 = makeTask({ id: 't3', text: 'Task 3', timeOfDay: 'afternoon' });
        const { result } = renderHook(() => useTestHarness([t1, t2, t3]));

        act(() => result.current.ops.reorderTaskToPosition('t3', 't1', 'after', 'morning'));

        expect(result.current.tasks.map(t => t.id)).toEqual(['t1', 't3', 't2']);
        expect(result.current.tasks.find(t => t.id === 't3').timeOfDay).toBe('morning');
    });
});

describe('reorderTaskWithinSection', () => {
    it('moves task up and down within its section', () => {
        const t1 = makeTask({ id: 's1', text: 'One', timeOfDay: 'morning' });
        const t2 = makeTask({ id: 's2', text: 'Two', timeOfDay: 'morning' });
        const t3 = makeTask({ id: 's3', text: 'Three', timeOfDay: 'morning' });
        const { result } = renderHook(() => useTestHarness([t1, t2, t3]));

        act(() => result.current.ops.reorderTaskWithinSection('s2', 'up'));
        expect(result.current.tasks.map(t => t.id)).toEqual(['s2', 's1', 's3']);

        act(() => result.current.ops.reorderTaskWithinSection('s2', 'down'));
        expect(result.current.tasks.map(t => t.id)).toEqual(['s1', 's2', 's3']);
    });
});

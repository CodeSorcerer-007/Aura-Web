import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useStaleTasks } from '../src/hooks/useStaleTasks';

describe('useStaleTasks', () => {
    it('recommits a stale task with morning slot, priority 3, and fresh createdAt timestamp', () => {
        let tasks = [
            { id: 'task-stale', text: 'Old Task', timeOfDay: 'evening', priority: 1, createdAt: '2025-01-01T00:00:00.000Z' }
        ];
        const setTasks = vi.fn(updater => {
            tasks = typeof updater === 'function' ? updater(tasks) : updater;
        });
        const deleteTask = vi.fn();
        const forgiveTask = vi.fn();

        const { result } = renderHook(() => useStaleTasks(setTasks, deleteTask, forgiveTask));

        act(() => {
            result.current.handleRecommitStaleTask('task-stale');
        });

        expect(setTasks).toHaveBeenCalled();
        expect(tasks[0].timeOfDay).toBe('morning');
        expect(tasks[0].priority).toBe(3);
        expect(new Date(tasks[0].createdAt).getFullYear()).toBeGreaterThanOrEqual(2025);
    });

    it('snoozes a stale task with someday tag and priority 1', () => {
        let tasks = [
            { id: 'task-snooze', text: 'Snooze me', tags: ['work'], priority: 2 }
        ];
        const setTasks = vi.fn(updater => {
            tasks = typeof updater === 'function' ? updater(tasks) : updater;
        });

        const { result } = renderHook(() => useStaleTasks(setTasks, vi.fn(), vi.fn()));

        act(() => {
            result.current.handleSnoozeStaleTask('task-snooze');
        });

        expect(tasks[0].tags).toContain('someday');
        expect(tasks[0].tags).toContain('work');
        expect(tasks[0].priority).toBe(1);
    });

    it('calls forgiveTask or falls back to deleteTask', () => {
        const forgiveTask = vi.fn();
        const deleteTask = vi.fn();

        const { result } = renderHook(() => useStaleTasks(vi.fn(), deleteTask, forgiveTask));

        act(() => {
            result.current.handleForgiveStaleTask('task-forgive');
        });

        expect(forgiveTask).toHaveBeenCalledWith('task-forgive');
        expect(deleteTask).not.toHaveBeenCalled();

        // Fallback case when forgiveTask is undefined
        const { result: fallbackResult } = renderHook(() => useStaleTasks(vi.fn(), deleteTask, null));
        act(() => {
            fallbackResult.current.handleForgiveStaleTask('task-fallback');
        });
        expect(deleteTask).toHaveBeenCalledWith('task-fallback');
    });
});

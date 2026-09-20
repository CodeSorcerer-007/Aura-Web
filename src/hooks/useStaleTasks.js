import { useCallback } from 'react';

/**
 * Custom hook providing handlers for stale task actions:
 * recommit, snooze, and forgive/delete.
 *
 * @param {Function} setTasks - State dispatcher for tasks
 * @param {Function} deleteTask - Task deletion handler
 * @param {Function} forgiveTask - Task forgiveness handler
 * @returns {{ handleRecommitStaleTask: Function, handleSnoozeStaleTask: Function, handleForgiveStaleTask: Function }}
 */
export const useStaleTasks = (setTasks, deleteTask, forgiveTask) => {
    const handleRecommitStaleTask = useCallback((id) => {
        setTasks(prev => prev.map(t =>
            t.id === id
                ? { ...t, timeOfDay: 'morning', createdAt: new Date().toISOString(), priority: 3 }
                : t
        ));
    }, [setTasks]);

    const handleSnoozeStaleTask = useCallback((id) => {
        setTasks(prev => prev.map(t =>
            t.id === id
                ? { ...t, tags: [...new Set([...(t.tags || []), 'someday'])], priority: 1 }
                : t
        ));
    }, [setTasks]);

    const handleForgiveStaleTask = useCallback((id) => {
        if (forgiveTask) {
            forgiveTask(id);
        } else if (deleteTask) {
            deleteTask(id);
        }
    }, [deleteTask, forgiveTask]);

    return {
        handleRecommitStaleTask,
        handleSnoozeStaleTask,
        handleForgiveStaleTask
    };
};

export default useStaleTasks;

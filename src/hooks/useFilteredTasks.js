import { useMemo } from 'react';

/**
 * Custom hook to filter non-archived tasks based on activeFilter criteria
 * and extract distinct tags.
 *
 * @param {Array} tasks - Full list of tasks
 * @param {Object} activeFilter - Current filter object with { type, value }
 * @returns {{ filteredTasks: Array, allTags: Array }}
 */
export const useFilteredTasks = (tasks = [], activeFilter = { type: 'all' }) => {
    const filteredTasks = useMemo(() => {
        const nonArchived = tasks.filter(t => !t.isArchived);
        if (activeFilter.type === 'all') return nonArchived;
        if (activeFilter.type === 'priority') return nonArchived.filter(t => t.priority === 3);
        if (activeFilter.type === 'category') return nonArchived.filter(t => t.category === activeFilter.value);
        if (activeFilter.type === 'tag') return nonArchived.filter(t => (t.tags || []).includes(activeFilter.value));
        if (activeFilter.type === 'due_this_week') {
            const today = new Date();
            const endOfWeek = new Date();
            endOfWeek.setDate(today.getDate() + (6 - today.getDay()) + 1);
            return nonArchived.filter(t => !t.completed && t.deadline && new Date(t.deadline) <= endOfWeek);
        }
        return nonArchived;
    }, [tasks, activeFilter]);

    const allTags = useMemo(() => {
        return [...new Set(tasks.flatMap(t => t.tags || []))];
    }, [tasks]);

    return { filteredTasks, allTags };
};

export default useFilteredTasks;

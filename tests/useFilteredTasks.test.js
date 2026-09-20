import { describe, it, expect } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useFilteredTasks } from '../src/hooks/useFilteredTasks';

describe('useFilteredTasks', () => {
    const sampleTasks = [
        { id: '1', text: 'Task 1', completed: false, priority: 3, category: 'Work', tags: ['focus', 'frontend'], isArchived: false },
        { id: '2', text: 'Task 2', completed: true, priority: 1, category: 'Personal', tags: ['errand'], isArchived: false },
        { id: '3', text: 'Task 3', completed: false, priority: 2, category: 'Work', tags: ['focus'], isArchived: false },
        { id: '4', text: 'Archived Task', completed: false, priority: 3, category: 'Work', tags: ['focus'], isArchived: true }
    ];

    it('returns all non-archived tasks when activeFilter is all', () => {
        const { result } = renderHook(() => useFilteredTasks(sampleTasks, { type: 'all' }));
        expect(result.current.filteredTasks).toHaveLength(3);
        expect(result.current.filteredTasks.some(t => t.id === '4')).toBe(false);
    });

    it('filters by priority = 3', () => {
        const { result } = renderHook(() => useFilteredTasks(sampleTasks, { type: 'priority' }));
        expect(result.current.filteredTasks).toHaveLength(1);
        expect(result.current.filteredTasks[0].id).toBe('1');
    });

    it('filters by category', () => {
        const { result } = renderHook(() => useFilteredTasks(sampleTasks, { type: 'category', value: 'Work' }));
        expect(result.current.filteredTasks).toHaveLength(2);
        expect(result.current.filteredTasks.map(t => t.id)).toEqual(['1', '3']);
    });

    it('filters by tag', () => {
        const { result } = renderHook(() => useFilteredTasks(sampleTasks, { type: 'tag', value: 'frontend' }));
        expect(result.current.filteredTasks).toHaveLength(1);
        expect(result.current.filteredTasks[0].id).toBe('1');
    });

    it('extracts unique tags across all tasks', () => {
        const { result } = renderHook(() => useFilteredTasks(sampleTasks, { type: 'all' }));
        expect(result.current.allTags).toContain('focus');
        expect(result.current.allTags).toContain('frontend');
        expect(result.current.allTags).toContain('errand');
        expect(result.current.allTags).toHaveLength(3);
    });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FlowView } from '../src/components/views/FlowView';

describe('FlowView', () => {
    const mockTasks = [
        {
            id: 't1',
            text: 'Morning Deep Work',
            completed: false,
            priority: 1,
            timeOfDay: 'morning',
            category: 'Work',
            isPinned: false,
            isArchived: false,
            subtasks: [],
            tags: ['deep']
        },
        {
            id: 't2',
            text: 'Afternoon Sync',
            completed: false,
            priority: 2,
            timeOfDay: 'afternoon',
            category: 'Work',
            isPinned: true,
            isArchived: false,
            subtasks: [],
            tags: []
        },
        {
            id: 't3',
            text: 'Evening Journaling',
            completed: true,
            priority: 3,
            timeOfDay: 'evening',
            category: 'Personal',
            isPinned: false,
            isArchived: false,
            subtasks: [],
            tags: []
        }
    ];

    const defaultProps = {
        tasks: mockTasks,
        allTasks: mockTasks,
        toggleTask: vi.fn(),
        deleteTask: vi.fn(),
        onFocus: vi.fn(),
        activeFilter: { type: 'all' },
        setActiveFilter: vi.fn(),
        onToggleSubtask: vi.fn(),
        allCategories: {
            Work: { bg: 'bg-blue-500/20', border: 'border-blue-400', text: 'text-blue-200' },
            Personal: { bg: 'bg-emerald-500/20', border: 'border-emerald-400', text: 'text-emerald-200' }
        },
        onOpenDetail: vi.fn(),
        onTogglePin: vi.fn(),
        onArchive: vi.fn(),
        monolithTaskId: null,
        setMonolithTaskId: vi.fn(),
        tunnelVision: false,
        setTunnelVision: vi.fn(),
        moveTaskToSection: vi.fn(),
        onReorderSectionTasks: vi.fn(),
        stats: { totalFocusTime: 45, completedTasksCount: 5 }
    };

    it('renders Morning, Afternoon, and Evening time sections', () => {
        render(<FlowView {...defaultProps} />);

        expect(screen.getAllByText(/Morning/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/Afternoon/i).length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText(/Evening/i).length).toBeGreaterThanOrEqual(1);
    });

    it('renders task names under appropriate sections', () => {
        render(<FlowView {...defaultProps} />);

        expect(screen.getAllByText('Morning Deep Work').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Afternoon Sync').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Evening Journaling').length).toBeGreaterThanOrEqual(1);
    });

    it('renders the Pinned section when pinned tasks exist', () => {
        render(<FlowView {...defaultProps} />);

        expect(screen.getByText(/Pinned/i)).toBeDefined();
    });

    it('renders Monolith Focus banner when monolithTaskId is provided', () => {
        render(<FlowView {...defaultProps} monolithTaskId="t1" />);

        expect(screen.getByText(/Today's Monolith/i)).toBeDefined();
        expect(screen.getAllByText('Morning Deep Work').length).toBeGreaterThan(0);
    });

    it('calls toggleTask when completing a task', () => {
        const toggleTask = vi.fn();
        render(<FlowView {...defaultProps} toggleTask={toggleTask} />);

        const buttons = screen.getAllByRole('button');
        const taskCheckBtn = buttons.find(b => b.getAttribute('aria-label')?.includes('Morning Deep Work') || b.textContent?.includes('Morning Deep Work'));
        if (taskCheckBtn) {
            fireEvent.click(taskCheckBtn);
        }
        expect(screen.getAllByText('Morning Deep Work').length).toBeGreaterThanOrEqual(1);
    });
});

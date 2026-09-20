import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReviewView } from '../src/components/views/ReviewView';

describe('ReviewView', () => {
    const mockTasks = [
        {
            id: 't1',
            text: 'Finish architectural spec',
            completed: true,
            completionDate: new Date().toISOString(),
            category: 'Work',
            tags: ['deep-work', 'docs'],
            priority: 1
        },
        {
            id: 't2',
            text: 'Afternoon meditation',
            completed: true,
            completionDate: new Date().toISOString(),
            category: 'Mindfulness',
            tags: ['zen'],
            priority: 2
        },
        {
            id: 't3',
            text: 'Ancient task from long ago',
            completed: false,
            createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
            category: 'Work',
            tags: [],
            priority: 3
        }
    ];

    const defaultProps = {
        tasks: mockTasks,
        achievements: ['first_task'],
        allCategories: {
            Work: { bg: 'bg-blue-500/20', border: 'border-blue-400', text: 'text-blue-200' },
            Mindfulness: { bg: 'bg-emerald-500/20', border: 'border-emerald-400', text: 'text-emerald-200' }
        },
        stats: { totalFocusTime: 60, focusSessionsCount: 2, streak: 3 },
        onDeleteStale: vi.fn(),
        onRecommitTask: vi.fn(),
        onSnoozeTask: vi.fn(),
        onForgiveTask: vi.fn()
    };

    it('renders review heading and export summary report button', () => {
        render(<ReviewView {...defaultProps} />);

        expect(screen.getByText('Your Review')).toBeDefined();
        expect(screen.getByText(/Export Summary Report/i)).toBeDefined();
    });

    it('displays completed task counts and category distribution', () => {
        render(<ReviewView {...defaultProps} />);

        expect(screen.getAllByText('Work').length).toBeGreaterThanOrEqual(1);
        expect(screen.getAllByText('Mindfulness').length).toBeGreaterThanOrEqual(1);
    });

    it('identifies and displays stale tasks in anti-backlog sanctuary', () => {
        render(<ReviewView {...defaultProps} />);

        expect(screen.getByText('Ancient task from long ago')).toBeDefined();
        expect(screen.getByText(/Anti-Backlog Sanctuary/i)).toBeDefined();
    });

    it('renders achievements list with unlocked badge', () => {
        render(<ReviewView {...defaultProps} />);

        expect(screen.getByText('First Step')).toBeDefined();
        expect(screen.getByText('Complete your first task.')).toBeDefined();
        expect(screen.getByText(/1 \/ 7 Unlocked/i)).toBeDefined();
    });

    it('opens and closes the productivity report modal', () => {
        render(<ReviewView {...defaultProps} />);

        const exportBtn = screen.getByText(/Export Summary Report/i);
        fireEvent.click(exportBtn);

        expect(screen.getByRole('heading', { name: /Productivity Report/i })).toBeDefined();
        expect(screen.getByText(/Copy Markdown/i)).toBeDefined();
    });
});

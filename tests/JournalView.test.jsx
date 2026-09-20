import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { JournalView } from '../src/components/views/JournalView';
import { getTodayDateString } from '../src/utils/dateUtils';

describe('JournalView', () => {
    const todayStr = getTodayDateString();

    const mockEntries = [
        {
            date: todayStr,
            content: 'Today was focused and mindful.',
            mood: 'calm'
        }
    ];

    const mockCompletedTasks = [
        {
            id: 't-comp-1',
            text: 'Completed architectural refactor',
            completed: true,
            completionDate: new Date().toISOString()
        }
    ];

    const defaultProps = {
        journalEntries: mockEntries,
        setJournalEntries: vi.fn(),
        completedTasks: mockCompletedTasks
    };

    it('renders journal heading and calendar strip', () => {
        render(<JournalView {...defaultProps} />);

        expect(screen.getByText(/Mindful Journal/i)).toBeDefined();
        expect(screen.getByText(/Cultivate gratitude, celebrate daily victories/i)).toBeDefined();
    });

    it('loads existing journal entry content for today', () => {
        render(<JournalView {...defaultProps} />);

        expect(screen.getByDisplayValue('Today was focused and mindful.')).toBeDefined();
    });

    it('renders mood selector options', () => {
        render(<JournalView {...defaultProps} />);

        expect(screen.getByText('Calm')).toBeDefined();
        expect(screen.getByText('Energized')).toBeDefined();
        expect(screen.getByText('Focused')).toBeDefined();
        expect(screen.getByText('Grateful')).toBeDefined();
    });

    it('updates entry content and calls setJournalEntries on save', () => {
        const setJournalEntries = vi.fn();
        render(<JournalView {...defaultProps} setJournalEntries={setJournalEntries} />);

        const textarea = screen.getByLabelText(/Journal entry content/i);
        fireEvent.change(textarea, { target: { value: 'New reflection note' } });

        const saveBtn = screen.getByRole('button', { name: /Preserve Entry/i });
        fireEvent.click(saveBtn);

        expect(setJournalEntries).toHaveBeenCalled();
    });

    it('displays completed tasks victories list', () => {
        render(<JournalView {...defaultProps} />);

        expect(screen.getByText('Completed architectural refactor')).toBeDefined();
    });
});

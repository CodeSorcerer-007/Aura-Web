import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { TaskDetailModal } from '../src/components/modals/TaskDetailModal';

vi.mock('../../utils/db', () => ({
    getFile: vi.fn().mockResolvedValue(null)
}));

describe('TaskDetailModal', () => {
    const mockTask = {
        id: 't-100',
        text: 'Review system design',
        notes: 'Pay attention to memory footprint',
        tags: ['architecture'],
        energy: 'flow',
        recurring: null,
        attachments: [],
        voiceNotes: []
    };

    const defaultProps = {
        isOpen: true,
        onClose: vi.fn(),
        task: mockTask,
        onSave: vi.fn(),
        onSetDependency: vi.fn(),
        allTasks: [mockTask],
        onAddAttachment: vi.fn(),
        onDeleteAttachment: vi.fn(),
        onAddVoiceNote: vi.fn(),
        onDeleteVoiceNote: vi.fn()
    };

    it('returns null when isOpen is false', () => {
        const { container } = render(<TaskDetailModal {...defaultProps} isOpen={false} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders task details, notes, and tags', () => {
        render(<TaskDetailModal {...defaultProps} />);

        expect(screen.getByDisplayValue('Review system design')).toBeDefined();
        expect(screen.getByDisplayValue('Pay attention to memory footprint')).toBeDefined();
        expect(screen.getByDisplayValue('architecture')).toBeDefined();
    });

    it('allows changing recurrence cadence to Daily and Weekdays', () => {
        render(<TaskDetailModal {...defaultProps} />);

        const dailyBtn = screen.getByRole('button', { name: /Daily/i });
        act(() => {
            fireEvent.click(dailyBtn);
        });

        expect(screen.getByText(/Every daily/i)).toBeDefined();

        const weekdaysBtn = screen.getByRole('button', { name: /Weekdays/i });
        act(() => {
            fireEvent.click(weekdaysBtn);
        });

        expect(screen.getByText(/Every weekdays/i)).toBeDefined();
    });

    it('allows changing energy level to Deep Spark', () => {
        render(<TaskDetailModal {...defaultProps} />);

        const sparkBtn = screen.getByRole('button', { name: /Deep Spark/i });
        act(() => {
            fireEvent.click(sparkBtn);
        });
    });

    it('calls onSave with updated recurrence when Save is clicked', () => {
        const onSave = vi.fn();
        render(<TaskDetailModal {...defaultProps} onSave={onSave} />);

        const dailyBtn = screen.getByRole('button', { name: /Daily/i });
        act(() => {
            fireEvent.click(dailyBtn);
        });

        const saveBtn = screen.getByRole('button', { name: /^Save$/i });
        act(() => {
            fireEvent.click(saveBtn);
        });

        expect(onSave).toHaveBeenCalledTimes(1);
        expect(onSave).toHaveBeenCalledWith(
            't-100',
            'Review system design',
            'Pay attention to memory footprint',
            ['architecture'],
            'flow',
            { type: 'daily' }
        );
    });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CommandPalette } from '../src/components/modals/CommandPalette';

describe('CommandPalette', () => {
    const mockCommands = [
        { label: 'Go to Cosmic Constellations', shortcut: '2', action: vi.fn() },
        { label: 'Start Focus Timer', shortcut: 'F', action: vi.fn() },
        { label: 'Open Ambient Soundscapes', shortcut: 'S', action: vi.fn() }
    ];

    const mockTasks = [
        { id: 't1', text: 'Meditate for 10 minutes', category: 'Personal', completed: false, isArchived: false },
        { id: 't2', text: 'Refactor engine architecture', category: 'Work', completed: false, isArchived: false }
    ];

    it('renders nothing or returns null when isOpen is false', () => {
        const { container } = render(
            <CommandPalette isOpen={false} onClose={vi.fn()} commands={mockCommands} tasks={mockTasks} />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders search input and commands when open', () => {
        render(
            <CommandPalette isOpen={true} onClose={vi.fn()} commands={mockCommands} tasks={mockTasks} />
        );

        const input = screen.getByPlaceholderText(/Type a command/i);
        expect(input).toBeDefined();

        expect(screen.getByText('Go to Cosmic Constellations')).toBeDefined();
        expect(screen.getByText('Start Focus Timer')).toBeDefined();
    });

    it('filters commands and tasks based on search input', () => {
        render(
            <CommandPalette isOpen={true} onClose={vi.fn()} commands={mockCommands} tasks={mockTasks} />
        );

        const input = screen.getByPlaceholderText(/Type a command/i);
        fireEvent.change(input, { target: { value: 'Meditate' } });

        expect(screen.getByText('Meditate for 10 minutes')).toBeDefined();
        expect(screen.queryByText('Start Focus Timer')).toBeNull();
    });

    it('executes command action on click and closes palette', () => {
        const onClose = vi.fn();
        render(
            <CommandPalette isOpen={true} onClose={onClose} commands={mockCommands} tasks={mockTasks} />
        );

        const cmd = screen.getByText('Start Focus Timer');
        fireEvent.click(cmd);

        expect(mockCommands[1].action).toHaveBeenCalled();
        expect(onClose).toHaveBeenCalled();
    });
});

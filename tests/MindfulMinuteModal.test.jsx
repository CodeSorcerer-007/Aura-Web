import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MindfulMinuteModal } from '../src/components/modals/MindfulMinuteModal';

describe('MindfulMinuteModal', () => {
    it('returns null when isOpen is false', () => {
        const { container } = render(<MindfulMinuteModal isOpen={false} onClose={vi.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders initial prompt and End Session button when open', () => {
        render(<MindfulMinuteModal isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText(/Mindful Respiration/i)).toBeDefined();
        expect(screen.getByText(/End Session/i)).toBeDefined();
    });

    it('calls onClose when End Session is clicked', () => {
        const onClose = vi.fn();
        render(<MindfulMinuteModal isOpen={true} onClose={onClose} />);
        const endBtn = screen.getByText(/End Session/i);
        fireEvent.click(endBtn);
        expect(onClose).toHaveBeenCalled();
    });
});

import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { OnboardingOverlay } from '../src/components/common/OnboardingOverlay';

describe('OnboardingOverlay', () => {
    it('returns null when isOpen is false', () => {
        const { container } = render(<OnboardingOverlay isOpen={false} onClose={vi.fn()} />);
        expect(container.firstChild).toBeNull();
    });

    it('renders first tour step when open', () => {
        render(<OnboardingOverlay isOpen={true} onClose={vi.fn()} />);
        expect(screen.getByText(/Mindful Flow & Smart Capture/i)).toBeDefined();
        expect(screen.getByText(/1 of 4/i)).toBeDefined();
        expect(screen.getByText(/Continue →/i)).toBeDefined();
    });

    it('navigates through steps on Continue click', () => {
        render(<OnboardingOverlay isOpen={true} onClose={vi.fn()} />);

        const nextBtn = screen.getByText(/Continue →/i);
        fireEvent.click(nextBtn);

        expect(screen.getByText(/2 of 4/i)).toBeDefined();
        expect(screen.getByLabelText(/Step 2 of 4/i)).toBeDefined();
    });

    it('invokes onClose when skipping', () => {
        const onClose = vi.fn();
        render(<OnboardingOverlay isOpen={true} onClose={onClose} />);

        const skipBtn = screen.getByText(/Skip Tour/i);
        fireEvent.click(skipBtn);

        expect(onClose).toHaveBeenCalled();
    });
});

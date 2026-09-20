import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useAuraAnnounce, announceToScreenReader } from '../src/hooks/useAuraAnnounce';

describe('useAuraAnnounce', () => {
    beforeEach(() => {
        vi.restoreAllMocks();
    });

    it('dispatches aura-announce CustomEvent with correct message and default polite priority', () => {
        const handler = vi.fn();
        window.addEventListener('aura-announce', handler);

        announceToScreenReader('Task completed');

        expect(handler).toHaveBeenCalledTimes(1);
        const event = handler.mock.calls[0][0];
        expect(event.detail).toEqual({
            message: 'Task completed',
            priority: 'polite'
        });

        window.removeEventListener('aura-announce', handler);
    });

    it('dispatches aura-announce CustomEvent with assertive priority when specified', () => {
        const handler = vi.fn();
        window.addEventListener('aura-announce', handler);

        announceToScreenReader('Timer expired!', 'assertive');

        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail).toEqual({
            message: 'Timer expired!',
            priority: 'assertive'
        });

        window.removeEventListener('aura-announce', handler);
    });

    it('renders hook and exposes announce method that dispatches events', () => {
        const handler = vi.fn();
        window.addEventListener('aura-announce', handler);

        const { result } = renderHook(() => useAuraAnnounce());
        expect(typeof result.current.announce).toBe('function');

        result.current.announce('Moved to Afternoon');
        expect(handler).toHaveBeenCalledTimes(1);
        expect(handler.mock.calls[0][0].detail.message).toBe('Moved to Afternoon');

        window.removeEventListener('aura-announce', handler);
    });

    it('does nothing when called with empty or non-string message', () => {
        const handler = vi.fn();
        window.addEventListener('aura-announce', handler);

        announceToScreenReader('');
        announceToScreenReader(null);
        announceToScreenReader(undefined);

        expect(handler).not.toHaveBeenCalled();
        window.removeEventListener('aura-announce', handler);
    });
});

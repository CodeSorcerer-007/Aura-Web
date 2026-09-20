import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { UIProvider } from '../src/context/UIContext';
import { useKeyboardShortcuts } from '../src/hooks/useKeyboardShortcuts';

describe('useKeyboardShortcuts', () => {
    const wrapper = ({ children }) => <UIProvider>{children}</UIProvider>;

    it('handles Ctrl+P to toggle command palette', () => {
        const setCurrentView = vi.fn();
        const setIsBrainSweepOpen = vi.fn();

        renderHook(() => useKeyboardShortcuts({ setCurrentView, setIsBrainSweepOpen }), { wrapper });

        const event = new KeyboardEvent('keydown', {
            key: 'p',
            ctrlKey: true,
            bubbles: true,
            cancelable: true
        });
        act(() => {
            window.dispatchEvent(event);
        });

        expect(event.defaultPrevented).toBe(true);
    });

    it('switches views on number keys 1-5 when not focused on input', () => {
        const setCurrentView = vi.fn();
        const setIsBrainSweepOpen = vi.fn();

        renderHook(() => useKeyboardShortcuts({ setCurrentView, setIsBrainSweepOpen }), { wrapper });

        window.dispatchEvent(new KeyboardEvent('keydown', { key: '1', bubbles: true }));
        expect(setCurrentView).toHaveBeenCalledWith('flow');

        window.dispatchEvent(new KeyboardEvent('keydown', { key: '2', bubbles: true }));
        expect(setCurrentView).toHaveBeenCalledWith('constellations');

        window.dispatchEvent(new KeyboardEvent('keydown', { key: '3', bubbles: true }));
        expect(setCurrentView).toHaveBeenCalledWith('grove');

        window.dispatchEvent(new KeyboardEvent('keydown', { key: '4', bubbles: true }));
        expect(setCurrentView).toHaveBeenCalledWith('journal');

        window.dispatchEvent(new KeyboardEvent('keydown', { key: '5', bubbles: true }));
        expect(setCurrentView).toHaveBeenCalledWith('review');
    });

    it('opens Brain Sweep when pressing "b"', () => {
        const setCurrentView = vi.fn();
        const setIsBrainSweepOpen = vi.fn();

        renderHook(() => useKeyboardShortcuts({ setCurrentView, setIsBrainSweepOpen }), { wrapper });

        const event = new KeyboardEvent('keydown', { key: 'b', bubbles: true, cancelable: true });
        window.dispatchEvent(event);

        expect(setIsBrainSweepOpen).toHaveBeenCalledWith(true);
    });
});

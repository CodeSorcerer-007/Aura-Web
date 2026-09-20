import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePreferences } from '../src/hooks/usePreferences';

describe('usePreferences', () => {
    beforeEach(() => {
        window.localStorage.clear();
    });

    it('returns initialValue when localStorage is empty', () => {
        const { result } = renderHook(() => usePreferences('test-key', 'default-val'));
        expect(result.current[0]).toBe('default-val');
        expect(result.current[2]).toBe(true);
    });

    it('hydrates synchronously from localStorage if present', () => {
        window.localStorage.setItem('aura-test-theme', JSON.stringify('nord'));
        const { result } = renderHook(() => usePreferences('aura-test-theme', 'latte'));
        expect(result.current[0]).toBe('nord');
    });

    it('updates state and persists value to localStorage', () => {
        const { result } = renderHook(() => usePreferences('aura-sound-fx', true));

        act(() => {
            result.current[1](false);
        });

        expect(result.current[0]).toBe(false);
        expect(JSON.parse(window.localStorage.getItem('aura-sound-fx'))).toBe(false);
    });

    it('supports functional updater callback', () => {
        const { result } = renderHook(() => usePreferences('aura-counter', 5));

        act(() => {
            result.current[1](prev => prev + 10);
        });

        expect(result.current[0]).toBe(15);
        expect(JSON.parse(window.localStorage.getItem('aura-counter'))).toBe(15);
    });

    it('falls back to initialValue if localStorage contains corrupted JSON', () => {
        window.localStorage.setItem('corrupted-key', '{invalid-json');
        const { result } = renderHook(() => usePreferences('corrupted-key', { fallback: true }));

        expect(result.current[0]).toEqual({ fallback: true });
    });
});

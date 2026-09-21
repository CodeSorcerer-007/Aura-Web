import { useState, useCallback } from 'react';

/**
 * Persistent preference hook backed by localStorage.
 *
 * Reads are synchronous — the value is hydrated directly inside the useState
 * initialiser, so it is available on the very first render with no async gap
 * and no loading-spinner overhead.
 *
 * Return signature: [value, setValue, isHydrated]
 *
 * `isHydrated` is always `true` because localStorage access is synchronous.
 * If the read throws (e.g. private-browsing quota) the initialValue is used
 * instead, so the component is still in a valid state on the first render.
 *
 * Fix 4: The previous implementation returned `true` without documenting why,
 * which made `allDataLoaded` gates feel meaningless. This comment clarifies the
 * design intent: the flag exists so callers that compose multiple usePreferences
 * instances can write uniform `loaded && loaded2 && loaded3` guards that will
 * remain correct if any instance is ever swapped to an async store (IndexedDB,
 * remote API) in the future, at which point only that hook needs updating.
 */
export const usePreferences = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(() => {
        try {
            if (typeof window !== 'undefined') {
                const item = window.localStorage.getItem(key);
                if (item !== null) {
                    return JSON.parse(item);
                }
            }
        } catch (e) {
            console.error(`[usePreferences] Error reading "${key}" from localStorage:`, e);
            // Self-healing: heal corrupted data with safe initialValue so the app never stays broken
            try {
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(initialValue));
                }
            } catch {}
        }
        return initialValue;
    });

    const setValue = useCallback((value) => {
        try {
            setStoredValue(prev => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                if (typeof window !== 'undefined') {
                    try {
                        window.localStorage.setItem(key, JSON.stringify(valueToStore));
                    } catch (storageErr) {
                        if (storageErr.name === 'QuotaExceededError' || storageErr.code === 22) {
                            console.warn(
                                `[usePreferences] localStorage quota reached for "${key}". ` +
                                'Value is kept in memory only for this session.'
                            );
                        } else {
                            console.error(`[usePreferences] Error writing "${key}":`, storageErr);
                        }
                    }
                }
                return valueToStore;
            });
        } catch (e) {
            console.error(`[usePreferences] Unexpected error setting "${key}":`, e);
        }
    }, [key]);

    // Always true: localStorage reads are synchronous so hydration is instant.
    // This flag exists for forward-compatibility — if this hook is ever replaced
    // with an async store, callers already have the right pattern in place.
    const isHydrated = true;

    return [storedValue, setValue, isHydrated];
};

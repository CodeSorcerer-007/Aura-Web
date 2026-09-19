import { useState, useCallback } from 'react';

// --- Web-based Preferences Hook with Instant Synchronous Hydration ---
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
            console.error(`Error reading preference ${key}`, e);
        }
        return initialValue;
    });

    const setValue = useCallback((value) => {
        try {
            setStoredValue(prev => {
                const valueToStore = value instanceof Function ? value(prev) : value;
                if (typeof window !== 'undefined') {
                    window.localStorage.setItem(key, JSON.stringify(valueToStore));
                }
                return valueToStore;
            });
        } catch (e) {
            console.error(`Error setting preference ${key}`, e);
        }
    }, [key]);

    return [storedValue, setValue, true];
};

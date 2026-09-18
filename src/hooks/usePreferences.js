import { useState, useEffect } from 'react';

// --- Web-based Preferences Hook ---
export const usePreferences = (key, initialValue) => {
    const [storedValue, setStoredValue] = useState(initialValue);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadValue = () => {
            try {
                const item = window.localStorage.getItem(key);
                if (item !== null) {
                    setStoredValue(JSON.parse(item));
                }
            } catch (e) {
                console.error(`Error reading preference ${key}`, e);
                setStoredValue(initialValue);
            } finally {
                setIsLoaded(true);
            }
        };
        loadValue();
    }, [key]);

    const setValue = (value) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
        } catch (e) {
            console.error(`Error setting preference ${key}`, e);
        }
    };

    return [storedValue, setValue, isLoaded];
};

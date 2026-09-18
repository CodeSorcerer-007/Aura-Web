import React, { createContext, useContext, useMemo } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { baseThemes } from '../utils/constants';

const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme, themeLoaded] = usePreferences('aura-theme', 'dark');
    const [customThemes, setCustomThemes, customThemesLoaded] = usePreferences('aura-custom-themes', []);

    const allThemes = useMemo(() => [...baseThemes, ...customThemes], [customThemes]);

    const value = {
        theme,
        setTheme,
        themeLoaded,
        customThemes,
        setCustomThemes,
        customThemesLoaded,
        allThemes,
        baseThemes
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) throw new Error('useTheme must be used within ThemeProvider');
    return context;
};

import React, { createContext, useContext, useMemo } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { baseThemes } from '../utils/constants';

const ThemeContext = createContext(null);

const themeBgMap = {
    dark: '#000000',
    circadian: '#090d16',
    light: '#f9fafb',
    cyberpunk: '#0d0221',
    crimson: '#120000',
    forest: '#0b2e13',
    ocean: '#021027',
    dune: '#422d1c',
    sakura: '#fff0f3',
    solarized: '#002b36',
    dracula: '#282a36',
    nord: '#2E3440',
    gruvbox: '#282828',
    monokai: '#272822',
    rose_pine: '#191724',
    matcha: '#243029',
    latte: '#eff1f5',
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme, themeLoaded] = usePreferences('aura-theme', 'dark');
    const [customThemes, setCustomThemes, customThemesLoaded] = usePreferences('aura-custom-themes', []);

    const allThemes = useMemo(() => [...baseThemes, ...customThemes], [customThemes]);

    // Dynamic browser address bar / frame theme-color synchronization
    React.useEffect(() => {
        try {
            const custom = customThemes.find(ct => ct.id === theme);
            const activeBg = custom?.bg || themeBgMap[theme] || '#000000';
            const metaTheme = document.getElementById('meta-theme-color') || document.querySelector('meta[name="theme-color"]');
            if (metaTheme) {
                metaTheme.setAttribute('content', activeBg);
            }
        } catch {}
    }, [theme, customThemes]);

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

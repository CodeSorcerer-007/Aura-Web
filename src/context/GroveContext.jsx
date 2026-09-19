import React, { createContext, useContext } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { getTodayDateString } from '../utils/dateUtils';

const GroveContext = createContext(null);

export const GroveProvider = ({ children }) => {
    const [stats, setStats, statsLoaded] = usePreferences('aura-stats', {
        streak: 1,
        goldenSeeds: 0,
        lastActiveDate: getTodayDateString(),
        focusedTasksCompleted: 0
    });
    const [unlockedAchievements, setUnlockedAchievements, achievementsLoaded] = usePreferences('aura-achievements', []);
    const [grove, setGrove, groveLoaded] = usePreferences('aura-grove', []);

    const groveDataLoaded = statsLoaded && achievementsLoaded && groveLoaded;

    const value = {
        groveDataLoaded,
        stats,
        setStats,
        unlockedAchievements,
        setUnlockedAchievements,
        grove,
        setGrove
    };

    return (
        <GroveContext.Provider value={value}>
            {children}
        </GroveContext.Provider>
    );
};

export const useGrove = () => {
    const context = useContext(GroveContext);
    if (!context) throw new Error('useGrove must be used within GroveProvider');
    return context;
};

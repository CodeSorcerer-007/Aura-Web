import React, { createContext, useContext, useEffect } from 'react';
import { usePreferences } from '../hooks/usePreferences';
import { getTodayDateString } from '../utils/dateUtils';

// ---------------------------------------------------------------------------
// Pruning constants
// aura-grove and aura-focus-history grow without bound in localStorage.  We
// cap them at sensible maximums so the 5 MB localStorage quota is never
// threatened.  The values are generous — a user completing 5 tasks + 3 focus
// sessions per day would hit the focus-history cap after ~5.5 years.
// Grove trees are purely cosmetic metadata objects; capping at 500 means
// ~500 days of daily planting before any trimming occurs.
// ---------------------------------------------------------------------------
const MAX_GROVE_TREES = 500;
const MAX_FOCUS_HISTORY = 5000;

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

    // Fix 2: Focus history moved from raw localStorage writes into React-managed
    // persisted state. Every focus-session completion now goes through setFocusHistory,
    // giving ReviewView and FlowView a single, consistent source of truth.
    const [focusHistory, setFocusHistory, focusHistoryLoaded] = usePreferences('aura-focus-history', []);

    // Fix 8: Momentum-award tracking moved from a raw localStorage write in
    // useStatsAndGrove into a proper persisted preference so the state management
    // is fully consistent with the rest of the app.
    const [momentumAwardedDate, setMomentumAwardedDate, momentumAwardedDateLoaded] = usePreferences('aura-momentum-awarded-date', '');

    const groveDataLoaded = statsLoaded && achievementsLoaded && groveLoaded &&
        focusHistoryLoaded && momentumAwardedDateLoaded;

    // -------------------------------------------------------------------------
    // Prune unbounded arrays once on mount (after data is loaded) so they never
    // threaten the 5 MB localStorage quota.
    // -------------------------------------------------------------------------
    useEffect(() => {
        if (!groveDataLoaded) return;

        if (grove.length > MAX_GROVE_TREES) {
            // Keep the most recent trees (tail of the array — newer plants are appended)
            setGrove(prev => prev.slice(prev.length - MAX_GROVE_TREES));
        }

        if (focusHistory.length > MAX_FOCUS_HISTORY) {
            // Keep the most recent sessions (sorted newest-last by timestamp)
            setFocusHistory(prev => prev.slice(prev.length - MAX_FOCUS_HISTORY));
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [groveDataLoaded]); // intentionally run once after load, not on every array change

    const value = {
        groveDataLoaded,
        stats,
        setStats,
        unlockedAchievements,
        setUnlockedAchievements,
        grove,
        setGrove,
        // Focus history (Fix 2)
        focusHistory,
        setFocusHistory,
        // Momentum award date (Fix 8)
        momentumAwardedDate,
        setMomentumAwardedDate,
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

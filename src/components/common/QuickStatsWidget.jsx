import React from 'react';
import { motion } from 'framer-motion';

export const QuickStatsWidget = ({ stats = {}, completedTodayCount = 0, groveCount = 0, onStreakClick, onGroveClick }) => {
    const streak = stats?.streak || 0;
    const goldenSeeds = stats?.goldenSeeds || 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-center flex-wrap gap-2 sm:gap-3 py-2 px-3 my-2 max-w-2xl mx-auto select-none"
            role="region"
            aria-label="Daily Momentum and Grove Quick Stats"
        >
            {/* Streak Stat */}
            <div
                onClick={onStreakClick}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition-all cursor-default ${
                    streak > 0
                        ? 'bg-amber-500/15 border-amber-400/30 text-amber-300 shadow-xs'
                        : 'bg-white/5 border-white/10 text-[var(--color-text-secondary)]'
                }`}
                title={`${streak} day consistent streak`}
            >
                <span className="text-sm" aria-hidden="true">{streak > 0 ? '🔥' : '🕯️'}</span>
                <span>{streak} {streak === 1 ? 'day streak' : 'days streak'}</span>
            </div>

            {/* Completed Today Stat */}
            <div
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 shadow-xs backdrop-blur-md"
                title={`${completedTodayCount} tasks accomplished today`}
            >
                <span className="text-sm" aria-hidden="true">✓</span>
                <span>{completedTodayCount} today</span>
            </div>

            {/* Grove Trees Stat */}
            <div
                onClick={onGroveClick}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-teal-500/15 border border-teal-400/30 text-teal-300 shadow-xs backdrop-blur-md cursor-pointer hover:border-teal-400/50 transition-all"
                title="View your botanical sanctuary"
            >
                <span className="text-sm" aria-hidden="true">🌱</span>
                <span>{groveCount} {groveCount === 1 ? 'tree' : 'trees'}</span>
            </div>

            {/* Golden Seeds Stat */}
            {goldenSeeds > 0 && (
                <div
                    className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-400/20 border border-amber-400/40 text-amber-200 shadow-xs backdrop-blur-md"
                    title={`${goldenSeeds} golden seeds available to plant`}
                >
                    <span className="text-sm" aria-hidden="true">🌰</span>
                    <span>{goldenSeeds} seed{goldenSeeds === 1 ? '' : 's'}</span>
                </div>
            )}
        </motion.div>
    );
};

export default QuickStatsWidget;

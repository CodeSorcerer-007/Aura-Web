import React from 'react';

/**
 * ReviewStatsCards
 * High-level productivity metrics: Completed tasks, completion rate, streak, energy distribution.
 */
export const ReviewStatsCards = ({ energyData, stats }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md flex flex-col justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Conquered
                </span>
                <div className="mt-2">
                    <span className="text-3xl font-black text-emerald-400 tabular-nums">
                        {energyData.totalCompleted}
                    </span>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                        {energyData.completionRate}% completion rate
                    </p>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md flex flex-col justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Flow Momentum
                </span>
                <div className="mt-2">
                    <span className="text-3xl font-black text-amber-400 tabular-nums">
                        {stats?.streak || 0}
                    </span>
                    <span className="text-sm font-bold text-amber-300 ml-1">Days 🔥</span>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                        Active daily streak
                    </p>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md flex flex-col justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Golden Seeds
                </span>
                <div className="mt-2">
                    <span className="text-3xl font-black text-yellow-300 tabular-nums">
                        {stats?.goldenSeeds || 0}
                    </span>
                    <span className="text-sm font-bold text-yellow-200 ml-1">✨</span>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                        Nurturing the Grove
                    </p>
                </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] shadow-md flex flex-col justify-between">
                <span className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider">
                    Bio-Energy
                </span>
                <div className="mt-2">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                        <span className="text-amber-400">⚡{energyData.sparkPct}%</span>
                        <span className="text-sky-400">🌊{energyData.flowPct}%</span>
                        <span className="text-emerald-400">🍵{energyData.restPct}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden flex mt-2">
                        <div style={{ width: `${energyData.sparkPct}%` }} className="bg-amber-400 h-full" />
                        <div style={{ width: `${energyData.flowPct}%` }} className="bg-sky-400 h-full" />
                        <div style={{ width: `${energyData.restPct}%` }} className="bg-emerald-400 h-full" />
                    </div>
                </div>
            </div>
        </div>
    );
};

import React from 'react';

/**
 * FocusAnalyticsPanel
 * Detailed breakdown of Pomodoro sessions, deep work hours, top realm, and focus streaks.
 */
export const FocusAnalyticsPanel = ({ focusStats }) => {
    return (
        <div className="p-5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between gap-3 mb-4">
                <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-amber-400/15 text-amber-300 border border-amber-400/30 text-base">
                        ⏱️
                    </span>
                    <div>
                        <h3 className="text-lg font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                            Focus Mastery & Deep Work
                            <span className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30">
                                Pomodoro
                            </span>
                        </h3>
                        <p className="text-xs text-[var(--color-text-secondary)]">
                            Deep work sessions and sacred focus intervals completed
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 rounded-xl bg-[var(--color-bg)]/70 border border-white/5 flex flex-col justify-between">
                    <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">Total Sessions</span>
                    <div className="mt-1">
                        <span className="text-2xl font-black text-amber-300 tabular-nums">{focusStats.totalSessions}</span>
                        <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">
                            {focusStats.sessionsThisWeek} wk · {focusStats.sessionsThisMonth} mo
                        </p>
                    </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-bg)]/70 border border-white/5 flex flex-col justify-between">
                    <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">Estimated Deep Work</span>
                    <div className="mt-1">
                        <span className="text-2xl font-black text-sky-300 tabular-nums">{focusStats.deepWorkFormatted}</span>
                        <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">~25m avg per flow</p>
                    </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-bg)]/70 border border-white/5 flex flex-col justify-between">
                    <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">Top Realm</span>
                    <div className="mt-1">
                        <span className="text-xl font-bold text-purple-300 truncate block">{focusStats.topCategory}</span>
                        <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">{focusStats.topCategoryCount} sessions</p>
                    </div>
                </div>

                <div className="p-3.5 rounded-xl bg-[var(--color-bg)]/70 border border-white/5 flex flex-col justify-between">
                    <span className="text-[11px] font-medium text-[var(--color-text-secondary)]">Focus Streak</span>
                    <div className="mt-1 flex items-baseline gap-1">
                        <span className="text-2xl font-black text-emerald-300 tabular-nums">{focusStats.focusStreak}</span>
                        <span className="text-xs text-emerald-400 font-bold">days 🔥</span>
                    </div>
                    <p className="text-[10px] text-[var(--color-text-secondary)] mt-0.5">Consecutive focus</p>
                </div>
            </div>
        </div>
    );
};

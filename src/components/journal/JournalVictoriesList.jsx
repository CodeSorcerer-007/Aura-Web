import React from 'react';
import { EmptyState } from '../common/EmptyState';

/**
 * JournalVictoriesList
 * Displays 7-day mood trail and tasks completed on the selected date.
 */
export const JournalVictoriesList = ({ statsSummary, selectedDate, tasksForSelectedDate }) => {
    return (
        <div className="space-y-4">
            {/* 7-Day Mood Resonance Trail */}
            <div className="aura-glass-card rounded-2xl p-4 border border-white/10">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-primary)]/80 mb-3">
                    7-Day Mood Trail
                </h3>
                <div className="grid grid-cols-7 gap-1 text-center">
                    {statsSummary.weeklyMoods.map((m, idx) => (
                        <div 
                            key={idx} 
                            className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                                m.dateStr === selectedDate 
                                    ? 'bg-white/15 border-white/30 shadow-xs' 
                                    : 'bg-white/5 border-transparent'
                            }`}
                            title={`${m.dayName}: ${m.mood ? m.mood.label : 'Unrecorded'}`}
                        >
                            <span className="text-[10px] uppercase font-semibold text-[var(--color-text-secondary)]">
                                {m.dayName}
                            </span>
                            <span className="text-base">
                                {m.mood ? m.mood.emoji : '·'}
                            </span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Harvested Wins for Day */}
            <div className="aura-glass-card rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-primary)]/80">
                        Harvested Wins
                    </h3>
                    <span className="text-xs font-mono text-[var(--color-accent)] font-semibold">
                        {tasksForSelectedDate.length} tasks
                    </span>
                </div>
                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                    {tasksForSelectedDate.length > 0 ? (
                        tasksForSelectedDate.map(task => (
                            <div 
                                key={task.id} 
                                className="p-3 rounded-xl bg-white/5 text-xs text-[var(--color-text-primary)] border border-white/5 flex items-start gap-2"
                            >
                                <span className="text-teal-400 font-bold mt-0.5">✓</span>
                                <span className="leading-snug">{task.text}</span>
                            </div>
                        ))
                    ) : (
                        <EmptyState
                            icon="🌱"
                            title="Restful Day"
                            description="No tasks marked complete. Rest and stillness nurture the seeds of tomorrow."
                            compact={true}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

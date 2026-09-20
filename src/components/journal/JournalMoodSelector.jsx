import React from 'react';

export const MOOD_OPTIONS = [
    { id: 'calm', emoji: '😌', label: 'Calm', glow: '#38bdf8' },
    { id: 'energized', emoji: '⚡', label: 'Energized', glow: '#fbbf24' },
    { id: 'focused', emoji: '🎯', label: 'Focused', glow: '#34d399' },
    { id: 'grateful', emoji: '🌸', label: 'Grateful', glow: '#f472b6' },
    { id: 'reflective', emoji: '🌙', label: 'Reflective', glow: '#a78bfa' },
    { id: 'weary', emoji: '🍵', label: 'Restful', glow: '#94a3b8' }
];

/**
 * JournalMoodSelector
 * Mood selection pills with glowing state and active resonance label.
 */
export const JournalMoodSelector = ({ selectedMood, onSelectMood }) => {
    return (
        <div className="mb-6 max-w-2xl mx-auto aura-glass-card rounded-2xl p-3.5 border border-white/10">
            <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
                    Daily Resonance & Mood
                </span>
                {selectedMood && (
                    <span className="text-xs font-medium text-[var(--color-accent)] capitalize">
                        Feeling {selectedMood}
                    </span>
                )}
            </div>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
                {MOOD_OPTIONS.map(m => {
                    const isChosen = selectedMood === m.id;
                    return (
                        <button
                            key={m.id}
                            type="button"
                            onClick={() => onSelectMood(isChosen ? null : m.id)}
                            aria-pressed={isChosen}
                            className={`flex-1 min-w-[58px] sm:min-w-[70px] py-1.5 px-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-0.5 border cursor-pointer ${
                                isChosen
                                    ? 'bg-white/15 border-white/30 text-[var(--color-text-primary)] shadow-md scale-105'
                                    : 'bg-white/5 border-transparent text-[var(--color-text-secondary)] hover:bg-white/10 hover:text-[var(--color-text-primary)]'
                            }`}
                        >
                            <span className="text-lg">{m.emoji}</span>
                            <span className="text-[10px] tracking-tight">{m.label}</span>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

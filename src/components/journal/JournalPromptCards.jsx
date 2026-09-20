import React from 'react';
import { SparklesIcon } from '../common/Icons';

export const JOURNAL_PROMPTS = [
    "What went well today?",
    "What am I grateful for?",
    "What was the biggest challenge?",
    "One thing I learned today is...",
    "How can I make tomorrow better?"
];

/**
 * JournalPromptCards
 * Guided reflective question chips and "Insert Daily Victories" button.
 */
export const JournalPromptCards = ({ onAddPrompt, onInsertWins, completedCount }) => {
    return (
        <div className="aura-glass-card rounded-2xl p-4 border border-white/10 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-primary)]/80">
                    Guided Prompts
                </h3>
                {completedCount > 0 && onInsertWins && (
                    <button
                        type="button"
                        onClick={onInsertWins}
                        className="text-xs px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-all flex items-center gap-1 font-medium active:scale-95 cursor-pointer"
                        title="Automatically format and insert tasks completed on this date"
                    >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>Insert Wins ({completedCount})</span>
                    </button>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {JOURNAL_PROMPTS.map(p => (
                    <button
                        key={p}
                        type="button"
                        onClick={() => onAddPrompt(p)}
                        className="text-xs px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[var(--color-text-primary)]/80 border border-white/5 transition-all text-left active:scale-95 cursor-pointer hover:border-white/20"
                    >
                        + {p}
                    </button>
                ))}
            </div>
        </div>
    );
};

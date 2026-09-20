import React from 'react';

/**
 * JournalCalendarStrip
 * Horizontal 7-day calendar strip for selecting journal entries.
 */
export const JournalCalendarStrip = ({ calendarStripDays, selectedDate, onSelectDate }) => {
    return (
        <div className="flex items-center justify-center gap-2 max-w-md mx-auto p-1.5 aura-glass-subtle rounded-2xl mb-4">
            {calendarStripDays.map(d => {
                const isSelected = selectedDate === d.dateStr;
                return (
                    <button
                        key={d.dateStr}
                        type="button"
                        onClick={() => onSelectDate(d.dateStr)}
                        aria-label={`${d.dayName} ${d.dayNum}`}
                        aria-current={isSelected ? 'date' : undefined}
                        className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all relative cursor-pointer ${
                            isSelected 
                                ? 'bg-[var(--color-accent)] text-black font-bold shadow-lg scale-105' 
                                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
                        }`}
                    >
                        <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                            {d.dayName}
                        </span>
                        <span className="text-sm font-bold font-mono">
                            {d.dayNum}
                        </span>
                        {d.hasEntry && (
                            <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-black' : 'bg-[var(--color-accent)]'}`} />
                        )}
                    </button>
                );
            })}
        </div>
    );
};

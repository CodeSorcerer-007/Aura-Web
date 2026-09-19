import React from 'react';

export const FilterBar = ({ activeFilter, setActiveFilter, categories, allTags }) => {
    const filters = [
        { type: 'all', label: 'All' },
        { type: 'priority', label: 'High Priority' },
        { type: 'due_this_week', label: 'Due This Week' },
    ];

    return (
        <div 
            role="toolbar" 
            aria-label="Task Filters"
            className="flex flex-wrap items-center justify-center gap-2 mb-6"
        >
            {filters.map(filter => {
                const isActive = activeFilter.type === filter.type && activeFilter.value === null;
                return (
                    <button
                        key={filter.type}
                        type="button"
                        onClick={() => setActiveFilter({ type: filter.type, value: null })}
                        aria-pressed={isActive}
                        className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 border focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                            isActive 
                                ? 'bg-[var(--color-accent)] text-black font-bold border-transparent shadow-[0_0_12px_rgba(52,211,153,0.35)] scale-105' 
                                : 'bg-[var(--color-bg-secondary)]/70 text-[var(--color-text-secondary)] border-white/5 hover:border-white/20 hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-secondary)]'
                        }`}
                    >
                        {filter.label}
                    </button>
                );
            })}
            <select
                onChange={(e) => setActiveFilter({ type: 'category', value: e.target.value })}
                value={activeFilter.type === 'category' ? activeFilter.value : ''}
                aria-label="Filter by category"
                className="bg-[var(--color-bg-secondary)]/70 text-[var(--color-text-secondary)] text-xs sm:text-sm rounded-full px-3.5 py-1.5 border border-white/5 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] cursor-pointer hover:border-white/20 transition-all"
            >
                <option value="" disabled>Category...</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {allTags.length > 0 && (
                <select
                    onChange={(e) => setActiveFilter({ type: 'tag', value: e.target.value })}
                    value={activeFilter.type === 'tag' ? activeFilter.value : ''}
                    aria-label="Filter by tag"
                    className="bg-[var(--color-bg-secondary)]/70 text-[var(--color-text-secondary)] text-xs sm:text-sm rounded-full px-3.5 py-1.5 border border-white/5 focus:outline-none focus:border-[var(--color-accent)] focus:ring-1 focus:ring-[var(--color-accent)] cursor-pointer hover:border-white/20 transition-all"
                >
                    <option value="" disabled>Tag...</option>
                    {allTags.map(tag => <option key={tag} value={tag}>@{tag}</option>)}
                </select>
            )}
        </div>
    );
};

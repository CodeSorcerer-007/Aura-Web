import React from 'react';

export const FilterBar = ({ activeFilter, setActiveFilter, categories, allTags }) => {
    const filters = [
        { type: 'all', label: 'All' },
        { type: 'priority', label: 'High Priority' },
        { type: 'due_this_week', label: 'Due This Week' },
    ];

    return (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
            {filters.map(filter => (
                <button
                    key={filter.type}
                    onClick={() => setActiveFilter({ type: filter.type, value: null })}
                    className={`px-3 py-1 text-sm rounded-full transition-colors ${activeFilter.type === filter.type && activeFilter.value === null ? 'bg-[var(--color-text-primary)]/90 text-[var(--color-bg)] font-semibold' : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary-hover)]'}`}
                >
                    {filter.label}
                </button>
            ))}
            <select
                onChange={(e) => setActiveFilter({ type: 'category', value: e.target.value })}
                value={activeFilter.type === 'category' ? activeFilter.value : ''}
                className="bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-sm rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
            >
                <option value="" disabled>Category...</option>
                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            {allTags.length > 0 && (
                <select
                    onChange={(e) => setActiveFilter({ type: 'tag', value: e.target.value })}
                    value={activeFilter.type === 'tag' ? activeFilter.value : ''}
                    className="bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-sm rounded-full px-3 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]/50"
                >
                    <option value="" disabled>Tag...</option>
                    {allTags.map(tag => <option key={tag} value={tag}>@{tag}</option>)}
                </select>
            )}
        </div>
    );
};

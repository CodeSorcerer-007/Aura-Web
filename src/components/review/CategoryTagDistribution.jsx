import React from 'react';
import { defaultCategories } from '../../utils/constants';

/**
 * CategoryTagDistribution
 * Visual progress bars for categories and tag breakdown.
 */
export const CategoryTagDistribution = ({ categoryData, tagData, allCategories = {}, totalCompleted, completedTasks }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-md">
                <h3 className="text-lg font-bold mb-4 text-[var(--color-text-primary)] flex items-center justify-between">
                    <span>Category Breakdown</span>
                    <span className="text-xs text-[var(--color-text-secondary)] font-normal">{categoryData.length} active realms</span>
                </h3>
                <div className="space-y-3">
                    {categoryData.length > 0 ? categoryData.map(([category, count]) => (
                        <div key={category}>
                            <div className="flex justify-between text-xs mb-1.5">
                                <span className="font-semibold text-[var(--color-text-primary)]">{category}</span>
                                <span className="text-[var(--color-text-secondary)] font-mono">{count} tasks</span>
                            </div>
                            <div className="w-full bg-[var(--color-bg)] rounded-full h-2 overflow-hidden border border-white/5">
                                <div 
                                    className={`${allCategories[category]?.solid || defaultCategories['General']?.solid || 'bg-slate-500'} h-2 rounded-full transition-all duration-500`}
                                    style={{ width: `${totalCompleted > 0 ? (count / totalCompleted) * 100 : 0}%` }}
                                />
                            </div>
                        </div>
                    )) : (
                        <p className="text-[var(--color-text-secondary)] text-xs italic py-2">No completed tasks with categories yet.</p>
                    )}
                </div>
            </div>

            <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-md">
                <h3 className="text-lg font-bold mb-4 text-[var(--color-text-primary)] flex items-center justify-between">
                    <span>Tag Distribution</span>
                    <span className="text-xs text-[var(--color-text-secondary)] font-normal">Top tags</span>
                </h3>
                <div className="space-y-3">
                    {tagData.length > 0 ? tagData.slice(0, 5).map(([tag, count]) => {
                        const totalTagged = completedTasks.flatMap(t => t.tags || []).length || 1;
                        return (
                            <div key={tag}>
                                <div className="flex justify-between text-xs mb-1.5">
                                    <span className="font-semibold font-mono text-purple-300">@{tag}</span>
                                    <span className="text-[var(--color-text-secondary)] font-mono">{count} tasks</span>
                                </div>
                                <div className="w-full bg-[var(--color-bg)] rounded-full h-2 overflow-hidden border border-white/5">
                                    <div 
                                        className="bg-purple-400 h-2 rounded-full transition-all duration-500"
                                        style={{ width: `${(count / totalTagged) * 100}%` }}
                                    />
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-[var(--color-text-secondary)] text-xs italic py-2">No completed tasks with tags yet.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

import React from 'react';
import { motion } from 'framer-motion';
import { defaultCategories } from '../../utils/constants';

export const ClusterListView = ({ activeProjects = [], allCategories = {}, onTaskClick }) => {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto py-4 text-left">
            {activeProjects.map(([category, cTasks]) => {
                const color = allCategories[category] || defaultCategories['General'] || {};
                const categoryHue = color.glowColor || '#38bdf8';
                const completedCount = cTasks.filter(t => t.completed).length;

                return (
                    <motion.div
                        key={`cluster-${category}`}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-3xl aura-glass border border-white/10 shadow-xl relative overflow-hidden"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2.5">
                                <div
                                    className="w-3.5 h-3.5 rounded-full shadow-[0_0_8px]"
                                    style={{ backgroundColor: categoryHue, boxShadow: `0 0 10px ${categoryHue}` }}
                                />
                                <h3 className="font-bold text-base text-[var(--color-text-primary)]">{category}</h3>
                            </div>
                            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-[var(--color-text-secondary)]">
                                {completedCount}/{cTasks.length} stars
                            </span>
                        </div>

                        <div className="space-y-2">
                            {cTasks.map(task => (
                                <div
                                    key={task.id}
                                    onClick={() => onTaskClick(task.id)}
                                    className={`p-2.5 rounded-xl border flex items-center justify-between gap-3 cursor-pointer transition-all ${
                                        task.completed
                                            ? 'bg-teal-500/10 border-teal-500/20 text-[var(--color-text-secondary)]'
                                            : 'bg-white/[0.03] border-white/5 hover:border-white/20 text-[var(--color-text-primary)]'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div
                                            className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                                                task.completed ? 'bg-teal-400 text-black' : task.priority === 3 ? 'bg-amber-400' : 'bg-white/40'
                                            }`}
                                        >
                                            {task.completed && <span className="text-[9px] font-bold">✓</span>}
                                        </div>
                                        <p className={`text-xs truncate ${task.completed ? 'line-through opacity-60' : 'font-medium'}`}>
                                            {task.text}
                                        </p>
                                    </div>
                                    <span className={`text-[10px] px-1.5 py-0.5 rounded font-mono flex-shrink-0 ${
                                        task.priority === 3 ? 'bg-rose-500/20 text-rose-300' : 'bg-white/5 text-white/50'
                                    }`}>
                                        P{task.priority}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                );
            })}
        </div>
    );
};

export default ClusterListView;

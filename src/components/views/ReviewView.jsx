import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { defaultCategories, achievementsList } from '../../utils/constants';
import { formatDate } from '../../utils/dateUtils';
import { TrophyIcon } from '../common/Icons';
import { ProductivityHeatmap } from './ProductivityHeatmap';

export const ReviewView = ({ tasks, achievements, allCategories, stats, onDeleteStale, onRecommitTask, onSnoozeTask, onForgiveTask }) => {
    const completedTasks = tasks.filter(t => t.completed && t.completionDate);
    
    const categoryData = useMemo(() => {
        const data = completedTasks.reduce((acc, task) => {
            acc[task.category] = (acc[task.category] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(data).sort((a, b) => b[1] - a[1]);
    }, [completedTasks]);

    const tagData = useMemo(() => {
        const data = completedTasks.reduce((acc, task) => {
            (task.tags || []).forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
            return acc;
        }, {});
        return Object.entries(data).sort((a, b) => b[1] - a[1]);
    }, [completedTasks]);

    const staleTasks = useMemo(() => {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return tasks.filter(task => {
            if (task.completed) return false;
            const createdDate = task.createdAt 
                ? new Date(task.createdAt) 
                : (typeof task.id === 'number' && task.id > 1000000000000 ? new Date(task.id) : null);
            if (!createdDate || isNaN(createdDate.getTime())) return false;
            return createdDate < twoWeeksAgo;
        });
    }, [tasks]);

    const totalCompleted = completedTasks.length;

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.5 }} 
            className="max-w-4xl mx-auto space-y-8"
        >
            <div className="text-center">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Your Review</h2>
                <p className="text-[var(--color-text-secondary)]">Reflect on your productivity and progress.</p>
            </div>

            {/* GitHub-style Full Year Productivity Heatmap */}
            <ProductivityHeatmap completedTasks={completedTasks} streak={stats?.streak || 0} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Category Breakdown</h3>
                    <div className="space-y-2">
                        {categoryData.length > 0 ? categoryData.map(([category, count]) => (
                            <div key={category}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="font-semibold">{category}</span>
                                    <span className="text-[var(--color-text-secondary)]">{count} tasks</span>
                                </div>
                                <div className="w-full bg-[var(--color-bg)] rounded-full h-2">
                                    <div 
                                        className={`${allCategories[category]?.solid || defaultCategories['General'].solid} h-2 rounded-full`}
                                        style={{ width: `${totalCompleted > 0 ? (count / totalCompleted) * 100 : 0}%` }}
                                    />
                                </div>
                            </div>
                        )) : (
                            <p className="text-[var(--color-text-secondary)] text-sm">No completed tasks with categories yet.</p>
                        )}
                    </div>
                </div>
                <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Tag Breakdown</h3>
                    <div className="space-y-2">
                        {tagData.length > 0 ? tagData.slice(0, 5).map(([tag, count]) => {
                            const totalTagged = completedTasks.flatMap(t => t.tags || []).length;
                            return (
                                <div key={tag}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="font-semibold">@{tag}</span>
                                        <span className="text-[var(--color-text-secondary)]">{count} tasks</span>
                                    </div>
                                    <div className="w-full bg-[var(--color-bg)] rounded-full h-2">
                                        <div 
                                            className="bg-purple-400 h-2 rounded-full"
                                            style={{ width: `${totalTagged > 0 ? (count / totalTagged) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        }) : (
                            <p className="text-[var(--color-text-secondary)] text-sm">No completed tasks with tags yet.</p>
                        )}
                    </div>
                </div>
            </div>
            
            {/* Anti-Backlog Sanctuary: Forgive & Release */}
            <div className="text-left p-5 bg-[var(--color-bg-secondary)] border border-emerald-500/30 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <span className="text-xl">🍃</span>
                        <h3 className="text-xl font-bold text-[var(--color-text-primary)]">Anti-Backlog Sanctuary</h3>
                    </div>
                    <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-300 font-semibold border border-emerald-500/20">
                        {staleTasks.length} {staleTasks.length === 1 ? 'stale task' : 'stale tasks'}
                    </span>
                </div>
                <p className="text-xs text-[var(--color-text-secondary)] mb-5 leading-relaxed">
                    Lingering tasks weigh heavily on your subconscious mind. Either recommit today, snooze to #someday, or gracefully forgive and let go without guilt.
                </p>

                {staleTasks.length > 0 ? (
                    <div className="space-y-3">
                        {staleTasks.map(task => (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0, y: -15, filter: 'blur(6px)' }}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] shadow-sm"
                            >
                                <div className="truncate">
                                    <span className="text-sm font-medium text-[var(--color-text-primary)]">{task.text}</span>
                                    <p className="text-[11px] text-[var(--color-text-secondary)] mt-0.5">
                                        Added {task.createdAt ? formatDate(task.createdAt.split('T')[0]) : 'over 2 weeks ago'}
                                    </p>
                                </div>
                                <div className="flex items-center gap-2 flex-shrink-0">
                                    {onRecommitTask && (
                                        <button
                                            onClick={() => onRecommitTask(task.id)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30 transition-colors flex items-center gap-1"
                                            title="Schedule for today's morning flow"
                                        >
                                            <span>⚡</span> Recommit
                                        </button>
                                    )}
                                    {onSnoozeTask && (
                                        <button
                                            onClick={() => onSnoozeTask(task.id)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition-colors flex items-center gap-1"
                                            title="Move to #someday list"
                                        >
                                            <span>🌙</span> Someday
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (onForgiveTask) {
                                                onForgiveTask(task.id);
                                            } else {
                                                onDeleteStale(task.id);
                                            }
                                        }}
                                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-500/30 transition-colors flex items-center gap-1"
                                        title="Forgive and release this task from your mind"
                                    >
                                        <span>🍃</span> Forgive
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                        <p className="text-xs text-emerald-300 font-medium">
                            ✨ Your sanctuary is clear! No stale tasks lingering in your subconscious.
                        </p>
                    </div>
                )}
            </div>

            <div className="text-left p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                <h3 className="text-xl font-bold mb-4">Achievements</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {achievementsList.map(ach => (
                        <div 
                            key={ach.id} 
                            className={`p-3 rounded-lg text-center ${achievements.includes(ach.id) ? 'bg-amber-500/20 border border-amber-500/30' : 'bg-slate-700/50 opacity-60'}`}
                        >
                            <TrophyIcon className={`w-8 h-8 mx-auto mb-2 ${achievements.includes(ach.id) ? 'text-amber-400' : 'text-slate-500'}`} />
                            <p className="font-semibold text-sm">{ach.title}</p>
                            <p className="text-xs text-[var(--color-text-primary)]/60">{ach.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

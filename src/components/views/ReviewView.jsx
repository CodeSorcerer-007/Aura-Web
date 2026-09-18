import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { defaultCategories, achievementsList } from '../../utils/constants';
import { formatDate } from '../../utils/dateUtils';
import { TrophyIcon, XIcon } from '../common/Icons';

export const ReviewView = ({ tasks, achievements, allCategories, stats, onDeleteStale }) => {
    const completedTasks = tasks.filter(t => t.completed && t.completionDate);

    const heatmapData = useMemo(() => {
        const data = new Map();
        for (let i = 0; i < 365; i++) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            data.set(date.toISOString().split('T')[0], { level: 0 });
        }
        completedTasks.forEach(task => {
            const date = task.completionDate;
            if (data.has(date)) {
                data.get(date).level++;
            }
        });
        return Array.from(data.entries()).reverse();
    }, [completedTasks]);
    
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
        return tasks.filter(task => !task.completed && new Date(task.id) < twoWeeksAgo);
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Productivity Heatmap</h3>
                    <div className="flex flex-wrap gap-1">
                        {heatmapData.map(([date, data]) => (
                            <div 
                                key={date} 
                                className={`w-3 h-3 rounded-sm ${data.level > 0 ? 'bg-teal-400' : 'bg-[var(--color-bg)]'}`}
                                style={{ opacity: data.level > 0 ? Math.min(0.25 + data.level * 0.25, 1) : 0.2 }}
                                title={`${data.level} tasks on ${formatDate(date)}`}
                            />
                        ))}
                    </div>
                </div>

                <div className="p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Current Streak</h3>
                    <div className="text-center">
                        <p className="text-6xl font-bold text-amber-400">{stats.streak}</p>
                        <p className="text-[var(--color-text-secondary)]">day{stats.streak !== 1 && 's'}</p>
                    </div>
                </div>
            </div>

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
            
            {staleTasks.length > 0 && (
                <div className="text-left p-4 bg-[var(--color-bg-secondary)] border border-rose-500/30 rounded-lg">
                    <h3 className="text-xl font-bold mb-4">Unfinished Business</h3>
                    <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                        These tasks were created over two weeks ago. Consider completing, rescheduling, or deleting them.
                    </p>
                    <div className="space-y-2">
                        {staleTasks.map(task => (
                            <div key={task.id} className="flex items-center justify-between p-2 bg-[var(--color-bg)] rounded-md">
                                <span className="text-sm">{task.text}</span>
                                <button onClick={() => onDeleteStale(task.id)} className="text-rose-400 hover:text-rose-600">
                                    <XIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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

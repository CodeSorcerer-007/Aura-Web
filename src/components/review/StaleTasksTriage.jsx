import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDate } from '../../utils/dateUtils';

/**
 * StaleTasksTriage
 * Anti-Backlog Sanctuary: Recommit, Snooze to Someday, or Forgive & Release.
 */
export const StaleTasksTriage = ({ staleTasks, onRecommitTask, onSnoozeTask, onForgiveTask, onDeleteStale }) => {
    return (
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
                    <AnimatePresence>
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
                                            className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/30 transition-colors flex items-center gap-1 cursor-pointer"
                                            title="Schedule for today's morning flow"
                                        >
                                            <span>⚡</span> Recommit
                                        </button>
                                    )}
                                    {onSnoozeTask && (
                                        <button
                                            onClick={() => onSnoozeTask(task.id)}
                                            className="px-2.5 py-1 rounded-lg text-xs font-medium bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                                            title="Move to #someday list"
                                        >
                                            <span>🌙</span> Someday
                                        </button>
                                    )}
                                    <button
                                        onClick={() => {
                                            if (onForgiveTask) {
                                                onForgiveTask(task.id);
                                            } else if (onDeleteStale) {
                                                onDeleteStale(task.id);
                                            }
                                        }}
                                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-200 border border-emerald-500/30 transition-colors flex items-center gap-1 cursor-pointer"
                                        title="Forgive and release this task from your mind"
                                    >
                                        <span>🍃</span> Forgive
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            ) : (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
                    <p className="text-xs text-emerald-300 font-medium">
                        ✨ Your sanctuary is clear! No stale tasks lingering in your subconscious.
                    </p>
                </div>
            )}
        </div>
    );
};

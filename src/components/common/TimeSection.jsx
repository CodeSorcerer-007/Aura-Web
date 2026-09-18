import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskBubble } from './TaskBubble';

export const TimeSection = ({
    title,
    icon,
    tasks,
    toggleTask,
    deleteTask,
    onFocus,
    isCompletedSection = false,
    onReorder,
    onToggleSubtask,
    allCategories,
    allTasks,
    onOpenDetail,
    onTogglePin,
    onArchive
}) => {
    if (tasks.length === 0 && !isCompletedSection) return null;

    return (
        <motion.section layout>
            <h2 className="flex items-center gap-3 text-2xl font-semibold text-[var(--color-text-primary)]/80 mb-4">
                {React.cloneElement(icon, { className: "w-7 h-7" })}
                <span>{title}</span>
            </h2>
            <div className="space-y-3">
                <AnimatePresence>
                    {tasks.map((task) => {
                        const dependency = task.dependsOn ? allTasks.find(t => t.id === task.dependsOn) : null;
                        const isDependencyMet = !dependency || dependency.completed;
                        return (
                            <TaskBubble 
                                key={task.id} 
                                task={task}
                                allCategories={allCategories}
                                onToggle={toggleTask}
                                onDelete={deleteTask}
                                onFocus={onFocus}
                                onReorder={onReorder}
                                onToggleSubtask={onToggleSubtask}
                                isDependencyMet={isDependencyMet}
                                onOpenDetail={onOpenDetail}
                                onTogglePin={onTogglePin}
                                onArchive={onArchive}
                            />
                        );
                    })}
                </AnimatePresence>
                {tasks.length === 0 && isCompletedSection && (
                    <p className="text-[var(--color-text-secondary)]/80 pl-4">No tasks completed yet.</p>
                )}
            </div>
        </motion.section>
    );
};

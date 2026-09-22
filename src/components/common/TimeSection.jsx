import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskBubble } from './TaskBubble';
import { announceToScreenReader } from '../../hooks/useAuraAnnounce';

export const TimeSection = ({
    title,
    icon,
    sectionKey,
    energyTip,
    tasks,
    toggleTask,
    deleteTask,
    onFocus,
    isCompletedSection = false,
    onToggleSubtask,
    allCategories,
    allTasks,
    onOpenDetail,
    onTogglePin,
    onArchive,
    onMoveTaskToSection,
    onReorderTaskToPosition,
    onReorderTaskWithinSection
}) => {
    const [isDragOver, setIsDragOver] = useState(false);
    // dropTarget: { taskId: string, position: 'before' | 'after' } | null
    const [dropTarget, setDropTarget] = useState(null);

    if (tasks.length === 0 && !isCompletedSection && !isDragOver) return null;

    const extractTaskId = (e) => {
        try {
            const raw = e.dataTransfer.getData('text/plain');
            if (!raw) return null;
            try {
                const parsed = JSON.parse(raw);
                if (parsed.taskId) return parsed.taskId;
            } catch {}
            return raw;
        } catch {
            return null;
        }
    };

    // Container drag over (fallback drop area for empty section or section footer)
    const handleContainerDragOver = (e) => {
        if (isCompletedSection || !sectionKey) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleContainerDragLeave = (e) => {
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
            setDropTarget(null);
        }
    };

    const handleContainerDrop = (e) => {
        if (isCompletedSection || !sectionKey) return;
        e.preventDefault();
        setIsDragOver(false);
        setDropTarget(null);
        const taskId = extractTaskId(e);
        if (taskId) {
            if (tasks.length > 0 && onReorderTaskToPosition) {
                const lastTask = tasks[tasks.length - 1];
                if (lastTask && lastTask.id !== taskId) {
                    onReorderTaskToPosition(taskId, lastTask.id, 'after', sectionKey);
                } else if (onMoveTaskToSection) {
                    onMoveTaskToSection(taskId, sectionKey);
                }
            } else if (onMoveTaskToSection) {
                onMoveTaskToSection(taskId, sectionKey);
            }
            try {
                announceToScreenReader(`Task moved into ${title} section`);
            } catch {}
        }
    };

    // Individual Task card drag-over handling for precise between-task positioning
    const handleTaskDragOver = (e, targetTaskId) => {
        if (isCompletedSection) return;
        e.preventDefault();
        e.stopPropagation();
        e.dataTransfer.dropEffect = 'move';

        const rect = e.currentTarget.getBoundingClientRect();
        const clientY = e.clientY;
        const middleY = rect.top + rect.height / 2;
        const position = clientY < middleY ? 'before' : 'after';

        if (!dropTarget || dropTarget.taskId !== targetTaskId || dropTarget.position !== position) {
            setDropTarget({ taskId: targetTaskId, position });
        }
    };

    const handleTaskDragLeave = (e) => {
        e.stopPropagation();
        // Clear indicator if leaving this task card and not entering another part of it
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setDropTarget(null);
        }
    };

    const handleTaskDrop = (e, targetTaskId) => {
        if (isCompletedSection) return;
        e.preventDefault();
        e.stopPropagation();

        const currentDrop = dropTarget;
        setDropTarget(null);
        setIsDragOver(false);

        const draggedTaskId = extractTaskId(e);
        if (!draggedTaskId || draggedTaskId === targetTaskId) return;

        const position = currentDrop?.position || 'after';
        if (onReorderTaskToPosition) {
            onReorderTaskToPosition(draggedTaskId, targetTaskId, position, sectionKey);
        } else if (onMoveTaskToSection && sectionKey) {
            onMoveTaskToSection(draggedTaskId, sectionKey);
        }

        try {
            announceToScreenReader(`Task moved ${position} target task`);
        } catch {}
    };

    return (
        <motion.section
            layout
            role="region"
            aria-label={`${title} tasks`}
            onDragOver={handleContainerDragOver}
            onDragLeave={handleContainerDragLeave}
            onDrop={handleContainerDrop}
            className={`transition-all duration-300 rounded-3xl p-3 sm:p-4 -m-3 sm:-m-4 ${
                isDragOver
                    ? 'bg-amber-400/10 border-2 border-dashed border-amber-400/60 shadow-xl shadow-amber-500/10 scale-[1.01]'
                    : 'border-2 border-transparent'
            }`}
        >
            <div className="flex items-center justify-between gap-3 mb-4">
                <h2 className="flex items-center gap-2.5 text-lg sm:text-xl font-bold tracking-tight text-[var(--color-text-primary)]">
                    <span className="p-1.5 rounded-xl bg-[var(--color-bg-secondary)]/60 border border-white/5 shadow-sm text-[var(--color-accent)]">
                        {React.cloneElement(icon, { className: "w-5 h-5" })}
                    </span>
                    <span>{title}</span>
                    <span className="text-xs font-mono text-[var(--color-text-secondary)] font-normal ml-0.5 px-2 py-0.5 rounded-full bg-[var(--color-bg-secondary)]/50 border border-white/5">
                        {tasks.length}
                    </span>
                </h2>

                {energyTip && (
                    <span className="text-[11px] font-medium text-[var(--color-text-secondary)]/70 hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[var(--color-bg-secondary)]/40 border border-white/5">
                        <span>{energyTip}</span>
                    </span>
                )}
            </div>

            {/* Droppable Drop Zone Prompt if dragged over an empty section */}
            {isDragOver && tasks.length === 0 && (
                <div className="p-4 mb-3 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-center text-xs font-semibold text-amber-200 animate-pulse">
                    ✨ Release to flow into {title}
                </div>
            )}

            <div className="space-y-3">
                <AnimatePresence>
                    {tasks.map((task) => {
                        const dependency = task.dependsOn ? allTasks?.find(t => t.id === task.dependsOn) : null;
                        const isDependencyMet = !dependency || dependency.completed;
                        const isTargetingThis = dropTarget?.taskId === task.id;

                        return (
                            <motion.div
                                key={task.id}
                                layout
                                initial={{ opacity: 0, y: 12 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ type: 'spring', stiffness: 350, damping: 28 }}
                                onDragOver={(e) => handleTaskDragOver(e, task.id)}
                                onDragLeave={handleTaskDragLeave}
                                onDrop={(e) => handleTaskDrop(e, task.id)}
                                className="relative group/task-drop-slot"
                            >
                                {/* Luminous Insertion Line Indicator (Before) */}
                                {isTargetingThis && dropTarget.position === 'before' && (
                                    <div
                                        className="h-1.5 -mt-2 mb-1.5 rounded-full bg-gradient-to-r from-teal-400 via-emerald-300 to-amber-300 shadow-[0_0_12px_rgba(45,212,191,0.9)] animate-pulse pointer-events-none transition-all duration-150 z-30"
                                        aria-hidden="true"
                                    />
                                )}

                                <TaskBubble 
                                    task={task} 
                                    allCategories={allCategories}
                                    onToggle={toggleTask}
                                    onDelete={deleteTask}
                                    onFocus={onFocus}
                                    onToggleSubtask={onToggleSubtask}
                                    isDependencyMet={isDependencyMet}
                                    onOpenDetail={onOpenDetail}
                                    onTogglePin={onTogglePin}
                                    onArchive={onArchive}
                                    onMoveTaskToSection={onMoveTaskToSection}
                                    onReorderTaskWithinSection={onReorderTaskWithinSection}
                                />

                                {/* Luminous Insertion Line Indicator (After) */}
                                {isTargetingThis && dropTarget.position === 'after' && (
                                    <div
                                        className="h-1.5 mt-1.5 -mb-2 rounded-full bg-gradient-to-r from-teal-400 via-emerald-300 to-amber-300 shadow-[0_0_12px_rgba(45,212,191,0.9)] animate-pulse pointer-events-none transition-all duration-150 z-30"
                                        aria-hidden="true"
                                    />
                                )}
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {tasks.length === 0 && isCompletedSection && (
                    <p className="text-[var(--color-text-secondary)]/80 pl-4 py-2 text-xs italic">
                        No tasks completed yet today. Let your flow state unfold naturally.
                    </p>
                )}
            </div>
        </motion.section>
    );
};

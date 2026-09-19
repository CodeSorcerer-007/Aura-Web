import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { TaskBubble } from './TaskBubble';

const ReorderTaskWrapper = ({
    task,
    allCategories,
    toggleTask,
    deleteTask,
    onFocus,
    onToggleSubtask,
    isDependencyMet,
    onOpenDetail,
    onTogglePin,
    onArchive
}) => {
    const dragControls = useDragControls();

    return (
        <Reorder.Item
            value={task}
            id={task.id}
            dragListener={false}
            dragControls={dragControls}
            whileDrag={{ scale: 1.02, zIndex: 50, boxShadow: '0 15px 35px rgba(0,0,0,0.35)' }}
            className="relative select-none"
        >
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
                dragControls={dragControls}
            />
        </Reorder.Item>
    );
};

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
    onReorderTasks
}) => {
    const [isDragOver, setIsDragOver] = useState(false);

    if (tasks.length === 0 && !isCompletedSection && !isDragOver) return null;

    const handleDragOver = (e) => {
        if (isCompletedSection || !sectionKey) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setIsDragOver(true);
    };

    const handleDragLeave = (e) => {
        // Only trigger if leaving the section element
        if (!e.currentTarget.contains(e.relatedTarget)) {
            setIsDragOver(false);
        }
    };

    const handleDrop = (e) => {
        if (isCompletedSection || !sectionKey) return;
        e.preventDefault();
        setIsDragOver(false);
        const taskId = e.dataTransfer.getData('text/plain');
        if (taskId && onMoveTaskToSection) {
            onMoveTaskToSection(taskId, sectionKey);
        }
    };

    return (
        <motion.section
            layout
            role="region"
            aria-label={`${title} tasks`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
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
            {isDragOver && (
                <div className="p-4 mb-3 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-center text-xs font-semibold text-amber-200 animate-pulse">
                    ✨ Release to flow into {title}
                </div>
            )}

            <div className="space-y-3">
                {onReorderTasks && !isCompletedSection ? (
                    <Reorder.Group
                        axis="y"
                        values={tasks}
                        onReorder={onReorderTasks}
                        className="space-y-3"
                    >
                        {tasks.map((task) => {
                            const dependency = task.dependsOn ? allTasks.find(t => t.id === task.dependsOn) : null;
                            const isDependencyMet = !dependency || dependency.completed;
                            return (
                                <ReorderTaskWrapper
                                    key={task.id}
                                    task={task}
                                    allCategories={allCategories}
                                    toggleTask={toggleTask}
                                    deleteTask={deleteTask}
                                    onFocus={onFocus}
                                    onToggleSubtask={onToggleSubtask}
                                    isDependencyMet={isDependencyMet}
                                    onOpenDetail={onOpenDetail}
                                    onTogglePin={onTogglePin}
                                    onArchive={onArchive}
                                />
                            );
                        })}
                    </Reorder.Group>
                ) : (
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
                                    onToggleSubtask={onToggleSubtask}
                                    isDependencyMet={isDependencyMet}
                                    onOpenDetail={onOpenDetail}
                                    onTogglePin={onTogglePin}
                                    onArchive={onArchive}
                                />
                            );
                        })}
                    </AnimatePresence>
                )}
                {tasks.length === 0 && isCompletedSection && (
                    <p className="text-[var(--color-text-secondary)]/80 pl-4 py-2 text-xs italic">
                        No tasks completed yet today. Let your flow state unfold naturally.
                    </p>
                )}
            </div>
        </motion.section>
    );
};

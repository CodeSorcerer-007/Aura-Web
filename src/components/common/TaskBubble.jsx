import React, { useState, useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { defaultCategories } from '../../utils/constants';
import { formatDate, isOverdue } from '../../utils/dateUtils';
import { StardustBurst } from './StardustParticles';
import {
    CheckIcon,
    CalendarIcon,
    ClockIcon,
    PaperclipIcon,
    LinkIcon,
    PinIcon,
    ArchiveIcon,
    PlayIcon,
    XIcon
} from './Icons';
import { GripVertical } from 'lucide-react';

export const TaskBubble = ({
    task,
    onToggle,
    onDelete,
    onFocus,
    onToggleSubtask,
    allCategories,
    isDependencyMet,
    onOpenDetail,
    onTogglePin,
    onArchive,
    dragControls
}) => {
    const [isBursting, setIsBursting] = useState(false);

    const color = allCategories[task.category] || defaultCategories['General'];
    const completedSubtasks = task.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = task.subtasks?.length || 0;
    const progress = totalSubtasks > 0 ? completedSubtasks / totalSubtasks : 0;
    const isLocked = !isDependencyMet;

    // Swipe motion values
    const x = useMotionValue(0);
    const rightSwipeOpacity = useTransform(x, [10, 60], [0, 1]);
    const leftSwipeOpacity = useTransform(x, [-10, -60], [0, 1]);

    const glowStyle = useMemo(() => {
        if (task.completed) return {};
        const glowColor = color.glowColor || '#9ca3af';
        const blurAmount = Math.min(task.priority * 4, 16);
        const spreadAmount = Math.max(task.priority - 1, 0.5);
        return {
            boxShadow: `0 4px 20px -2px rgba(0,0,0,0.4), 0 0 ${blurAmount}px ${spreadAmount}px ${glowColor}40`
        };
    }, [task.completed, task.priority, color.glowColor]);

    const handleToggleClick = (e) => {
        if (e) e.stopPropagation();
        if (isLocked) return;

        if (!task.completed) {
            setIsBursting(true);
        }
        onToggle(task.id);
    };

    // Handle touch/swipe gestures on task card
    const handleSwipeEnd = (event, info) => {
        if (info.offset.x > 75 && !task.completed && !isLocked) {
            // Swiped right -> complete
            handleToggleClick();
        } else if (info.offset.x < -75) {
            // Swiped left -> archive or delete
            if (task.completed && onArchive) {
                onArchive(task.id);
            } else if (onDelete) {
                onDelete(task.id);
            }
        }
    };

    // Energy glyph configuration
    const energyConfig = {
        spark: { icon: '⚡', label: 'Spark', bg: 'bg-amber-400/15 text-amber-300 border-amber-400/30' },
        flow: { icon: '🌊', label: 'Flow', bg: 'bg-sky-400/15 text-sky-300 border-sky-400/30' },
        rest: { icon: '🍵', label: 'Rest', bg: 'bg-emerald-400/15 text-emerald-300 border-emerald-400/30' }
    };
    const activeEnergy = task.energy ? energyConfig[task.energy] : null;

    return (
        <div className="relative group/swipe-container overflow-visible">
            {/* Swipe Action Hints (Behind Card) */}
            <motion.div 
                style={{ opacity: rightSwipeOpacity }}
                className="absolute inset-y-0 left-3 flex items-center gap-1.5 text-teal-400 font-semibold text-xs pointer-events-none z-0"
            >
                <div className="w-7 h-7 rounded-full bg-teal-500/20 border border-teal-400/40 flex items-center justify-center">
                    <CheckIcon className="w-4 h-4 stroke-[3]" />
                </div>
                <span>Complete</span>
            </motion.div>
            <motion.div 
                style={{ opacity: leftSwipeOpacity }}
                className="absolute inset-y-0 right-3 flex items-center gap-1.5 text-rose-400 font-semibold text-xs pointer-events-none z-0"
            >
                <span>{task.completed ? 'Archive' : 'Remove'}</span>
                <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-400/40 flex items-center justify-center">
                    {task.completed ? <ArchiveIcon className="w-4 h-4" /> : <XIcon className="w-4 h-4" />}
                </div>
            </motion.div>

            <motion.article
                initial={{ opacity: 0, y: 15, scale: 0.97 }}
                animate={{
                    opacity: 1,
                    y: 0,
                    scale: 1
                }}
                exit={{ opacity: 0, x: -80, transition: { duration: 0.25 } }}
                transition={{ type: 'spring', stiffness: 220, damping: 24 }}
                style={{ ...glowStyle, x }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.35}
                onDragEnd={handleSwipeEnd}
                aria-label={`Task: ${task.text}`}
                className={`group relative p-4 sm:p-4.5 rounded-2xl border backdrop-blur-xl transition-colors duration-200 z-10 select-none ${color.bg} ${color.border} ${
                    task.completed ? 'opacity-60 brightness-90 saturate-50' : 'hover:border-white/20'
                } ${isLocked ? 'opacity-65' : ''} ${
                    task.isPinned ? 'border-amber-400/90 ring-1 ring-amber-400/30 shadow-md shadow-amber-500/10' : ''
                }`}
            >
                {/* Stardust Burst on Completion */}
                <StardustBurst active={isBursting} onComplete={() => setIsBursting(false)} />

                <div className="flex items-start gap-2.5">
                    {/* Drag Handle */}
                    <div
                        onPointerDown={(e) => {
                            e.stopPropagation();
                            dragControls?.start(e);
                        }}
                        style={{ touchAction: 'none' }}
                        className="flex items-center text-[var(--color-text-primary)]/30 hover:text-[var(--color-text-primary)] cursor-grab active:cursor-grabbing p-1.5 -m-1.5 rounded-lg hover:bg-white/10 transition-colors flex-shrink-0"
                        title="Drag to reorder"
                        aria-label="Reorder task"
                    >
                        <GripVertical className="w-4 h-4 pointer-events-none" />
                    </div>

                    {/* Completion Ring */}
                    <motion.button
                        type="button"
                        role="checkbox"
                        aria-checked={task.completed}
                        aria-label={task.completed ? `Mark ${task.text} incomplete` : `Mark ${task.text} complete`}
                        onClick={handleToggleClick}
                        className={`relative w-7 h-7 mt-0.5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-400 ${
                            task.completed
                                ? 'bg-gradient-to-tr from-teal-500 to-emerald-400 border-teal-400 shadow-[0_0_12px_rgba(45,212,191,0.5)]'
                                : 'border-[var(--color-text-primary)]/40 hover:border-teal-400 hover:bg-teal-400/10'
                        } ${isLocked ? 'cursor-not-allowed opacity-40' : ''}`}
                        whileTap={isLocked ? {} : { scale: 0.85 }}
                        title={task.completed ? 'Mark incomplete' : 'Complete task'}
                    >
                        {task.completed && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                <CheckIcon className="w-4 h-4 text-black stroke-[3]" />
                            </motion.div>
                        )}
                    </motion.button>

                    {/* Task Body */}
                    <div 
                        className="flex-grow cursor-pointer" 
                        onClick={() => onOpenDetail(task.id)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault();
                                onOpenDetail(task.id);
                            }
                        }}
                        tabIndex={0}
                        role="button"
                        aria-label={`Open details for ${task.text}`}
                    >
                        <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-sm sm:text-base leading-snug font-medium transition-all ${
                                task.completed ? 'line-through text-[var(--color-text-primary)]/50' : 'text-[var(--color-text-primary)]'
                            }`}>
                                {task.text}
                            </span>

                            {/* Energy Badge */}
                            {activeEnergy && (
                                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${activeEnergy.bg}`}>
                                    <span>{activeEnergy.icon}</span>
                                    <span>{activeEnergy.label}</span>
                                </span>
                            )}
                        </div>

                        {/* Tags */}
                        {task.tags && task.tags.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1.5 mt-2">
                                {task.tags.map(tag => (
                                    <span key={tag} className="text-[11px] bg-white/10 text-[var(--color-text-primary)]/80 px-2.5 py-0.5 rounded-full font-mono border border-white/5">
                                        @{tag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Metadata Indicators */}
                        <div className="flex items-center gap-3.5 mt-2 flex-wrap">
                            {task.deadline && (
                                <div className={`flex items-center gap-1 text-xs font-medium ${
                                    isOverdue(task.deadline) && !task.completed ? 'text-rose-400 font-semibold' : 'text-[var(--color-text-primary)]/60'
                                }`}>
                                    <CalendarIcon className="w-3.5 h-3.5" />
                                    <span>{formatDate(task.deadline)}{task.recurring && ` (${task.recurring.type})`}</span>
                                </div>
                            )}
                            {task.focusSessions > 0 && (
                                <div className="flex items-center gap-1 text-xs text-amber-300 font-mono">
                                    <ClockIcon className="w-3.5 h-3.5" />
                                    <span>{task.focusSessions} focus</span>
                                </div>
                            )}
                            {task.attachments && task.attachments.length > 0 && (
                                <div className="flex items-center gap-1 text-xs text-[var(--color-text-primary)]/60">
                                    <PaperclipIcon className="w-3.5 h-3.5" />
                                    <span>{task.attachments.length}</span>
                                </div>
                            )}
                            {task.dependsOn && (
                                <div className="flex items-center gap-1 text-xs text-amber-400 font-medium">
                                    <LinkIcon className="w-3 h-3"/>
                                    <span>Depends on task</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Category Badge & Action Buttons */}
                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                        <div className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border border-white/10 shadow-sm ${color.bg} ${color.text}`}>
                            {task.category}
                        </div>
                        <div className="flex items-center gap-1">
                            {!task.completed && (
                                <motion.button
                                    onClick={() => onTogglePin(task.id)}
                                    aria-label={task.isPinned ? 'Unpin task' : 'Pin task'}
                                    className={`p-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-amber-400 ${
                                        task.isPinned ? 'text-amber-400 bg-amber-400/10' : 'text-[var(--color-text-primary)]/30 hover:text-amber-400 hover:bg-white/5'
                                    }`}
                                    whileTap={{ scale: 0.9 }}
                                    title={task.isPinned ? 'Unpin Task' : 'Pin Task'}
                                >
                                    <PinIcon className="w-3.5 h-3.5" />
                                </motion.button>
                            )}
                            {task.completed && onArchive && (
                                <motion.button
                                    onClick={() => onArchive(task.id)}
                                    aria-label="Archive task"
                                    className="p-1.5 rounded-lg text-[var(--color-text-primary)]/30 hover:text-[var(--color-accent)] hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-[var(--color-accent)]"
                                    whileTap={{ scale: 0.9 }}
                                    title="Archive Task"
                                >
                                    <ArchiveIcon className="w-3.5 h-3.5" />
                                </motion.button>
                            )}
                            {!task.completed && (
                                <motion.button
                                    onClick={() => onFocus(task.id)}
                                    disabled={isLocked}
                                    aria-label="Focus on task"
                                    className="p-1.5 rounded-lg text-[var(--color-text-primary)]/30 hover:text-teal-400 hover:bg-white/5 transition-colors disabled:opacity-30 focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-400"
                                    whileTap={{ scale: 0.9 }}
                                    title="Enter Deep Flow Focus"
                                >
                                    <PlayIcon className="w-3.5 h-3.5" />
                                </motion.button>
                            )}
                            <motion.button
                                onClick={() => onDelete(task.id)}
                                aria-label="Delete task"
                                className="p-1.5 rounded-lg text-[var(--color-text-primary)]/30 hover:text-rose-400 hover:bg-white/5 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-rose-400"
                                whileTap={{ scale: 0.9 }}
                                title="Delete Task"
                            >
                                <XIcon className="w-3.5 h-3.5"/>
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Subtask Progress & Interactive Checklist */}
                {totalSubtasks > 0 && (
                    <div className="mt-3 pl-7" role="group" aria-label="Subtasks">
                        <div 
                            className="w-full bg-[var(--color-text-primary)]/10 rounded-full h-1.5 overflow-hidden mb-2"
                            role="progressbar"
                            aria-valuenow={Math.round(progress * 100)}
                            aria-valuemin="0"
                            aria-valuemax="100"
                            aria-label="Subtasks progress"
                        >
                            <motion.div
                                className="bg-gradient-to-r from-teal-400 to-emerald-400 h-1.5 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress * 100}%` }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                        <div className="space-y-1.5">
                            {task.subtasks.map((st, idx) => (
                                <button
                                    key={idx}
                                    type="button"
                                    role="checkbox"
                                    aria-checked={st.completed}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        if (onToggleSubtask) onToggleSubtask(task.id, st.text);
                                    }}
                                    className="flex items-center gap-2 text-xs text-[var(--color-text-primary)]/80 hover:text-[var(--color-text-primary)] text-left group/st w-full py-0.5 focus:outline-none focus-visible:ring-1 focus-visible:ring-teal-400 rounded"
                                >
                                    <span className={`w-3.5 h-3.5 rounded border flex items-center justify-center text-[9px] font-bold transition-all ${
                                        st.completed ? 'bg-teal-400 border-teal-400 text-black shadow-sm' : 'border-[var(--color-border)] group-hover/st:border-teal-400'
                                    }`}>
                                        {st.completed && '✓'}
                                    </span>
                                    <span className={st.completed ? 'line-through opacity-50' : ''}>{st.text}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </motion.article>
        </div>
    );
};

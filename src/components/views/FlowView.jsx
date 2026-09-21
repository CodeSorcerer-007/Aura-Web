import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { defaultCategories } from '../../utils/constants';
import { DayDatePanel } from '../common/DayDatePanel';
import { FilterBar } from '../common/FilterBar';
import { TimeSection } from '../common/TimeSection';
import {
    PinIcon,
    SunIcon,
    SunsetIcon,
    MoonIcon,
    CheckIcon,
    XIcon
} from '../common/Icons';

export const FlowView = ({
    tasks,
    toggleTask,
    deleteTask,
    onFocus,
    activeFilter,
    setActiveFilter,
    onToggleSubtask,
    allTasks,
    allCategories,
    onOpenDetail,
    onTogglePin,
    onArchive,
    monolithTaskId,
    setMonolithTaskId,
    tunnelVision,
    setTunnelVision,
    moveTaskToSection,
    onReorderSectionTasks,
    stats,
    // Fix 2: receive focusHistory as a prop instead of reading localStorage directly
    focusHistory = [],
    // allTags is computed once in App.jsx via useFilteredTasks and passed down,
    // so FlowView does not need its own useMemo for the same computation.
    allTags = [],
}) => {
    const nonArchivedTasks = tasks.filter(t => !t.isArchived);

    // Weekly Mini-Summary collapsed state — persisted via usePreferences for
    // consistency with the rest of the app's storage pattern.
    const [isWeeklySummaryOpen, setIsWeeklySummaryOpenRaw] = React.useState(() => {
        try {
            return localStorage.getItem('aura-weekly-summary-collapsed') !== 'true';
        } catch {
            return true;
        }
    });

    const setIsWeeklySummaryOpen = (next) => {
        setIsWeeklySummaryOpenRaw(next);
        try {
            // sessionStorage is intentional here: collapsed state is a per-session
            // preference, not a durable setting — it resets on next app open.
            localStorage.setItem('aura-weekly-summary-collapsed', (!next).toString());
        } catch {}
    };

    const toggleWeeklySummary = () => setIsWeeklySummaryOpen(!isWeeklySummaryOpen);

    const weeklyStats = useMemo(() => {
        const now = new Date();
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const tasksCompletedThisWeek = (allTasks || tasks).filter(t => {
            if (!t.completed || !t.completionDate) return false;
            const cDate = new Date(t.completionDate);
            return cDate >= startOfWeek;
        }).length;

        // Fix 2: use the React-managed focusHistory prop — no localStorage read needed
        const focusThisWeek = focusHistory.filter(
            item => item.timestamp && new Date(item.timestamp) >= startOfWeek
        ).length;

        const streak = stats?.streak || 0;

        return {
            completed: tasksCompletedThisWeek,
            streak,
            focusSessions: focusThisWeek
        };
    }, [allTasks, tasks, focusHistory, stats]);

    // Monolith Task
    const monolithTask = monolithTaskId ? nonArchivedTasks.find(t => t.id === monolithTaskId) : null;

    // Filter out monolith task from standard time queues so it sits exclusively on its sacred pedestal
    const pinnedTasks = nonArchivedTasks.filter(t => t.isPinned && !t.completed && t.id !== monolithTaskId);
    const uncompletedTasks = nonArchivedTasks.filter(t => !t.isPinned && !t.completed && t.id !== monolithTaskId);
    const morningTasks = uncompletedTasks.filter(t => t.timeOfDay === 'morning'); 
    const afternoonTasks = uncompletedTasks.filter(t => t.timeOfDay === 'afternoon'); 
    const eveningTasks = uncompletedTasks.filter(t => t.timeOfDay === 'evening'); 
    const completedTasks = nonArchivedTasks.filter(t => t.completed && t.id !== monolithTaskId);
    
    const categories = useMemo(() => [
        ...Object.keys(defaultCategories),
        ...Object.keys(allCategories).filter(c => !defaultCategories[c])
    ], [allCategories]);
    
    // allTags is now received as a prop from App.jsx (computed via useFilteredTasks).
    // The local useMemo has been removed to avoid computing the same value twice.

    const selectableTasksForMonolith = nonArchivedTasks.filter(t => !t.completed);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.5 }} 
            className="max-w-2xl mx-auto"
        >
            <DayDatePanel />

            {/* Weekly Mini-Summary Micro-Card */}
            <div className="mb-4">
                <div 
                    onClick={toggleWeeklySummary}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            toggleWeeklySummary();
                        }
                    }}
                    className="cursor-pointer group flex items-center justify-between p-2.5 sm:px-4 sm:py-2 rounded-2xl bg-[var(--color-bg-secondary)]/50 hover:bg-[var(--color-bg-secondary)]/80 border border-white/5 hover:border-amber-400/20 transition-all text-xs select-none"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isWeeklySummaryOpen}
                    aria-label="Toggle weekly summary"
                >
                    <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                        <span className="font-bold text-[var(--color-accent)] flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                            <span>📊</span> This Week
                        </span>
                        <div className="flex items-center gap-3 sm:gap-4 text-[var(--color-text-secondary)]">
                            <span className="flex items-center gap-1 font-medium">
                                <span className="text-emerald-400 font-bold">{weeklyStats.completed}</span> done
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                                <span className="text-amber-400 font-bold">{weeklyStats.streak}d</span> streak 🔥
                            </span>
                            <span className="flex items-center gap-1 font-medium">
                                <span className="text-sky-400 font-bold">{weeklyStats.focusSessions}</span> focus ⏱️
                            </span>
                        </div>
                    </div>
                    <span className="text-[var(--color-text-secondary)] group-hover:text-[var(--color-text-primary)] transition-transform duration-200">
                        {isWeeklySummaryOpen ? '▴' : '▾'}
                    </span>
                </div>

                {isWeeklySummaryOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-1.5 p-3 rounded-2xl bg-[var(--color-bg-secondary)]/30 border border-white/5 grid grid-cols-3 gap-2 text-center text-xs">
                            <div className="p-2 rounded-xl bg-[var(--color-bg)]/40">
                                <span className="text-[10px] text-[var(--color-text-secondary)] block">Tasks Finished</span>
                                <span className="text-base font-extrabold text-emerald-400">{weeklyStats.completed}</span>
                            </div>
                            <div className="p-2 rounded-xl bg-[var(--color-bg)]/40">
                                <span className="text-[10px] text-[var(--color-text-secondary)] block">Daily Momentum</span>
                                <span className="text-base font-extrabold text-amber-400">{weeklyStats.streak} Days</span>
                            </div>
                            <div className="p-2 rounded-xl bg-[var(--color-bg)]/40">
                                <span className="text-[10px] text-[var(--color-text-secondary)] block">Deep Work Flow</span>
                                <span className="text-base font-extrabold text-sky-400">{weeklyStats.focusSessions} Sessions</span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </div>

            <FilterBar 
                activeFilter={activeFilter} 
                setActiveFilter={setActiveFilter} 
                categories={categories} 
                allTags={allTags}
            />

            {/* The Daily Monolith Section */}
            <div className="mt-6">
                {monolithTask ? (
                    <motion.div
                        layout
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`relative overflow-hidden rounded-2xl border p-5 transition-all shadow-xl ${
                            monolithTask.completed
                                ? 'bg-gradient-to-r from-emerald-950/40 via-amber-950/30 to-emerald-950/40 border-emerald-500/50'
                                : 'bg-gradient-to-br from-amber-500/15 via-purple-500/10 to-indigo-500/15 border-amber-400/40 shadow-amber-500/10 ring-1 ring-amber-400/20'
                        }`}
                    >
                        <div className="flex items-center justify-between gap-2 mb-3">
                            <div className="flex items-center gap-2">
                                <span className="text-base">👑</span>
                                <span className="text-xs font-bold uppercase tracking-widest text-amber-300">Today's Monolith</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/30 font-semibold">
                                    Sacred MIT
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                {setTunnelVision && (
                                    <button
                                        onClick={() => setTunnelVision(!tunnelVision)}
                                        className={`text-xs px-2.5 py-1 rounded-full border transition-all flex items-center gap-1.5 font-medium ${
                                            tunnelVision
                                                ? 'bg-amber-400 text-black border-amber-300 shadow-md font-semibold'
                                                : 'bg-[var(--color-bg)]/80 text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
                                        }`}
                                        title="Tunnel Vision: Dim non-monolith sections for zero-distraction flow"
                                    >
                                        <span>{tunnelVision ? '🔦' : '👁️'}</span>
                                        <span className="hidden sm:inline">Tunnel Vision</span>
                                        <span className="text-[10px]">{tunnelVision ? 'ON' : 'OFF'}</span>
                                    </button>
                                )}
                                {setMonolithTaskId && (
                                    <button
                                        onClick={() => setMonolithTaskId(null)}
                                        className="text-[var(--color-text-secondary)] hover:text-rose-400 p-1 rounded transition-colors"
                                        title="Clear or choose another Monolith"
                                    >
                                        <XIcon className="w-3.5 h-3.5" />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-start gap-3 flex-grow">
                                <button
                                    onClick={() => toggleTask(monolithTask.id, true)}
                                    className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${
                                        monolithTask.completed
                                            ? 'bg-emerald-500 border-emerald-400 text-black'
                                            : 'border-amber-400/70 hover:border-amber-300 hover:bg-amber-400/20'
                                    }`}
                                >
                                    {monolithTask.completed && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                                </button>
                                <div>
                                    <p className={`text-lg font-bold transition-all ${
                                        monolithTask.completed
                                            ? 'line-through text-emerald-300/80'
                                            : 'text-[var(--color-text-primary)]'
                                    }`}>
                                        {monolithTask.text}
                                    </p>
                                    {monolithTask.completed ? (
                                        <p className="text-xs text-amber-300 mt-1 flex items-center gap-1 font-medium">
                                            ✨ Monolith Conquered! Sacred goal fulfilled for today.
                                        </p>
                                    ) : (
                                        <p className="text-xs text-[var(--color-text-secondary)] mt-1">
                                            Master this before turning to smaller tasks.
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center gap-2 flex-shrink-0">
                                {!monolithTask.completed && onFocus && (
                                    <button
                                        onClick={() => onFocus(monolithTask.id)}
                                        className="bg-amber-400 hover:bg-amber-300 text-black font-semibold text-xs px-3 py-1.5 rounded-lg shadow transition-colors flex items-center gap-1"
                                    >
                                        <span>🎯</span> Focus
                                    </button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                ) : (
                    <div className="p-3 bg-[var(--color-bg-secondary)]/50 rounded-xl border border-dashed border-[var(--color-border)] flex items-center justify-between gap-3 text-xs text-[var(--color-text-secondary)]">
                        <div className="flex items-center gap-2">
                            <span className="text-amber-400 text-sm">👑</span>
                            <span>Designate your Daily Monolith (Single Sacred Goal):</span>
                        </div>
                        {selectableTasksForMonolith.length > 0 && setMonolithTaskId ? (
                            <select
                                onChange={(e) => {
                                    if (e.target.value) setMonolithTaskId(e.target.value);
                                }}
                                defaultValue=""
                                className="bg-[var(--color-bg)] text-[var(--color-text-primary)] px-2.5 py-1 rounded-lg border border-[var(--color-border)] text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-amber-400"
                            >
                                <option value="" disabled>Choose MIT...</option>
                                {selectableTasksForMonolith.map(t => (
                                    <option key={t.id} value={t.id}>{t.text.slice(0, 35)}</option>
                                ))}
                            </select>
                        ) : (
                            <span className="italic text-[11px]">Capture a task below to select it</span>
                        )}
                    </div>
                )}
            </div>

            {/* Task Queues with Tunnel Vision Effect */}
            <div className={`space-y-12 mt-8 transition-all duration-500 ${
                tunnelVision ? 'opacity-25 blur-[1.5px] grayscale-[30%] hover:opacity-100 hover:blur-0 hover:grayscale-0' : ''
            }`}>
                {pinnedTasks.length > 0 && (
                    <TimeSection 
                        title="Pinned" 
                        icon={<PinIcon />} 
                        tasks={pinnedTasks} 
                        onMoveTaskToSection={moveTaskToSection}
                        onReorderTasks={onReorderSectionTasks}
                        {...{ toggleTask, deleteTask, onFocus, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }} 
                    />
                )}
                <TimeSection 
                    title="Morning" 
                    icon={<SunIcon />} 
                    sectionKey="morning"
                    energyTip="⚡ Deep Spark Focus"
                    tasks={morningTasks} 
                    onMoveTaskToSection={moveTaskToSection}
                    onReorderTasks={onReorderSectionTasks}
                    {...{ toggleTask, deleteTask, onFocus, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }} 
                />
                <TimeSection 
                    title="Afternoon" 
                    icon={<SunsetIcon />} 
                    sectionKey="afternoon"
                    energyTip="🌊 Steady Rhythm Flow"
                    tasks={afternoonTasks} 
                    onMoveTaskToSection={moveTaskToSection}
                    onReorderTasks={onReorderSectionTasks}
                    {...{ toggleTask, deleteTask, onFocus, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }} 
                />
                <TimeSection 
                    title="Evening" 
                    icon={<MoonIcon />} 
                    sectionKey="evening"
                    energyTip="🍵 Gentle Wind-down"
                    tasks={eveningTasks} 
                    onMoveTaskToSection={moveTaskToSection}
                    onReorderTasks={onReorderSectionTasks}
                    {...{ toggleTask, deleteTask, onFocus, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }} 
                />
                {completedTasks.length > 0 && (
                    <TimeSection 
                        title="Completed" 
                        icon={<CheckIcon />} 
                        tasks={completedTasks} 
                        {...{ toggleTask, deleteTask, onFocus, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }} 
                        isCompletedSection 
                    />
                )}

                {/* Sanctuary Empty State when all queues are clear */}
                {uncompletedTasks.length === 0 && pinnedTasks.length === 0 && !monolithTask && completedTasks.length === 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                        className="text-center py-16 px-6 aura-glass rounded-3xl border border-white/10 my-6 shadow-2xl"
                    >
                        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-tr from-amber-400/20 via-teal-400/15 to-emerald-400/20 border border-white/10 flex items-center justify-center text-3xl shadow-inner aura-glow">
                            ✨
                        </div>
                        <h3 className="text-xl font-bold tracking-tight text-[var(--color-text-primary)] mb-2 font-display">
                            Sanctuary of Clarity
                        </h3>
                        <p className="text-sm text-[var(--color-text-secondary)] max-w-sm mx-auto leading-relaxed">
                            Your mind is unburdened and today's path is wide open. Capture an intention below to gently begin your flow.
                        </p>
                    </motion.div>
                )}
            </div>
        </motion.div>
    );
};

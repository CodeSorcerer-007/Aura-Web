import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultCategories } from '../../utils/constants';
import { BookmarkIcon } from '../common/Icons';
import { playHarmonicUiSound } from '../../hooks/useSoundEffects';
import { ZoomIn, ZoomOut, RotateCcw, Link as LinkIcon } from 'lucide-react';

export const ConstellationsView = ({ tasks, toggleTask, onSaveTemplate, templates, allCategories }) => {
    const [hoveredTask, setHoveredTask] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [zoomLevel, setZoomLevel] = useState(1);

    const nonArchivedTasks = tasks.filter(t => !t.isArchived);

    const projects = useMemo(() => {
        const grouped = nonArchivedTasks.reduce((acc, task) => {
            const cat = task.category || 'General';
            (acc[cat] = acc[cat] || []).push(task);
            return acc;
        }, {});
        return Object.entries(grouped);
    }, [nonArchivedTasks]);

    const activeProjects = useMemo(() => {
        if (selectedCategory === 'all') return projects;
        return projects.filter(([category]) => category === selectedCategory);
    }, [projects, selectedCategory]);

    const handleTaskClick = (taskId) => {
        playHarmonicUiSound('complete');
        toggleTask(taskId);
    };

    const handleZoomIn = () => setZoomLevel(z => Math.min(1.5, Math.round((z + 0.15) * 100) / 100));
    const handleZoomOut = () => setZoomLevel(z => Math.max(0.65, Math.round((z - 0.15) * 100) / 100));
    const handleResetZoom = () => setZoomLevel(1);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-6xl mx-auto select-none relative"
        >
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-center gap-2 mb-1">
                    <span className="text-3xl animate-pulse">🌌</span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] font-display">
                        Cosmic Constellations
                    </h2>
                </div>
                <p className="text-[var(--color-text-secondary)] text-xs sm:text-sm max-w-md mx-auto">
                    A celestial topology where projects form gravitational hubs and tasks orbit as luminous stellar bodies.
                </p>

                {/* Filter & Galaxy Focus Chips */}
                {projects.length > 1 && (
                    <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4">
                        <button
                            onClick={() => setSelectedCategory('all')}
                            aria-pressed={selectedCategory === 'all'}
                            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                                selectedCategory === 'all'
                                    ? 'bg-[var(--color-accent)] text-black border-transparent shadow-[0_0_12px_rgba(52,211,153,0.4)] scale-105'
                                    : 'bg-[var(--color-bg-secondary)]/70 text-[var(--color-text-secondary)] border-white/5 hover:border-white/20 hover:text-[var(--color-text-primary)]'
                            }`}
                        >
                            All Galaxies ({projects.length})
                        </button>
                        {projects.map(([cat, cTasks]) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                aria-pressed={selectedCategory === cat}
                                className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                                    selectedCategory === cat
                                        ? 'bg-[var(--color-accent)] text-black border-transparent shadow-[0_0_12px_rgba(52,211,153,0.4)] font-bold scale-105'
                                        : 'bg-[var(--color-bg-secondary)]/70 text-[var(--color-text-secondary)] border-white/5 hover:border-white/20 hover:text-[var(--color-text-primary)]'
                                }`}
                            >
                                {cat} ({cTasks.length})
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Floating Zoom Controls Bar */}
            <div className="flex items-center justify-center gap-2 mb-4">
                <div className="aura-glass-floating px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    <button
                        onClick={handleZoomOut}
                        disabled={zoomLevel <= 0.65}
                        aria-label="Zoom out constellation map"
                        className="p-1.5 rounded-full text-[var(--color-text-secondary)] hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                        <ZoomOut className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-[11px] font-mono px-2 text-[var(--color-text-secondary)] font-semibold">
                        {Math.round(zoomLevel * 100)}%
                    </span>
                    <button
                        onClick={handleZoomIn}
                        disabled={zoomLevel >= 1.5}
                        aria-label="Zoom in constellation map"
                        className="p-1.5 rounded-full text-[var(--color-text-secondary)] hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                    >
                        <ZoomIn className="w-3.5 h-3.5" />
                    </button>
                    {zoomLevel !== 1 && (
                        <button
                            onClick={handleResetZoom}
                            aria-label="Reset zoom level"
                            className="p-1.5 rounded-full text-amber-400 hover:bg-white/10 transition-all ml-1"
                            title="Reset zoom"
                        >
                            <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>
            </div>

            {/* Cosmos Starfield Canvas with Zoom Transition */}
            <motion.div 
                style={{ scale: zoomLevel, transformOrigin: 'top center' }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="flex flex-wrap justify-center gap-x-12 gap-y-24 items-center py-6 min-h-[440px]"
            >
                {activeProjects.map(([category, cTasks], index) => {
                    const isTemplated = templates.some(t => t.name === category);
                    const color = allCategories[category] || defaultCategories['General'];
                    const categoryHue = color.glowColor || '#38bdf8';

                    const centerX = 140;
                    const centerY = 140;

                    // Build coordinate map for dependency line linking
                    const taskCoordinates = new Map();
                    cTasks.forEach((task, taskIndex) => {
                        const total = Math.max(1, cTasks.length);
                        const angle = (taskIndex / total) * 2 * Math.PI;
                        const orbitDist = task.priority === 3 ? 85 : task.priority === 2 ? 104 : 122;
                        taskCoordinates.set(task.id, {
                            x: centerX + Math.cos(angle) * orbitDist,
                            y: centerY + Math.sin(angle) * orbitDist,
                            task
                        });
                    });

                    return (
                        <motion.div
                            key={category}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: index * 0.08 }}
                            className="relative w-72 h-72 flex items-center justify-center"
                        >
                            {/* Template Bookmark Pill */}
                            <button
                                onClick={() => !isTemplated && onSaveTemplate(category, cTasks)}
                                disabled={isTemplated}
                                className="absolute -top-8 z-20 text-[11px] aura-glass-subtle text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1 rounded-full border border-white/10 hover:border-[var(--color-accent)] flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
                                title={isTemplated ? 'Constellation already saved as template' : 'Save as repeatable constellation template'}
                            >
                                <BookmarkIcon className="w-3 h-3" />
                                <span>{isTemplated ? 'Archived Template' : 'Save Template'}</span>
                            </button>

                            {/* Nebula Glow & Cosmic Rings */}
                            <div
                                className="absolute inset-0 rounded-full pointer-events-none opacity-25 blur-3xl transition-opacity"
                                style={{ backgroundColor: categoryHue }}
                            />

                            {/* SVG Gravitational Orbit Rings & Dependency Filaments */}
                            <svg className="absolute w-full h-full overflow-visible pointer-events-none" viewBox="0 0 280 280">
                                {/* Orbit rings */}
                                <circle
                                    cx={centerX}
                                    cy={centerY}
                                    r="85"
                                    fill="none"
                                    stroke="rgba(255, 255, 255, 0.08)"
                                    strokeWidth="1"
                                    strokeDasharray="3 6"
                                />
                                <circle
                                    cx={centerX}
                                    cy={centerY}
                                    r="118"
                                    fill="none"
                                    stroke="rgba(255, 255, 255, 0.05)"
                                    strokeWidth="1"
                                />

                                {/* Gravitational Core Rays */}
                                {cTasks.map((task) => {
                                    const coords = taskCoordinates.get(task.id);
                                    if (!coords) return null;

                                    return (
                                        <g key={`core-line-${task.id}`}>
                                            <motion.line
                                                x1={centerX}
                                                y1={centerY}
                                                x2={coords.x}
                                                y2={coords.y}
                                                stroke={task.completed ? 'rgba(45, 212, 191, 0.35)' : 'rgba(255, 255, 255, 0.2)'}
                                                strokeWidth={task.priority === 3 ? '1.5' : '1'}
                                                strokeDasharray={task.completed ? '2 4' : 'none'}
                                                initial={{ pathLength: 0 }}
                                                animate={{ pathLength: 1 }}
                                                transition={{ duration: 0.8 }}
                                            />
                                        </g>
                                    );
                                })}

                                {/* Inter-Task Dependency Filaments */}
                                {cTasks.map((task) => {
                                    if (!task.dependsOn) return null;
                                    const sourceCoords = taskCoordinates.get(task.id);
                                    const targetCoords = taskCoordinates.get(task.dependsOn);
                                    if (!sourceCoords || !targetCoords) return null;

                                    return (
                                        <motion.line
                                            key={`dep-${task.id}-${task.dependsOn}`}
                                            x1={sourceCoords.x}
                                            y1={sourceCoords.y}
                                            x2={targetCoords.x}
                                            y2={targetCoords.y}
                                            stroke="#f59e0b"
                                            strokeWidth="1.5"
                                            strokeDasharray="3 3"
                                            style={{ filter: 'drop-shadow(0 0 4px #f59e0b)' }}
                                            initial={{ pathLength: 0 }}
                                            animate={{ pathLength: 1 }}
                                            transition={{ duration: 1 }}
                                        />
                                    );
                                })}
                            </svg>

                            {/* Central Celestial Core / Category Star */}
                            <motion.div
                                className={`relative rounded-full w-24 h-24 flex flex-col items-center justify-center text-center p-2 shadow-2xl z-10 cursor-pointer ${color.solid || 'bg-gradient-to-tr from-sky-600 to-indigo-600'} border border-white/20`}
                                whileHover={{ scale: 1.08 }}
                                transition={{ type: 'spring', stiffness: 220 }}
                            >
                                <div
                                    className="absolute inset-0 rounded-full blur-md opacity-60 pointer-events-none"
                                    style={{
                                        backgroundColor: categoryHue,
                                        animation: 'cosmos-glow 3.5s ease-in-out infinite'
                                    }}
                                />
                                <span className="font-bold text-sm tracking-tight relative z-10 text-white drop-shadow">
                                    {category}
                                </span>
                                <span className="text-[10px] text-white/90 font-mono relative z-10 font-medium">
                                    {cTasks.filter(t => t.completed).length}/{cTasks.length} stars
                                </span>
                            </motion.div>

                            {/* Orbiting Task Stars */}
                            {cTasks.map((task, taskIndex) => {
                                const coords = taskCoordinates.get(task.id);
                                if (!coords) return null;
                                const x = coords.x - centerX;
                                const y = coords.y - centerY;

                                const starSize = task.priority === 3 ? 'w-5 h-5' : task.priority === 2 ? 'w-4 h-4' : 'w-3.5 h-3.5';
                                const starGlow = task.completed
                                    ? '0 0 10px rgba(45, 212, 191, 0.9)'
                                    : task.priority === 3
                                    ? '0 0 14px rgba(251, 191, 36, 0.95)'
                                    : '0 0 8px rgba(255, 255, 255, 0.7)';

                                return (
                                    <motion.div
                                        key={task.id}
                                        className="absolute z-20 cursor-pointer"
                                        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }}
                                        animate={{ x, y, opacity: 1, scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 120, damping: 15, delay: index * 0.04 + taskIndex * 0.02 }}
                                        style={{ top: '50%', left: '50%', marginTop: '-10px', marginLeft: '-10px' }}
                                        onMouseEnter={() => setHoveredTask(task.id)}
                                        onMouseLeave={() => setHoveredTask(null)}
                                        onClick={() => handleTaskClick(task.id)}
                                    >
                                        <motion.div
                                            className={`rounded-full flex items-center justify-center ${starSize} transition-all ${
                                                task.completed
                                                    ? 'bg-teal-400 border border-teal-200'
                                                    : task.priority === 3
                                                    ? 'bg-amber-300 border-2 border-white'
                                                    : 'bg-white border border-white/80'
                                            }`}
                                            style={{ boxShadow: starGlow }}
                                            whileHover={{ scale: 1.4 }}
                                            animate={{
                                                scale: task.priority === 3 && !task.completed ? [1, 1.25, 1] : [1, 1.1, 1]
                                            }}
                                            transition={{
                                                duration: task.priority === 3 ? 2 : 3,
                                                repeat: Infinity,
                                                ease: 'easeInOut',
                                                delay: taskIndex * 0.2
                                            }}
                                        >
                                            {task.completed && (
                                                <span className="text-[9px] text-black font-bold">✓</span>
                                            )}
                                        </motion.div>

                                        {/* Celestial Glass Preview Card on Hover */}
                                        <AnimatePresence>
                                            {hoveredTask === task.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 8, scale: 0.92 }}
                                                    animate={{ opacity: 1, y: -16, scale: 1 }}
                                                    exit={{ opacity: 0, y: 8, scale: 0.92 }}
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 p-3.5 aura-glass rounded-2xl text-left border border-white/15 shadow-2xl pointer-events-auto min-w-[200px] max-w-xs z-30 ring-1 ring-white/10"
                                                >
                                                    <p className={`text-xs font-bold leading-snug ${task.completed ? 'line-through text-[var(--color-text-secondary)]' : 'text-[var(--color-text-primary)]'}`}>
                                                        {task.text}
                                                    </p>
                                                    <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                                                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-[var(--color-text-secondary)] font-mono">
                                                            {task.timeOfDay}
                                                        </span>
                                                        {task.energy && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-semibold">
                                                                {task.energy === 'spark' ? '⚡ Spark' : task.energy === 'rest' ? '🍵 Rest' : '🌊 Flow'}
                                                            </span>
                                                        )}
                                                        {task.dependsOn && (
                                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-semibold flex items-center gap-1">
                                                                <LinkIcon className="w-2.5 h-2.5" />
                                                                <span>Linked</span>
                                                            </span>
                                                        )}
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${task.priority === 3 ? 'bg-rose-500/20 text-rose-300' : 'bg-white/10 text-white/70'}`}>
                                                            P{task.priority}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-teal-300 mt-2.5 italic flex items-center gap-1 font-medium">
                                                        <span>✦</span>
                                                        <span>{task.completed ? 'Click star to reactivate' : 'Click star to harvest victory'}</span>
                                                    </p>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </motion.div>
                    );
                })}

                {activeProjects.length === 0 && (
                    <div className="py-16 text-center">
                        <p className="text-base text-[var(--color-text-secondary)]">No celestial constellations yet in this galaxy.</p>
                        <p className="text-xs text-[var(--color-text-secondary)]/70 mt-1">Capture tasks with #Categories to ignite projects.</p>
                    </div>
                )}
            </motion.div>
        </motion.div>
    );
};

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultCategories } from '../../utils/constants';
import { BookmarkIcon } from '../common/Icons';
import { Link as LinkIcon } from 'lucide-react';
import { EmptyState } from '../common/EmptyState';

export const OrbitVisualization = ({
    zoomLevel = 1,
    activeProjects = [],
    templates = [],
    allCategories = {},
    onSaveTemplate,
    onTaskClick
}) => {
    const [hoveredTask, setHoveredTask] = useState(null);

    return (
        <motion.div 
            style={{ scale: zoomLevel, transformOrigin: 'top center' }}
            transition={{ type: 'spring', stiffness: 200, damping: 25 }}
            className="flex flex-wrap justify-center gap-x-12 gap-y-24 items-center py-6 min-h-[440px]"
        >
            {activeProjects.map(([category, cTasks], index) => {
                const isTemplated = templates.some(t => t.name === category);
                const color = allCategories[category] || defaultCategories['General'] || {};
                const categoryHue = color.glowColor || '#38bdf8';

                const centerX = 140;
                const centerY = 140;

                // Multi-Ring Gravitational Shell Calculation
                const taskCoordinates = new Map();
                const p3Tasks = cTasks.filter(t => t.priority === 3);
                const p2Tasks = cTasks.filter(t => t.priority === 2);
                const p1Tasks = cTasks.filter(t => t.priority !== 3 && t.priority !== 2);

                // Inner Stellar Ring (Priority 3 - Monolith / High Impact)
                p3Tasks.forEach((task, idx) => {
                    const angle = (idx / Math.max(1, p3Tasks.length)) * 2 * Math.PI - Math.PI / 2;
                    taskCoordinates.set(task.id, {
                        x: centerX + Math.cos(angle) * 72,
                        y: centerY + Math.sin(angle) * 72,
                        task,
                        ring: 1
                    });
                });

                // Middle Orbital Shell (Priority 2 - Standard Flow)
                p2Tasks.forEach((task, idx) => {
                    const angle = (idx / Math.max(1, p2Tasks.length)) * 2 * Math.PI - Math.PI / 2 + Math.PI / 4;
                    taskCoordinates.set(task.id, {
                        x: centerX + Math.cos(angle) * 100,
                        y: centerY + Math.sin(angle) * 100,
                        task,
                        ring: 2
                    });
                });

                // Outer Kuiper Ring (Priority 1 / Routine Backlog)
                p1Tasks.forEach((task, idx) => {
                    const angle = (idx / Math.max(1, p1Tasks.length)) * 2 * Math.PI - Math.PI / 2 + Math.PI / 6;
                    taskCoordinates.set(task.id, {
                        x: centerX + Math.cos(angle) * 128,
                        y: centerY + Math.sin(angle) * 128,
                        task,
                        ring: 3
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
                        {onSaveTemplate && (
                            <button
                                onClick={() => !isTemplated && onSaveTemplate(category, cTasks)}
                                disabled={isTemplated}
                                className="absolute -top-8 z-20 text-[11px] aura-glass-subtle text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] px-3 py-1 rounded-full border border-white/10 hover:border-[var(--color-accent)] flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md"
                                title={isTemplated ? 'Constellation already saved as template' : 'Save as repeatable constellation template'}
                                aria-label={isTemplated ? 'Constellation template saved' : 'Save constellation template'}
                            >
                                <BookmarkIcon className="w-3 h-3" />
                                <span>{isTemplated ? 'Archived Template' : 'Save Template'}</span>
                            </button>
                        )}

                        {/* Nebula Glow & Cosmic Rings */}
                        <div
                            className="absolute inset-0 rounded-full pointer-events-none opacity-25 blur-3xl transition-opacity"
                            style={{ backgroundColor: categoryHue }}
                            aria-hidden="true"
                        />

                        {/* SVG Gravitational Orbit Rings & Dependency Filaments */}
                        <svg className="absolute w-full h-full overflow-visible pointer-events-none" viewBox="0 0 280 280" aria-hidden="true">
                            {/* 3 Concentric Priority Orbit Rings */}
                            <circle
                                cx={centerX}
                                cy={centerY}
                                r="72"
                                fill="none"
                                stroke="rgba(251, 191, 36, 0.22)"
                                strokeWidth="1"
                                strokeDasharray="3 5"
                            />
                            <circle
                                cx={centerX}
                                cy={centerY}
                                r="100"
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.12)"
                                strokeWidth="1"
                                strokeDasharray="4 6"
                            />
                            <circle
                                cx={centerX}
                                cy={centerY}
                                r="128"
                                fill="none"
                                stroke="rgba(255, 255, 255, 0.06)"
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
                                    onClick={() => onTaskClick(task.id)}
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
                <EmptyState
                    icon="🌌"
                    title="No constellations in this galaxy"
                    description="Capture intentions with #Category hashtags to ignite gravitational project clusters."
                    shortcutHint="Type #ProjectName in mindful capture"
                />
            )}
        </motion.div>
    );
};

export default OrbitVisualization;

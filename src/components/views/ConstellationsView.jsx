import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultCategories } from '../../utils/constants';
import { BookmarkIcon } from '../common/Icons';

export const ConstellationsView = ({ tasks, toggleTask, onSaveTemplate, templates, allCategories }) => {
    const [hoveredTask, setHoveredTask] = useState(null);
    const nonArchivedTasks = tasks.filter(t => !t.isArchived);
    
    const projects = useMemo(() => { 
        const grouped = nonArchivedTasks.reduce((acc, task) => { 
            (acc[task.category] = acc[task.category] || []).push(task); 
            return acc; 
        }, {}); 
        return Object.entries(grouped); 
    }, [nonArchivedTasks]);

    return (
        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }} 
            exit={{ opacity: 0, scale: 0.9 }} 
            transition={{ duration: 0.5 }} 
            className="text-center max-w-5xl mx-auto"
        >
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Your Constellations</h2>
            <p className="text-[var(--color-text-secondary)] mb-16">An overview of your projects and goals.</p>
            <div className="flex flex-wrap justify-center gap-x-16 gap-y-24 items-center">
                {projects.map(([category, cTasks], index) => { 
                    const isTemplated = templates.some(t => t.name === category); 
                    const centerX = 128; 
                    const centerY = 128; 
                    const color = allCategories[category] || defaultCategories['General']; 

                    return (
                        <div key={category} className="relative w-64 h-64 flex items-center justify-center">
                            <button 
                                onClick={() => !isTemplated && onSaveTemplate(category, cTasks)} 
                                disabled={isTemplated} 
                                className="absolute -top-10 text-xs bg-[var(--color-bg-secondary)] backdrop-blur-sm text-[var(--color-text-secondary)] px-3 py-1 rounded-full border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary-hover)] flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors" 
                                title={isTemplated ? "Template already saved" : "Save as Template"}
                            >
                                <BookmarkIcon className="w-3 h-3" />
                                {isTemplated ? 'Saved' : 'Save Template'}
                            </button>
                            <svg className="absolute w-full h-full overflow-visible" viewBox="0 0 256 256">
                                {cTasks.map((task, taskIndex) => { 
                                    const angle = (taskIndex / cTasks.length) * 2 * Math.PI; 
                                    const radius = 110 + (taskIndex % 3) * 12; 
                                    const x = centerX + Math.cos(angle) * radius; 
                                    const y = centerY + Math.sin(angle) * radius; 
                                    return (
                                        <motion.line 
                                            key={`line-${task.id}`} 
                                            x1={centerX} 
                                            y1={centerY} 
                                            x2={x} 
                                            y2={y} 
                                            stroke="rgba(255, 255, 255, 0.15)" 
                                            strokeWidth="1" 
                                            initial={{ pathLength: 0 }} 
                                            animate={{ pathLength: 1 }} 
                                            transition={{ duration: 1, delay: index * 0.1 + taskIndex * 0.05 }} 
                                        />
                                    ); 
                                })}
                            </svg>
                            <motion.div 
                                className={`relative rounded-full w-24 h-24 flex items-center justify-center text-center p-2 shadow-2xl shadow-black/30 ${color.solid}`} 
                                initial={{ scale: 0 }} 
                                animate={{ scale: 1 }} 
                                transition={{ delay: index * 0.1 }} 
                            >
                                <motion.div 
                                    className={`absolute inset-0 rounded-full ${color.solid} opacity-50 blur-lg`} 
                                    animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.7, 0.5] }} 
                                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }} 
                                />
                                <span className="font-bold text-lg relative z-10 text-white">{category}</span>
                            </motion.div>
                            {cTasks.map((task, taskIndex) => { 
                                const angle = (taskIndex / cTasks.length) * 2 * Math.PI; 
                                const radius = 110 + (taskIndex % 3) * 12; 
                                const x = Math.cos(angle) * radius; 
                                const y = Math.sin(angle) * radius; 
                                const prioritySize = { 1: 'w-3 h-3', 2: 'w-4 h-4', 3: 'w-5 h-5' }[task.priority] || 'w-4 h-4'; 

                                return (
                                    <motion.div 
                                        key={task.id} 
                                        className="absolute" 
                                        initial={{ x: 0, y: 0, opacity: 0, scale: 0 }} 
                                        animate={{ x, y, opacity: 1, scale: 1 }} 
                                        transition={{ type: 'spring', stiffness: 100, delay: index * 0.1 + taskIndex * 0.05 }} 
                                        style={{ top: '50%', left: '50%', marginTop: '-10px', marginLeft: '-10px' }} 
                                        onMouseEnter={() => setHoveredTask(task.id)} 
                                        onMouseLeave={() => setHoveredTask(null)}
                                    >
                                        <motion.div 
                                            onClick={() => toggleTask(task.id)} 
                                            className={`rounded-full cursor-pointer ${task.completed ? 'bg-teal-400' : 'bg-white/80'} shadow-lg transition-colors ${prioritySize}`} 
                                            animate={{ scale: [1, 1.2, 1] }} 
                                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: taskIndex * 0.3 }} 
                                        />
                                        <AnimatePresence>
                                            {hoveredTask === task.id && (
                                                <motion.div 
                                                    initial={{ opacity: 0, y: 10, scale: 0.9 }} 
                                                    animate={{ opacity: 1, y: -20, scale: 1 }} 
                                                    exit={{ opacity: 0, y: 10, scale: 0.9 }} 
                                                    className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 p-2 bg-[var(--color-bg-secondary)] backdrop-blur-sm text-xs text-[var(--color-text-primary)] rounded-md shadow-lg pointer-events-none whitespace-nowrap z-20"
                                                >
                                                    {task.text}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </motion.div>
                                );
                            })}
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );
};

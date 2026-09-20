import React from 'react';
import { motion } from 'framer-motion';
import { Tree } from './TreeRenderer';
import { EmptyState } from '../common/EmptyState';

export const GroveGrid = ({ grove = [], isRaining = false, season = 'summer', seasonGradients = {} }) => {
    const currentGradient = seasonGradients[season] || 'from-emerald-500/10 via-teal-500/10 to-sky-500/15';

    return (
        <div className={`relative overflow-hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12 min-h-[220px] p-6 rounded-3xl bg-gradient-to-br ${currentGradient} border border-[var(--color-border)] shadow-xl backdrop-blur-md`}>
            {/* Weather Rainfall and Droplet Ripples */}
            {isRaining && (
                <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden" aria-hidden="true">
                    {[...Array(35)].map((_, i) => (
                        <React.Fragment key={i}>
                            <div
                                className="absolute w-[1.5px] h-8 bg-sky-200/60 rounded-full"
                                style={{
                                    left: `${(i * 3.1) % 100}%`,
                                    animation: 'rain-fall 1.0s linear infinite',
                                    animationDelay: `${((i * 0.13) % 1.4).toFixed(2)}s`
                                }}
                            />
                            {i % 4 === 0 && (
                                <div
                                    className="absolute w-4 h-1.5 border border-sky-300/40 rounded-full"
                                    style={{
                                        left: `${(i * 3.1) % 100}%`,
                                        bottom: `${10 + (i % 5) * 6}%`,
                                        animation: 'rain-ripple 1.2s ease-out infinite',
                                        animationDelay: `${((i * 0.21) % 1.4).toFixed(2)}s`
                                    }}
                                />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            )}

            {grove.map((tree, idx) => {
                const progress = tree.growthPoints / tree.maxGrowth;
                return (
                    <motion.div
                        key={tree.id || idx}
                        initial={{ scale: 0.85, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.4, delay: idx * 0.05 }}
                        className="p-3 bg-[var(--color-bg-secondary)]/70 hover:bg-[var(--color-bg-secondary)] backdrop-blur-md rounded-2xl border border-[var(--color-border)] hover:border-emerald-500/40 shadow-sm transition-all flex flex-col items-center justify-between group cursor-default"
                    >
                        <div className="w-full h-36 flex items-center justify-center p-1 relative">
                            <Tree type={tree.type} growth={progress} />
                        </div>

                        <div className="w-full mt-2 text-center">
                            <p className="text-xs font-semibold text-[var(--color-text-primary)] capitalize">
                                {tree.type} Tree
                            </p>
                            <div
                                className="w-full bg-[var(--color-bg)]/80 rounded-full h-1.5 mt-1.5 overflow-hidden border border-[var(--color-border)]"
                                role="progressbar"
                                aria-valuenow={Math.round(progress * 100)}
                                aria-valuemin={0}
                                aria-valuemax={100}
                                aria-label={`${tree.type} tree growth progress`}
                            >
                                <div
                                    className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                                    style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
                                />
                            </div>
                            <span className="text-[10px] text-[var(--color-text-secondary)] font-mono mt-0.5 block">
                                {tree.growthPoints} / {tree.maxGrowth} pts
                            </span>
                        </div>
                    </motion.div>
                );
            })}

            {grove.length === 0 && (
                <EmptyState
                    icon="🌸"
                    title="Your Grove Sanctuary Awaits"
                    description="Plant your first golden seed to sprout an organic botanical tree that flourishes with every task you conquer."
                    shortcutHint="Conquer high-priority tasks to earn golden seeds"
                />
            )}
        </div>
    );
};

export default GroveGrid;

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from './Icons';

export const CaptureInput = ({ onAddTask, onOpenBrainSweep }) => {
    const [text, setText] = useState('');
    const [selectedEnergy, setSelectedEnergy] = useState(null); // null | 'spark' | 'flow' | 'rest'

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            let finalTaskText = text.trim();
            if (selectedEnergy && !finalTaskText.includes(`~${selectedEnergy}`)) {
                finalTaskText += ` ~${selectedEnergy}`;
            }
            onAddTask(finalTaskText);
            setText('');
            setSelectedEnergy(null);
        }
    };

    return (
        <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            transition={{ type: 'spring', stiffness: 120, damping: 20 }} 
            className="fixed bottom-0 left-0 right-0 pt-3 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/95 to-transparent z-20 backdrop-blur-[4px]"
            role="region"
            aria-label="Quick Task Capture"
        >
            <div className="max-w-2xl mx-auto space-y-2">
                {/* Micro Energy Selection Pills */}
                <div className="flex items-center justify-center gap-1.5 px-2">
                    <span className="text-[10px] uppercase font-bold text-[var(--color-text-secondary)]/70 tracking-widest mr-1">
                        Bio-Energy:
                    </span>
                    <button
                        type="button"
                        onClick={() => setSelectedEnergy(selectedEnergy === 'spark' ? null : 'spark')}
                        aria-pressed={selectedEnergy === 'spark'}
                        className={`text-[11px] px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                            selectedEnergy === 'spark'
                                ? 'bg-amber-400 text-black border-amber-300 font-bold shadow-[0_0_12px_rgba(251,191,36,0.4)] scale-105'
                                : 'bg-[var(--color-bg-secondary)]/60 text-[var(--color-text-secondary)] border-white/5 hover:border-amber-400/40 hover:text-amber-300'
                        }`}
                        title="Deep Focus / High Creative Spark (~spark)"
                    >
                        <span>⚡</span>
                        <span>Spark</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedEnergy(selectedEnergy === 'flow' ? null : 'flow')}
                        aria-pressed={selectedEnergy === 'flow'}
                        className={`text-[11px] px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                            selectedEnergy === 'flow'
                                ? 'bg-sky-400 text-black border-sky-300 font-bold shadow-[0_0_12px_rgba(56,189,248,0.4)] scale-105'
                                : 'bg-[var(--color-bg-secondary)]/60 text-[var(--color-text-secondary)] border-white/5 hover:border-sky-400/40 hover:text-sky-300'
                        }`}
                        title="Steady Rhythm / Routine Flow (~flow)"
                    >
                        <span>🌊</span>
                        <span>Flow</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setSelectedEnergy(selectedEnergy === 'rest' ? null : 'rest')}
                        aria-pressed={selectedEnergy === 'rest'}
                        className={`text-[11px] px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 ${
                            selectedEnergy === 'rest'
                                ? 'bg-emerald-400 text-black border-emerald-300 font-bold shadow-[0_0_12px_rgba(52,211,153,0.4)] scale-105'
                                : 'bg-[var(--color-bg-secondary)]/60 text-[var(--color-text-secondary)] border-white/5 hover:border-emerald-400/40 hover:text-emerald-300'
                        }`}
                        title="Low Demand / Gentle Wind-down (~rest)"
                    >
                        <span>🍵</span>
                        <span>Rest</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="flex items-center gap-2">
                    <div className="relative flex-grow">
                        <input 
                            type="text" 
                            value={text} 
                            onChange={(e) => setText(e.target.value)} 
                            placeholder="Capture a thought... (@tag, #Category, !urgent, ~spark) (N)" 
                            aria-label="Capture a new task or thought"
                            className="w-full bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 text-sm sm:text-base px-5 py-3.5 rounded-2xl border border-white/10 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30 shadow-xl transition-all"
                        />
                    </div>
                    {onOpenBrainSweep && (
                        <button
                            type="button"
                            onClick={onOpenBrainSweep}
                            title="Zen Brain Sweep - Multi-line thought dump"
                            aria-label="Open Zen Brain Sweep multi-line dump"
                            className="bg-[var(--color-bg-secondary)]/80 hover:bg-[var(--color-bg-secondary-hover)] text-[var(--color-text-secondary)] hover:text-amber-300 p-3.5 rounded-2xl transition-all flex-shrink-0 border border-white/10 shadow-lg hover:border-amber-400/30 active:scale-95"
                        >
                            <span className="text-base">💨</span>
                        </button>
                    )}
                    <button 
                        type="submit" 
                        aria-label="Add task"
                        className="bg-[var(--color-accent)] text-black p-3.5 sm:p-4 rounded-2xl transition-all flex-shrink-0 shadow-[0_0_18px_rgba(52,211,153,0.35)] hover:shadow-[0_0_24px_rgba(52,211,153,0.55)] active:scale-95 font-semibold hover:brightness-110"
                    >
                        <PlusIcon className="w-5 h-5 stroke-[2.5]" />
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

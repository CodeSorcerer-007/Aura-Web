import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sprout, ArrowRight, X } from 'lucide-react';

export const AssistantPrompt = ({
    message,
    action,
    onAction,
    onClose,
    showNext,
    onNext,
    allowSeedInput = false,
    onPlantSeed = null
}) => {
    const [seedText, setSeedText] = useState('');

    const handlePlantSubmit = (e) => {
        if (e) e.preventDefault();
        if (!seedText.trim()) return;
        if (onPlantSeed) {
            onPlantSeed(seedText.trim());
        }
        setSeedText('');
        if (onNext) onNext();
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-2xl mx-auto mb-6 p-4 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-xl backdrop-blur-md relative text-center text-sm"
        >
            {onClose && (
                <button
                    onClick={onClose}
                    className="absolute top-3 right-3 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors p-1"
                    title="Dismiss"
                >
                    <X size={14} />
                </button>
            )}

            <p className="text-[var(--color-text-primary)] font-medium leading-relaxed px-4">{message}</p>

            {allowSeedInput && (
                <form onSubmit={handlePlantSubmit} className="mt-3 flex items-center justify-center gap-2 max-w-md mx-auto">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={seedText}
                            onChange={(e) => setSeedText(e.target.value)}
                            placeholder="Name your single seed for tomorrow..."
                            className="w-full px-3 py-1.5 text-xs sm:text-sm bg-[var(--color-bg-primary)] border border-[var(--color-border)] rounded-xl text-[var(--color-text-primary)] placeholder-[var(--color-text-secondary)] focus:outline-none focus:border-amber-400/80 transition-colors"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!seedText.trim()}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-md shadow-amber-500/20"
                    >
                        <Sprout size={14} />
                        <span>Plant Seed</span>
                    </button>
                </form>
            )}

            <div className="flex justify-center items-center gap-3 mt-3">
                {action && (
                    <button
                        onClick={onAction}
                        className="text-xs sm:text-sm bg-indigo-500/80 hover:bg-indigo-500 text-white px-3 py-1 rounded-full transition-colors"
                    >
                        {action}
                    </button>
                )}
                {showNext && (
                    <button
                        onClick={onNext}
                        className="flex items-center gap-1 text-xs sm:text-sm bg-[var(--color-border)] hover:bg-[var(--color-text-secondary)]/20 text-[var(--color-text-primary)] px-3 py-1 rounded-full transition-colors"
                    >
                        <span>{allowSeedInput ? 'Skip for now' : 'Next'}</span>
                        <ArrowRight size={12} />
                    </button>
                )}
            </div>
        </motion.div>
    );
};

import React from 'react';
import { motion } from 'framer-motion';

export const EmptyState = ({
    icon = '✨',
    title = 'All clear in this space',
    description = 'Enjoy the stillness, or capture a new mindful intention.',
    actionLabel,
    onAction,
    shortcutHint = 'Press N to capture a thought'
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="col-span-full py-12 px-6 flex flex-col items-center justify-center text-center max-w-md mx-auto select-none"
            role="status"
        >
            {/* Glowing Icon Orb */}
            <div className="relative mb-4">
                <div 
                    className="absolute inset-0 rounded-full bg-[var(--color-accent)]/20 blur-xl scale-125 pointer-events-none"
                    aria-hidden="true" 
                />
                <motion.div
                    className="w-16 h-16 rounded-3xl bg-[var(--color-bg-secondary)]/80 border border-white/10 flex items-center justify-center text-3xl shadow-xl relative z-10"
                    animate={{ y: [0, -6, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                >
                    <span aria-hidden="true">{icon}</span>
                </motion.div>
            </div>

            <h3 className="text-base sm:text-lg font-bold text-[var(--color-text-primary)] tracking-tight">
                {title}
            </h3>

            <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mt-1.5 leading-relaxed max-w-sm">
                {description}
            </p>

            {actionLabel && onAction && (
                <button
                    onClick={onAction}
                    className="mt-5 px-5 py-2 rounded-full bg-[var(--color-accent)] text-black font-semibold text-xs shadow-md shadow-[var(--color-accent)]/20 hover:brightness-110 active:scale-95 transition-all"
                >
                    {actionLabel}
                </button>
            )}

            {shortcutHint && (
                <p className="text-[11px] text-[var(--color-text-secondary)]/60 font-mono mt-3">
                    💡 {shortcutHint}
                </p>
            )}
        </motion.div>
    );
};

export default EmptyState;

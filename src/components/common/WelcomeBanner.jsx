import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XIcon } from './Icons';

export const WelcomeBanner = ({ welcomeBanner, onDismiss }) => {
    return (
        <AnimatePresence>
            {welcomeBanner && (
                <motion.div
                    initial={{ opacity: 0, y: -20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                    transition={{ duration: 0.3 }}
                    className="max-w-2xl mx-auto mb-6 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-teal-500/15 border border-amber-400/30 backdrop-blur-xl shadow-lg flex items-center justify-between gap-3 text-xs"
                    role="status"
                    aria-live="polite"
                >
                    <div className="flex items-center gap-2.5">
                        <span className="text-base" aria-hidden="true">🌙</span>
                        <p className="text-[var(--color-text-primary)] font-medium">
                            <span className="font-bold text-amber-300">Welcome back</span> — you left off in{' '}
                            <span className="font-semibold text-purple-300">{welcomeBanner.viewName}</span>. You have{' '}
                            <span className="font-bold text-emerald-400">{welcomeBanner.activeCount} active tasks</span> for today.
                        </p>
                    </div>
                    <button
                        onClick={onDismiss}
                        className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded transition-colors flex-shrink-0 focus:outline-none focus:ring-1 focus:ring-amber-400"
                        aria-label="Dismiss welcome banner"
                    >
                        <XIcon className="w-3.5 h-3.5" />
                    </button>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WelcomeBanner;

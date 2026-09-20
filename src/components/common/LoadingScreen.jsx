import React from 'react';
import { motion } from 'framer-motion';

export const LoadingScreen = () => (
    <motion.div
        key="loading-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        className="fixed inset-0 bg-[var(--color-bg,#0a0e17)] flex flex-col items-center justify-center z-[100] overflow-hidden select-none"
        role="status"
        aria-label="Loading Aura Mindful Sanctuary"
    >
        {/* Ambient Celestial Nebula Glows */}
        <div 
            className="absolute w-96 h-96 rounded-full bg-[var(--color-accent,#34d399)]/15 blur-3xl pointer-events-none animate-pulse"
            style={{ animationDuration: '4s' }}
            aria-hidden="true" 
        />
        <div 
            className="absolute w-72 h-72 rounded-full bg-purple-500/10 blur-3xl pointer-events-none"
            style={{ transform: 'translate(40px, 40px)' }}
            aria-hidden="true" 
        />

        {/* Pulsing Luminous Brand Glyph */}
        <div className="relative mb-6">
            <motion.div
                animate={{
                    scale: [1, 1.08, 1],
                    rotate: [0, 2, -2, 0]
                }}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl relative z-10 border border-white/20 bg-black/40 backdrop-blur-xl flex items-center justify-center"
            >
                <img 
                    src="/Aura_logo.png" 
                    alt="Aura" 
                    className="w-full h-full object-cover" 
                />
            </motion.div>
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-amber-500/40 via-pink-500/40 to-purple-500/40 blur-2xl animate-pulse" />
        </div>

        {/* Brand Title */}
        <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary,#ffffff)] font-display"
        >
            Aura
        </motion.h1>

        {/* Subtitle */}
        <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="text-xs sm:text-sm text-[var(--color-text-secondary,#94a3b8)] mt-2 font-medium tracking-wide text-center px-4"
        >
            Mindful Productivity & Ambient Flow
        </motion.p>

        {/* Elegant Animated Pulse Bar */}
        <div className="w-36 h-1 bg-white/10 rounded-full mt-6 overflow-hidden relative">
            <motion.div
                className="h-full bg-gradient-to-r from-[var(--color-accent,#34d399)] to-teal-300 rounded-full"
                animate={{
                    x: ['-100%', '100%']
                }}
                transition={{
                    duration: 1.6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                style={{ width: '60%' }}
            />
        </div>
    </motion.div>
);

export default LoadingScreen;

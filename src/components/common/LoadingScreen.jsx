import React from 'react';
import { motion } from 'framer-motion';
import { SparklesIcon } from './Icons';

export const LoadingScreen = () => (
    <motion.div
        key="loading-screen"
        initial={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 bg-[var(--color-bg)] flex flex-col items-center justify-center z-[100]"
    >
        <motion.div
            animate={{
                scale: [1, 1.1, 1],
                opacity: [0.7, 1, 0.7],
            }}
            transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
            }}
        >
            <SparklesIcon className="w-16 h-16 text-[var(--color-accent)]" />
        </motion.div>
        <h1 className="text-2xl font-bold mt-4 text-[var(--color-text-primary)]">Aura</h1>
    </motion.div>
);

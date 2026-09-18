import React from 'react';
import { motion } from 'framer-motion';

export const DayDatePanel = () => {
    const now = new Date();
    const day = now.toLocaleDateString('en-US', { weekday: 'long' });
    const date = now.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

    return (
        <motion.div 
            initial={{ opacity: 0, y: -10 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="text-center mb-8 p-4 bg-[var(--color-bg-secondary)] rounded-xl border border-[var(--color-border)] max-w-xs mx-auto shadow-lg"
        >
            <p className="text-xl font-bold text-[var(--color-text-primary)]">{day}</p>
            <p className="text-md text-[var(--color-text-secondary)]">{date}</p>
        </motion.div>
    );
};

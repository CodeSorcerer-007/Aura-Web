import React from 'react';
import { motion } from 'framer-motion';

export const AssistantPrompt = ({ message, action, onAction, onClose, showNext, onNext }) => (
    <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        exit={{ opacity: 0, y: -20 }} 
        className="max-w-2xl mx-auto mb-6 p-3 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg text-center text-sm"
    >
        <p className="text-[var(--color-text-primary)]/80">{message}</p>
        <div className="flex justify-center items-center gap-4 mt-2">
            {action && (
                <button onClick={onAction} className="text-sm bg-indigo-500/80 px-3 py-1 rounded-full hover:bg-indigo-500">
                    {action}
                </button>
            )}
            {showNext && (
                <button onClick={onNext} className="text-sm bg-teal-500/80 px-3 py-1 rounded-full hover:bg-teal-500">
                    Next →
                </button>
            )}
        </div>
    </motion.div>
);

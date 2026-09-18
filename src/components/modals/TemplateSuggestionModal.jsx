import React from 'react';
import { motion } from 'framer-motion';

export const TemplateSuggestionModal = ({ suggestion, onApply, onContinue, onClose }) => (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
    >
        <motion.div 
            initial={{ scale: 0.9, y: 20 }} 
            animate={{ scale: 1, y: 0 }} 
            className="w-full max-w-sm bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 text-center"
        >
            <h2 className="text-xl font-bold mb-2">Template Found</h2>
            <p className="text-[var(--color-text-secondary)] mb-4">
                Your new task matches the "{suggestion.templateName}" template. How would you like to proceed?
            </p>
            <div className="flex flex-col gap-3 mt-6">
                <button 
                    onClick={onApply} 
                    className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-semibold py-2 rounded-lg"
                >
                    Apply Template
                </button>
                <button 
                    onClick={onContinue} 
                    className="w-full bg-[var(--color-text-primary)]/10 py-2 rounded-lg"
                >
                    Add Task as Written
                </button>
            </div>
        </motion.div>
    </motion.div>
);

import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const WinModal = ({ task, onSave, onClose }) => {
    const [winText, setWinText] = useState('');

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 text-center"
            >
                <h2 className="text-2xl font-bold mb-2">Great Work!</h2>
                <p className="text-[var(--color-text-secondary)] mb-4">
                    You completed: <span className="font-semibold text-[var(--color-text-primary)]">{task?.text}</span>
                </p>
                <p className="text-sm text-[var(--color-text-primary)]/60 mb-4">
                    Optionally, add a note about this accomplishment to your Grove.
                </p>
                <textarea 
                    value={winText} 
                    onChange={(e) => setWinText(e.target.value)} 
                    placeholder="e.g., 'Finally cracked the issue...'" 
                    className="w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] placeholder:text-[var(--color-text-primary)]/50 p-3 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all h-24"
                />
                <div className="flex gap-4 mt-6">
                    <button 
                        onClick={onClose} 
                        className="w-full bg-[var(--color-bg-secondary-hover)] py-2 rounded-lg"
                    >
                        Skip
                    </button>
                    <button 
                        onClick={() => onSave(task?.id, winText)} 
                        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 rounded-lg"
                    >
                        Save Win
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

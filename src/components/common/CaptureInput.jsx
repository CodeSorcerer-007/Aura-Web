import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon } from './Icons';

export const CaptureInput = ({ onAddTask }) => {
    const [text, setText] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (text.trim()) {
            onAddTask(text.trim());
            setText('');
        }
    };

    return (
        <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            transition={{ type: 'spring', stiffness: 100 }} 
            className="fixed bottom-0 left-0 right-0 pt-4 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/80 to-transparent z-20"
        >
            <div className="max-w-2xl mx-auto">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <input 
                        type="text" 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        placeholder="Capture a thought... (N)" 
                        className="w-full bg-[var(--color-bg-input)] backdrop-blur-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)] px-5 py-3 rounded-full border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] transition-all"
                    />
                    <button 
                        type="submit" 
                        className="bg-[var(--color-bg-input)] hover:bg-[var(--color-bg-secondary-hover)] text-[var(--color-text-primary)] p-4 rounded-full transition-colors flex-shrink-0"
                    >
                        <PlusIcon className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

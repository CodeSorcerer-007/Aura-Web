import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const MINDFUL_PROMPTS = ['Breathe in...', 'Hold...', 'Breathe out...'];
const MINDFUL_DURATIONS = [4000, 2000, 6000];

export const MindfulMinuteModal = ({ isOpen, onClose }) => {
    const [prompt, setPrompt] = useState('Prepare to begin...');

    useEffect(() => {
        if (!isOpen) return;

        let index = -1;
        let timer;

        const cycle = () => {
            index = (index + 1) % MINDFUL_PROMPTS.length;
            setPrompt(MINDFUL_PROMPTS[index]);
            timer = setTimeout(cycle, MINDFUL_DURATIONS[index]);
        };
        
        const startTimeout = setTimeout(cycle, 1000);

        return () => {
            clearTimeout(startTimeout);
            clearTimeout(timer);
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[80] flex flex-col items-center justify-center p-4"
        >
            <motion.div 
                className="w-48 h-48 rounded-full border-2 border-[var(--color-accent)] shadow-2xl shadow-[var(--color-accent)]/20"
                animate={{ 
                    scale: [1, 1.25, 1],
                    opacity: [0.5, 1, 0.5]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
            />
            <p className="text-2xl font-semibold text-white/80 mt-12 tracking-wide">{prompt}</p>
            <button 
                onClick={onClose} 
                className="absolute bottom-12 bg-white/10 hover:bg-white/20 text-white px-8 py-3 rounded-full transition-colors"
            >
                End Session
            </button>
        </motion.div>
    );
};

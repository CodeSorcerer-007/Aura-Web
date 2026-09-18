import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '../common/Icons';

export const ShareSummaryModal = ({ isOpen, onClose, dailyStats }) => {
    const [copied, setCopied] = useState(false);
    if (!isOpen) return null;
    
    const summaryText = `Aura Daily Summary ✨\n\n✅ Tasks Completed: ${dailyStats.completed}\n⏰ Focus Sessions: ${dailyStats.focusSessions}\n🏆 Achievements: ${dailyStats.achievements}`;

    const handleCopy = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(summaryText).then(() => {
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            }).catch(err => console.error('Failed to copy!', err));
        } else {
            const textArea = document.createElement("textarea");
            textArea.value = summaryText;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                console.error('Fallback copy failed', err);
            }
            document.body.removeChild(textArea);
        }
    };
    
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Today's Wins</h2>
                    <button onClick={onClose}><XIcon className="w-6 h-6"/></button>
                </div>
                <div className="bg-[var(--color-bg)] p-4 rounded-lg mb-4 whitespace-pre-wrap text-left font-mono text-sm leading-relaxed">
                    {summaryText}
                </div>
                <button 
                    onClick={handleCopy} 
                    className="w-full bg-[var(--color-accent)] text-black font-semibold py-2.5 rounded-lg shadow-lg"
                >
                    {copied ? 'Copied to Clipboard!' : 'Copy Summary'}
                </button>
            </motion.div>
        </motion.div>
    );
};

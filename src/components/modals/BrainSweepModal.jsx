import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '../common/Icons';

export const BrainSweepModal = ({ isOpen, onClose, onSweepTasks }) => {
    const [rawText, setRawText] = useState('');

    if (!isOpen) return null;

    // Parse lines into task objects
    const parsedLines = rawText
        .split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .map((line, index) => {
            // Strip bullet points
            let clean = line.replace(/^[-*•]\s+/, '').replace(/^\d+[.)]\s+/, '').trim();
            
            // Extract tags
            const tags = [...clean.matchAll(/@(\w+)/g)].map(m => m[1]);
            
            // Extract category
            const categoryMatch = clean.match(/#(\w+)/);
            const category = categoryMatch ? categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1) : null;
            
            // Extract priority
            let priority = 2;
            if (clean.includes('!3') || clean.includes('!urgent') || clean.toLowerCase().includes('urgent')) {
                priority = 3;
            } else if (clean.includes('!1') || clean.toLowerCase().includes('low priority')) {
                priority = 1;
            } else if (clean.includes('!')) {
                priority = 3;
            }

            return {
                id: index,
                raw: line,
                text: clean,
                tags,
                category,
                priority
            };
        });

    const handleSweep = () => {
        if (parsedLines.length === 0) return;
        onSweepTasks(parsedLines.map(p => p.raw));
        setRawText('');
        onClose();
    };

    const handleKeyDown = (e) => {
        if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
            e.preventDefault();
            handleSweep();
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                className="w-full max-w-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl flex flex-col max-h-[90vh]"
            >
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2.5">
                        <span className="text-xl">💨</span>
                        <div>
                            <h2 className="text-lg font-bold text-[var(--color-text-primary)]">Zen Brain Sweep</h2>
                            <p className="text-xs text-[var(--color-text-secondary)]">Dump your thoughts line-by-line. Aura will parse and organize them.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1 rounded">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-grow flex flex-col gap-3">
                    <textarea
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        autoFocus
                        placeholder={`Dump everything freely:\n- Draft quarterly proposal !urgent #work @morning\n- 20 min mindfulness walk #health\n- Call supplier @phone\n- Read chapter 4 of deep work evening`}
                        className="w-full h-44 bg-[var(--color-bg)] text-[var(--color-text-primary)] p-3.5 rounded-xl border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] font-mono text-xs leading-relaxed resize-none"
                    />

                    {/* Live Preview Chips */}
                    {parsedLines.length > 0 && (
                        <div className="p-3 bg-[var(--color-bg)]/60 rounded-xl border border-[var(--color-border)] max-h-36 overflow-y-auto">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-[var(--color-text-primary)]">
                                    Detected Thoughts ({parsedLines.length})
                                </span>
                                <span className="text-[10px] text-emerald-400 font-medium">Ready to sweep</span>
                            </div>
                            <div className="space-y-1.5">
                                {parsedLines.map(item => (
                                    <div key={item.id} className="text-xs p-1.5 rounded bg-[var(--color-bg-secondary)] border border-[var(--color-border)] flex items-center justify-between gap-2">
                                        <span className="truncate text-[var(--color-text-primary)]">{item.text}</span>
                                        <div className="flex items-center gap-1 flex-shrink-0">
                                            {item.priority === 3 && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 font-semibold">Urgent</span>
                                            )}
                                            {item.category && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-sky-500/20 text-sky-300">#{item.category}</span>
                                            )}
                                            {item.tags.map(tag => (
                                                <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300">@{tag}</span>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-between mt-5 pt-3 border-t border-[var(--color-border)]">
                    <span className="text-[11px] text-[var(--color-text-secondary)]">
                        Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] text-[10px]">Cmd/Ctrl + Enter</kbd> to sweep
                    </span>
                    <div className="flex gap-2">
                        <button
                            onClick={onClose}
                            className="text-xs px-4 py-2 rounded-lg bg-[var(--color-bg-secondary-hover)] text-[var(--color-text-primary)]"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSweep}
                            disabled={parsedLines.length === 0}
                            className="text-xs font-semibold px-4 py-2 rounded-lg bg-[var(--color-accent)] text-black disabled:opacity-40 disabled:cursor-not-allowed shadow transition-all flex items-center gap-1.5"
                        >
                            <span>💨</span> Sweep {parsedLines.length > 0 && `(${parsedLines.length})`}
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

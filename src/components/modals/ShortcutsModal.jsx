import React from 'react';
import { motion } from 'framer-motion';
import { XIcon, CommandIcon } from '../common/Icons';

export const ShortcutsModal = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    const sections = [
        {
            title: "Navigation",
            shortcuts: [
                { keys: ["1"], label: "Go to Flow View" },
                { keys: ["2"], label: "Go to Projects / Constellations" },
                { keys: ["3"], label: "Go to The Grove" },
                { keys: ["4"], label: "Go to Daily Journal" },
                { keys: ["5"], label: "Go to Review & Heatmap" },
            ]
        },
        {
            title: "Quick Actions",
            shortcuts: [
                { keys: ["N"], label: "Focus task capture input" },
                { keys: ["Ctrl", "P"], label: "Open Command Palette / Search" },
                { keys: ["S"], label: "Open Settings" },
                { keys: ["?"], label: "Toggle this Shortcuts Cheatsheet" },
                { keys: ["Esc"], label: "Close modal or cancel session" },
            ]
        },
        {
            title: "Smart Task Syntax",
            shortcuts: [
                { keys: ["@tag"], label: "Attach tag (e.g. @deepwork, @home)" },
                { keys: ["#category"], label: "Assign category (e.g. #Work, #Ideas)" },
                { keys: ["!"], label: "Mark as High Priority (or type 'urgent')" },
                { keys: ["morning"], label: "Schedule to Morning time block" },
                { keys: ["evening"], label: "Schedule to Evening time block" },
                { keys: ["every day"], label: "Create a daily recurring task" },
            ]
        }
    ];

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[80] flex items-center justify-center p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.95, y: 15 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.95, y: 15 }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="w-full max-w-xl bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl overflow-hidden text-[var(--color-text-primary)]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6 pb-4 border-b border-[var(--color-border)]">
                    <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-[var(--color-accent)]/15 flex items-center justify-center text-[var(--color-accent)]">
                            <CommandIcon className="w-4 h-4" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold">Keyboard Shortcuts</h2>
                            <p className="text-xs text-[var(--color-text-secondary)]">Navigate and capture at the speed of thought</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] p-1 rounded-lg hover:bg-[var(--color-bg-secondary-hover)] transition-colors"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                    {sections.map(sec => (
                        <div key={sec.title}>
                            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-accent)] mb-3">
                                {sec.title}
                            </h3>
                            <div className="space-y-2">
                                {sec.shortcuts.map((sc, i) => (
                                    <div
                                        key={i}
                                        className="flex items-center justify-between py-1.5 px-2.5 rounded-lg bg-[var(--color-bg)]/40 hover:bg-[var(--color-bg)]/70 transition-colors text-sm"
                                    >
                                        <span className="text-[var(--color-text-primary)]/90">{sc.label}</span>
                                        <div className="flex items-center gap-1">
                                            {sc.keys.map((k, ki) => (
                                                <kbd
                                                    key={ki}
                                                    className="px-2 py-0.5 text-xs font-mono font-medium rounded-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] text-[var(--color-text-secondary)] shadow-sm"
                                                >
                                                    {k}
                                                </kbd>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-6 pt-4 border-t border-[var(--color-border)] flex justify-between items-center text-xs text-[var(--color-text-secondary)]">
                    <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] font-mono">?</kbd> anytime to open</span>
                    <span>Press <kbd className="px-1.5 py-0.5 rounded bg-[var(--color-bg)] border border-[var(--color-border)] font-mono">Esc</kbd> to close</span>
                </div>
            </motion.div>
        </motion.div>
    );
};

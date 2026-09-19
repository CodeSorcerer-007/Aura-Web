import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '../common/Icons';

export const HarvestCardModal = ({ isOpen, onClose, grove, stats, tasks }) => {
    const [copied, setCopied] = useState(false);

    if (!isOpen) return null;

    const today = new Date();
    const monthName = today.toLocaleString('default', { month: 'long' }).toUpperCase();
    const year = today.getFullYear();
    const wins = tasks.filter(t => t.win);
    const matureTrees = (grove || []).filter(t => t.growthPoints >= t.maxGrowth).length;
    const totalTrees = (grove || []).length;

    const handleCopy = () => {
        const text = `🌿 Aura Harvest — ${monthName} ${year}\n` +
            `🌲 Trees Nurtured: ${totalTrees} (${matureTrees} fully grown)\n` +
            `⭐ Golden Seeds: ${stats.goldenSeeds || 0}\n` +
            `🏆 High-Impact Wins: ${wins.length}\n` +
            `🎯 Focus Sessions: ${stats.focusedTasksCompleted || 0}\n\n` +
            `"Like the oak, deep growth happens in quiet seasons."`;
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
        >
            <motion.div
                initial={{ scale: 0.9, rotate: -1 }}
                animate={{ scale: 1, rotate: 0 }}
                className="w-full max-w-sm bg-neutral-900 border border-neutral-700/80 rounded-3xl p-6 shadow-2xl relative text-neutral-100 font-sans"
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-white p-1 rounded-full bg-neutral-800/80"
                >
                    <XIcon className="w-4 h-4" />
                </button>

                {/* Polaroid Frame */}
                <div className="bg-gradient-to-b from-neutral-800 to-neutral-950 p-4 rounded-2xl border border-neutral-700/60 shadow-inner">
                    {/* Visual Photo Area */}
                    <div className="relative h-48 bg-gradient-to-tr from-amber-950/40 via-emerald-950/30 to-indigo-950/40 rounded-xl border border-neutral-700/40 flex flex-col items-center justify-center overflow-hidden">
                        {/* Botanical Illustration Silhouette */}
                        <div className="text-6xl filter drop-shadow-[0_0_20px_rgba(245,158,11,0.35)] animate-bounce" style={{ animationDuration: '4s' }}>
                            🌳
                        </div>
                        <div className="absolute bottom-2 text-[10px] tracking-widest text-amber-300/70 uppercase font-mono">
                            Aura Living Grove
                        </div>
                    </div>

                    {/* Polaroid Caption Area */}
                    <div className="pt-4 text-center">
                        <h3 className="text-xs font-bold tracking-[0.25em] text-amber-400 uppercase font-mono">
                            Harvest • {monthName} {year}
                        </h3>

                        <div className="grid grid-cols-2 gap-2 my-4 text-left">
                            <div className="bg-neutral-800/60 p-2 rounded-lg border border-neutral-700/40">
                                <p className="text-[10px] text-neutral-400 uppercase">Trees Grown</p>
                                <p className="text-lg font-bold text-emerald-400">{totalTrees}</p>
                            </div>
                            <div className="bg-neutral-800/60 p-2 rounded-lg border border-neutral-700/40">
                                <p className="text-[10px] text-neutral-400 uppercase">Golden Seeds</p>
                                <p className="text-lg font-bold text-amber-400">{stats.goldenSeeds || 0}</p>
                            </div>
                            <div className="bg-neutral-800/60 p-2 rounded-lg border border-neutral-700/40">
                                <p className="text-[10px] text-neutral-400 uppercase">Sacred Wins</p>
                                <p className="text-lg font-bold text-sky-400">{wins.length}</p>
                            </div>
                            <div className="bg-neutral-800/60 p-2 rounded-lg border border-neutral-700/40">
                                <p className="text-[10px] text-neutral-400 uppercase">Deep Focus</p>
                                <p className="text-lg font-bold text-purple-400">{stats.focusedTasksCompleted || 0}</p>
                            </div>
                        </div>

                        <p className="text-[11px] italic text-neutral-400 px-2 leading-relaxed">
                            "Like the oak, deep growth happens in quiet, consistent seasons."
                        </p>
                    </div>
                </div>

                <div className="flex gap-2 mt-4">
                    <button
                        onClick={handleCopy}
                        className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs bg-amber-400 hover:bg-amber-300 text-black shadow-lg transition-all flex items-center justify-center gap-1.5"
                    >
                        <span>{copied ? '✓' : '📋'}</span>
                        <span>{copied ? 'Copied to Clipboard!' : 'Share Harvest Card'}</span>
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

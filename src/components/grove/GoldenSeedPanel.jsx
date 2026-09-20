import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { StarIcon } from '../common/Icons';

export const GoldenSeedPanel = ({ goldenSeeds, onPlant, isPlantingEffect }) => {
    return (
        <div className="mb-8 p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border border-amber-400/30 rounded-2xl shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between gap-4 relative z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                        <StarIcon className="w-5 h-5" />
                    </div>
                    <div className="text-left">
                        <p className="font-bold text-base sm:text-lg text-amber-300 flex items-center gap-1.5">
                            <span>Golden Seeds</span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 font-mono">
                                {goldenSeeds} available
                            </span>
                        </p>
                        <p className="text-xs text-amber-200/70">
                            Earned through consistent mindful momentum. Plant one to nurture a new living tree.
                        </p>
                    </div>
                </div>
                <button
                    onClick={onPlant}
                    disabled={goldenSeeds === 0}
                    className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-black px-6 py-2.5 rounded-full font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 flex-shrink-0"
                    aria-label="Plant a golden seed"
                >
                    <span>🌰</span>
                    <span>Plant Seed</span>
                </button>
            </div>

            {/* Golden Seed Drop & Sprout Visual */}
            <AnimatePresence>
                {isPlantingEffect && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-amber-400/20 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none"
                    >
                        <div className="flex flex-col items-center">
                            <span className="text-3xl animate-bounce">🌰</span>
                            <span className="text-xs font-semibold text-amber-200 mt-1 uppercase tracking-wider">
                                Seed embedded into sacred earth...
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default GoldenSeedPanel;

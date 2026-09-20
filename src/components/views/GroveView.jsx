import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { playHarmonicUiSound } from '../../hooks/useSoundEffects';
import { GoldenSeedPanel } from '../grove/GoldenSeedPanel';
import { GroveGrid } from '../grove/GroveGrid';
import { AccomplishmentJournal } from '../grove/AccomplishmentJournal';

// Re-export botanical tree components for backwards compatibility
export { OakTree, PineTree, CherryBlossom, Tree } from '../grove/TreeRenderer';
export { PlantingAnimation } from '../common/PlantingAnimation';

export const GroveView = ({ tasks = [], grove = [], goldenSeeds = 0, onPlantSeed, allCategories = {}, onOpenHarvestCard }) => {
    const [isRaining, setIsRaining] = useState(false);
    const [isPlantingEffect, setIsPlantingEffect] = useState(false);

    const wins = tasks.filter(t => t.win);

    const getSeason = () => {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    };
    const season = getSeason();
    const seasonGradients = {
        spring: 'from-pink-500/10 via-emerald-500/10 to-teal-500/15',
        summer: 'from-amber-500/10 via-sky-500/10 to-emerald-500/15',
        autumn: 'from-orange-500/10 via-amber-600/10 to-rose-600/15',
        winter: 'from-blue-500/10 via-indigo-500/10 to-slate-600/15',
    };

    const handlePlant = () => {
        if (goldenSeeds <= 0) return;
        setIsPlantingEffect(true);
        playHarmonicUiSound('plant_seed');
        if (onPlantSeed) onPlantSeed();
        setTimeout(() => setIsPlantingEffect(false), 1400);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto pb-28 sm:pb-36"
        >
            {/* Header with Weather toggle and Harvest Card trigger */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="text-left">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl" aria-hidden="true">🌱</span>
                        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Your Grove</h2>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-0.5">
                        A living botanical sanctuary that blossoms with every mindful finish.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsRaining(!isRaining)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm ${
                            isRaining
                                ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 ring-1 ring-sky-400/30'
                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
                        }`}
                        title="Toggle serene rainfall weather over the grove"
                        aria-pressed={isRaining}
                        aria-label="Toggle serene rain weather"
                    >
                        <span aria-hidden="true">🌧️</span>
                        <span>{isRaining ? 'Rain Active' : 'Rain Weather'}</span>
                    </button>
                    {onOpenHarvestCard && (
                        <button
                            onClick={onOpenHarvestCard}
                            className="px-3.5 py-1.5 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-200 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                            title="Export monthly accomplishments polaroid card"
                            aria-label="Open Harvest Card export"
                        >
                            <span aria-hidden="true">📸</span>
                            <span>Harvest Card</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Golden Seeds Planting Shrine */}
            <GoldenSeedPanel
                goldenSeeds={goldenSeeds}
                onPlant={handlePlant}
                isPlantingEffect={isPlantingEffect}
            />

            {/* Living Botanical Garden Grid */}
            <GroveGrid
                grove={grove}
                isRaining={isRaining}
                season={season}
                seasonGradients={seasonGradients}
            />

            {/* Accomplishment Wins Journal */}
            <AccomplishmentJournal
                wins={wins}
                allCategories={allCategories}
            />
        </motion.div>
    );
};

export default GroveView;

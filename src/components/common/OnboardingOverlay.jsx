import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playHarmonicUiSound } from '../../hooks/useSoundEffects';
import { XIcon } from './Icons';

const ONBOARDING_STEPS = [
    {
        icon: '🌊',
        title: 'Mindful Flow & Smart Capture',
        description: 'Capture intentions effortlessly with natural syntax: type #Category, @tag, !urgent, or ~spark. Organize your day into Morning, Afternoon, and Evening calm.',
        tip: 'Press "N" anywhere to jump straight into mindful capture.'
    },
    {
        icon: '🌌',
        title: 'Cosmic Constellations',
        description: 'Watch your projects transform into living celestial topologies. High-impact monolith tasks orbit close to the gravitational core, with visual dependency filaments.',
        tip: 'Press "2" to switch directly into Constellations galaxy view.'
    },
    {
        icon: '🌱',
        title: 'Botanical Grove Sanctuary',
        description: 'Accomplishing tasks nurtures procedural botanical trees through sprout, sapling, and mature foliage. Earn golden seeds and export Polaroid harvest cards.',
        tip: 'Press "3" to visit your Grove and toggle serene rainfall.'
    },
    {
        icon: '🎧',
        title: 'Ambient Flow & Evening Rituals',
        description: 'Immerse in procedural soundscapes: rainfall, ocean swells, and 432 Hz alpha frequencies. Complete your day with the evening wind-down shutdown ritual.',
        tip: 'Press "S" to open soundscapes or Ctrl+P for the command palette.'
    }
];

export const OnboardingOverlay = ({ isOpen, onClose, onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);

    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setCurrentStep(0);
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const step = ONBOARDING_STEPS[currentStep];
    const isLast = currentStep === ONBOARDING_STEPS.length - 1;

    const handleNext = () => {
        playHarmonicUiSound('toggle');
        if (isLast) {
            handleFinish();
        } else {
            setCurrentStep(s => s + 1);
        }
    };

    const handlePrev = () => {
        playHarmonicUiSound('toggle');
        setCurrentStep(s => Math.max(0, s - 1));
    };

    const handleFinish = () => {
        playHarmonicUiSound('plant_seed');
        try {
            localStorage.setItem('aura-onboarding-completed', 'true');
        } catch {}
        if (onComplete) onComplete();
        if (onClose) onClose();
    };

    const handleSkip = () => {
        try {
            localStorage.setItem('aura-onboarding-completed', 'true');
        } catch {}
        if (onClose) onClose();
    };

    return (
        <div 
            className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md"
            role="dialog"
            aria-modal="true"
            aria-labelledby="onboarding-step-title"
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: 15 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                className="w-full max-w-lg bg-[var(--color-bg-secondary)]/95 border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-xl"
            >
                {/* Background Ambient Glow */}
                <div 
                    className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-[var(--color-accent)]/20 blur-3xl pointer-events-none"
                    aria-hidden="true" 
                />
                <div 
                    className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-purple-500/20 blur-3xl pointer-events-none"
                    aria-hidden="true" 
                />

                {/* Close/Skip button */}
                <button
                    onClick={handleSkip}
                    className="absolute top-4 right-4 p-2 rounded-full text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/10 transition-colors"
                    aria-label="Skip onboarding tour"
                >
                    <XIcon className="w-4 h-4" />
                </button>

                {/* Step indicator dots */}
                <div className="flex items-center gap-1.5 mb-6" aria-label={`Step ${currentStep + 1} of ${ONBOARDING_STEPS.length}`}>
                    {ONBOARDING_STEPS.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                                idx === currentStep
                                    ? 'w-6 bg-[var(--color-accent)] shadow-[0_0_8px_var(--color-accent)]'
                                    : idx < currentStep
                                    ? 'w-2.5 bg-white/40'
                                    : 'w-2 bg-white/15'
                            }`}
                        />
                    ))}
                    <span className="text-[11px] font-mono text-[var(--color-text-secondary)] ml-2">
                        {currentStep + 1} of {ONBOARDING_STEPS.length}
                    </span>
                </div>

                {/* Animated Step Content */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentStep}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.25 }}
                        className="text-left"
                    >
                        <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-3xl mb-4 shadow-inner">
                            {step.icon}
                        </div>
                        <h2 
                            id="onboarding-step-title" 
                            className="text-2xl font-bold text-[var(--color-text-primary)] tracking-tight"
                        >
                            {step.title}
                        </h2>
                        <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed mt-2.5">
                            {step.description}
                        </p>

                        <div className="mt-4 p-3 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-2.5">
                            <span className="text-sm" aria-hidden="true">💡</span>
                            <p className="text-xs text-[var(--color-accent)] font-medium leading-normal">
                                {step.tip}
                            </p>
                        </div>
                    </motion.div>
                </AnimatePresence>

                {/* Action Controls */}
                <div className="flex items-center justify-between mt-8 pt-4 border-t border-white/10">
                    <button
                        onClick={handleSkip}
                        className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors px-2 py-1"
                    >
                        Skip Tour
                    </button>

                    <div className="flex items-center gap-2">
                        {currentStep > 0 && (
                            <button
                                onClick={handlePrev}
                                className="px-4 py-2 rounded-full text-xs font-semibold border border-white/15 text-[var(--color-text-secondary)] hover:text-white hover:bg-white/10 transition-all"
                            >
                                Previous
                            </button>
                        )}
                        <button
                            onClick={handleNext}
                            className="px-6 py-2 rounded-full text-xs font-bold bg-[var(--color-accent)] hover:brightness-110 active:scale-95 text-black shadow-lg shadow-[var(--color-accent)]/20 transition-all"
                        >
                            {isLast ? 'Begin Flow ✨' : 'Continue →'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default OnboardingOverlay;

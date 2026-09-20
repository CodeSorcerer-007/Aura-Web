import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { playHarmonicUiSound } from '../../hooks/useSoundEffects';
import { usePreferences } from '../../hooks/usePreferences';

const BREATH_PATTERNS = [
    {
        id: 'box',
        name: 'Box Breathing (4-4-4-4)',
        description: 'Navy SEAL technique for grounding and mental clarity',
        phases: [
            { text: 'Inhale through nose...', duration: 4000, scale: 1.35, color: '#34d399' },
            { text: 'Gently hold breath...', duration: 4000, scale: 1.35, color: '#38bdf8' },
            { text: 'Exhale through mouth...', duration: 4000, scale: 1.0, color: '#818cf8' },
            { text: 'Hold empty...', duration: 4000, scale: 1.0, color: '#a78bfa' }
        ]
    },
    {
        id: 'relax_478',
        name: 'Relax & Reset (4-7-8)',
        description: 'Vagus nerve stimulation for soothing anxious thoughts',
        phases: [
            { text: 'Inhale deeply...', duration: 4000, scale: 1.35, color: '#34d399' },
            { text: 'Hold tranquil breath...', duration: 7000, scale: 1.35, color: '#facc15' },
            { text: 'Slow, steady exhale...', duration: 8000, scale: 1.0, color: '#fb7185' }
        ]
    },
    {
        id: 'energize',
        name: 'Energize & Focus (2-1-2-1)',
        description: 'Awaken momentum and sharpen acute attention',
        phases: [
            { text: 'Quick inhale...', duration: 2000, scale: 1.25, color: '#f59e0b' },
            { text: 'Pause...', duration: 1000, scale: 1.25, color: '#fbbf24' },
            { text: 'Crisp exhale...', duration: 2000, scale: 1.0, color: '#34d399' },
            { text: 'Rest...', duration: 1000, scale: 1.0, color: '#10b981' }
        ]
    }
];

export const MindfulMinuteModal = ({ isOpen, onClose }) => {
    const [selectedPatternId, setSelectedPatternId] = useState('box');
    const [phaseIndex, setPhaseIndex] = useState(0);
    const [completedCycles, setCompletedCycles] = useState(0);
    // Persisted via usePreferences — consistent with the rest of the app's storage pattern
    const [totalSessions, setTotalSessions] = usePreferences('aura-mindful-sessions', 0);

    const activePattern = BREATH_PATTERNS.find(p => p.id === selectedPatternId) || BREATH_PATTERNS[0];
    const currentPhase = activePattern.phases[phaseIndex] || activePattern.phases[0];

    // Reset when modal is opened
    useEffect(() => {
        if (isOpen) {
            const timer = setTimeout(() => {
                setPhaseIndex(0);
                setCompletedCycles(0);
            }, 0);
            playHarmonicUiSound('toggle');
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    // Cycling breath timer
    useEffect(() => {
        if (!isOpen) return;

        const timer = setTimeout(() => {
            setPhaseIndex(prev => {
                const next = (prev + 1) % activePattern.phases.length;
                if (next === 0) {
                    setCompletedCycles(c => c + 1);
                }
                return next;
            });
        }, currentPhase.duration);

        return () => clearTimeout(timer);
    }, [isOpen, phaseIndex, activePattern, currentPhase.duration]);

    const handleEndSession = () => {
        if (completedCycles > 0) {
            playHarmonicUiSound('complete');
            setTotalSessions(prev => prev + 1);
        }
        if (onClose) onClose();
    };

    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[80] flex flex-col items-center justify-between p-4 sm:p-8"
            role="dialog"
            aria-modal="true"
            aria-label="Mindful Breathing Session"
        >
            {/* Top Bar with Pattern Selectors */}
            <div className="w-full max-w-xl flex flex-col items-center gap-3 pt-2">
                <div className="flex items-center gap-2">
                    <span className="text-xl" aria-hidden="true">🧘</span>
                    <h2 className="text-base sm:text-lg font-bold text-white tracking-wide">Mindful Respiration</h2>
                    {totalSessions > 0 && (
                        <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-white/10 text-emerald-300 border border-emerald-400/30">
                            {totalSessions} mindful {totalSessions === 1 ? 'session' : 'sessions'}
                        </span>
                    )}
                </div>

                <div className="flex flex-wrap items-center justify-center gap-1.5" role="tablist" aria-label="Breathing Techniques">
                    {BREATH_PATTERNS.map(p => (
                        <button
                            key={p.id}
                            onClick={() => {
                                setSelectedPatternId(p.id);
                                setPhaseIndex(0);
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                selectedPatternId === p.id
                                    ? 'bg-white/20 text-white border border-white/30 shadow-sm'
                                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                            }`}
                        >
                            {p.name.split(' (')[0]}
                        </button>
                    ))}
                </div>
            </div>

            {/* Central Living Breath Orb */}
            <div className="flex flex-col items-center justify-center my-auto relative">
                {/* Outermost Halo Glow */}
                <motion.div
                    className="absolute rounded-full pointer-events-none blur-3xl opacity-40"
                    animate={{
                        scale: currentPhase.scale * 1.3,
                        backgroundColor: currentPhase.color
                    }}
                    transition={{
                        duration: currentPhase.duration / 1000,
                        ease: 'easeInOut'
                    }}
                    style={{ width: '260px', height: '260px' }}
                />

                {/* Main Pulsing Orb */}
                <motion.div
                    className="w-48 h-48 sm:w-56 sm:h-56 rounded-full border-2 shadow-2xl flex items-center justify-center relative overflow-hidden"
                    animate={{
                        scale: currentPhase.scale,
                        borderColor: currentPhase.color,
                        boxShadow: `0 0 35px ${currentPhase.color}40`
                    }}
                    transition={{
                        duration: currentPhase.duration / 1000,
                        ease: 'easeInOut'
                    }}
                >
                    {/* Inner Harmonic Wave Ripples */}
                    <motion.div
                        className="w-full h-full rounded-full opacity-20"
                        animate={{
                            backgroundColor: currentPhase.color,
                            opacity: [0.15, 0.35, 0.15]
                        }}
                        transition={{
                            duration: currentPhase.duration / 1000,
                            repeat: Infinity,
                            ease: 'easeInOut'
                        }}
                    />
                </motion.div>

                {/* Phase Prompt text */}
                <motion.p
                    key={currentPhase.text}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-xl sm:text-2xl font-bold text-white/90 mt-8 tracking-wide text-center"
                    aria-live="polite"
                >
                    {currentPhase.text}
                </motion.p>

                <p className="text-xs text-white/50 mt-1 font-mono">
                    Cycle {completedCycles + 1} • {activePattern.description}
                </p>
            </div>

            {/* Bottom Actions */}
            <div className="w-full max-w-xs flex flex-col items-center gap-2 pb-4">
                <button
                    onClick={handleEndSession}
                    className="w-full py-3 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white font-semibold text-sm border border-white/10 shadow-lg transition-all"
                >
                    {completedCycles > 0 ? `Complete Mindful Break (${completedCycles} cycles) ✨` : 'End Session'}
                </button>
            </div>
        </div>
    );
};

export default MindfulMinuteModal;

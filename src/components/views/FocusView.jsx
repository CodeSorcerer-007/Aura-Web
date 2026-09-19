import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAmbientSound, playTibetanBowl } from '../../hooks/useAmbientSound';
import { Volume2Icon } from '../common/Icons';

export const FocusView = ({ task, onClose, onComplete }) => {
    // Mode: 'focus' (25m) | 'shortBreak' (5m) | 'longBreak' (15m)
    const [mode, setMode] = useState('focus');
    const [duration, setDuration] = useState(25);
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isActive, setIsActive] = useState(false);
    const [isFlameMode, setIsFlameMode] = useState(true);
    const [showExactTime, setShowExactTime] = useState(false);
    const [completedPomodoros, setCompletedPomodoros] = useState(0);

    const targetEndTimeRef = useRef(null);

    // Enhanced ambient soundscape engine
    const {
        soundType,
        setSoundType,
        volume,
        setVolume,
        soundOptions,
        sleepTimer,
        setSleepTimer,
        sleepTimerOptions,
        formattedSleepTime
    } = useAmbientSound(isActive, 'off');

    // Handle mode switching
    const switchMode = (newMode) => {
        setIsActive(false);
        setMode(newMode);
        let newDuration = 25;
        if (newMode === 'shortBreak') newDuration = 5;
        if (newMode === 'longBreak') newDuration = 15;
        setDuration(newDuration);
        setTimeLeft(newDuration * 60);
    };

    const handleDecreaseDuration = () => {
        if (isActive) return;
        setDuration(d => {
            const next = Math.max(1, d - 5);
            setTimeLeft(next * 60);
            return next;
        });
    };

    const handleIncreaseDuration = () => {
        if (isActive) return;
        setDuration(d => {
            const next = d + 5;
            setTimeLeft(next * 60);
            return next;
        });
    };

    // Toggle active state and synchronize target end timestamp to prevent background tab drift
    const toggleTimer = () => {
        if (!isActive) {
            targetEndTimeRef.current = Date.now() + timeLeft * 1000;
            setIsActive(true);
        } else {
            // When pausing, recalculate exact remaining time from target
            if (targetEndTimeRef.current) {
                const remaining = Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000));
                setTimeLeft(remaining);
            }
            targetEndTimeRef.current = null;
            setIsActive(false);
        }
    };

    // Robust interval with background tab drift compensation
    useEffect(() => {
        if (!isActive) return;

        const updateTick = () => {
            if (!targetEndTimeRef.current) return;
            const remaining = Math.max(0, Math.round((targetEndTimeRef.current - Date.now()) / 1000));
            setTimeLeft(remaining);

            if (remaining === 0) {
                setIsActive(false);
                playTibetanBowl(216);

                if (mode === 'focus') {
                    setCompletedPomodoros(c => c + 1);
                    if (onComplete && task?.id) {
                        onComplete(task.id);
                    }
                    // Auto suggest break
                    const nextMode = (completedPomodoros + 1) % 4 === 0 ? 'longBreak' : 'shortBreak';
                    switchMode(nextMode);
                } else {
                    // Break finished, return to focus mode
                    switchMode('focus');
                }
            }
        };

        const interval = setInterval(updateTick, 500);

        // Immediate recalculation upon returning to tab
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                updateTick();
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            clearInterval(interval);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [isActive, mode, completedPomodoros, onComplete, task?.id]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const totalSeconds = duration * 60;
    const progress = totalSeconds > 0 ? (totalSeconds - timeLeft) / totalSeconds : 0;

    // Mode-based themes and color palette
    const modeConfig = {
        focus: {
            title: 'Sacred Focus',
            accent: 'var(--color-accent, #f59e0b)',
            ringColor: '#f59e0b',
            bgGlow: 'bg-amber-500/20',
            glowShadow: 'rgba(245, 158, 11, 0.6)'
        },
        shortBreak: {
            title: 'Restorative Pause',
            accent: '#38bdf8',
            ringColor: '#38bdf8',
            bgGlow: 'bg-sky-500/20',
            glowShadow: 'rgba(56, 189, 248, 0.6)'
        },
        longBreak: {
            title: 'Deep Restoration',
            accent: '#34d399',
            ringColor: '#34d399',
            bgGlow: 'bg-emerald-500/20',
            glowShadow: 'rgba(52, 211, 153, 0.6)'
        }
    };
    const currentModeInfo = modeConfig[mode];

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            role="dialog"
            aria-modal="true"
            aria-label="Deep Flow Focus Sanctuary"
            className="fixed inset-0 bg-black/92 backdrop-blur-2xl z-50 flex items-center justify-center p-4 select-none overflow-y-auto"
        >
            <motion.div 
                initial={{ scale: 0.95, y: 15 }} 
                animate={{ scale: 1, y: 0 }} 
                className="w-full max-w-lg text-center my-auto py-6"
            >
                {/* Header Mode & Sanctuary Toggle */}
                <div className="flex items-center justify-between mb-4 px-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentModeInfo.ringColor }}></span>
                        <span className="text-xs uppercase tracking-widest font-mono text-white/70">Deep Flow Sanctuary</span>
                    </div>
                    <button
                        onClick={() => setIsFlameMode(!isFlameMode)}
                        className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-medium text-white/80 transition-all flex items-center gap-1.5"
                    >
                        <span>{isFlameMode ? '🕯️ Sanctuary Flame' : '⏱️ Classic Timer'}</span>
                    </button>
                </div>

                {/* Pomodoro Cycle Mode Switcher */}
                <div className="flex items-center justify-center gap-2 mb-4">
                    <button
                        onClick={() => switchMode('focus')}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                            mode === 'focus'
                                ? 'bg-amber-400 text-black border-amber-300 shadow-[0_0_12px_rgba(251,191,36,0.4)]'
                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        🎯 Focus (25m)
                    </button>
                    <button
                        onClick={() => switchMode('shortBreak')}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                            mode === 'shortBreak'
                                ? 'bg-sky-400 text-black border-sky-300 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        🍵 Short Break (5m)
                    </button>
                    <button
                        onClick={() => switchMode('longBreak')}
                        className={`px-3.5 py-1 rounded-full text-xs font-semibold transition-all border ${
                            mode === 'longBreak'
                                ? 'bg-emerald-400 text-black border-emerald-300 shadow-[0_0_12px_rgba(52,211,153,0.4)]'
                                : 'bg-white/5 text-white/60 border-white/10 hover:bg-white/10 hover:text-white'
                        }`}
                    >
                        🌿 Long Break (15m)
                    </button>
                </div>

                {/* Pomodoro Completed Cycles Counter */}
                <div className="flex items-center justify-center gap-1.5 mb-3">
                    {[...Array(4)].map((_, idx) => (
                        <span 
                            key={idx} 
                            className={`text-sm transition-all ${idx < (completedPomodoros % 4) || (completedPomodoros > 0 && completedPomodoros % 4 === 0) ? 'scale-110' : 'opacity-30'}`}
                            title={`Pomodoro ${idx + 1}`}
                        >
                            🍅
                        </span>
                    ))}
                    <span className="text-[11px] font-mono text-white/50 ml-1">
                        {completedPomodoros} completed
                    </span>
                </div>

                <h2 className="text-xs uppercase tracking-widest text-white/50 mb-1 font-mono">
                    {currentModeInfo.title}
                </h2>
                <p className="text-2xl sm:text-3xl font-bold text-white mb-5 tracking-tight max-w-md mx-auto line-clamp-2">
                    {mode === 'focus' ? (task?.text || 'Deep Focus Session') : 'Breathe & Rest'}
                </p>

                {/* Duration Picker Controls */}
                <div className="flex items-center justify-center gap-6 mb-6 text-white">
                    <button 
                        onClick={handleDecreaseDuration} 
                        disabled={isActive} 
                        aria-label="Decrease session duration"
                        className="text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all border border-white/10"
                    >
                        -
                    </button>
                    <span className="text-sm w-32 text-center text-white/80 font-medium font-mono">
                        {duration} min block
                    </span>
                    <button 
                        onClick={handleIncreaseDuration} 
                        disabled={isActive} 
                        aria-label="Increase session duration"
                        className="text-2xl font-light w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all border border-white/10"
                    >
                        +
                    </button>
                </div>

                {/* Center Visual: The Sanctuary Flame or Classic Timer */}
                {isFlameMode ? (
                    <div 
                        className="relative w-60 h-60 mx-auto mb-6 flex flex-col items-center justify-center cursor-pointer group"
                        onClick={() => setShowExactTime(!showExactTime)}
                        title="Click to toggle exact time countdown"
                    >
                        {/* Ethereal Ember Radiance Ring */}
                        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                            <circle 
                                className="text-white/10" 
                                strokeWidth="3" 
                                cx="50" 
                                cy="50" 
                                r="44" 
                                fill="transparent" 
                            />
                            <motion.circle 
                                strokeWidth="3.5" 
                                strokeLinecap="round"
                                stroke={currentModeInfo.ringColor}
                                cx="50" 
                                cy="50" 
                                r="44" 
                                fill="transparent" 
                                strokeDasharray={2 * Math.PI * 44} 
                                initial={{ strokeDashoffset: 2 * Math.PI * 44 }} 
                                animate={{ strokeDashoffset: (2 * Math.PI * 44) * (1 - progress) }} 
                                transition={{ duration: 0.5, ease: 'linear' }} 
                                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center', filter: `drop-shadow(0 0 8px ${currentModeInfo.glowShadow})` }}
                            />
                        </svg>

                        {/* Procedural Candle Flame / Breath Lotus */}
                        <div className="relative flex flex-col items-center justify-center pointer-events-none" style={{ animation: isActive ? 'flame-breathe 19s ease-in-out infinite' : 'none' }}>
                            {/* Flame Aura Glow */}
                            <div className={`absolute w-24 h-24 rounded-full ${currentModeInfo.bgGlow} blur-2xl`}></div>

                            {/* Flame Teardrop */}
                            <div 
                                className="relative w-10 h-16 rounded-full"
                                style={{
                                    background: mode === 'focus'
                                        ? 'radial-gradient(ellipse at 50% 80%, #ffffff 0%, #fef08a 25%, #f59e0b 60%, #ea580c 85%, transparent 100%)'
                                        : mode === 'shortBreak'
                                        ? 'radial-gradient(ellipse at 50% 80%, #ffffff 0%, #bae6fd 30%, #38bdf8 70%, #0284c7 90%, transparent 100%)'
                                        : 'radial-gradient(ellipse at 50% 80%, #ffffff 0%, #a7f3d0 30%, #34d399 70%, #059669 90%, transparent 100%)',
                                    borderRadius: '50% 50% 35% 35% / 70% 70% 30% 30%',
                                    animation: isActive ? 'flame-flicker 2.5s ease-in-out infinite alternate' : 'none',
                                    filter: `drop-shadow(0 0 18px ${currentModeInfo.glowShadow})`
                                }}
                            >
                                <div 
                                    className="absolute bottom-1 left-1/2 -translate-x-1/2 w-4 h-7 rounded-full bg-white"
                                    style={{ borderRadius: '50% 50% 35% 35% / 70% 70% 30% 30%' }}
                                />
                            </div>

                            {/* Wick & Base */}
                            <div className="w-1 h-3 bg-neutral-600 rounded-full mt-0.5"></div>
                            <div className="w-8 h-2 bg-neutral-800 rounded-full"></div>

                            {/* Rising Embers */}
                            {isActive && (
                                <div className="absolute inset-0 pointer-events-none">
                                    {[...Array(5)].map((_, i) => (
                                        <div 
                                            key={i}
                                            className="absolute w-1.5 h-1.5 rounded-full"
                                            style={{
                                                backgroundColor: currentModeInfo.ringColor,
                                                top: '20%',
                                                left: `${40 + i * 5}%`,
                                                animation: `ember-rise ${2.5 + i * 0.5}s ease-in infinite`,
                                                animationDelay: `${i * 0.7}s`
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Time Caption / Subconscious Mode */}
                        <div className="mt-4">
                            <AnimatePresence mode="wait">
                                {showExactTime ? (
                                    <motion.p 
                                        key="exact"
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }} 
                                        className="text-xs font-mono text-amber-300 tracking-wider font-semibold"
                                    >
                                        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} remaining`}
                                    </motion.p>
                                ) : (
                                    <motion.p 
                                        key="peace"
                                        initial={{ opacity: 0 }} 
                                        animate={{ opacity: 1 }} 
                                        exit={{ opacity: 0 }} 
                                        className="text-xs font-serif italic text-white/70 group-hover:text-white transition-colors"
                                    >
                                        {isActive 
                                            ? (mode === 'focus' ? 'Holding space in deep flow...' : 'Recharging mind & body...') 
                                            : 'Ignite the sanctuary'}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                ) : (
                    /* Classic Timer Mode */
                    <div className="relative w-52 h-52 mx-auto mb-6">
                        <svg className="w-full h-full" viewBox="0 0 100 100">
                            <circle 
                                className="text-white/10" 
                                strokeWidth="6" 
                                cx="50" 
                                cy="50" 
                                r="45" 
                                fill="transparent" 
                            />
                            <motion.circle 
                                strokeWidth="6" 
                                strokeLinecap="round"
                                stroke={currentModeInfo.ringColor}
                                cx="50" 
                                cy="50" 
                                r="45" 
                                fill="transparent" 
                                strokeDasharray={2 * Math.PI * 45} 
                                initial={{ strokeDashoffset: 2 * Math.PI * 45 }} 
                                animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1 - progress) }} 
                                transition={{ duration: 0.5, ease: 'linear' }} 
                                style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                            />
                        </svg>
                        <div className="absolute inset-0 flex items-center justify-center text-5xl font-mono text-white tracking-wider font-bold">
                            {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                        </div>
                    </div>
                )}

                {/* Primary Action Controls */}
                <div className="flex items-center justify-center gap-4 mb-6">
                    <button 
                        onClick={toggleTimer} 
                        style={{ backgroundColor: currentModeInfo.ringColor }}
                        className="text-black px-8 py-3 rounded-full text-base font-bold w-36 transition-all shadow-xl hover:brightness-110 active:scale-95"
                    >
                        {isActive ? 'Pause' : 'Ignite Focus'}
                    </button>
                    <button 
                        onClick={onClose} 
                        className="bg-white/10 hover:bg-white/15 text-white/80 px-6 py-3 rounded-full transition-colors text-sm font-medium border border-white/10 active:scale-95"
                    >
                        End Session
                    </button>
                </div>

                {/* Soundscape Selector with Sleep Timer */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-md mx-auto space-y-3 aura-glass-subtle">
                    <div className="flex items-center justify-between px-2">
                        <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">Ambient Resonance</span>
                        {soundType !== 'off' && (
                            <div className="flex items-center gap-2">
                                <Volume2Icon className="w-4 h-4 text-white/60" />
                                <input 
                                    type="range" 
                                    min="0" 
                                    max="1" 
                                    step="0.05" 
                                    value={volume} 
                                    onChange={(e) => setVolume(parseFloat(e.target.value))} 
                                    aria-label="Ambient volume"
                                    className="w-20 accent-amber-400 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {soundOptions.map(opt => (
                            <button 
                                key={opt.id} 
                                onClick={() => setSoundType(opt.id)} 
                                className={`px-3 py-1.5 text-xs rounded-full transition-all ${
                                    soundType === opt.id 
                                        ? 'bg-amber-400 text-black font-bold shadow-md scale-105' 
                                        : 'bg-white/5 text-white/70 hover:bg-white/10 border border-white/5'
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>

                    {/* Sleep / Auto-Fade Timer Section */}
                    {soundType !== 'off' && (
                        <div className="pt-2.5 border-t border-white/10">
                            <div className="flex items-center justify-between mb-2 px-2">
                                <span className="text-[11px] uppercase tracking-wider text-purple-200/70 font-semibold flex items-center gap-1">
                                    <span>🌙 Auto-Fade Sleep Timer</span>
                                </span>
                                {formattedSleepTime && (
                                    <span className="text-xs font-mono text-amber-300 font-semibold animate-pulse">
                                        {formattedSleepTime} left
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-center gap-1.5">
                                {sleepTimerOptions.map(opt => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setSleepTimer(opt.id)}
                                        className={`px-3 py-1 text-xs rounded-lg transition-all ${
                                            sleepTimer === opt.id
                                                ? 'bg-purple-500 text-white font-medium shadow-sm shadow-purple-900/40'
                                                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

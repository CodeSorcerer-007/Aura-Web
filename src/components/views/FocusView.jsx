import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAmbientSound } from '../../hooks/useAmbientSound';
import { Volume2Icon } from '../common/Icons';

export const FocusView = ({ task, onClose, onComplete }) => {
    const [duration, setDuration] = useState(25); // Default 25 minutes
    const [timeLeft, setTimeLeft] = useState(duration * 60);
    const [isActive, setIsActive] = useState(false);

    // Enhanced ambient soundscape engine
    const {
        soundType,
        setSoundType,
        volume,
        setVolume,
        soundOptions
    } = useAmbientSound(isActive, 'off');

    useEffect(() => {
        if (!isActive) {
            setTimeLeft(duration * 60);
        }
    }, [duration, isActive]);

    useEffect(() => { 
        let interval = null; 
        if (isActive && timeLeft > 0) { 
            interval = setInterval(() => {
                setTimeLeft(t => t - 1);
            }, 1000); 
        } else if (timeLeft === 0) { 
            onComplete(task.id); 
            onClose(); 
        } 
        return () => clearInterval(interval); 
    }, [isActive, timeLeft, onComplete, onClose, task.id]);
    
    const minutes = Math.floor(timeLeft / 60); 
    const seconds = timeLeft % 60; 
    const progress = ((duration * 60) - timeLeft) / (duration * 60);

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/85 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                className="w-full max-w-lg text-center"
            >
                <h2 className="text-xl text-white/70 mb-2 font-medium">Focusing on:</h2>
                <p className="text-3xl font-bold text-white mb-6 tracking-tight">{task.text}</p>

                <div className="flex items-center justify-center gap-6 mb-6 text-white">
                    <button 
                        onClick={() => setDuration(d => Math.max(5, d - 5))} 
                        disabled={isActive} 
                        className="text-4xl font-light w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all"
                    >
                        -
                    </button>
                    <span className="text-lg w-36 text-center text-white/80 font-medium">
                        Timer: {duration} min
                    </span>
                    <button 
                        onClick={() => setDuration(d => d + 5)} 
                        disabled={isActive} 
                        className="text-3xl font-light w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-all"
                    >
                        +
                    </button>
                </div>

                <div className="relative w-52 h-52 mx-auto mb-8">
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
                            className="text-teal-400" 
                            strokeWidth="6" 
                            strokeLinecap="round"
                            cx="50" 
                            cy="50" 
                            r="45" 
                            fill="transparent" 
                            strokeDasharray={2 * Math.PI * 45} 
                            initial={{ strokeDashoffset: 2 * Math.PI * 45 }} 
                            animate={{ strokeDashoffset: (2 * Math.PI * 45) * (1 - progress) }} 
                            transition={{ duration: 1, ease: 'linear' }} 
                            style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
                        />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-5xl font-mono text-white tracking-wider">
                        {`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}
                    </div>
                </div>

                <div className="flex items-center justify-center gap-4 mb-6">
                    <button 
                        onClick={() => setIsActive(!isActive)} 
                        className="bg-teal-500 hover:bg-teal-600 text-black px-8 py-3 rounded-full text-lg font-semibold w-36 transition-colors shadow-lg shadow-teal-500/20"
                    >
                        {isActive ? 'Pause' : 'Start'}
                    </button>
                    <button 
                        onClick={onClose} 
                        className="bg-white/10 hover:bg-white/15 text-white/80 px-6 py-3 rounded-full transition-colors font-medium"
                    >
                        End Session
                    </button>
                </div>

                {/* Soundscape Selector */}
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-md mx-auto">
                    <div className="flex items-center justify-between mb-3 px-2">
                        <span className="text-xs uppercase tracking-wider text-white/50 font-semibold">Ambient Soundscape</span>
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
                                    className="w-20 accent-teal-400 cursor-pointer h-1.5 bg-white/20 rounded-lg appearance-none"
                                />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-wrap items-center justify-center gap-1.5 max-h-32 overflow-y-auto pr-1">
                        {soundOptions.map(opt => (
                            <button 
                                key={opt.id} 
                                onClick={() => setSoundType(opt.id)} 
                                className={`px-3 py-1.5 text-xs rounded-full transition-all ${soundType === opt.id ? 'bg-teal-400 text-black font-semibold shadow-md' : 'bg-white/5 text-white/70 hover:bg-white/10'}`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

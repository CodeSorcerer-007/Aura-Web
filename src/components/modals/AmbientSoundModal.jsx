import React from 'react';
import { motion } from 'framer-motion';
import { useAmbientSound } from '../../hooks/useAmbientSound';
import { Volume2, VolumeX, Moon, CloudRain, Waves, Wind, Zap, Sparkles, Bell, Radio } from 'lucide-react';

const ICON_MAP = {
    CloudRain: CloudRain,
    Waves: Waves,
    Wind: Wind,
    Zap: Zap,
    Sparkles: Sparkles,
    Volume2: Volume2,
    VolumeX: VolumeX,
    Bell: Bell,
    Radio: Radio
};

export const AmbientSoundModal = ({ isOpen, onClose }) => {
    // Persistent active state when modal opens or sound plays
    const [isPlaying, setIsPlaying] = React.useState(true);
    
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
    } = useAmbientSound(isPlaying, 'off');

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-md p-6 rounded-3xl bg-[#131722]/95 border border-white/10 shadow-2xl backdrop-blur-2xl text-white"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                        <Waves className="w-5 h-5 text-cyan-400" />
                        <h2 className="text-base font-semibold">Ambient Soundscapes</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/50 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/5 transition-colors"
                    >
                        ✕
                    </button>
                </div>

                {/* Soundscapes Grid */}
                <div className="grid grid-cols-3 gap-2 mb-4">
                    {soundOptions.map((opt) => {
                        const Icon = ICON_MAP[opt.icon] || Volume2;
                        const isSelected = soundType === opt.id;
                        return (
                            <button
                                key={opt.id}
                                type="button"
                                onClick={() => {
                                    setSoundType(opt.id);
                                    if (opt.id !== 'off') setIsPlaying(true);
                                }}
                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-2xl border text-xs font-medium transition-all ${
                                    isSelected
                                        ? 'bg-gradient-to-tr from-purple-600/40 to-cyan-500/30 border-cyan-400/40 text-white shadow-lg shadow-cyan-900/30'
                                        : 'bg-white/[0.04] border-white/5 text-white/60 hover:text-white hover:bg-white/[0.08]'
                                }`}
                            >
                                <Icon className={`w-5 h-5 ${isSelected ? 'text-cyan-300' : 'text-white/40'}`} />
                                <span className="text-[11px] truncate w-full text-center">{opt.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Volume Slider */}
                {soundType !== 'off' && (
                    <div className="p-3 rounded-2xl bg-white/[0.04] border border-white/5 mb-4">
                        <div className="flex items-center justify-between mb-2 text-xs text-white/70">
                            <span className="flex items-center gap-1.5 font-medium">
                                <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                                Volume
                            </span>
                            <span className="font-mono text-[11px] text-white/50">{Math.round(volume * 100)}%</span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.02"
                            value={volume}
                            onChange={(e) => setVolume(parseFloat(e.target.value))}
                            className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                        />
                    </div>
                )}

                {/* Auto-Fade Sleep Timer */}
                {soundType !== 'off' && (
                    <div className="p-3.5 rounded-2xl bg-purple-500/10 border border-purple-500/20">
                        <div className="flex items-center justify-between mb-2.5">
                            <span className="text-xs font-semibold text-purple-200 flex items-center gap-1.5">
                                <Moon className="w-3.5 h-3.5 text-purple-400" />
                                Auto-Fade Sleep Timer
                            </span>
                            {formattedSleepTime ? (
                                <span className="text-xs font-mono text-cyan-300 font-semibold animate-pulse">
                                    {formattedSleepTime} left
                                </span>
                            ) : (
                                <span className="text-[10px] text-purple-300/60 font-medium">Continuous</span>
                            )}
                        </div>
                        <div className="flex items-center justify-center gap-2">
                            {sleepTimerOptions.map((opt) => (
                                <button
                                    key={opt.id}
                                    type="button"
                                    onClick={() => setSleepTimer(opt.id)}
                                    className={`flex-1 py-1.5 text-xs rounded-xl transition-all ${
                                        sleepTimer === opt.id
                                            ? 'bg-purple-600 text-white font-medium shadow-md shadow-purple-900/50'
                                            : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                                    }`}
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="mt-5 text-center">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors"
                    >
                        Done
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

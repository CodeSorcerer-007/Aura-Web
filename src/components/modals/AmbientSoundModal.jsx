import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAmbientSound } from '../../hooks/useAmbientSound';
import {
    Volume2,
    VolumeX,
    Moon,
    CloudRain,
    Waves,
    Wind,
    Zap,
    Sparkles,
    Bell,
    Radio,
    Sliders,
    Music2,
    Flame,
    Sun
} from 'lucide-react';

const ICON_MAP = {
    CloudRain,
    Waves,
    Wind,
    Zap,
    Sparkles,
    Volume2,
    VolumeX,
    Bell,
    Radio,
    Flame,
    Sun
};

export const AmbientSoundModal = ({ isOpen, onClose }) => {
    const [activeTab, setActiveTab] = useState('atmosphere'); // 'atmosphere' | 'frequency'

    const {
        atmosphereSound,
        setAtmosphereSound,
        frequencySound,
        setFrequencySound,
        masterVolume,
        setMasterVolume,
        atmosphereVolume,
        setAtmosphereVolume,
        frequencyVolume,
        setFrequencyVolume,
        isPlaying,
        stopAll,
        applyPreset,
        ATMOSPHERE_OPTIONS,
        FREQUENCY_OPTIONS,
        SOUND_PRESETS,
        sleepTimer,
        setSleepTimer,
        sleepTimerOptions,
        formattedSleepTime,
        intervalBell,
        setIntervalBell,
        intervalBellOptions,
        triggerPreviewChime
    } = useAmbientSound(true);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-lg p-6 rounded-3xl bg-[#131722]/95 border border-white/10 shadow-2xl backdrop-blur-2xl text-white"
            >
                {/* Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                        <Waves className="w-5 h-5 text-cyan-400" />
                        <div>
                            <h2 className="text-base font-semibold">Dual-Track Ambient Soundscapes</h2>
                            <p className="text-[11px] text-white/50">Layer nature with harmonic brainwave frequencies</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isPlaying && (
                            <button
                                type="button"
                                onClick={stopAll}
                                className="px-2.5 py-1 text-[11px] rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-400/25 transition-colors cursor-pointer flex items-center gap-1"
                            >
                                <VolumeX className="w-3 h-3" />
                                Stop All
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="text-white/50 hover:text-white text-sm px-2 py-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        >
                            ✕
                        </button>
                    </div>
                </div>

                {/* Quick Presets Bar */}
                <div className="mb-4">
                    <span className="text-[11px] uppercase tracking-wider text-white/40 font-semibold mb-2 block">
                        Harmonic Presets
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {SOUND_PRESETS.map((preset) => {
                            const isPresetActive =
                                atmosphereSound === preset.atmosphere && frequencySound === preset.frequency;
                            return (
                                <button
                                    key={preset.id}
                                    type="button"
                                    onClick={() => applyPreset(preset)}
                                    className={`px-2.5 py-1.5 rounded-xl border text-xs text-center transition-all cursor-pointer truncate ${
                                        isPresetActive
                                            ? 'bg-gradient-to-r from-cyan-500/30 to-purple-500/30 border-cyan-400/50 text-cyan-200 font-semibold shadow-sm'
                                            : 'bg-white/[0.03] border-white/5 text-white/70 hover:text-white hover:bg-white/[0.06]'
                                    }`}
                                >
                                    {preset.name}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Layer Selector Tabs */}
                <div className="flex rounded-2xl bg-white/[0.04] p-1 border border-white/5 mb-4">
                    <button
                        type="button"
                        onClick={() => setActiveTab('atmosphere')}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'atmosphere'
                                ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 shadow-sm'
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        <CloudRain className="w-3.5 h-3.5" />
                        <span>Track 1: Atmosphere</span>
                        {atmosphereSound !== 'off' && (
                            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                        )}
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab('frequency')}
                        className={`flex-1 py-1.5 rounded-xl text-xs font-medium transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                            activeTab === 'frequency'
                                ? 'bg-purple-500/20 text-purple-200 border border-purple-400/30 shadow-sm'
                                : 'text-white/60 hover:text-white'
                        }`}
                    >
                        <Radio className="w-3.5 h-3.5" />
                        <span>Track 2: Frequency</span>
                        {frequencySound !== 'off' && (
                            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
                        )}
                    </button>
                </div>

                {/* Track 1: Atmosphere Sound Grid */}
                {activeTab === 'atmosphere' && (
                    <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {ATMOSPHERE_OPTIONS.map((opt) => {
                                const Icon = ICON_MAP[opt.icon] || Volume2;
                                const isSelected = atmosphereSound === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setAtmosphereSound(opt.id)}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-gradient-to-tr from-cyan-600/30 to-blue-500/20 border-cyan-400/50 text-white shadow-md shadow-cyan-900/30'
                                                : 'bg-white/[0.03] border-white/5 text-white/60 hover:text-white hover:bg-white/[0.07]'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-cyan-300' : 'text-white/40'}`} />
                                        <span className="text-[11px] truncate w-full text-center">{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Track 2: Frequency Sound Grid */}
                {activeTab === 'frequency' && (
                    <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {FREQUENCY_OPTIONS.map((opt) => {
                                const Icon = ICON_MAP[opt.icon] || Music2;
                                const isSelected = frequencySound === opt.id;
                                return (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setFrequencySound(opt.id)}
                                        className={`flex flex-col items-center justify-center gap-1.5 p-2.5 rounded-2xl border text-xs font-medium transition-all cursor-pointer ${
                                            isSelected
                                                ? 'bg-gradient-to-tr from-purple-600/30 to-pink-500/20 border-purple-400/50 text-white shadow-md shadow-purple-900/30'
                                                : 'bg-white/[0.03] border-white/5 text-white/60 hover:text-white hover:bg-white/[0.07]'
                                        }`}
                                    >
                                        <Icon className={`w-4 h-4 ${isSelected ? 'text-purple-300' : 'text-white/40'}`} />
                                        <span className="text-[11px] truncate w-full text-center">{opt.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Persistent Dual-Track Live Mixer Rack */}
                {isPlaying && (
                    <div className="space-y-3 pt-3 border-t border-white/10 mb-4">
                        <div className="flex items-center justify-between text-xs text-white/70">
                            <span className="flex items-center gap-1.5 font-semibold text-cyan-300">
                                <Sliders className="w-3.5 h-3.5" />
                                Dual-Track Sound Mixer
                            </span>
                            <span className="text-[10px] text-white/40 font-mono">Live Volume Balance</span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                            {/* Track 1 Live Slider */}
                            <div className="p-2.5 rounded-2xl bg-cyan-500/10 border border-cyan-400/20">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-medium text-cyan-200 flex items-center gap-1.5 truncate">
                                        <CloudRain className="w-3 h-3 text-cyan-400 flex-shrink-0" />
                                        <span className="truncate">
                                            {ATMOSPHERE_OPTIONS.find(o => o.id === atmosphereSound)?.label || 'Track 1'}
                                        </span>
                                    </span>
                                    <span className="font-mono text-[10px] text-cyan-300 font-bold ml-2">
                                        {atmosphereSound === 'off' ? 'Off' : `${Math.round(atmosphereVolume * 100)}%`}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.02"
                                    disabled={atmosphereSound === 'off'}
                                    value={atmosphereVolume}
                                    onChange={(e) => setAtmosphereVolume(parseFloat(e.target.value))}
                                    className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none disabled:opacity-25"
                                />
                            </div>

                            {/* Track 2 Live Slider */}
                            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-400/20">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-[11px] font-medium text-purple-200 flex items-center gap-1.5 truncate">
                                        <Radio className="w-3 h-3 text-purple-400 flex-shrink-0" />
                                        <span className="truncate">
                                            {FREQUENCY_OPTIONS.find(o => o.id === frequencySound)?.label || 'Track 2'}
                                        </span>
                                    </span>
                                    <span className="font-mono text-[10px] text-purple-300 font-bold ml-2">
                                        {frequencySound === 'off' ? 'Off' : `${Math.round(frequencyVolume * 100)}%`}
                                    </span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.02"
                                    disabled={frequencySound === 'off'}
                                    value={frequencyVolume}
                                    onChange={(e) => setFrequencyVolume(parseFloat(e.target.value))}
                                    className="w-full accent-purple-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none disabled:opacity-25"
                                />
                            </div>
                        </div>

                        {/* Master Volume Output */}
                        <div className="p-2.5 rounded-2xl bg-white/[0.03] border border-white/5 space-y-1.5">
                            <div className="flex items-center justify-between text-xs text-white/70">
                                <span className="text-[11px] font-medium text-white/60">Master Volume</span>
                                <span className="font-mono text-[11px] text-white/90 font-bold">{Math.round(masterVolume * 100)}%</span>
                            </div>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.02"
                                value={masterVolume}
                                onChange={(e) => setMasterVolume(parseFloat(e.target.value))}
                                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-white/10 rounded-lg appearance-none"
                            />
                        </div>

                        {/* Sleep Timer */}
                        <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 mt-2">
                            <div className="flex items-center justify-between mb-2">
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
                            <div className="flex items-center justify-center gap-1.5">
                                {sleepTimerOptions.map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setSleepTimer(opt.id)}
                                        className={`flex-1 py-1 text-xs rounded-xl transition-all cursor-pointer ${
                                            sleepTimer === opt.id
                                                ? 'bg-purple-600 text-white font-medium shadow-sm'
                                                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mindfulness Interval Bell */}
                        <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 mt-2">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-semibold text-amber-200 flex items-center gap-1.5">
                                    <Bell className="w-3.5 h-3.5 text-amber-400" />
                                    Mindfulness Interval Bell
                                </span>
                                <button
                                    type="button"
                                    onClick={triggerPreviewChime}
                                    className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 hover:bg-amber-400/30 border border-amber-400/30 font-medium transition-colors cursor-pointer"
                                    title="Preview singing bowl overtone"
                                >
                                    🔔 Test Bell
                                </button>
                            </div>
                            <div className="flex items-center justify-center gap-1.5">
                                {(intervalBellOptions || []).map((opt) => (
                                    <button
                                        key={opt.id}
                                        type="button"
                                        onClick={() => setIntervalBell(opt.id)}
                                        className={`flex-1 py-1 text-xs rounded-xl transition-all cursor-pointer ${
                                            intervalBell === opt.id
                                                ? 'bg-amber-400 text-black font-semibold shadow-sm'
                                                : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                <div className="mt-4 text-center">
                    <button
                        type="button"
                        onClick={onClose}
                        className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-medium transition-colors cursor-pointer"
                    >
                        Done
                    </button>
                </div>
            </motion.div>
        </div>
    );
};

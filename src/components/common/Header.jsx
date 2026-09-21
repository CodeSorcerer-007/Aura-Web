import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    WindIcon,
    Share2Icon,
    SearchIcon,
    SettingsIcon,
    ZapIcon,
    HelpCircleIcon
} from './Icons';
import { Headphones, Maximize2, Minimize2 } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';

export const Header = ({
    momentumProgress,
    onSettingsClick,
    onSearchClick,
    onMindfulClick,
    onAmbientClick,
    dailyQuote,
    onShare,
    onShortcutsClick
}) => {
    const [isAmbientActive, setIsAmbientActive] = useState(false);
    const [isAudioSuspended, setIsAudioSuspended] = useState(false);

    const { isFullscreen = false, toggleFullScreen = () => {} } = useSettings();

    useEffect(() => {
        const handleAmbientState = (e) => {
            setIsAmbientActive(!!e.detail?.isPlaying);
            setIsAudioSuspended(!!e.detail?.isSuspended);
        };
        window.addEventListener('aura-ambient-state-changed', handleAmbientState);
        return () => window.removeEventListener('aura-ambient-state-changed', handleAmbientState);
    }, []);

    const handleAmbientBtnClick = async () => {
        if (isAudioSuspended) {
            try {
                const { resumeAudioContext } = await import('../../hooks/useAmbientSound');
                await resumeAudioContext();
            } catch {}
        }
        onAmbientClick();
    };

    return (
    <motion.header 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="text-center mb-8 relative wco-drag-region titlebar-safe-top"
    >
        <div className="absolute top-0 left-0 flex items-center gap-2 sm:gap-3.5 wco-no-drag">
            <button 
                onClick={onMindfulClick} 
                className="p-2 rounded-xl bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-white/5 transition-all shadow-sm cursor-pointer" 
                title="Mindful Minute"
                aria-label="Mindful Minute meditation timer"
            >
                <WindIcon className="w-5 h-5"/>
            </button>
            <button 
                onClick={handleAmbientBtnClick} 
                className={`p-2 rounded-xl transition-all shadow-sm cursor-pointer relative ${
                    isAmbientActive
                        ? isAudioSuspended
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_14px_rgba(245,158,11,0.35)] animate-pulse'
                            : 'bg-cyan-500/25 text-cyan-200 border border-cyan-400/50 shadow-[0_0_12px_rgba(34,211,238,0.35)] scale-105'
                        : 'bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-cyan-300 border border-white/5'
                }`} 
                title={
                    isAmbientActive
                        ? isAudioSuspended
                            ? "Soundscape waiting for gesture — click to enable audio"
                            : "Ambient Soundscapes & Sleep Timer (Active)"
                        : "Ambient Soundscapes & Sleep Timer"
                }
                aria-label={
                    isAudioSuspended
                        ? "Soundscape paused by browser autoplay policy, click to enable audio"
                        : "Ambient soundscapes and sleep timer"
                }
            >
                <Headphones className="w-5 h-5"/>
                {isAmbientActive && (
                    <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 pointer-events-none">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${isAudioSuspended ? 'bg-amber-400 opacity-85' : 'bg-cyan-400 opacity-75'}`}></span>
                        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isAudioSuspended ? 'bg-amber-400 shadow-[0_0_6px_#f59e0b]' : 'bg-cyan-400 shadow-[0_0_6px_#22d3ee]'}`}></span>
                    </span>
                )}
            </button>
            <button 
                onClick={onShare} 
                className="p-2 rounded-xl bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-white/5 transition-all shadow-sm cursor-pointer" 
                title="Share Today's Wins"
                aria-label="Share today's wins summary"
            >
                <Share2Icon className="w-5 h-5"/>
            </button>
        </div>
        <div className="absolute top-0 right-0 flex items-center gap-2 sm:gap-3 wco-no-drag">
            <button 
                onClick={toggleFullScreen} 
                className={`p-2 rounded-xl transition-all shadow-sm cursor-pointer border ${
                    isFullscreen 
                        ? 'bg-amber-500/20 text-amber-300 border-amber-400/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' 
                        : 'bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border-white/5'
                }`}
                title={isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"}
                aria-label={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
            >
                {isFullscreen ? <Minimize2 className="w-5 h-5"/> : <Maximize2 className="w-5 h-5"/>}
            </button>
            <button 
                onClick={onShortcutsClick} 
                className="p-2 rounded-xl bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-white/5 transition-all shadow-sm cursor-pointer"
                title="Shortcuts (?)"
                aria-label="Keyboard shortcuts"
            >
                <HelpCircleIcon className="w-5 h-5"/>
            </button>
            <button 
                onClick={onSearchClick} 
                className="p-2 rounded-xl bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-white/5 transition-all shadow-sm cursor-pointer"
                title="Search (Ctrl+P)"
                aria-label="Search tasks"
            >
                <SearchIcon className="w-5 h-5"/>
            </button>
            <button 
                onClick={onSettingsClick} 
                className="p-2 rounded-xl bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-white/5 transition-all shadow-sm cursor-pointer"
                title="Settings"
                aria-label="Application settings"
            >
                <SettingsIcon className="w-5 h-5"/>
            </button>
        </div>

        <div className="flex items-center justify-center gap-3 sm:gap-3.5 mb-1 select-none">
            <div className="relative group">
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500/25 via-pink-500/25 to-purple-500/25 blur-md opacity-60 group-hover:opacity-100 transition duration-500 group-hover:scale-105 pointer-events-none" />
                <img 
                    src="/Aura_logo.png" 
                    alt="Aura" 
                    className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-2xl shadow-lg border border-white/10 object-contain transform transition duration-300 group-hover:scale-105" 
                />
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] font-display">
                <span className="aura-gradient-text">Aura</span>
            </h1>
        </div>
        {dailyQuote && (
            <p className="text-[var(--color-text-secondary)] mb-4 mt-2 text-xs sm:text-sm italic max-w-md mx-auto line-clamp-2">
                "{dailyQuote.quote}" <span className="not-italic text-[var(--color-text-secondary)]/70">— {dailyQuote.author}</span>
            </p>
        )}
        <div className="max-w-xs mx-auto mt-2">
            <div className="flex items-center justify-between text-xs text-amber-300 font-medium px-1">
                <div className="flex items-center gap-1.5">
                    <ZapIcon className="w-3.5 h-3.5 fill-amber-400/30" />
                    <span>Daily Momentum</span>
                </div>
                <span className="font-mono text-[11px]">{Math.round(momentumProgress * 100)}%</span>
            </div>
            <div 
                className="w-full bg-[var(--color-text-primary)]/10 rounded-full h-2 mt-1.5 p-0.5 overflow-hidden backdrop-blur-sm border border-white/5"
                role="progressbar"
                aria-valuenow={Math.round(momentumProgress * 100)}
                aria-valuemin="0"
                aria-valuemax="100"
                aria-label="Daily momentum progress"
            >
                <motion.div 
                    className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 h-full rounded-full shadow-[0_0_12px_rgba(251,191,36,0.5)]" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${momentumProgress * 100}%` }} 
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }} 
                />
            </div>
        </div>
    </motion.header>
    );
};

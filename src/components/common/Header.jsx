import React from 'react';
import { motion } from 'framer-motion';
import {
    WindIcon,
    Share2Icon,
    SearchIcon,
    SettingsIcon,
    ZapIcon,
    HelpCircleIcon
} from './Icons';
import { Headphones, WifiOff } from 'lucide-react';
import { UserProfileMenu } from './UserProfileMenu';

export const Header = ({
    momentumProgress,
    onSettingsClick,
    onSearchClick,
    onMindfulClick,
    onAmbientClick,
    dailyQuote,
    onShare,
    onShortcutsClick,
    onTriggerSync,
    isOffline = false
}) => (
    <motion.header 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="text-center mb-8 relative"
    >
        <div className="absolute top-0 left-0 flex items-center gap-2 sm:gap-3.5">
            <button 
                onClick={onMindfulClick} 
                className="p-2 rounded-xl bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-white/5 transition-all shadow-sm" 
                title="Mindful Minute"
                aria-label="Mindful Minute meditation timer"
            >
                <WindIcon className="w-5 h-5"/>
            </button>
            <button 
                onClick={onAmbientClick} 
                className="p-2 rounded-xl bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-cyan-300 border border-white/5 transition-all shadow-sm" 
                title="Ambient Soundscapes & Sleep Timer"
                aria-label="Ambient soundscapes and sleep timer"
            >
                <Headphones className="w-5 h-5"/>
            </button>
            <button 
                onClick={onShare} 
                className="p-2 rounded-xl bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-white/5 transition-all shadow-sm" 
                title="Share Today's Wins"
                aria-label="Share today's wins summary"
            >
                <Share2Icon className="w-5 h-5"/>
            </button>
        </div>
        <div className="absolute top-0 right-0 flex items-center gap-2 sm:gap-3">
            <UserProfileMenu onTriggerSync={onTriggerSync} />
            <button 
                onClick={onShortcutsClick} 
                className="p-2 rounded-xl bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-white/5 transition-all shadow-sm"
                title="Shortcuts (?)"
                aria-label="Keyboard shortcuts"
            >
                <HelpCircleIcon className="w-5 h-5"/>
            </button>
            <button 
                onClick={onSearchClick} 
                className="p-2 rounded-xl bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-white/5 transition-all shadow-sm"
                title="Search (Ctrl+P)"
                aria-label="Search tasks"
            >
                <SearchIcon className="w-5 h-5"/>
            </button>
            <button 
                onClick={onSettingsClick} 
                className="p-2 rounded-xl bg-[var(--color-bg-secondary)]/40 hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] border border-white/5 transition-all shadow-sm"
                title="Settings"
                aria-label="Application settings"
            >
                <SettingsIcon className="w-5 h-5"/>
            </button>
        </div>

        {isOffline && (
            <div 
                id="offline-sanctuary-badge"
                className="inline-flex items-center gap-1.5 px-3 py-1 mb-3 rounded-full text-xs font-medium bg-amber-500/15 border border-amber-400/30 text-amber-300 backdrop-blur-md shadow-sm"
                title="Offline Sanctuary active: all changes are safely saved locally"
                role="status"
                aria-live="polite"
            >
                <WifiOff size={13} className="text-amber-400 animate-pulse" />
                <span>Offline Sanctuary</span>
            </div>
        )}

        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[var(--color-text-primary)] font-display">
            <span className="aura-gradient-text">Aura</span>
        </h1>
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

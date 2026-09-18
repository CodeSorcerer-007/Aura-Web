import React from 'react';
import { motion } from 'framer-motion';
import {
    WindIcon,
    Share2Icon,
    SearchIcon,
    SettingsIcon,
    ZapIcon
} from './Icons';

export const Header = ({
    momentumProgress,
    onSettingsClick,
    onSearchClick,
    onMindfulClick,
    dailyQuote,
    onShare
}) => (
    <motion.header 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }} 
        className="text-center mb-8 relative"
    >
        <div className="absolute top-0 left-0 flex items-center gap-4">
            <button 
                onClick={onMindfulClick} 
                className="bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" 
                title="Mindful Minute"
            >
                <WindIcon className="w-6 h-6"/>
            </button>
            <button 
                onClick={onShare} 
                className="bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors" 
                title="Share Today's Wins"
            >
                <Share2Icon className="w-6 h-6"/>
            </button>
        </div>
        <div className="absolute top-0 right-0 flex items-center gap-4">
            <button 
                onClick={onSearchClick} 
                className="bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                title="Search (Ctrl+P)"
            >
                <SearchIcon className="w-6 h-6"/>
            </button>
            <button 
                onClick={onSettingsClick} 
                className="bg-transparent text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
                title="Settings"
            >
                <SettingsIcon className="w-6 h-6"/>
            </button>
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--color-text-primary)]">Aura</h1>
        <p className="text-[var(--color-text-secondary)] mb-4 italic">
            "{dailyQuote?.quote}" - {dailyQuote?.author}
        </p>
        <div className="max-w-xs mx-auto">
            <div className="flex items-center gap-2 text-xs text-amber-300">
                <ZapIcon className="w-4 h-4" />
                <span>Daily Momentum</span>
            </div>
            <div className="w-full bg-[var(--color-text-primary)]/10 rounded-full h-1.5 mt-1">
                <motion.div 
                    className="bg-amber-400 h-1.5 rounded-full" 
                    initial={{ width: 0 }} 
                    animate={{ width: `${momentumProgress * 100}%` }} 
                    transition={{ type: 'spring' }} 
                />
            </div>
        </div>
    </motion.header>
);

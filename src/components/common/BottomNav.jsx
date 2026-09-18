import React from 'react';
import { motion } from 'framer-motion';
import {
    SunIcon,
    SparklesIcon,
    LeafIcon,
    BookOpenIcon,
    BarChartIcon
} from './Icons';

export const BottomNav = ({ currentView, setCurrentView }) => {
    const navItems = [
        { id: 'flow', label: 'Flow', icon: <SunIcon /> },
        { id: 'constellations', label: 'Projects', icon: <SparklesIcon /> },
        { id: 'grove', label: 'Grove', icon: <LeafIcon /> },
        { id: 'journal', label: 'Journal', icon: <BookOpenIcon /> },
        { id: 'review', label: 'Review', icon: <BarChartIcon /> }
    ];

    return (
        <div className="fixed bottom-[calc(5rem+env(safe-area-inset-bottom))] left-0 right-0 z-20 flex justify-center px-4 pointer-events-none">
            <div className="flex items-center gap-1 sm:gap-2 bg-[var(--color-bg-secondary)]/80 backdrop-blur-lg border border-[var(--color-border)] rounded-full p-2 pointer-events-auto">
                {navItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setCurrentView(item.id)}
                        className={`relative px-2 sm:px-4 py-2 rounded-full text-sm transition-colors ${currentView === item.id ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]'}`}
                    >
                        {currentView === item.id && (
                            <motion.div
                                layoutId="nav-bubble"
                                className="absolute inset-0 bg-[var(--color-bg-secondary-hover)] rounded-full"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center gap-2">
                            {React.cloneElement(item.icon, { className: "w-5 h-5" })}
                            <span className="hidden sm:inline">{item.label}</span>
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
};

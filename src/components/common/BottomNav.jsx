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

    const bottomClass = currentView === 'flow'
        ? 'bottom-[calc(5.2rem+env(safe-area-inset-bottom))] sm:bottom-[calc(7.2rem+env(safe-area-inset-bottom))]'
        : 'bottom-[calc(1rem+env(safe-area-inset-bottom))] sm:bottom-[calc(1.5rem+env(safe-area-inset-bottom))]';

    return (
        <nav 
            aria-label="Main Navigation"
            className={`fixed ${bottomClass} left-0 right-0 z-20 flex justify-center px-2 sm:px-4 pointer-events-none transition-all duration-300 ease-out`}
        >
            <div className="flex items-center gap-0.5 sm:gap-1.5 aura-glass-floating rounded-full p-1 sm:p-2 pointer-events-auto shadow-2xl">
                {navItems.map(item => {
                    const isActive = currentView === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setCurrentView(item.id)}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                            className={`relative px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] ${
                                isActive 
                                    ? 'text-[var(--color-text-primary)] font-semibold' 
                                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="nav-pill"
                                    className="absolute inset-0 bg-[var(--color-bg-secondary-hover)] rounded-full border border-white/10 shadow-inner"
                                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                />
                            )}
                            <span className="relative z-10 flex items-center gap-1.5 sm:gap-2">
                                {React.cloneElement(item.icon, {
                                    className: `w-4 h-4 sm:w-5 sm:h-5 transition-all duration-300 ${
                                        isActive 
                                            ? 'scale-110 text-[var(--color-accent)] filter drop-shadow-[0_0_8px_var(--color-accent)]' 
                                            : 'opacity-70 group-hover:opacity-100'
                                    }`
                                })}
                                <span className={`${isActive ? 'inline' : 'hidden sm:inline'} tracking-tight`}>
                                    {item.label}
                                </span>
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};

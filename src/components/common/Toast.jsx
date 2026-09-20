import React from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, XIcon } from './Icons';

export const AchievementToast = ({ achievement, onClose }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, y: 50, scale: 0.8 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
        role="alert"
        aria-live="polite"
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 select-none"
    >
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 p-4 rounded-3xl shadow-[0_12px_40px_rgba(251,191,36,0.45)] text-black flex items-center gap-3.5 border border-amber-200/60 backdrop-blur-xl">
            <div className="w-11 h-11 rounded-2xl bg-black/10 flex items-center justify-center flex-shrink-0 shadow-inner">
                <TrophyIcon className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-extrabold text-[10px] uppercase tracking-wider text-black/70">Achievement Unlocked</p>
                <p className="font-bold text-sm truncate text-black">{achievement.title}</p>
            </div>
            <button 
                onClick={onClose} 
                aria-label="Dismiss achievement notification"
                className="p-1.5 rounded-full text-black/60 hover:text-black hover:bg-black/10 transition-colors ml-auto flex-shrink-0"
            >
                <XIcon className="w-4 h-4"/>
            </button>
        </div>
    </motion.div>
);

export const GenericToast = ({ message, onClose }) => {
    React.useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 5000);
        return () => clearTimeout(timer);
    }, [message, onClose]);

    const typeConfig = {
        success: {
            classes: 'bg-emerald-950/90 border-emerald-500/40 text-emerald-100 shadow-[0_12px_40px_rgba(16,185,129,0.35)]',
            icon: '✨',
            accent: 'bg-emerald-400'
        },
        info: {
            classes: 'bg-sky-950/90 border-sky-500/40 text-sky-100 shadow-[0_12px_40px_rgba(14,165,233,0.35)]',
            icon: '✦',
            accent: 'bg-sky-400'
        },
        warning: {
            classes: 'bg-amber-950/90 border-amber-500/40 text-amber-100 shadow-[0_12px_40px_rgba(245,158,11,0.35)]',
            icon: '⚡',
            accent: 'bg-amber-400'
        },
        error: {
            classes: 'bg-rose-950/90 border-rose-500/40 text-rose-100 shadow-[0_12px_40px_rgba(244,63,94,0.35)]',
            icon: '⚠️',
            accent: 'bg-rose-400'
        }
    };

    const config = typeConfig[message.type] || typeConfig.info;

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 50, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
            role="status"
            aria-live="polite"
            className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-auto select-none"
        >
            <div className={`relative overflow-hidden p-3.5 sm:p-4 rounded-3xl border backdrop-blur-2xl flex items-center gap-3 ${config.classes}`}>
                <span className="text-base flex-shrink-0" aria-hidden="true">{config.icon}</span>
                <p className="font-medium text-xs sm:text-sm flex-1 leading-snug">{message.text}</p>
                {(message.onUndo || message.onAction) && (
                    <button
                        onClick={() => {
                            if (message.onAction) message.onAction();
                            else if (message.onUndo) message.onUndo();
                            onClose();
                        }}
                        className="px-3 py-1 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0 active:scale-95 flex items-center gap-1 border border-white/10"
                    >
                        {message.onUndo && <span aria-hidden="true">↩</span>}
                        <span>{message.actionText || 'Undo'}</span>
                    </button>
                )}
                <button 
                    onClick={onClose} 
                    aria-label="Dismiss notification"
                    className="p-1 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                >
                    <XIcon className="w-3.5 h-3.5"/>
                </button>
                {/* 5-second countdown progress bar */}
                <motion.div
                    initial={{ width: '100%' }}
                    animate={{ width: '0%' }}
                    transition={{ duration: 5, ease: 'linear' }}
                    className={`absolute bottom-0 left-0 h-0.5 ${config.accent}/60`}
                />
            </div>
        </motion.div>
    );
};

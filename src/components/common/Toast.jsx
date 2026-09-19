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
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
    >
        <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 p-4 rounded-2xl shadow-[0_12px_40px_rgba(251,191,36,0.4)] text-black flex items-center gap-4 border border-amber-200/50 backdrop-blur-xl">
            <div className="w-11 h-11 rounded-xl bg-black/10 flex items-center justify-center flex-shrink-0">
                <TrophyIcon className="w-6 h-6 text-black" />
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-extrabold text-xs uppercase tracking-wider text-black/70">Achievement Unlocked</p>
                <p className="font-bold text-sm truncate text-black">{achievement.title}</p>
            </div>
            <button 
                onClick={onClose} 
                aria-label="Dismiss achievement notification"
                className="p-1 rounded-lg text-black/60 hover:text-black hover:bg-black/10 transition-colors ml-auto flex-shrink-0"
            >
                <XIcon className="w-5 h-5"/>
            </button>
        </div>
    </motion.div>
);

export const GenericToast = ({ message, onClose }) => {
    const typeStyles = {
        success: 'bg-emerald-950/85 border-emerald-500/40 text-emerald-100 shadow-[0_12px_40px_rgba(16,185,129,0.3)]',
        info: 'bg-sky-950/85 border-sky-500/40 text-sky-100 shadow-[0_12px_40px_rgba(14,165,233,0.3)]',
        error: 'bg-rose-950/85 border-rose-500/40 text-rose-100 shadow-[0_12px_40px_rgba(244,63,94,0.3)]'
    };

    const style = typeStyles[message.type] || typeStyles.info;

    return (
        <motion.div 
            layout
            initial={{ opacity: 0, y: 50, scale: 0.85 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9, transition: { duration: 0.2 } }}
            role="status"
            aria-live="polite"
            className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4"
        >
            <div className={`p-4 rounded-2xl border backdrop-blur-2xl flex items-center gap-3 ${style}`}>
                <p className="font-medium text-sm flex-1 leading-snug">{message.text}</p>
                {message.onUndo && (
                    <button
                        onClick={() => { message.onUndo(); onClose(); }}
                        className="px-3 py-1 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all shadow-sm flex-shrink-0 active:scale-95"
                    >
                        Undo
                    </button>
                )}
                <button 
                    onClick={onClose} 
                    aria-label="Dismiss notification"
                    className="p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10 transition-colors flex-shrink-0"
                >
                    <XIcon className="w-4 h-4"/>
                </button>
            </div>
        </motion.div>
    );
};

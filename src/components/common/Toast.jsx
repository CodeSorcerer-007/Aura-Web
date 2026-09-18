import React from 'react';
import { motion } from 'framer-motion';
import { TrophyIcon, XIcon } from './Icons';

export const AchievementToast = ({ achievement, onClose }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm"
    >
        <div className="bg-gradient-to-r from-amber-500 to-yellow-400 p-4 rounded-xl shadow-2xl text-black flex items-center gap-4">
            <TrophyIcon className="w-10 h-10 flex-shrink-0" />
            <div>
                <p className="font-bold">Achievement Unlocked!</p>
                <p className="text-sm">{achievement.title}</p>
            </div>
            <button onClick={onClose} className="ml-auto text-black/50 hover:text-black">
                <XIcon className="w-5 h-5"/>
            </button>
        </div>
    </motion.div>
);

export const GenericToast = ({ message, onClose }) => (
    <motion.div 
        layout
        initial={{ opacity: 0, y: 50, scale: 0.3 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, scale: 0.5, transition: { duration: 0.2 } }}
        className="fixed bottom-[calc(6rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 z-50 w-full max-w-sm p-4"
    >
        <div className={`p-4 rounded-xl shadow-2xl text-white flex items-center gap-4 ${message.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}>
            <p className="font-semibold text-sm">{message.text}</p>
            <button onClick={onClose} className="ml-auto text-white/70 hover:text-white flex-shrink-0">
                <XIcon className="w-5 h-5"/>
            </button>
        </div>
    </motion.div>
);

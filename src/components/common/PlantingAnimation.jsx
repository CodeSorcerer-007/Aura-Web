import React from 'react';
import { motion } from 'framer-motion';

export const PlantingAnimation = ({ onComplete }) => (
    <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[70] flex items-center justify-center"
    >
        <svg viewBox="0 0 100 100" className="w-48 h-48">
            <motion.circle 
                cx="50" cy="95" r="2" fill="#fde68a"
                animate={{ r: [2, 5, 2], transition: { duration: 1, repeat: 1 } }}
            />
            <motion.path 
                d="M 50 95 Q 45 75 50 55"
                stroke="#a3e635"
                strokeWidth="3"
                fill="transparent"
                strokeLinecap="round"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1, transition: { delay: 2, duration: 1.5 } }}
                onAnimationComplete={onComplete}
            />
        </svg>
    </motion.div>
);

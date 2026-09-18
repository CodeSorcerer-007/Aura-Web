import React from 'react';
import { motion } from 'framer-motion';
import { defaultCategories } from '../../utils/constants';
import { StarIcon, QuoteIcon } from '../common/Icons';

export const OakTree = ({ growth }) => {
    const trunkHeight = 5 + growth * 45;
    const branches = [
        { start: 0.3, len: 15, angle: -30 },
        { start: 0.4, len: 15, angle: 30 },
        { start: 0.6, len: 12, angle: -45 },
        { start: 0.7, len: 12, angle: 45 },
        { start: 0.85, len: 8, angle: -25 },
    ];
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <motion.line 
                x1="50" y1="95" x2="50" y2={95 - trunkHeight} 
                stroke="var(--color-text-primary)" strokeWidth="3" strokeLinecap="round" 
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
            />
            {branches.map((b, i) => growth > b.start && (
                <motion.line 
                    key={i} 
                    x1="50" 
                    y1={95 - (trunkHeight * (b.start + 0.1))} 
                    x2={50 + Math.sin(b.angle * Math.PI / 180) * b.len * ((growth - b.start) / (1 - b.start))} 
                    y2={(95 - (trunkHeight * (b.start + 0.1))) - Math.cos(b.angle * Math.PI / 180) * b.len * ((growth - b.start) / (1 - b.start))} 
                    stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" 
                    initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: i * 0.2 }}
                />
            ))}
        </svg>
    );
};

export const PineTree = ({ growth }) => {
    const trunkHeight = 10 + growth * 50;
    const layers = [
        { y: 0.3, w: 25 },
        { y: 0.6, w: 20 },
        { y: 0.85, w: 15 }
    ];
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            <motion.line 
                x1="50" y1="95" x2="50" y2={95 - trunkHeight} 
                stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" 
                initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }}
            />
            {layers.map((l, i) => growth > l.y && (
                <motion.path 
                    key={i} 
                    d={`M 50 ${95 - trunkHeight * l.y} l ${l.w * growth} 0 l ${-l.w * growth} 10 l ${-l.w * growth} -10 Z`} 
                    fill="var(--color-text-primary)" 
                    opacity={(growth - l.y) / (1 - l.y)} 
                    initial={{ scale: 0, opacity: 0 }} 
                    animate={{ scale: 1, opacity: (growth - l.y) / (1 - l.y) }} 
                    transition={{ delay: 0.5 + i * 0.3 }} 
                    style={{ transformOrigin: `50px ${95 - trunkHeight * l.y}px` }}
                />
            ))}
        </svg>
    );
};

export const CherryBlossom = ({ growth }) => {
    const trunkHeight = 15 + growth * 35;
    const branches = [
        { start: 0.3, len: 18, angle: -35 },
        { start: 0.4, len: 18, angle: 35 },
        { start: 0.6, len: 12, angle: -55 },
        { start: 0.65, len: 12, angle: 55 },
        { start: 0.2, len: 10, angle: 10 }
    ];
    return (
        <svg viewBox="0 0 100 100" className="w-full h-full">
            {branches.map((b, i) => growth > b.start && (
                <motion.g key={i}>
                    <motion.line 
                        x1="50" y1="95" 
                        x2={50 + Math.sin(b.angle * Math.PI / 180) * b.len * ((growth - b.start) / (1 - b.start))} 
                        y2={95 - Math.cos(b.angle * Math.PI / 180) * b.len * ((growth - b.start) / (1 - b.start))} 
                        stroke="var(--color-text-primary)" strokeWidth="2" strokeLinecap="round" 
                        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1, delay: i * 0.2 }}
                    />
                    <motion.circle 
                        cx={50 + Math.sin(b.angle * Math.PI / 180) * b.len * ((growth - b.start) / (1 - b.start))} 
                        cy={95 - Math.cos(b.angle * Math.PI / 180) * b.len * ((growth - b.start) / (1 - b.start))} 
                        r={growth > b.start + 0.1 ? 4 : 0} 
                        fill="#fecdd3" 
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1 + i * 0.2 }}
                    />
                </motion.g>
            ))}
        </svg>
    );
};

export const Tree = ({ type, growth }) => {
    switch (type) {
        case 'pine': return <PineTree growth={growth} />;
        case 'cherry': return <CherryBlossom growth={growth} />;
        default: return <OakTree growth={growth} />;
    }
};

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

export const GroveView = ({ tasks, grove, goldenSeeds, onPlantSeed, allCategories }) => {
    const wins = tasks.filter(t => t.win);
    const getSeason = () => {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    };
    const season = getSeason();
    const seasonGradients = {
        spring: 'from-pink-300/20 to-green-300/20',
        summer: 'from-sky-400/20 to-yellow-300/20',
        autumn: 'from-orange-400/20 to-red-500/20',
        winter: 'from-blue-300/20 to-indigo-400/20',
    };
    
    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.5 }} 
            className="text-center max-w-4xl mx-auto"
        >
            <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Your Grove</h2>
            <p className="text-[var(--color-text-secondary)] mb-8">A garden that grows with your efforts.</p>
            <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center justify-center gap-4">
                    <StarIcon className="w-8 h-8 text-amber-400" />
                    <div className="text-left">
                        <p className="font-bold text-lg text-amber-300">Golden Seeds</p>
                        <p className="text-sm text-amber-300/80">You have {goldenSeeds} seed{goldenSeeds !== 1 && 's'}. Plant one to grow something special.</p>
                    </div>
                    <button 
                        onClick={onPlantSeed} 
                        disabled={goldenSeeds === 0} 
                        className="ml-auto bg-amber-400 text-black px-4 py-2 rounded-full font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                    >
                        Plant
                    </button>
                </div>
            </div>
            
            <div className={`grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12 min-h-[150px] p-4 rounded-xl bg-gradient-to-br ${seasonGradients[season]}`}>
                {grove.map(tree => (
                    <div key={tree.id} className="p-2 bg-[var(--color-bg-secondary)]/50 rounded-lg border border-[var(--color-border)]">
                        <Tree type={tree.type} growth={tree.growthPoints / tree.maxGrowth} />
                        <p className="text-xs mt-1 text-[var(--color-text-secondary)]">
                            {tree.type.charAt(0).toUpperCase() + tree.type.slice(1)} Tree
                        </p>
                    </div>
                ))}
                {grove.length === 0 && (
                    <p className="text-[var(--color-text-secondary)] col-span-full self-center">
                        Your grove is empty. Plant a golden seed to begin.
                    </p>
                )}
            </div>

            <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4">Accomplishment Journal</h3>
            <div className="space-y-4">
                {wins.length > 0 ? (
                    wins.map((winTask, i) => (
                        <motion.div 
                            key={winTask.id} 
                            initial={{ opacity: 0, y: 20 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.1 }} 
                            className={`p-4 rounded-lg border text-left ${winTask.isGolden ? 'border-amber-400 bg-amber-500/20' : allCategories[winTask.category]?.border || defaultCategories['General'].border} ${!winTask.isGolden && (allCategories[winTask.category]?.bg || defaultCategories['General'].bg)}`}
                        >
                            <p className="font-bold text-[var(--color-text-primary)]">{winTask.text}</p>
                            <div className="flex items-start gap-3 mt-2 text-[var(--color-text-primary)]/80">
                                <QuoteIcon className="w-5 h-5 flex-shrink-0 mt-1 opacity-50" /> 
                                <p className="italic">{winTask.win}</p>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <p className="text-[var(--color-text-secondary)]">Complete high-priority tasks to record your wins here.</p>
                )}
            </div>
        </motion.div>
    );
};

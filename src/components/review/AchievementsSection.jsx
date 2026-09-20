import React from 'react';
import { achievementsList } from '../../utils/constants';
import { TrophyIcon } from '../common/Icons';

/**
 * AchievementsSection
 * Grid of unlockable trophies and milestones.
 */
export const AchievementsSection = ({ achievements = [] }) => {
    return (
        <div className="text-left p-5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl shadow-lg">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[var(--color-text-primary)] flex items-center gap-2">
                    <span className="text-amber-400">🏆</span> Achievements
                </h3>
                <span className="text-xs px-2.5 py-1 rounded-full bg-amber-400/10 text-amber-300 font-mono font-semibold border border-amber-400/20">
                    {achievements.length} / {achievementsList.length} Unlocked
                </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {achievementsList.map(ach => {
                    const isUnlocked = achievements.includes(ach.id);
                    return (
                        <div 
                            key={ach.id} 
                            className={`p-3.5 rounded-xl text-center transition-all ${
                                isUnlocked 
                                    ? 'bg-amber-400/10 border border-amber-400/30 shadow-sm' 
                                    : 'bg-[var(--color-bg)]/40 border border-white/5 opacity-50'
                            }`}
                        >
                            <TrophyIcon className={`w-8 h-8 mx-auto mb-2 ${isUnlocked ? 'text-amber-400 aura-glow' : 'text-slate-500'}`} />
                            <p className={`font-semibold text-xs ${isUnlocked ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-secondary)]'}`}>
                                {ach.title}
                            </p>
                            <p className="text-[10px] text-[var(--color-text-secondary)] mt-1 leading-snug">
                                {ach.description}
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

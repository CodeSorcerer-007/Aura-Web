import React from 'react';
import { motion } from 'framer-motion';
import { QuoteIcon } from '../common/Icons';
import { defaultCategories } from '../../utils/constants';

export const AccomplishmentJournal = ({ wins = [], allCategories = {} }) => {
    return (
        <div className="mt-8 text-left">
            <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                <span>🏆</span>
                <span>Accomplishment Journal</span>
            </h3>
            <div className="space-y-3">
                {wins.length > 0 ? (
                    wins.map((winTask, i) => (
                        <motion.div
                            key={winTask.id || i}
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.08 }}
                            className={`p-4 rounded-2xl border text-left backdrop-blur-sm shadow-sm ${
                                winTask.isGolden
                                    ? 'border-amber-400/60 bg-amber-500/15'
                                    : allCategories[winTask.category]?.border || defaultCategories['General']?.border || 'border-[var(--color-border)]'
                            } ${!winTask.isGolden && (allCategories[winTask.category]?.bg || defaultCategories['General']?.bg || 'bg-[var(--color-bg-secondary)]')}`}
                        >
                            <p className="font-bold text-sm text-[var(--color-text-primary)]">{winTask.text}</p>
                            <div className="flex items-start gap-2.5 mt-2 text-[var(--color-text-primary)]/80 text-xs">
                                <QuoteIcon className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-50" />
                                <p className="italic leading-relaxed">{winTask.win}</p>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <p className="text-xs text-[var(--color-text-secondary)] italic">
                        Complete high-priority tasks to record your proudest moments in this mindful journal.
                    </p>
                )}
            </div>
        </div>
    );
};

export default AccomplishmentJournal;

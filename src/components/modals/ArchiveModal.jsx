import React from 'react';
import { motion } from 'framer-motion';
import { formatDate } from '../../utils/dateUtils';
import { XIcon } from '../common/Icons';

export const ArchiveModal = ({ isOpen, onClose, archivedTasks, onRestore, onDelete }) => {
    if (!isOpen) return null;

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[60] flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6"
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Archived Tasks</h2>
                    <button onClick={onClose}>
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                    {archivedTasks.length > 0 ? (
                        archivedTasks.map(task => (
                            <div key={task.id} className="p-3 bg-[var(--color-bg)] rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="line-through text-white/80">{task.text}</p>
                                    <p className="text-xs text-[var(--color-text-secondary)]">
                                        Completed: {formatDate(task.completionDate)}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onRestore(task.id)} 
                                        className="text-emerald-400 hover:text-emerald-500 text-sm font-medium"
                                    >
                                        Restore
                                    </button>
                                    <button 
                                        onClick={() => onDelete(task.id)} 
                                        className="text-rose-400 hover:text-rose-500 text-sm font-medium"
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-[var(--color-text-secondary)] py-4 text-center">Your archive is empty.</p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

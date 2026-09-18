import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { XIcon } from '../common/Icons';

export const SearchModal = ({ isOpen, onClose, tasks, onTaskClick }) => {
    const [searchTerm, setSearchTerm] = useState('');
    
    const filteredTasks = useMemo(() => {
        if (!searchTerm) return [];
        return tasks.filter(task => 
            task.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
            task.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (task.notes && task.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (task.tags && task.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
        );
    }, [searchTerm, tasks]);
    
    if (!isOpen) return null;
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 p-4 pt-20"
        >
            <div className="w-full max-w-xl mx-auto">
                <div className="flex items-center gap-2 mb-4">
                    <input 
                        type="text" 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search tasks, categories, or @tags..."
                        className="w-full bg-[var(--color-bg-input)] text-lg p-3 rounded-full border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                        autoFocus
                    />
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                        <XIcon className="w-8 h-8"/>
                    </button>
                </div>
                <div className="space-y-2 max-h-[70vh] overflow-y-auto">
                    {filteredTasks.map(task => (
                        <div 
                            key={task.id} 
                            onClick={() => onTaskClick(task.id)} 
                            className="p-3 bg-[var(--color-bg-secondary)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-secondary-hover)]"
                        >
                            <p>{task.text}</p>
                            <p className="text-xs text-[var(--color-text-secondary)]">{task.category}</p>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );
};

import React from 'react';
import { motion } from 'framer-motion';

export const DependencySelectorModal = ({ isOpen, onClose, currentTaskId, tasks, onSelect }) => {
    if (!isOpen) return null;

    // Avoid circular dependencies (direct or transitive cycle detection)
    const wouldCreateCycle = (candidateId) => {
        const visited = new Set();
        let curr = candidateId;
        while (curr) {
            if (curr === currentTaskId) return true;
            if (visited.has(curr)) break;
            visited.add(curr);
            const parentTask = tasks.find(t => t.id === curr);
            curr = parentTask?.dependsOn;
        }
        return false;
    };

    const potentialDependencies = tasks.filter(task => 
        !task.completed && 
        !task.isArchived &&
        task.id !== currentTaskId &&
        !wouldCreateCycle(task.id)
    );

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
                className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6"
            >
                <h2 className="text-xl font-bold mb-4">Select Prerequisite Task</h2>
                <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                    {potentialDependencies.length > 0 ? (
                        potentialDependencies.map(task => (
                            <div 
                                key={task.id} 
                                role="button"
                                tabIndex={0}
                                onClick={() => onSelect(task.id)} 
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onSelect(task.id);
                                    }
                                }}
                                className="p-3 bg-[var(--color-bg)] rounded-lg cursor-pointer hover:bg-[var(--color-bg-secondary-hover)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)]"
                            >
                                <p>{task.text}</p>
                            </div>
                        ))
                    ) : (
                        <p className="text-sm text-[var(--color-text-secondary)]">No available tasks to depend on.</p>
                    )}
                </div>
                <button onClick={onClose} className="w-full bg-[var(--color-bg-secondary-hover)] py-2 rounded-lg">Cancel</button>
            </motion.div>
        </motion.div>
    );
};

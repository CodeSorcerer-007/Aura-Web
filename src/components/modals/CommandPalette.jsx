import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

export const CommandPalette = ({ isOpen, onClose, commands = [], tasks = [], onTaskSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    // Reset on open during render transition
    const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
    if (prevIsOpen !== isOpen) {
        setPrevIsOpen(isOpen);
        if (isOpen) {
            setSearchTerm('');
            setSelectedIndex(0);
        }
    }

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 50);
        }
    }, [isOpen]);

    const term = searchTerm.trim().toLowerCase();

    const filteredCommands = useMemo(() => {
        if (!term) return commands;
        return commands.filter(cmd => cmd.label.toLowerCase().includes(term));
    }, [term, commands]);

    const filteredTasks = useMemo(() => {
        if (!term) return [];
        return tasks.filter(t => 
            !t.isArchived && (
                t.text.toLowerCase().includes(term) ||
                (t.category && t.category.toLowerCase().includes(term)) ||
                (t.tags && t.tags.some(tag => tag.toLowerCase().includes(term))) ||
                (t.notes && t.notes.toLowerCase().includes(term))
            )
        ).slice(0, 6);
    }, [term, tasks]);

    const combinedItems = useMemo(() => {
        const items = [];
        filteredCommands.forEach(cmd => {
            items.push({
                id: `cmd_${cmd.label}`,
                type: 'command',
                label: cmd.label,
                shortcut: cmd.shortcut,
                action: () => { cmd.action(); onClose(); }
            });
        });
        filteredTasks.forEach(task => {
            items.push({
                id: `task_${task.id}`,
                type: 'task',
                label: task.text,
                category: task.category,
                completed: task.completed,
                action: () => { onTaskSelect?.(task.id); onClose(); }
            });
        });
        return items;
    }, [filteredCommands, filteredTasks, onTaskSelect, onClose]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setSelectedIndex(0);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => (i + 1) % Math.max(1, combinedItems.length));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => (i - 1 + Math.max(1, combinedItems.length)) % Math.max(1, combinedItems.length));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const item = combinedItems[selectedIndex];
            if (item) {
                item.action();
            }
        }
    };

    useEffect(() => {
        const activeEl = document.getElementById(`cmd-item-${selectedIndex}`);
        if (typeof activeEl?.scrollIntoView === 'function') {
            activeEl.scrollIntoView({ block: 'nearest' });
        }
    }, [selectedIndex]);

    if (!isOpen) return null;
    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/80 backdrop-blur-lg z-[70] p-4 pt-20" 
            onClick={onClose}
        >
            <motion.div 
                initial={{ y: -40, scale: 0.96 }} 
                animate={{ y: 0, scale: 1 }} 
                exit={{ y: -40, scale: 0.96 }} 
                className="w-full max-w-xl mx-auto bg-[var(--color-bg-secondary)] border border-white/10 rounded-2xl shadow-2xl overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center px-4 py-3 border-b border-white/10 gap-2">
                    <span className="text-white/40 text-sm">🔍</span>
                    <input 
                        ref={inputRef}
                        type="text" 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        role="combobox"
                        aria-expanded="true"
                        aria-haspopup="listbox"
                        aria-autocomplete="list"
                        aria-controls="command-palette-list"
                        aria-activedescendant={combinedItems.length > 0 ? `cmd-item-${selectedIndex}` : undefined}
                        placeholder="Type a command, task title, @tag, or #category..."
                        className="w-full bg-transparent text-sm sm:text-base text-[var(--color-text-primary)] focus:outline-none placeholder:text-white/30"
                    />
                    <span className="text-[10px] text-white/30 font-mono border border-white/10 px-1.5 py-0.5 rounded">ESC</span>
                </div>

                <div 
                    id="command-palette-list"
                    role="listbox"
                    aria-label="Commands and tasks"
                    className="max-h-[55vh] overflow-y-auto p-1.5 space-y-1"
                >
                    {combinedItems.length > 0 ? (
                        combinedItems.map((item, index) => {
                            const isSelected = selectedIndex === index;
                            return (
                                <div 
                                    key={item.id} 
                                    id={`cmd-item-${index}`}
                                    role="option"
                                    aria-selected={isSelected}
                                    onClick={item.action}
                                    className={`p-2.5 rounded-xl text-xs sm:text-sm cursor-pointer flex justify-between items-center transition-all ${
                                        isSelected 
                                            ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] font-medium border border-[var(--color-accent)]/30' 
                                            : 'hover:bg-white/[0.04] text-[var(--color-text-primary)]/80'
                                    }`}
                                >
                                    <div className="flex items-center gap-2 truncate pr-2">
                                        {item.type === 'command' ? (
                                            <span className="text-white/40 text-xs">⚡</span>
                                        ) : (
                                            <span className={`text-xs ${item.completed ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                {item.completed ? '✓' : '○'}
                                            </span>
                                        )}
                                        <span className="truncate">{item.label}</span>
                                        {item.category && (
                                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/[0.06] text-white/50">
                                                {item.category}
                                            </span>
                                        )}
                                    </div>
                                    {item.shortcut && (
                                        <span className="text-[10px] font-mono text-white/40 border border-white/10 px-1.5 py-0.5 rounded">
                                            {item.shortcut}
                                        </span>
                                    )}
                                </div>
                            );
                        })
                    ) : (
                        <p className="p-4 text-xs text-center text-[var(--color-text-secondary)]">
                            No matching commands or tasks found.
                        </p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

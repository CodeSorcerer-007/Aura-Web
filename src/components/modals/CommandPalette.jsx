import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';

export const CommandPalette = ({ isOpen, onClose, commands }) => {
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

    const filteredCommands = useMemo(() => {
        if (!searchTerm) return commands;
        return commands.filter(cmd => cmd.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [searchTerm, commands]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setSelectedIndex(0);
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(i => (i + 1) % filteredCommands.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(i => (i - 1 + filteredCommands.length) % filteredCommands.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const command = filteredCommands[selectedIndex];
            if (command) {
                command.action();
                onClose();
            }
        }
    };

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
                initial={{ y: -50, scale: 0.95 }} 
                animate={{ y: 0, scale: 1 }} 
                exit={{ y: -50, scale: 0.95 }} 
                className="w-full max-w-xl mx-auto bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-xl shadow-2xl overflow-hidden" 
                onClick={(e) => e.stopPropagation()}
            >
                <input 
                    ref={inputRef}
                    type="text" 
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onKeyDown={handleKeyDown}
                    placeholder="Type a command or search..."
                    className="w-full bg-transparent text-lg p-4 focus:outline-none"
                />
                <div className="border-t border-[var(--color-border)] max-h-[50vh] overflow-y-auto">
                    {filteredCommands.length > 0 ? (
                        filteredCommands.map((cmd, index) => (
                            <div 
                                key={cmd.label} 
                                onClick={() => { cmd.action(); onClose(); }}
                                className={`p-3 text-sm cursor-pointer flex justify-between items-center ${selectedIndex === index ? 'bg-[var(--color-accent)]/20 text-[var(--color-accent)]' : 'hover:bg-[var(--color-bg-secondary-hover)]'}`}
                            >
                                <span>{cmd.label}</span>
                                <span className="text-xs text-[var(--color-text-secondary)]">{cmd.shortcut}</span>
                            </div>
                        ))
                    ) : (
                        <p className="p-3 text-sm text-[var(--color-text-secondary)]">No commands found.</p>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

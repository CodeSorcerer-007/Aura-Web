import React, { useState } from 'react';
import { motion } from 'framer-motion';

export const ThemeCreatorModal = ({ isOpen, onClose, onSave }) => {
    const [name, setName] = useState('');
    const [colors, setColors] = useState({
        bg: '#000000',
        bgSecondary: '#1f2937',
        textPrimary: '#f9fafb',
        textSecondary: '#9ca3af',
        accent: '#2dd4bf',
    });

    if (!isOpen) return null;

    const handleSave = () => {
        if (!name.trim()) return;
        onSave({ id: name.toLowerCase().replace(/\s+/g, '_'), name, ...colors });
        onClose();
    };

    const colorVars = [
        { key: 'bg', label: 'Background' },
        { key: 'bgSecondary', label: 'Secondary BG' },
        { key: 'textPrimary', label: 'Primary Text' },
        { key: 'textSecondary', label: 'Secondary Text' },
        { key: 'accent', label: 'Accent' },
    ];

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
                <h2 className="text-xl font-bold mb-4">Create a Theme</h2>
                <input 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Theme Name"
                    className="w-full bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-4"
                />
                <div className="grid grid-cols-2 gap-4 mb-6">
                    {colorVars.map(({ key, label }) => (
                        <div key={key} className="flex items-center justify-between bg-[var(--color-bg)] p-2 rounded-lg">
                            <label htmlFor={key} className="text-sm">{label}</label>
                            <input
                                id={key}
                                type="color"
                                value={colors[key]}
                                onChange={(e) => setColors(c => ({ ...c, [key]: e.target.value }))}
                                className="w-8 h-8 rounded-md border-none bg-transparent cursor-pointer"
                            />
                        </div>
                    ))}
                </div>
                <div className="flex gap-4">
                    <button onClick={onClose} className="w-full bg-[var(--color-bg-secondary-hover)] py-2 rounded-lg">Cancel</button>
                    <button onClick={handleSave} className="w-full bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 rounded-lg">Save</button>
                </div>
            </motion.div>
        </motion.div>
    );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { defaultCategories } from '../../utils/constants';
import {
    XIcon,
    PaintbrushIcon,
    DownloadIcon,
    UploadIcon,
    ArchiveIcon
} from '../common/Icons';

export const SettingsModal = ({
    isOpen,
    onClose,
    theme,
    setTheme,
    customCategories,
    onUpdateCustomCategories,
    onOpenThemeCreator,
    allThemes,
    shutdownTime,
    onSetShutdownTime,
    soundEffectsEnabled,
    onSetSoundEffectsEnabled,
    onOpenArchive,
    autoArchiveEnabled,
    onSetAutoArchiveEnabled,
    onExport,
    onTriggerImport,
    notificationsEnabled,
    onSetNotificationsEnabled
}) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    if (!isOpen) return null;
    
    const addCategory = () => {
        if (newCategoryName && !customCategories[newCategoryName] && !defaultCategories[newCategoryName]) {
            const newCat = {
                bg: 'bg-gray-500/30',
                border: 'border-gray-400/50',
                text: 'text-gray-200',
                solid: 'bg-gray-500',
                glowColor: '#9ca3af'
            };
            onUpdateCustomCategories({ ...customCategories, [newCategoryName]: newCat });
            setNewCategoryName('');
        }
    };
    
    const removeCategory = (name) => {
        const { [name]: _, ...remaining } = customCategories;
        onUpdateCustomCategories(remaining);
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
        >
            <motion.div 
                initial={{ scale: 0.9, y: 20 }} 
                animate={{ scale: 1, y: 0 }} 
                className="w-full max-w-md bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 overflow-y-auto max-h-[90vh]"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[var(--color-text-primary)]">Settings</h2>
                    <button onClick={onClose} className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]">
                        <XIcon className="w-6 h-6"/>
                    </button>
                </div>
                
                <div className="mb-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Theme</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                        {allThemes.map(t => (
                            <button 
                                key={t.id} 
                                onClick={() => setTheme(t.id)} 
                                className={`w-full p-1 rounded-lg border-2 ${theme === t.id ? 'border-[var(--color-accent)]' : 'border-transparent'}`}
                            >
                                <div className={`w-full h-12 ${t.bg} rounded-md flex items-center justify-center ${t.text} text-xs font-semibold text-center`}>
                                    {t.name}
                                </div>
                            </button>
                        ))}
                        <button onClick={onOpenThemeCreator} className="w-full p-1 rounded-lg border-2 border-transparent">
                            <div className={`w-full h-12 bg-[var(--color-bg)] rounded-md flex items-center justify-center text-[var(--color-text-secondary)] text-xs font-semibold border-2 border-dashed border-[var(--color-border)] hover:border-[var(--color-accent)]`}>
                                <PaintbrushIcon className="w-5 h-5"/>
                            </div>
                        </button>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">General</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between bg-[var(--color-bg)] p-3 rounded-lg">
                            <span>Enable Sound Effects</span>
                            <button 
                                onClick={() => onSetSoundEffectsEnabled(!soundEffectsEnabled)} 
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${soundEffectsEnabled ? 'bg-[var(--color-accent)]' : 'bg-gray-500'}`}
                            >
                                <motion.div layout className={`w-4 h-4 bg-white rounded-full ${soundEffectsEnabled ? 'ml-auto' : ''}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between bg-[var(--color-bg)] p-3 rounded-lg">
                            <span>Auto-archive yesterday's tasks</span>
                            <button 
                                onClick={() => onSetAutoArchiveEnabled(!autoArchiveEnabled)} 
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${autoArchiveEnabled ? 'bg-[var(--color-accent)]' : 'bg-gray-500'}`}
                            >
                                <motion.div layout className={`w-4 h-4 bg-white rounded-full ${autoArchiveEnabled ? 'ml-auto' : ''}`} />
                            </button>
                        </div>
                        <div className="flex items-center justify-between bg-[var(--color-bg)] p-3 rounded-lg">
                            <span>Enable Desktop Notifications</span>
                            <button 
                                onClick={() => onSetNotificationsEnabled(!notificationsEnabled)} 
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${notificationsEnabled ? 'bg-[var(--color-accent)]' : 'bg-gray-500'}`}
                            >
                                <motion.div layout className={`w-4 h-4 bg-white rounded-full ${notificationsEnabled ? 'ml-auto' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Custom Categories</h3>
                    <div className="flex gap-2 mb-2">
                        <input 
                            type="text" 
                            value={newCategoryName}
                            onChange={(e) => setNewCategoryName(e.target.value)}
                            placeholder="New category name..."
                            className="w-full bg-[var(--color-bg)] text-sm p-2 rounded-md border border-[var(--color-border)] focus:ring-2 focus:ring-[var(--color-accent)]"
                        />
                        <button onClick={addCategory} className="bg-[var(--color-accent)] text-black font-semibold px-4 rounded-md">Add</button>
                    </div>
                    <div className="space-y-2 max-h-24 overflow-y-auto">
                        {Object.keys(customCategories).map(catName => (
                            <div key={catName} className="flex justify-between items-center bg-[var(--color-bg)] p-2 rounded-md">
                                <span>{catName}</span>
                                <button onClick={() => removeCategory(catName)} className="text-rose-400 hover:text-rose-600">
                                    <XIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Productivity</h3>
                    <div className="flex items-center justify-between bg-[var(--color-bg)] p-3 rounded-lg">
                        <label htmlFor="shutdownTime">End of Day Time</label>
                        <input 
                            type="time"
                            id="shutdownTime"
                            value={shutdownTime}
                            onChange={e => onSetShutdownTime(e.target.value)}
                            className="bg-transparent border-none text-[var(--color-text-primary)] focus:outline-none"
                        />
                    </div>
                </div>

                <div>
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Data Management</h3>
                    <div className="flex gap-2">
                        <button onClick={onExport} className="w-full flex items-center justify-center gap-2 bg-[var(--color-bg)] p-3 rounded-lg hover:bg-[var(--color-bg-secondary-hover)]">
                            <DownloadIcon className="w-5 h-5"/> Export
                        </button>
                        <button onClick={onTriggerImport} className="w-full flex items-center justify-center gap-2 bg-[var(--color-bg)] p-3 rounded-lg hover:bg-[var(--color-bg-secondary-hover)]">
                            <UploadIcon className="w-5 h-5"/> Import
                        </button>
                    </div>
                    <button onClick={onOpenArchive} className="w-full flex items-center justify-center gap-2 bg-[var(--color-bg)] p-3 rounded-lg mt-3 hover:bg-[var(--color-bg-secondary-hover)]">
                        <ArchiveIcon className="w-5 h-5"/> View Archive
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

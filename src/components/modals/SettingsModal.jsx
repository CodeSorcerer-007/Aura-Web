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
import { ShieldCheck, HardDrive, RotateCcw, Clock, Sparkles } from 'lucide-react';
import { DataVaultHealthWidget } from '../common/DataVaultHealthWidget';

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
    onSetNotificationsEnabled,
    alwaysFullScreen = false,
    onSetAlwaysFullScreen = () => {},
    onTestShutdownReminder,
    onSaveSafetyVault,
    onRestoreSnapshot,
    getRollingSnapshots
}) => {
    const [newCategoryName, setNewCategoryName] = useState('');
    const [showSnapshots, setShowSnapshots] = useState(false);
    const [showWhatsNew, setShowWhatsNew] = useState(false);

    const snapshots = getRollingSnapshots ? getRollingSnapshots() : [];

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
                    <div className="flex items-center gap-3">
                        <img src="/Aura_logo.png" alt="Aura" className="w-8 h-8 rounded-xl object-contain shadow-md border border-white/10" />
                        <div>
                            <h2 className="text-xl font-bold text-[var(--color-text-primary)] leading-tight">Settings</h2>
                            <p className="text-[10px] text-[var(--color-text-secondary)] font-mono">Aura v1.2.0 • Offline Sanctuary</p>
                        </div>
                    </div>
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
                        <div className="flex items-center justify-between bg-[var(--color-bg)] p-3 rounded-lg">
                            <div>
                                <span className="font-medium text-sm text-[var(--color-text-primary)]">Always Full Screen Mode</span>
                                <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">Automatically open and expand into full screen browser mode</p>
                            </div>
                            <button 
                                onClick={() => {
                                    const next = !alwaysFullScreen;
                                    onSetAlwaysFullScreen(next);
                                    if (next && !document.fullscreenElement) {
                                        document.documentElement?.requestFullscreen?.().catch(() => {});
                                    } else if (!next && document.fullscreenElement) {
                                        document.exitFullscreen?.().catch(() => {});
                                    }
                                }} 
                                className={`w-12 h-6 rounded-full p-1 transition-colors cursor-pointer ${alwaysFullScreen ? 'bg-[var(--color-accent)]' : 'bg-gray-500'}`}
                                aria-label="Toggle always full screen mode"
                            >
                                <motion.div layout className={`w-4 h-4 bg-white rounded-full ${alwaysFullScreen ? 'ml-auto' : ''}`} />
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
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Productivity & Evening Ritual</h3>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between bg-[var(--color-bg)] p-3 rounded-lg">
                            <div>
                                <label htmlFor="shutdownTime" className="block text-sm font-medium">End of Day Time</label>
                                <span className="text-[11px] text-[var(--color-text-secondary)]">Target wind-down time</span>
                            </div>
                            <input 
                                type="time"
                                id="shutdownTime"
                                value={shutdownTime}
                                onChange={e => onSetShutdownTime(e.target.value)}
                                className="bg-transparent border border-white/10 rounded-lg px-2 py-1 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]"
                            />
                        </div>

                        <div className="bg-[var(--color-bg)] p-3 rounded-lg flex items-center justify-between">
                            <div>
                                <p className="text-xs font-medium text-[var(--color-text-primary)]">Web Push Evening Reminders</p>
                                <p className="text-[11px] text-[var(--color-text-secondary)]">
                                    Sends a tranquil browser notification at {shutdownTime} to close out your day.
                                </p>
                            </div>
                            {onTestShutdownReminder && (
                                <button
                                    type="button"
                                    onClick={onTestShutdownReminder}
                                    className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 transition-colors whitespace-nowrap"
                                >
                                    Test Reminder
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3 flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" />
                            <span>Offline Sanctuary & Vault</span>
                        </span>
                        <span className="text-[11px] font-mono text-emerald-300/80 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            {snapshots.length} Recovery Points
                        </span>
                    </h3>
                    <div className="bg-[var(--color-bg)] p-3 rounded-lg space-y-3">
                        <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--color-text-secondary)]">Storage Engine</span>
                            <span className="text-emerald-300 font-medium font-mono flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                100% Offline Vault
                            </span>
                        </div>

                        {/* Data Vault Health Widget */}
                        <DataVaultHealthWidget snapshotsCount={snapshots.length} />

                        <div className="flex items-center justify-between text-xs">
                            <span className="text-[var(--color-text-secondary)]">Rolling Snapshots</span>
                            <button
                                type="button"
                                onClick={() => setShowSnapshots(!showSnapshots)}
                                className="text-cyan-300 hover:text-cyan-200 text-xs font-medium underline flex items-center gap-1 cursor-pointer"
                            >
                                <Clock className="w-3 h-3" />
                                <span>{showSnapshots ? 'Hide History' : 'View History'}</span>
                            </button>
                        </div>

                        {showSnapshots && (
                            <div className="space-y-1.5 pt-2 border-t border-white/5 max-h-36 overflow-y-auto">
                                {snapshots.length === 0 ? (
                                    <p className="text-[11px] text-white/40 italic">Daily snapshots are created automatically.</p>
                                ) : (
                                    snapshots.map(s => (
                                        <div key={s.id} className="flex items-center justify-between p-1.5 rounded-md bg-white/[0.03] text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <Clock className="w-3 h-3 text-cyan-400" />
                                                <span className="font-mono text-[11px] text-white/80">{s.date}</span>
                                                <span className="text-[10px] text-white/40">({s.taskCount} tasks)</span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm(`Restore data snapshot from ${s.date}?`)) {
                                                        onRestoreSnapshot(s.id);
                                                    }
                                                }}
                                                className="px-2 py-0.5 text-[10px] rounded bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-400/30 flex items-center gap-1 transition-colors cursor-pointer"
                                            >
                                                <RotateCcw className="w-2.5 h-2.5" />
                                                Restore
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between">
                            <p className="text-[11px] text-[var(--color-text-secondary)]">
                                Save permanent safety vault file to your PC:
                            </p>
                            {onSaveSafetyVault && (
                                <button
                                    type="button"
                                    onClick={onSaveSafetyVault}
                                    className="px-3 py-1 text-xs rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-400/30 flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
                                >
                                    <HardDrive className="w-3.5 h-3.5" />
                                    Save Vault (.json)
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                <div className="mb-6">
                    <h3 className="font-semibold text-[var(--color-text-primary)] mb-3">Data Management</h3>
                    <div className="flex gap-2">
                        <button onClick={onExport} className="w-full flex items-center justify-center gap-2 bg-[var(--color-bg)] p-3 rounded-lg hover:bg-[var(--color-bg-secondary-hover)] cursor-pointer">
                            <DownloadIcon className="w-5 h-5"/> Export
                        </button>
                        <button onClick={onTriggerImport} className="w-full flex items-center justify-center gap-2 bg-[var(--color-bg)] p-3 rounded-lg hover:bg-[var(--color-bg-secondary-hover)] cursor-pointer">
                            <UploadIcon className="w-5 h-5"/> Import
                        </button>
                    </div>
                    <button onClick={onOpenArchive} className="w-full flex items-center justify-center gap-2 bg-[var(--color-bg)] p-3 rounded-lg mt-3 hover:bg-[var(--color-bg-secondary-hover)] cursor-pointer">
                        <ArchiveIcon className="w-5 h-5"/> View Archive
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            if (window.confirm('Clear all tasks to start with a fresh, empty workspace?')) {
                                localStorage.setItem('aura-tasks', JSON.stringify([]));
                                window.location.reload();
                            }
                        }}
                        className="w-full flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/20 p-2.5 rounded-lg mt-3 text-xs font-semibold cursor-pointer transition-all"
                    >
                        <RotateCcw className="w-3.5 h-3.5" /> Clear All Tasks (Start Fresh)
                    </button>
                </div>

                {/* What's New & Changelog Section */}
                <div className="border-t border-white/10 pt-5">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-[var(--color-text-primary)] flex items-center gap-2 text-sm">
                            <Sparkles className="w-4 h-4 text-amber-400" />
                            <span>What's New in Aura v1.1.0</span>
                        </h3>
                        <button
                            type="button"
                            onClick={() => setShowWhatsNew(!showWhatsNew)}
                            className="text-xs text-[var(--color-accent)] hover:underline cursor-pointer"
                        >
                            {showWhatsNew ? 'Collapse Notes' : 'Release Notes'}
                        </button>
                    </div>
                    <p className="text-[11px] text-[var(--color-text-secondary)] mb-3">
                        Edition: Harmonic Architecture & Mindful Depth
                    </p>

                    {showWhatsNew && (
                        <div className="p-3 bg-[var(--color-bg)] rounded-xl border border-white/5 space-y-2.5 text-xs">
                            <div className="space-y-1">
                                <span className="font-bold text-teal-300 flex items-center gap-1.5">
                                    <span>🌿</span> Botanical Grove & Tree Renderer
                                </span>
                                <p className="text-[11px] text-[var(--color-text-secondary)] pl-5">
                                    Modular SVG tree renderers (Oak, Cherry, Pine, Bonsai, Willow), weather rain toggle, and accomplishment wins journal.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                                    <span>🌌</span> Cosmic Constellations
                                </span>
                                <p className="text-[11px] text-[var(--color-text-secondary)] pl-5">
                                    Multi-ring gravitational orbits, physics-based stellar filaments, and zoom magnification.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="font-bold text-amber-300 flex items-center gap-1.5">
                                    <span>🧘</span> Advanced Mindful Minute Breathing
                                </span>
                                <p className="text-[11px] text-[var(--color-text-secondary)] pl-5">
                                    Box 4-4-4-4, Relax 4-7-8, and Energize 2-1-2-1 breathing rhythms with persistent session tracking.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="font-bold text-sky-300 flex items-center gap-1.5">
                                    <span>⚡</span> Real-time Natural Language Preview
                                </span>
                                <p className="text-[11px] text-[var(--color-text-secondary)] pl-5">
                                    Smart syntax chip preview for #category, !priority, ~energy, @tag, and ~due dates while typing.
                                </p>
                            </div>

                            <div className="space-y-1">
                                <span className="font-bold text-emerald-300 flex items-center gap-1.5">
                                    <span>🛡️</span> Zero-Knowledge Air-Gapped Sanctuary
                                </span>
                                <p className="text-[11px] text-[var(--color-text-secondary)] pl-5">
                                    Automated rolling snapshots, JSON safety vault exports, and 100% offline client storage.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
};

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Cloud, RefreshCw, KeyRound, LogOut, UserCheck } from 'lucide-react';

export const UserProfileMenu = ({ onTriggerSync }) => {
    const {
        user,
        isAuthenticated,
        isGuest,
        syncStatus,
        lastSyncedAt,
        logout,
        openEntrance,
        setIsChangePasswordOpen
    } = useAuth();

    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const formatSyncTime = (iso) => {
        if (!iso) return 'Just now';
        try {
            const d = new Date(iso);
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return 'Recently';
        }
    };

    if (!isAuthenticated && isGuest) {
        return (
            <button
                type="button"
                onClick={openEntrance}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-500/15 hover:bg-purple-500/25 border border-purple-400/30 text-purple-200 text-xs font-medium transition-all shadow-sm shadow-purple-900/20 group"
                title="Sign in to sync your data anywhere"
            >
                <Cloud className="w-3.5 h-3.5 text-purple-300 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Cloud Sync</span>
            </button>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="relative" ref={menuRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.06] hover:bg-white/[0.1] border border-white/10 text-white text-xs font-medium transition-all"
            >
                <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center text-[9px] font-bold text-white shadow-sm">
                    {user?.username?.charAt(0).toUpperCase()}
                </div>
                <span className="hidden sm:inline font-mono text-[11px] text-purple-200">
                    @{user?.username}
                </span>
                
                {/* Sync status beacon */}
                {syncStatus === 'syncing' ? (
                    <RefreshCw className="w-3 h-3 text-cyan-400 animate-spin" />
                ) : syncStatus === 'offline' ? (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" title="Offline" />
                ) : (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" title="Synced" />
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-60 p-3 rounded-2xl bg-[#131722]/95 border border-white/10 shadow-2xl backdrop-blur-2xl text-left z-50 text-white"
                    >
                        {/* User info */}
                        <div className="pb-2.5 mb-2.5 border-b border-white/10">
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-purple-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white shadow-md">
                                    {user?.username?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="text-xs font-semibold text-white">@{user?.username}</p>
                                    <p className="text-[10px] text-white/50 flex items-center gap-1">
                                        <UserCheck className="w-3 h-3 text-emerald-400" />
                                        Cloud Connected
                                    </p>
                                </div>
                            </div>

                            {/* Sync Status Banner */}
                            <div className="mt-2.5 p-2 rounded-xl bg-white/[0.04] border border-white/5 flex items-center justify-between text-[11px]">
                                <span className="text-white/60">Last synced:</span>
                                <span className="font-mono text-purple-300">
                                    {formatSyncTime(lastSyncedAt)}
                                </span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-1">
                            {onTriggerSync && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        onTriggerSync();
                                        setIsOpen(false);
                                    }}
                                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                                >
                                    <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
                                    <span>Sync Cloud Now</span>
                                </button>
                            )}

                            <button
                                type="button"
                                onClick={() => {
                                    setIsChangePasswordOpen(true);
                                    setIsOpen(false);
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                            >
                                <KeyRound className="w-3.5 h-3.5 text-purple-400" />
                                <span>Change Password</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => {
                                    setIsOpen(false);
                                    logout();
                                }}
                                className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-300 hover:text-rose-200 hover:bg-rose-500/10 transition-colors"
                            >
                                <LogOut className="w-3.5 h-3.5" />
                                <span>Sign Out</span>
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

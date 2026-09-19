import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { KeyRound, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export const ChangePasswordModal = () => {
    const { isChangePasswordOpen, setIsChangePasswordOpen, changePassword } = useAuth();

    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (!isChangePasswordOpen) return null;

    const handleClose = () => {
        setIsChangePasswordOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setSuccess('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!currentPassword || !newPassword) {
            setError('Please fill in all fields');
            return;
        }

        if (newPassword.length < 6) {
            setError('New password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('New passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await changePassword(currentPassword, newPassword);
            setSuccess('Password updated successfully!');
            setTimeout(() => {
                handleClose();
            }, 1200);
        } catch (err) {
            setError(err.message || 'Failed to update password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="w-full max-w-sm p-6 rounded-3xl bg-[#131722]/90 border border-white/10 shadow-2xl backdrop-blur-xl text-white"
            >
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                    <div className="flex items-center gap-2">
                        <KeyRound className="w-5 h-5 text-purple-400" />
                        <h2 className="text-base font-semibold">Change Password</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        className="text-white/50 hover:text-white text-sm"
                    >
                        ✕
                    </button>
                </div>

                {error && (
                    <div className="mb-3 p-2.5 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0" />
                        <span>{error}</span>
                    </div>
                )}

                {success && (
                    <div className="mb-3 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>{success}</span>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
                            Current Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                            <input
                                type="password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
                            New Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Min 6 characters"
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
                            Confirm New Password
                        </label>
                        <div className="relative">
                            <Lock className="w-4 h-4 text-white/40 absolute left-3 top-2.5" />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Repeat new password"
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60"
                            />
                        </div>
                    </div>

                    <div className="pt-2 flex gap-2">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="flex-1 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-medium transition-colors disabled:opacity-50"
                        >
                            {isLoading ? 'Updating...' : 'Save Password'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, KeyRound, User, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, Compass, HelpCircle, CheckCircle2 } from 'lucide-react';

const SECURITY_QUESTIONS = [
    'What is your secret sanctuary or favorite peaceful place?',
    'What was the name of your first childhood pet?',
    'What book or philosophy has inspired you most?',
    'What is your favorite tea, coffee, or morning drink?',
    'What city or haven would you love to retreat to?'
];

export const EntrancePage = () => {
    const {
        isEntranceOpen,
        closeEntrance,
        login,
        register,
        continueAsGuest,
        getSecurityQuestion,
        resetPassword,
        isAuthenticated,
        isGuest
    } = useAuth();

    const [mode, setMode] = useState('login'); // 'login' | 'register' | 'forgot'
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    
    // Forgot Password & Security Question state
    const [securityQuestion, setSecurityQuestion] = useState(SECURITY_QUESTIONS[0]);
    const [securityAnswer, setSecurityAnswer] = useState('');
    const [forgotStep, setForgotStep] = useState(1); // 1: enter username, 2: answer question & reset
    const [retrievedQuestion, setRetrievedQuestion] = useState('');

    const [isLoading, setIsLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    if (!isEntranceOpen) return null;

    const clearMessages = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleSwitchMode = (newMode) => {
        clearMessages();
        setMode(newMode);
        setForgotStep(1);
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        clearMessages();
        if (!username.trim() || !password) {
            setErrorMessage('Please provide both username and password');
            return;
        }

        setIsLoading(true);
        try {
            await login(username.trim(), password);
        } catch (err) {
            setErrorMessage(err.message || 'Login failed. Please check your credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        clearMessages();
        if (!username.trim()) {
            setErrorMessage('Please choose a username (at least 3 characters)');
            return;
        }
        if (password.length < 6) {
            setErrorMessage('Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }
        if (!securityAnswer.trim()) {
            setErrorMessage('Please provide a recovery answer in case you forget your password');
            return;
        }

        setIsLoading(true);
        try {
            const finalQuestion = securityQuestion === 'custom' ? customQuestion : securityQuestion;
            await register(username.trim(), password, finalQuestion, securityAnswer.trim());
        } catch (err) {
            setErrorMessage(err.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFetchQuestion = async (e) => {
        e.preventDefault();
        clearMessages();
        if (!username.trim()) {
            setErrorMessage('Please enter your username to find your account');
            return;
        }

        setIsLoading(true);
        try {
            const res = await getSecurityQuestion(username.trim());
            setRetrievedQuestion(res.securityQuestion);
            setForgotStep(2);
        } catch (err) {
            setErrorMessage(err.message || 'No account found with this username');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        clearMessages();
        if (!securityAnswer.trim()) {
            setErrorMessage('Please enter the answer to your recovery question');
            return;
        }
        if (password.length < 6) {
            setErrorMessage('New password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            setErrorMessage('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            await resetPassword(username.trim(), securityAnswer.trim(), password);
            setSuccessMessage('Password reset successfully! You can now sign in.');
            setMode('login');
            setPassword('');
            setConfirmPassword('');
            setSecurityAnswer('');
        } catch (err) {
            setErrorMessage(err.message || 'Incorrect recovery answer');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto overflow-x-hidden select-none">
            {/* Live Animated Celestial Atmosphere */}
            <div className="absolute inset-0 bg-[#0a0d14]/90 backdrop-blur-2xl -z-10" />
            
            {/* Drifting Aura Glow Orbs */}
            <motion.div
                animate={{
                    scale: [1, 1.25, 1],
                    x: [0, 40, 0],
                    y: [0, -30, 0],
                    opacity: [0.35, 0.55, 0.35]
                }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-purple-600/25 blur-3xl -z-10 pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.3, 1],
                    x: [0, -40, 0],
                    y: [0, 40, 0],
                    opacity: [0.3, 0.5, 0.3]
                }}
                transition={{ duration: 16, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                className="absolute bottom-1/4 right-1/4 w-[28rem] h-[28rem] rounded-full bg-cyan-600/20 blur-3xl -z-10 pointer-events-none"
            />
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2]
                }}
                transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] rounded-full bg-emerald-500/15 blur-[100px] -z-10 pointer-events-none"
            />

            {/* Main Entrance Glass Card */}
            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.96 }}
                transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="relative w-full max-w-md my-8 p-8 rounded-3xl bg-white/[0.04] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)] backdrop-blur-xl text-white text-center"
            >
                {/* Close Button if already guest or authenticated */}
                {(isAuthenticated || isGuest) && (
                    <button
                        onClick={closeEntrance}
                        className="absolute top-5 right-5 text-xs text-white/50 hover:text-white px-2.5 py-1 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        ✕ Close
                    </button>
                )}

                {/* Aura Logo & Mindful Tagline */}
                <div className="flex flex-col items-center mb-6">
                    <motion.div 
                        animate={{ rotate: [0, 360] }}
                        transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
                        className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-500/30 via-indigo-500/20 to-cyan-400/30 border border-white/20 flex items-center justify-center shadow-lg shadow-purple-500/10 mb-3"
                    >
                        <Sparkles className="w-7 h-7 text-purple-300" />
                    </motion.div>
                    <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-purple-100 to-cyan-200 bg-clip-text text-transparent">
                        Aura
                    </h1>
                    <p className="text-xs text-purple-200/60 mt-1 font-light tracking-wide">
                        Mindful Productivity & Flow Sanctuary
                    </p>
                </div>

                {/* Mode Switcher Tabs */}
                {mode !== 'forgot' && (
                    <div className="grid grid-cols-2 gap-1 p-1 bg-white/5 border border-white/10 rounded-2xl mb-6">
                        <button
                            type="button"
                            onClick={() => handleSwitchMode('login')}
                            className={`py-2 text-xs font-medium rounded-xl transition-all ${
                                mode === 'login'
                                    ? 'bg-purple-500/30 text-white border border-purple-400/30 shadow-md shadow-purple-900/40'
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => handleSwitchMode('register')}
                            className={`py-2 text-xs font-medium rounded-xl transition-all ${
                                mode === 'register'
                                    ? 'bg-purple-500/30 text-white border border-purple-400/30 shadow-md shadow-purple-900/40'
                                    : 'text-white/60 hover:text-white'
                            }`}
                        >
                            Begin Journey
                        </button>
                    </div>
                )}

                {/* Status Messages */}
                {errorMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-xl bg-rose-500/20 border border-rose-500/30 text-rose-200 text-xs text-left flex items-start gap-2"
                    >
                        <span className="text-rose-400 font-bold">!</span>
                        <span>{errorMessage}</span>
                    </motion.div>
                )}

                {successMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-200 text-xs text-left flex items-start gap-2"
                    >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{successMessage}</span>
                    </motion.div>
                )}

                {/* FORM: Sign In */}
                {mode === 'login' && (
                    <form onSubmit={handleLogin} className="space-y-4 text-left">
                        <div>
                            <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1.5">
                                Username
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Enter your username"
                                    autoComplete="username"
                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    onClick={() => handleSwitchMode('forgot')}
                                    className="text-[11px] text-purple-300/80 hover:text-purple-200 hover:underline"
                                >
                                    Forgot Password?
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3.5 top-3.5 text-white/40 hover:text-white/80"
                                >
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 active:scale-[0.99] text-white font-medium text-sm shadow-lg shadow-purple-900/40 border border-purple-400/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Enter Sanctuary</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* FORM: Register / Begin Journey */}
                {mode === 'register' && (
                    <form onSubmit={handleRegister} className="space-y-3.5 text-left">
                        <div>
                            <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
                                Choose Username
                            </label>
                            <div className="relative">
                                <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3" />
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Your preferred handle"
                                    autoComplete="username"
                                    className="w-full pl-10 pr-4 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60 focus:ring-2 focus:ring-purple-500/20 transition-all"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
                                    Password
                                </label>
                                <div className="relative">
                                    <Lock className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 6 chars"
                                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60 transition-all"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
                                    Confirm
                                </label>
                                <div className="relative">
                                    <ShieldCheck className="w-4 h-4 text-white/40 absolute left-3 top-3" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat"
                                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security Question for Password Recovery */}
                        <div>
                            <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1 flex items-center justify-between">
                                <span>Recovery Security Question</span>
                                <HelpCircle className="w-3.5 h-3.5 text-purple-300/60" />
                            </label>
                            <select
                                value={securityQuestion}
                                onChange={(e) => setSecurityQuestion(e.target.value)}
                                className="w-full px-3 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white text-xs focus:outline-none focus:border-purple-400/60 transition-all mb-2"
                            >
                                {SECURITY_QUESTIONS.map((q, i) => (
                                    <option key={i} value={q} className="bg-[#121622] text-white">
                                        {q}
                                    </option>
                                ))}
                            </select>

                            <input
                                type="text"
                                value={securityAnswer}
                                onChange={(e) => setSecurityAnswer(e.target.value)}
                                placeholder="Your secret answer (e.g. Kyoto, Earl Grey...)"
                                className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60 transition-all"
                            />
                            <p className="text-[10px] text-white/40 mt-1">
                                Used to recover your account if you ever forget your password.
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-600 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 active:scale-[0.99] text-white font-medium text-sm shadow-lg shadow-teal-900/40 border border-teal-400/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Create Sanctuary Account</span>
                                    <Sparkles className="w-4 h-4" />
                                </>
                            )}
                        </button>
                    </form>
                )}

                {/* FORM: Forgot Password Recovery */}
                {mode === 'forgot' && (
                    <div className="space-y-4 text-left">
                        <div className="flex items-center justify-between pb-1 border-b border-white/10">
                            <h3 className="text-sm font-semibold text-purple-200 flex items-center gap-1.5">
                                <KeyRound className="w-4 h-4 text-purple-400" />
                                Account Recovery
                            </h3>
                            <button
                                type="button"
                                onClick={() => handleSwitchMode('login')}
                                className="text-xs text-white/50 hover:text-white"
                            >
                                Back to Sign In
                            </button>
                        </div>

                        {forgotStep === 1 ? (
                            <form onSubmit={handleFetchQuestion} className="space-y-4">
                                <p className="text-xs text-white/60">
                                    Enter your username to retrieve your security question.
                                </p>
                                <div>
                                    <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1.5">
                                        Username
                                    </label>
                                    <div className="relative">
                                        <User className="w-4 h-4 text-white/40 absolute left-3.5 top-3.5" />
                                        <input
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            placeholder="Enter your account username"
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60 transition-all"
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-sm transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Checking...' : 'Continue'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword} className="space-y-3.5">
                                <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20">
                                    <span className="block text-[10px] text-purple-300/80 uppercase font-semibold">Security Question:</span>
                                    <p className="text-xs text-white font-medium mt-0.5">{retrievedQuestion}</p>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
                                        Your Answer
                                    </label>
                                    <input
                                        type="text"
                                        value={securityAnswer}
                                        onChange={(e) => setSecurityAnswer(e.target.value)}
                                        placeholder="Enter the answer you chose"
                                        className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
                                        New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder="Min 6 characters"
                                        className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-medium text-white/70 uppercase tracking-wider mb-1">
                                        Confirm New Password
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Repeat new password"
                                        className="w-full px-3.5 py-2 rounded-xl bg-white/[0.06] border border-white/10 text-white placeholder-white/30 text-sm focus:outline-none focus:border-purple-400/60 transition-all"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white font-medium text-sm transition-all disabled:opacity-50"
                                >
                                    {isLoading ? 'Resetting Password...' : 'Reset & Save Password'}
                                </button>
                            </form>
                        )}
                    </div>
                )}

                {/* Divider & Guest Fallback */}
                <div className="mt-6 pt-5 border-t border-white/10 flex flex-col items-center">
                    <button
                        type="button"
                        onClick={continueAsGuest}
                        className="group flex items-center gap-2 text-xs text-purple-200/70 hover:text-white px-4 py-2 rounded-full hover:bg-white/5 transition-all"
                    >
                        <Compass className="w-3.5 h-3.5 group-hover:rotate-45 transition-transform" />
                        <span>Continue Offline as Guest</span>
                    </button>
                    <p className="text-[10px] text-white/40 mt-1">
                        Local storage mode. You can sign in or sync to the cloud anytime.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayDateString, formatLocalDate } from '../../utils/dateUtils';
import { SparklesIcon } from '../common/Icons';
import { EmptyState } from '../common/EmptyState';

const JOURNAL_PROMPTS = [
    "What went well today?",
    "What am I grateful for?",
    "What was the biggest challenge?",
    "One thing I learned today is...",
    "How can I make tomorrow better?"
];

const MOOD_OPTIONS = [
    { id: 'calm', emoji: '😌', label: 'Calm', glow: '#38bdf8' },
    { id: 'energized', emoji: '⚡', label: 'Energized', glow: '#fbbf24' },
    { id: 'focused', emoji: '🎯', label: 'Focused', glow: '#34d399' },
    { id: 'grateful', emoji: '🌸', label: 'Grateful', glow: '#f472b6' },
    { id: 'reflective', emoji: '🌙', label: 'Reflective', glow: '#a78bfa' },
    { id: 'weary', emoji: '🍵', label: 'Restful', glow: '#94a3b8' }
];

export const JournalView = ({ journalEntries = [], setJournalEntries, completedTasks = [] }) => {
    const todayStr = getTodayDateString();
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [entryContent, setEntryContent] = useState('');
    const [selectedMood, setSelectedMood] = useState(null);
    const [isSaved, setIsSaved] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechError, setSpeechError] = useState(null);

    const recognitionRef = useRef(null);

    // Synchronize content and mood when selected date changes
    useEffect(() => {
        const entry = journalEntries.find(e => e.date === selectedDate);
        const timer = setTimeout(() => {
            setEntryContent(entry?.content || '');
            setSelectedMood(entry?.mood || null);
        }, 0);
        return () => clearTimeout(timer);
    }, [selectedDate, journalEntries]);

    // Generate past 7 days for the quick calendar strip
    const calendarStripDays = useMemo(() => {
        const days = [];
        const base = new Date();
        for (let i = 6; i >= 0; i--) {
            const d = new Date(base);
            d.setDate(base.getDate() - i);
            const dateStr = formatLocalDate(d);
            const hasEntry = journalEntries.some(e => e.date === dateStr && e.content?.trim());
            const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
            const dayNum = d.getDate();
            days.push({ dateStr, dayName, dayNum, hasEntry });
        }
        return days;
    }, [journalEntries]);

    // Journal Analytics and Mood Sparkline
    const statsSummary = useMemo(() => {
        let totalWords = 0;
        journalEntries.forEach(e => {
            if (e.content) {
                totalWords += e.content.trim().split(/\s+/).filter(Boolean).length;
            }
        });

        const weeklyMoods = calendarStripDays.map(d => {
            const entry = journalEntries.find(e => e.date === d.dateStr);
            const moodObj = MOOD_OPTIONS.find(m => m.id === entry?.mood);
            return {
                dateStr: d.dateStr,
                dayName: d.dayName,
                mood: moodObj || null
            };
        });

        return {
            totalEntries: journalEntries.length,
            totalWords,
            weeklyMoods
        };
    }, [journalEntries, calendarStripDays]);

    // Clean up recognition on unmount
    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch {
                    // Ignore
                }
            }
        };
    }, []);

    const handleSave = () => {
        const existingIndex = journalEntries.findIndex(entry => entry.date === selectedDate);
        const entryData = {
            date: selectedDate,
            content: entryContent,
            mood: selectedMood,
            updatedAt: new Date().toISOString()
        };

        if (existingIndex > -1) {
            const newEntries = [...journalEntries];
            newEntries[existingIndex] = entryData;
            setJournalEntries(newEntries);
        } else {
            setJournalEntries([...journalEntries, entryData]);
        }
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const addPrompt = (prompt) => {
        setEntryContent(prev => {
            const separator = prev.trim().length > 0 ? '\n\n' : '';
            return prev + `${separator}**${prompt}**\n`;
        });
    };

    // Auto-populate completed daily wins into the journal entry
    const handleInsertDailyWins = () => {
        const tasksForDate = completedTasks.filter(t => t.completionDate === selectedDate);
        if (tasksForDate.length === 0) return;

        const winsText = tasksForDate.map(t => `- ${t.text}`).join('\n');
        setEntryContent(prev => {
            const separator = prev.trim().length > 0 ? '\n\n' : '';
            return `${prev}${separator}### 🏆 Daily Victories (${tasksForDate.length})\n${winsText}\n`;
        });
    };

    const toggleVoiceDictation = () => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechError("Speech recognition is not supported in this browser. You can type freely instead.");
            setTimeout(() => setSpeechError(null), 4000);
            return;
        }

        if (isListening) {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
            setIsListening(false);
            return;
        }

        try {
            setSpeechError(null);
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = false;
            recognition.lang = 'en-US';

            recognition.onstart = () => {
                setIsListening(true);
            };

            recognition.onresult = (event) => {
                let transcript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        transcript += event.results[i][0].transcript + ' ';
                    }
                }
                if (transcript.trim()) {
                    setEntryContent(prev => {
                        const needsSpace = prev.length > 0 && !prev.endsWith(' ') && !prev.endsWith('\n');
                        return prev + (needsSpace ? ' ' : '') + transcript.trim();
                    });
                }
            };

            recognition.onerror = (event) => {
                console.warn('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    setSpeechError("Microphone permission was denied.");
                } else if (event.error !== 'no-speech') {
                    setSpeechError(`Voice error: ${event.error}`);
                }
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognitionRef.current = recognition;
            recognition.start();
        } catch (err) {
            console.error('Failed to initialize speech recognition:', err);
            setSpeechError("Could not start microphone.");
            setIsListening(false);
        }
    };

    const tasksForSelectedDate = completedTasks.filter(t => t.completionDate === selectedDate);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.5 }} 
            className="max-w-4xl mx-auto pb-28 sm:pb-36"
        >
            {/* Header & Date Strip */}
            <div className="text-center mb-6">
                <h2 className="text-3xl sm:text-4xl font-extrabold text-[var(--color-text-primary)] mb-2 font-display">
                    Mindful Journal
                </h2>
                <p className="text-xs sm:text-sm text-[var(--color-text-secondary)] mb-5 italic max-w-sm mx-auto">
                    Cultivate gratitude, celebrate daily victories, and archive clarity.
                </p>

                {/* 7-Day Quick Calendar Strip */}
                <div className="flex items-center justify-center gap-2 max-w-md mx-auto p-1.5 aura-glass-subtle rounded-2xl mb-4">
                    {calendarStripDays.map(d => {
                        const isSelected = selectedDate === d.dateStr;
                        return (
                            <button
                                key={d.dateStr}
                                type="button"
                                onClick={() => setSelectedDate(d.dateStr)}
                                aria-label={`${d.dayName} ${d.dayNum}`}
                                aria-current={isSelected ? 'date' : undefined}
                                className={`flex-1 flex flex-col items-center py-2 px-1 rounded-xl transition-all relative ${
                                    isSelected 
                                        ? 'bg-[var(--color-accent)] text-black font-bold shadow-lg scale-105' 
                                        : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-white/5'
                                }`}
                            >
                                <span className="text-[10px] uppercase tracking-wider font-semibold opacity-80">
                                    {d.dayName}
                                </span>
                                <span className="text-sm font-bold font-mono">
                                    {d.dayNum}
                                </span>
                                {d.hasEntry && (
                                    <span className={`w-1 h-1 rounded-full mt-0.5 ${isSelected ? 'bg-black' : 'bg-[var(--color-accent)]'}`} />
                                )}
                            </button>
                        );
                    })}
                </div>

                <div className="inline-flex items-center gap-2">
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => setSelectedDate(e.target.value)}
                        aria-label="Pick journal date"
                        className="bg-[var(--color-bg-secondary)]/80 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-xs font-mono cursor-pointer text-[var(--color-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
                    />
                </div>

                {/* Journal Quick Metrics Ribbon */}
                <div className="flex items-center justify-center flex-wrap gap-2.5 mt-3 text-xs text-[var(--color-text-secondary)]">
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono flex items-center gap-1.5">
                        <span>📖</span>
                        <span>{statsSummary.totalEntries} {statsSummary.totalEntries === 1 ? 'reflection' : 'reflections'}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono flex items-center gap-1.5">
                        <span>✍️</span>
                        <span>{statsSummary.totalWords.toLocaleString()} words penned</span>
                    </span>
                </div>
            </div>

            {/* Mood Selector Row */}
            <div className="mb-6 max-w-2xl mx-auto aura-glass-card rounded-2xl p-3.5 border border-white/10">
                <div className="flex items-center justify-between mb-2 px-1">
                    <span className="text-xs uppercase font-bold tracking-wider text-[var(--color-text-secondary)]">
                        Daily Resonance & Mood
                    </span>
                    {selectedMood && (
                        <span className="text-xs font-medium text-[var(--color-accent)] capitalize">
                            Feeling {selectedMood}
                        </span>
                    )}
                </div>
                <div className="flex items-center justify-between gap-1.5 sm:gap-2 flex-wrap">
                    {MOOD_OPTIONS.map(m => {
                        const isChosen = selectedMood === m.id;
                        return (
                            <button
                                key={m.id}
                                type="button"
                                onClick={() => setSelectedMood(isChosen ? null : m.id)}
                                aria-pressed={isChosen}
                                className={`flex-1 min-w-[58px] sm:min-w-[70px] py-1.5 px-2 rounded-xl text-xs font-medium transition-all flex flex-col items-center gap-0.5 border ${
                                    isChosen
                                        ? 'bg-white/15 border-white/30 text-[var(--color-text-primary)] shadow-md scale-105'
                                        : 'bg-white/5 border-transparent text-[var(--color-text-secondary)] hover:bg-white/10 hover:text-[var(--color-text-primary)]'
                                }`}
                            >
                                <span className="text-lg">{m.emoji}</span>
                                <span className="text-[10px] tracking-tight">{m.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    <div className="aura-glass-card rounded-2xl p-4 border border-white/10 space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-primary)]/80">
                                Guided Prompts
                            </h3>
                            <div className="flex items-center gap-2">
                                {tasksForSelectedDate.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={handleInsertDailyWins}
                                        className="text-xs px-3 py-1 rounded-full border border-amber-400/30 bg-amber-400/10 text-amber-300 hover:bg-amber-400/20 transition-all flex items-center gap-1 font-medium active:scale-95"
                                        title="Automatically format and insert tasks completed on this date"
                                    >
                                        <SparklesIcon className="w-3.5 h-3.5" />
                                        <span>Insert Wins ({tasksForSelectedDate.length})</span>
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={toggleVoiceDictation}
                                    className={`text-xs px-3 py-1 rounded-full border transition-all flex items-center gap-1.5 font-medium ${
                                        isListening
                                            ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm animate-pulse'
                                            : 'bg-white/5 text-[var(--color-text-secondary)] border-white/10 hover:text-amber-300 hover:bg-white/10'
                                    }`}
                                    title="Whisper Voice Journaling"
                                >
                                    <span>🎙️</span>
                                    <span>{isListening ? 'Listening...' : 'Voice Note'}</span>
                                </button>
                            </div>
                        </div>

                        {speechError && (
                            <p className="text-xs text-rose-400">{speechError}</p>
                        )}

                        <div className="flex flex-wrap gap-1.5">
                            {JOURNAL_PROMPTS.map(prompt => (
                                <button 
                                    key={prompt} 
                                    type="button"
                                    onClick={() => addPrompt(prompt)} 
                                    className="text-xs bg-white/5 hover:bg-white/10 px-3 py-1 rounded-full transition-all border border-white/5 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:border-white/20 active:scale-95"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="relative aura-glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        <textarea 
                            value={entryContent}
                            onChange={(e) => setEntryContent(e.target.value)}
                            placeholder={isListening ? "Listening to your voice... speak freely." : "How was your day? What thoughts are asking to be heard?"}
                            aria-label="Journal entry content"
                            className={`w-full h-80 bg-transparent text-[var(--color-text-primary)] p-5 focus:outline-none leading-relaxed text-sm sm:text-base resize-none ${
                                isListening ? 'ring-2 ring-rose-400/40' : ''
                            }`}
                        />
                        {isListening && (
                            <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-black/60 px-2.5 py-1 rounded-full border border-rose-500/30 backdrop-blur-md">
                                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                                <span className="text-[10px] text-rose-300 uppercase tracking-widest font-mono font-bold">Transcribing</span>
                            </div>
                        )}
                        <div className="flex justify-between items-center px-5 py-3 border-t border-white/5 bg-white/5">
                            <span className="text-xs text-[var(--color-text-secondary)]/60 font-mono">
                                {entryContent.trim().length > 0 ? `${entryContent.trim().split(/\s+/).length} words` : 'Empty sanctuary'}
                            </span>
                            <div className="flex items-center gap-3">
                                <AnimatePresence>
                                    {isSaved && (
                                        <motion.span 
                                            initial={{ opacity: 0, x: 10 }} 
                                            animate={{ opacity: 1, x: 0 }} 
                                            exit={{ opacity: 0 }} 
                                            className="text-xs text-emerald-400 font-bold"
                                        >
                                            ✨ Safely Preserved
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                                <button 
                                    type="button"
                                    onClick={handleSave} 
                                    className="bg-[var(--color-accent)] text-black font-bold text-xs sm:text-sm px-5 py-2 rounded-xl shadow-lg hover:brightness-110 transition-all active:scale-95"
                                >
                                    Preserve Entry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Day's Harvest & Mood Trail */}
                <div className="space-y-4">
                    {/* 7-Day Mood Resonance Trail */}
                    <div className="aura-glass-card rounded-2xl p-4 border border-white/10">
                        <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-primary)]/80 mb-3">
                            7-Day Mood Trail
                        </h3>
                        <div className="grid grid-cols-7 gap-1 text-center">
                            {statsSummary.weeklyMoods.map((m, idx) => (
                                <div 
                                    key={idx} 
                                    className={`p-2 rounded-xl border flex flex-col items-center gap-1 transition-all ${
                                        m.dateStr === selectedDate 
                                            ? 'bg-white/15 border-white/30 shadow-xs' 
                                            : 'bg-white/5 border-transparent'
                                    }`}
                                    title={`${m.dayName}: ${m.mood ? m.mood.label : 'Unrecorded'}`}
                                >
                                    <span className="text-[10px] uppercase font-semibold text-[var(--color-text-secondary)]">
                                        {m.dayName}
                                    </span>
                                    <span className="text-base">
                                        {m.mood ? m.mood.emoji : '·'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="aura-glass-card rounded-2xl p-4 border border-white/10">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-bold text-xs uppercase tracking-wider text-[var(--color-text-primary)]/80">
                                Harvested Wins
                            </h3>
                            <span className="text-xs font-mono text-[var(--color-accent)] font-semibold">
                                {tasksForSelectedDate.length} tasks
                            </span>
                        </div>
                        <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                            {tasksForSelectedDate.length > 0 ? (
                                tasksForSelectedDate.map(task => (
                                    <div 
                                        key={task.id} 
                                        className="p-3 rounded-xl bg-white/5 text-xs text-[var(--color-text-primary)] border border-white/5 flex items-start gap-2"
                                    >
                                        <span className="text-teal-400 font-bold mt-0.5">✓</span>
                                        <span className="leading-snug">{task.text}</span>
                                    </div>
                                ))
                            ) : (
                                <EmptyState
                                    icon="🌱"
                                    title="Restful Day"
                                    description="No tasks marked complete. Rest and stillness nurture the seeds of tomorrow."
                                    compact={true}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

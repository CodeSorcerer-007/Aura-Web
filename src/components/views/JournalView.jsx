import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayDateString, formatLocalDate } from '../../utils/dateUtils';
import { JournalCalendarStrip } from '../journal/JournalCalendarStrip';
import { JournalMoodSelector, MOOD_OPTIONS } from '../journal/JournalMoodSelector';
import { JournalPromptCards } from '../journal/JournalPromptCards';
import { JournalVictoriesList } from '../journal/JournalVictoriesList';

export const JournalView = ({ journalEntries = [], setJournalEntries, completedTasks = [] }) => {
    const todayStr = getTodayDateString();
    const [selectedDate, setSelectedDate] = useState(todayStr);
    const [entryContent, setEntryContent] = useState(() => {
        const entry = journalEntries.find(e => e.date === todayStr);
        return entry?.content || '';
    });
    const [selectedMood, setSelectedMood] = useState(() => {
        const entry = journalEntries.find(e => e.date === todayStr);
        return entry?.mood || null;
    });
    const [isSaved, setIsSaved] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [speechError, setSpeechError] = useState(null);

    const recognitionRef = useRef(null);
    const prevDateRef = useRef(selectedDate);
    const isDirtyRef = useRef(false);

    // In-Progress Overwrite Protection: If a user is actively writing and background
    // state changes (e.g. snapshot vaulting, auto-archive), protect the in-progress draft from
    // being clobbered unless the user explicitly switches the selectedDate.
    useEffect(() => {
        const isDateChange = prevDateRef.current !== selectedDate;
        if (isDateChange) {
            prevDateRef.current = selectedDate;
            isDirtyRef.current = false;
            const entry = journalEntries.find(e => e.date === selectedDate);
            setEntryContent(entry?.content || '');
            setSelectedMood(entry?.mood || null);
            return;
        }

        // Same date: only update if user hasn't made unsaved keystrokes on the current date
        if (!isDirtyRef.current) {
            const entry = journalEntries.find(e => e.date === selectedDate);
            setEntryContent(entry?.content || '');
            setSelectedMood(entry?.mood || null);
        }
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
                } catch {}
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
        isDirtyRef.current = false;
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const addPrompt = (prompt) => {
        isDirtyRef.current = true;
        setEntryContent(prev => {
            const separator = prev.trim().length > 0 ? '\n\n' : '';
            return prev + `${separator}**${prompt}**\n`;
        });
    };

    // Tasks completed on the currently inspected journal date
    const tasksForSelectedDate = useMemo(() => {
        return completedTasks.filter(t => {
            if (!t.completionDate) return false;
            return t.completionDate === selectedDate || t.completionDate.startsWith(selectedDate);
        });
    }, [completedTasks, selectedDate]);

    // Auto-populate completed daily wins into the journal entry
    const handleInsertDailyWins = () => {
        if (tasksForSelectedDate.length === 0) return;
        isDirtyRef.current = true;
        const winsText = tasksForSelectedDate.map(t => `- ${t.text}`).join('\n');
        setEntryContent(prev => {
            const separator = prev.trim().length > 0 ? '\n\n' : '';
            return `${prev}${separator}### 🏆 Daily Victories (${tasksForSelectedDate.length})\n${winsText}\n`;
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
                    isDirtyRef.current = true;
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
                <JournalCalendarStrip
                    calendarStripDays={calendarStripDays}
                    selectedDate={selectedDate}
                    onSelectDate={setSelectedDate}
                />

                <div className="flex items-center justify-center gap-3">
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
                        <span className="tabular-nums">{statsSummary.totalEntries} {statsSummary.totalEntries === 1 ? 'reflection' : 'reflections'}</span>
                    </span>
                    <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 font-mono flex items-center gap-1.5">
                        <span>✍️</span>
                        <span className="tabular-nums">{statsSummary.totalWords.toLocaleString()} words penned</span>
                    </span>
                </div>
            </div>

            {/* Mood Selector Row */}
            <JournalMoodSelector
                selectedMood={selectedMood}
                onSelectMood={(moodId) => {
                    isDirtyRef.current = true;
                    setSelectedMood(moodId);
                }}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                    {/* Guided Prompts */}
                    <div className="space-y-2">
                        <div className="flex justify-end">
                            <button
                                type="button"
                                onClick={toggleVoiceDictation}
                                className={`text-xs px-3 py-1.5 rounded-full border transition-all flex items-center gap-1.5 font-medium cursor-pointer ${
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
                        {speechError && (
                            <p className="text-xs text-rose-400">{speechError}</p>
                        )}
                        <JournalPromptCards
                            onAddPrompt={addPrompt}
                            onInsertWins={handleInsertDailyWins}
                            completedCount={tasksForSelectedDate.length}
                        />
                    </div>

                    {/* Journal Editor Box */}
                    <div className="relative aura-glass rounded-2xl border border-white/10 overflow-hidden shadow-2xl">
                        <textarea 
                            value={entryContent}
                            onChange={(e) => {
                                isDirtyRef.current = true;
                                setEntryContent(e.target.value);
                            }}
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
                                    className="bg-[var(--color-accent)] text-black font-bold text-xs sm:text-sm px-5 py-2 rounded-xl shadow-lg hover:brightness-110 transition-all active:scale-95 cursor-pointer"
                                >
                                    Preserve Entry
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Day's Harvest & Mood Trail */}
                <JournalVictoriesList
                    statsSummary={statsSummary}
                    selectedDate={selectedDate}
                    tasksForSelectedDate={tasksForSelectedDate}
                />
            </div>
        </motion.div>
    );
};

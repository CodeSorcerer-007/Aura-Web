import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getTodayDateString, formatDate } from '../../utils/dateUtils';

export const JournalView = ({ journalEntries, setJournalEntries, completedTasks }) => {
    const [selectedDate, setSelectedDate] = useState(getTodayDateString());
    const [entryContent, setEntryContent] = useState('');
    const [isSaved, setIsSaved] = useState(false);

    const journalPrompts = [
        "What went well today?",
        "What am I grateful for?",
        "What was the biggest challenge?",
        "One thing I learned today is...",
        "How can I make tomorrow better?"
    ];

    useEffect(() => {
        const content = journalEntries.find(entry => entry.date === selectedDate)?.content || '';
        setEntryContent(content);
    }, [journalEntries, selectedDate]);

    const handleSave = () => {
        const existingIndex = journalEntries.findIndex(entry => entry.date === selectedDate);
        if (existingIndex > -1) {
            const newEntries = [...journalEntries];
            newEntries[existingIndex] = { date: selectedDate, content: entryContent };
            setJournalEntries(newEntries);
        } else {
            setJournalEntries([...journalEntries, { date: selectedDate, content: entryContent }]);
        }
        setIsSaved(true);
        setTimeout(() => setIsSaved(false), 2000);
    };
    
    const addPrompt = (prompt) => {
        setEntryContent(prev => prev + `\n\n**${prompt}**\n`);
    };

    const tasksForSelectedDate = completedTasks.filter(t => t.completionDate === selectedDate);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.5 }} 
            className="max-w-4xl mx-auto"
        >
            <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-[var(--color-text-primary)] mb-2">Daily Journal</h2>
                <input 
                    type="date" 
                    value={selectedDate} 
                    onChange={(e) => setSelectedDate(e.target.value)}
                    className="bg-[var(--color-bg-secondary)] p-2 rounded-lg border border-[var(--color-border)] text-sm cursor-pointer"
                />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                    <div className="mb-4">
                        <h3 className="font-bold mb-2 text-sm text-[var(--color-text-primary)]/80">Prompts</h3>
                        <div className="flex flex-wrap gap-2">
                            {journalPrompts.map(prompt => (
                                <button 
                                    key={prompt} 
                                    onClick={() => addPrompt(prompt)} 
                                    className="text-xs bg-[var(--color-bg-secondary)] hover:bg-[var(--color-bg-secondary-hover)] px-3 py-1 rounded-full transition-colors border border-[var(--color-border)]"
                                >
                                    {prompt}
                                </button>
                            ))}
                        </div>
                    </div>
                    <textarea 
                        value={entryContent}
                        onChange={(e) => setEntryContent(e.target.value)}
                        placeholder="How was your day? What's on your mind?"
                        className="w-full h-96 bg-[var(--color-bg-secondary)] p-4 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] leading-relaxed"
                    />
                    <div className="flex justify-end items-center mt-3">
                        <AnimatePresence>
                            {isSaved && (
                                <motion.span 
                                    initial={{ opacity: 0 }} 
                                    animate={{ opacity: 1 }} 
                                    exit={{ opacity: 0 }} 
                                    className="text-sm text-emerald-400 mr-4 font-medium"
                                >
                                    Saved!
                                </motion.span>
                            )}
                        </AnimatePresence>
                        <button 
                            onClick={handleSave} 
                            className="bg-[var(--color-accent)] text-black font-semibold px-6 py-2 rounded-lg shadow-lg"
                        >
                            Save
                        </button>
                    </div>
                </div>
                <div>
                    <h3 className="font-bold mb-3 text-sm text-[var(--color-text-primary)]/80">Completed on {formatDate(selectedDate)}</h3>
                    <div className="space-y-2">
                        {tasksForSelectedDate.length > 0 ? tasksForSelectedDate.map(task => (
                            <div key={task.id} className="p-2.5 bg-[var(--color-bg)] rounded-md text-sm text-[var(--color-text-secondary)] border border-[var(--color-border)]">
                                {task.text}
                            </div>
                        )) : (
                            <p className="text-sm text-[var(--color-text-secondary)]">No tasks completed on this day.</p>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

import React, { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon } from './Icons';

export const CaptureInput = ({ onAddTask, onOpenBrainSweep, allTags = [] }) => {
    const [text, setText] = useState('');
    const [selectedEnergy, setSelectedEnergy] = useState(null); // null | 'spark' | 'flow' | 'rest'
    const [tagQuery, setTagQuery] = useState(null);
    const [tagStartIndex, setTagStartIndex] = useState(-1);
    const [selectedTagIndex, setSelectedTagIndex] = useState(0);
    const inputRef = useRef(null);

    // Detect @tag typing pattern
    const matchingTags = useMemo(() => {
        if (tagQuery === null) return [];
        const cleanQuery = tagQuery.toLowerCase();
        return allTags
            .filter(t => t && (cleanQuery === '' || t.toLowerCase().startsWith(cleanQuery)))
            .slice(0, 6);
    }, [tagQuery, allTags]);

    // Live smart syntax chips preview
    const parsedPreview = useMemo(() => {
        if (!text.trim()) return null;
        const catMatch = text.match(/#([a-zA-Z0-9_-]+)/);
        const tagsMatches = [...text.matchAll(/(?:^|\s)@([a-zA-Z0-9_-]+)/g)].map(m => m[1]);
        const isUrgent = text.toLowerCase().includes('!urgent') || text.toLowerCase().includes('!high');
        const energyMatch = text.match(/~(spark|flow|rest)/i) || (selectedEnergy ? [null, selectedEnergy] : null);
        const hasTomorrow = /\btomorrow\b/i.test(text);
        const hasToday = /\btoday\b/i.test(text);

        const chips = [];
        if (catMatch) chips.push({ id: `cat-${catMatch[1]}`, label: `#${catMatch[1]}`, color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' });
        if (isUrgent) chips.push({ id: 'prio-urgent', label: '!High Priority', color: 'bg-rose-500/20 text-rose-300 border-rose-400/30' });
        if (energyMatch) {
            const eVal = energyMatch[1].toLowerCase();
            const eLabel = eVal === 'spark' ? '⚡ Spark' : eVal === 'rest' ? '🍵 Rest' : '🌊 Flow';
            chips.push({ id: `energy-${eVal}`, label: eLabel, color: 'bg-amber-400/20 text-amber-300 border-amber-400/30' });
        }
        tagsMatches.forEach(t => {
            chips.push({ id: `tag-${t}`, label: `@${t}`, color: 'bg-purple-500/20 text-purple-300 border-purple-400/30' });
        });
        if (hasTomorrow) chips.push({ id: 'due-tomorrow', label: '📅 Tomorrow', color: 'bg-sky-500/20 text-sky-300 border-sky-400/30' });
        else if (hasToday) chips.push({ id: 'due-today', label: '📅 Today', color: 'bg-sky-500/20 text-sky-300 border-sky-400/30' });

        return chips.length > 0 ? chips : null;
    }, [text, selectedEnergy]);

    const handleTextChange = (e) => {
        const val = e.target.value;
        setText(val);

        const cursor = e.target.selectionStart;
        const textUpToCursor = val.slice(0, cursor);
        const match = textUpToCursor.match(/(?:^|\s)@([a-zA-Z0-9_-]*)$/);

        if (match) {
            const query = match[1];
            const start = match.index + (match[0].startsWith('@') ? 0 : 1);
            setTagQuery(query);
            setTagStartIndex(start);
            setSelectedTagIndex(0);
        } else {
            setTagQuery(null);
            setTagStartIndex(-1);
        }
    };

    const handleSelectTag = (tag) => {
        if (tagStartIndex === -1) return;
        const cursor = inputRef.current ? inputRef.current.selectionStart : text.length;
        const before = text.slice(0, tagStartIndex);
        const after = text.slice(cursor);
        const nextText = `${before}@${tag} ${after}`;
        setText(nextText);
        setTagQuery(null);
        setTagStartIndex(-1);

        setTimeout(() => {
            if (inputRef.current) {
                inputRef.current.focus();
                const newPos = before.length + tag.length + 2;
                inputRef.current.setSelectionRange(newPos, newPos);
            }
        }, 10);
    };

    const handleKeyDown = (e) => {
        if (matchingTags.length > 0) {
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                setSelectedTagIndex(i => (i + 1) % matchingTags.length);
                return;
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                setSelectedTagIndex(i => (i - 1 + matchingTags.length) % matchingTags.length);
                return;
            }
            if (e.key === 'Enter' || e.key === 'Tab') {
                if (matchingTags[selectedTagIndex]) {
                    e.preventDefault();
                    handleSelectTag(matchingTags[selectedTagIndex]);
                    return;
                }
            }
            if (e.key === 'Escape') {
                setTagQuery(null);
                return;
            }
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (matchingTags.length > 0 && tagQuery !== null) {
            handleSelectTag(matchingTags[selectedTagIndex]);
            return;
        }
        if (text.trim()) {
            let finalTaskText = text.trim();
            if (selectedEnergy && !finalTaskText.includes(`~${selectedEnergy}`)) {
                finalTaskText += ` ~${selectedEnergy}`;
            }
            onAddTask(finalTaskText);
            setText('');
            setSelectedEnergy(null);
            setTagQuery(null);
        }
    };

    return (
        <motion.div 
            initial={{ y: 100 }} 
            animate={{ y: 0 }} 
            transition={{ type: 'spring', stiffness: 120, damping: 20 }} 
            className="fixed bottom-0 left-0 right-0 pt-2 sm:pt-3 px-3 sm:px-4 pb-[calc(0.6rem+env(safe-area-inset-bottom))] sm:pb-[calc(1rem+env(safe-area-inset-bottom))] bg-gradient-to-t from-[var(--color-bg)] via-[var(--color-bg)]/95 to-transparent z-20 backdrop-blur-[4px]"
            role="region"
            aria-label="Quick Task Capture"
        >
            <div className="max-w-2xl mx-auto space-y-1.5 sm:space-y-2">
                {/* Micro Energy Selection Pills & Parsed Syntax Preview */}
                <div className="flex flex-col items-center justify-center gap-1.5 px-1 sm:px-2">
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                        <span className="text-[9px] sm:text-[10px] uppercase font-bold text-[var(--color-text-secondary)]/70 tracking-widest mr-0.5 sm:mr-1">
                            Bio-Energy:
                        </span>
                        <button
                            type="button"
                            onClick={() => setSelectedEnergy(selectedEnergy === 'spark' ? null : 'spark')}
                            aria-pressed={selectedEnergy === 'spark'}
                            className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border transition-all flex items-center gap-1 sm:gap-1.5 ${
                                selectedEnergy === 'spark'
                                    ? 'bg-amber-400 text-black border-amber-300 font-bold shadow-[0_0_12px_rgba(251,191,36,0.4)] scale-105'
                                    : 'bg-[var(--color-bg-secondary)]/60 text-[var(--color-text-secondary)] border-white/5 hover:border-amber-400/40 hover:text-amber-300'
                            }`}
                            title="Deep Focus / High Creative Spark (~spark)"
                        >
                            <span>⚡</span>
                            <span>Spark</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedEnergy(selectedEnergy === 'flow' ? null : 'flow')}
                            aria-pressed={selectedEnergy === 'flow'}
                            className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border transition-all flex items-center gap-1 sm:gap-1.5 ${
                                selectedEnergy === 'flow'
                                    ? 'bg-sky-400 text-black border-sky-300 font-bold shadow-[0_0_12px_rgba(56,189,248,0.4)] scale-105'
                                    : 'bg-[var(--color-bg-secondary)]/60 text-[var(--color-text-secondary)] border-white/5 hover:border-sky-400/40 hover:text-sky-300'
                            }`}
                            title="Steady Rhythm / Routine Flow (~flow)"
                        >
                            <span>🌊</span>
                            <span>Flow</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedEnergy(selectedEnergy === 'rest' ? null : 'rest')}
                            aria-pressed={selectedEnergy === 'rest'}
                            className={`text-[10px] sm:text-[11px] px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full border transition-all flex items-center gap-1 sm:gap-1.5 ${
                                selectedEnergy === 'rest'
                                    ? 'bg-emerald-400 text-black border-emerald-300 font-bold shadow-[0_0_12px_rgba(52,211,153,0.4)] scale-105'
                                    : 'bg-[var(--color-bg-secondary)]/60 text-[var(--color-text-secondary)] border-white/5 hover:border-emerald-400/40 hover:text-emerald-300'
                            }`}
                            title="Low Demand / Gentle Wind-down (~rest)"
                        >
                            <span>🍵</span>
                            <span>Rest</span>
                        </button>
                    </div>

                    {/* Inline syntax chips preview */}
                    <AnimatePresence>
                        {parsedPreview && (
                            <motion.div
                                initial={{ opacity: 0, y: -6, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: -6, scale: 0.95 }}
                                transition={{ duration: 0.2 }}
                                className="flex flex-wrap items-center justify-center gap-1 mt-0.5"
                                aria-label="Detected task attributes preview"
                            >
                                {parsedPreview.map(chip => (
                                    <span
                                        key={chip.id}
                                        className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-semibold shadow-xs ${chip.color}`}
                                    >
                                        {chip.label}
                                    </span>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <form onSubmit={handleSubmit} className="flex items-center gap-1.5 sm:gap-2">
                    <div className="relative flex-grow">
                        {/* Tag Autocomplete Popover */}
                        <AnimatePresence>
                            {matchingTags.length > 0 && tagQuery !== null && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    className="absolute bottom-full mb-2 left-0 right-0 p-2 aura-glass rounded-2xl border border-white/10 shadow-2xl z-30"
                                >
                                    <div className="space-y-0.5">
                                        {matchingTags.map((tag, idx) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    handleSelectTag(tag);
                                                }}
                                                className={`w-full text-left px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors ${
                                                    idx === selectedTagIndex
                                                        ? 'bg-purple-500/25 text-purple-200 border border-purple-400/40 shadow-sm'
                                                        : 'text-[var(--color-text-primary)] hover:bg-white/5 border border-transparent'
                                                }`}
                                            >
                                                <span className="flex items-center gap-1.5">
                                                    <span className="text-purple-400">@</span>
                                                    <span>{tag}</span>
                                                </span>
                                                {idx === selectedTagIndex && (
                                                    <span className="text-[10px] text-purple-300/80 font-mono">↵</span>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <input 
                            ref={inputRef}
                            type="text" 
                            value={text} 
                            onChange={handleTextChange} 
                            onKeyDown={handleKeyDown}
                            placeholder="Capture a thought... (@tag, #Category, !urgent, ~spark) (N)" 
                            aria-label="Capture a new task or thought"
                            enterKeyHint="done"
                            autoCapitalize="sentences"
                            autoComplete="off"
                            spellCheck="false"
                            className="w-full bg-[var(--color-bg-secondary)]/80 backdrop-blur-xl text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]/50 text-xs sm:text-base px-3.5 sm:px-5 py-2.5 sm:py-3.5 rounded-xl sm:rounded-2xl border border-white/10 focus:outline-none focus:border-[var(--color-accent)] focus:ring-2 focus:ring-[var(--color-accent)]/30 shadow-xl transition-all"
                        />
                    </div>
                    {onOpenBrainSweep && (
                        <button
                            type="button"
                            onClick={onOpenBrainSweep}
                            title="Zen Brain Sweep - Multi-line thought dump"
                            aria-label="Open Zen Brain Sweep multi-line dump"
                            className="bg-[var(--color-bg-secondary)]/80 hover:bg-[var(--color-bg-secondary-hover)] text-[var(--color-text-secondary)] hover:text-amber-300 p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all flex-shrink-0 border border-white/10 shadow-lg hover:border-amber-400/30 active:scale-95"
                        >
                            <span className="text-sm sm:text-base">💨</span>
                        </button>
                    )}
                    <button 
                        type="submit" 
                        aria-label="Add task"
                        className="bg-[var(--color-accent)] text-black p-2.5 sm:p-3.5 rounded-xl sm:rounded-2xl transition-all flex-shrink-0 shadow-[0_0_18px_rgba(52,211,153,0.35)] hover:shadow-[0_0_24px_rgba(52,211,153,0.55)] active:scale-95 font-semibold hover:brightness-110"
                    >
                        <PlusIcon className="w-4 h-4 sm:w-5 sm:h-5 stroke-[2.5]" />
                    </button>
                </form>
            </div>
        </motion.div>
    );
};

export default CaptureInput;

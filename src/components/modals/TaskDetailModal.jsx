import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFile } from '../../utils/db';
import { DependencySelectorModal } from './DependencySelectorModal';
import { XIcon, LinkIcon } from '../common/Icons';

export const TaskDetailModal = ({
    isOpen,
    onClose,
    task,
    onSave,
    onSetDependency,
    allTasks,
    onAddAttachment,
    onDeleteAttachment,
    onAddVoiceNote,
    onDeleteVoiceNote
}) => {
    const [text, setText] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');
    const [energy, setEnergy] = useState('flow');
    const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
    const [attachmentURLs, setAttachmentURLs] = useState({});
    const [voiceURLs, setVoiceURLs] = useState({});
    const [isRecording, setIsRecording] = useState(false);
    const [recordSeconds, setRecordSeconds] = useState(0);
    const [recordError, setRecordError] = useState(null);

    const fileInputRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioStreamRef = useRef(null);
    const audioChunksRef = useRef([]);
    const recordTimerRef = useRef(null);

    // Adjust form fields during render when task identity changes
    const [prevTaskId, setPrevTaskId] = useState(task?.id);
    if (task && prevTaskId !== task.id) {
        setPrevTaskId(task.id);
        setText(task.text);
        setNotes(task.notes || '');
        setTags((task.tags || []).join(', '));
        setEnergy(task.energy || 'flow');
    }

    useEffect(() => {
        if (task) {
            // Create Object URLs for attachments
            const fileUrls = {};
            const attachmentPromises = (task.attachments || []).map(async (att) => {
                const fileBlob = await getFile(att.id);
                if (fileBlob) {
                    fileUrls[att.id] = URL.createObjectURL(fileBlob);
                }
            });

            // Create Object URLs for voice notes
            const vUrls = {};
            const voicePromises = (task.voiceNotes || []).map(async (vn) => {
                const voiceBlob = await getFile(vn.id);
                if (voiceBlob) {
                    vUrls[vn.id] = URL.createObjectURL(voiceBlob);
                }
            });

            Promise.all([...attachmentPromises, ...voicePromises]).then(() => {
                setAttachmentURLs(fileUrls);
                setVoiceURLs(vUrls);
            });

            return () => {
                Object.values(fileUrls).forEach(URL.revokeObjectURL);
                Object.values(vUrls).forEach(URL.revokeObjectURL);
            };
        }
    }, [task]);

    // Clean up active recorder on unmount
    useEffect(() => {
        return () => {
            if (recordTimerRef.current) clearInterval(recordTimerRef.current);
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    if (!isOpen || !task) return null;

    const handleSave = () => {
        const newTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        onSave(task.id, text, notes, newTags, energy);
        onClose();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onAddAttachment(task.id, file);
        }
    };

    const startRecording = async () => {
        try {
            setRecordError(null);
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioStreamRef.current = stream;
            audioChunksRef.current = [];

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;

            recorder.ondataavailable = (event) => {
                if (event.data && event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            recorder.start(100);
            setIsRecording(true);
            setRecordSeconds(0);
            recordTimerRef.current = setInterval(() => {
                setRecordSeconds(s => s + 1);
            }, 1000);
        } catch (err) {
            console.error('Microphone access failed:', err);
            setRecordError('Microphone permission required for voice notes.');
        }
    };

    const stopRecording = (shouldSave = true) => {
        if (!mediaRecorderRef.current || !isRecording) return;

        clearInterval(recordTimerRef.current);
        const duration = recordSeconds;

        mediaRecorderRef.current.onstop = async () => {
            if (shouldSave && audioChunksRef.current.length > 0) {
                const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                if (onAddVoiceNote) {
                    await onAddVoiceNote(task.id, blob, duration);
                }
            }
            if (audioStreamRef.current) {
                audioStreamRef.current.getTracks().forEach(t => t.stop());
                audioStreamRef.current = null;
            }
            audioChunksRef.current = [];
        };

        mediaRecorderRef.current.stop();
        setIsRecording(false);
        setRecordSeconds(0);
    };

    const formatDuration = (secs) => {
        const m = Math.floor(secs / 60);
        const s = secs % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    const dependencyTask = task.dependsOn ? allTasks.find(t => t.id === task.dependsOn) : null;

    return (
        <>
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-black/80 backdrop-blur-lg z-50 flex items-center justify-center p-4"
            >
                <motion.div 
                    initial={{ scale: 0.9, y: 20 }} 
                    animate={{ scale: 1, y: 0 }} 
                    className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6 shadow-2xl"
                >
                    <input 
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-transparent text-xl font-bold mb-4 focus:outline-none text-[var(--color-text-primary)]"
                    />
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes, ideas, or reminders..."
                        className="w-full h-24 bg-[var(--color-bg)] text-[var(--color-text-primary)] p-3 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-4"
                    />
                    <input 
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Tags, comma separated (e.g. work, design)"
                        className="w-full bg-[var(--color-bg)] text-[var(--color-text-primary)] p-3 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-4"
                    />

                    {/* Bio-Energy Chronotype Selector */}
                    <div className="mb-4">
                        <label className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider block mb-2">
                            Bio-Energy Level
                        </label>
                        <div className="flex items-center gap-2">
                            <button
                                type="button"
                                onClick={() => setEnergy('spark')}
                                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                                    energy === 'spark'
                                        ? 'bg-amber-400 text-black border-amber-300 shadow-md ring-1 ring-amber-400'
                                        : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-amber-300'
                                }`}
                            >
                                <span>⚡</span>
                                <span>Deep Spark</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setEnergy('flow')}
                                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                                    energy === 'flow'
                                        ? 'bg-sky-400 text-black border-sky-300 shadow-md ring-1 ring-sky-400'
                                        : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-sky-300'
                                }`}
                            >
                                <span>🌊</span>
                                <span>Steady Flow</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setEnergy('rest')}
                                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                                    energy === 'rest'
                                        ? 'bg-emerald-400 text-black border-emerald-300 shadow-md ring-1 ring-emerald-400'
                                        : 'bg-[var(--color-bg)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-emerald-300'
                                }`}
                            >
                                <span>🍵</span>
                                <span>Gentle Rest</span>
                            </button>
                        </div>
                    </div>

                    {/* Voice Notes Section */}
                    <div className="mb-5 p-3.5 bg-[var(--color-bg)]/80 rounded-xl border border-[var(--color-border)]">
                        <div className="flex items-center justify-between mb-2.5">
                            <h3 className="font-semibold text-sm flex items-center gap-1.5 text-[var(--color-text-primary)]">
                                <span>🎙️</span> Voice Notes & Audio Memos
                            </h3>
                            <span className="text-xs text-[var(--color-text-secondary)]">
                                {(task.voiceNotes || []).length} recorded
                            </span>
                        </div>

                        {/* List of existing voice recordings */}
                        <div className="space-y-2 mb-3 max-h-36 overflow-y-auto pr-1">
                            {(task.voiceNotes || []).map(vn => (
                                <div key={vn.id} className="p-2.5 bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-lg flex flex-col gap-2 text-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 truncate">
                                            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                                            <span className="font-medium text-xs text-[var(--color-text-primary)] truncate">{vn.name || 'Voice Memo'}</span>
                                            {vn.duration ? (
                                                <span className="text-[10px] text-[var(--color-text-secondary)]">({formatDuration(vn.duration)})</span>
                                            ) : null}
                                        </div>
                                        {onDeleteVoiceNote && (
                                            <button 
                                                onClick={() => onDeleteVoiceNote(task.id, vn.id)} 
                                                className="text-rose-400 hover:text-rose-500 p-1 hover:bg-rose-500/10 rounded transition-colors"
                                                title="Delete voice note"
                                            >
                                                <XIcon className="w-3.5 h-3.5"/>
                                            </button>
                                        )}
                                    </div>
                                    {voiceURLs[vn.id] ? (
                                        <audio controls src={voiceURLs[vn.id]} className="w-full h-8 rounded mt-1" />
                                    ) : (
                                        <div className="text-[11px] text-[var(--color-text-secondary)] italic">Loading audio...</div>
                                    )}
                                </div>
                            ))}
                            {(!task.voiceNotes || task.voiceNotes.length === 0) && !isRecording && (
                                <p className="text-xs text-[var(--color-text-secondary)] py-1 italic">
                                    No voice notes yet. Record thoughts or instructions to hear while working.
                                </p>
                            )}
                        </div>

                        {/* Recording status & controls */}
                        {recordError && (
                            <p className="text-xs text-rose-400 mb-2">{recordError}</p>
                        )}

                        {isRecording ? (
                            <div className="flex items-center justify-between p-2.5 bg-rose-500/15 border border-rose-500/30 rounded-lg animate-pulse">
                                <div className="flex items-center gap-2">
                                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                                    <span className="text-xs font-semibold text-rose-300">
                                        Recording: {formatDuration(recordSeconds)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => stopRecording(false)} 
                                        className="text-xs px-2.5 py-1 text-slate-400 hover:text-white"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        onClick={() => stopRecording(true)} 
                                        className="text-xs bg-rose-500 hover:bg-rose-600 text-white font-semibold px-3 py-1.5 rounded-lg shadow"
                                    >
                                        Save Note
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <button 
                                onClick={startRecording}
                                className="w-full bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold py-2 rounded-lg border border-emerald-500/30 transition-colors flex items-center justify-center gap-2"
                            >
                                <span>🎙️</span> Record New Voice Note
                            </button>
                        )}
                    </div>
                    
                    {/* File Attachments */}
                    <div className="mb-4">
                        <h3 className="font-semibold text-sm mb-2 text-[var(--color-text-primary)]">Attachments</h3>
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                            {(task.attachments || []).map(att => (
                                <div key={att.id} className="flex items-center justify-between bg-[var(--color-bg)] p-2 rounded-lg text-sm">
                                    <a href={attachmentURLs[att.id]} target="_blank" rel="noopener noreferrer" className="truncate hover:underline text-[var(--color-text-primary)]">
                                        {att.name}
                                    </a>
                                    <button onClick={() => onDeleteAttachment(task.id, att)} className="text-rose-400 hover:text-rose-500 ml-4 flex-shrink-0">
                                        <XIcon className="w-4 h-4"/>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <button onClick={() => fileInputRef.current.click()} className="w-full mt-2 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 text-sm font-semibold py-2 rounded-lg">
                            Add Attachment
                        </button>
                    </div>

                    <div className="mb-4">
                        <button onClick={() => setIsDependencyModalOpen(true)} className="text-sm text-amber-400/80 hover:text-amber-400 flex items-center gap-2">
                            <LinkIcon className="w-4 h-4"/> Set Dependency
                        </button>
                        {dependencyTask && (
                            <div className="text-xs mt-2 p-2 bg-[var(--color-bg)] rounded-md flex justify-between items-center text-[var(--color-text-primary)]">
                                <span>Depends on: {dependencyTask.text}</span>
                                <button onClick={() => onSetDependency(task.id, null)} className="text-rose-400">
                                    <XIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4">
                        <button onClick={onClose} className="bg-[var(--color-bg-secondary-hover)] text-[var(--color-text-primary)] py-2 px-4 rounded-lg">Cancel</button>
                        <button onClick={handleSave} className="bg-teal-600 hover:bg-teal-700 text-white font-semibold py-2 px-4 rounded-lg">Save</button>
                    </div>
                </motion.div>
            </motion.div>
            <AnimatePresence>
                {isDependencyModalOpen && (
                    <DependencySelectorModal 
                        isOpen={isDependencyModalOpen}
                        onClose={() => setIsDependencyModalOpen(false)}
                        currentTaskId={task.id}
                        tasks={allTasks}
                        onSelect={(dependencyId) => {
                            onSetDependency(task.id, dependencyId);
                            setIsDependencyModalOpen(false);
                        }}
                    />
                )}
            </AnimatePresence>
        </>
    );
};

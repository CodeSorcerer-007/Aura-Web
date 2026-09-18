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
    onDeleteAttachment
}) => {
    const [text, setText] = useState('');
    const [notes, setNotes] = useState('');
    const [tags, setTags] = useState('');
    const [isDependencyModalOpen, setIsDependencyModalOpen] = useState(false);
    const [attachmentURLs, setAttachmentURLs] = useState({});
    const fileInputRef = useRef(null);

    useEffect(() => {
        if (task) {
            setText(task.text);
            setNotes(task.notes || '');
            setTags((task.tags || []).join(', '));
            
            // Create Object URLs for attachments
            const urls = {};
            const attachmentPromises = (task.attachments || []).map(async (att) => {
                const fileBlob = await getFile(att.id);
                if (fileBlob) {
                    urls[att.id] = URL.createObjectURL(fileBlob);
                }
            });
            Promise.all(attachmentPromises).then(() => setAttachmentURLs(urls));

            return () => {
                Object.values(urls).forEach(URL.revokeObjectURL);
            };
        }
    }, [task]);
    
    if (!isOpen || !task) return null;

    const handleSave = () => {
        const newTags = tags.split(',').map(t => t.trim()).filter(Boolean);
        onSave(task.id, text, notes, newTags);
        onClose();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            onAddAttachment(task.id, file);
        }
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
                    className="w-full max-w-lg bg-[var(--color-bg-secondary)] border border-[var(--color-border)] rounded-2xl p-6"
                >
                    <input 
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="w-full bg-transparent text-xl font-bold mb-4 focus:outline-none"
                    />
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes..."
                        className="w-full h-24 bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-4"
                    />
                    <input 
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="Tags, comma separated"
                        className="w-full bg-[var(--color-bg)] p-3 rounded-lg border border-[var(--color-border)] focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] mb-4"
                    />
                    
                    <div className="mb-4">
                        <h3 className="font-semibold text-sm mb-2">Attachments</h3>
                        <div className="space-y-2 max-h-24 overflow-y-auto">
                            {(task.attachments || []).map(att => (
                                <div key={att.id} className="flex items-center justify-between bg-[var(--color-bg)] p-2 rounded-lg text-sm">
                                    <a href={attachmentURLs[att.id]} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
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
                            <div className="text-xs mt-2 p-2 bg-[var(--color-bg)] rounded-md flex justify-between items-center">
                                <span>Depends on: {dependencyTask.text}</span>
                                <button onClick={() => onSetDependency(task.id, null)} className="text-rose-400">
                                    <XIcon className="w-4 h-4"/>
                                </button>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-4">
                        <button onClick={onClose} className="bg-[var(--color-bg-secondary-hover)] py-2 px-4 rounded-lg">Cancel</button>
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

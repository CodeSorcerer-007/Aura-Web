import { useCallback, useRef } from 'react';
import { parseIntelligentDeadline, getTodayDateString } from '../utils/dateUtils';
import { setFile, deleteFile } from '../utils/db';

export const useTaskOperations = ({
    tasks,
    setTasks,
    templates,
    setTemplates,
    setGrove,
    ui,
    playSoundEffect
}) => {
    // Universal Undo stack: stores previous state for 5 seconds
    const undoRef = useRef(null);
    const undoTimerRef = useRef(null);

    const clearUndo = useCallback(() => {
        if (undoTimerRef.current) {
            clearTimeout(undoTimerRef.current);
            undoTimerRef.current = null;
        }
        undoRef.current = null;
    }, []);

    const performUndo = useCallback(() => {
        if (!undoRef.current) return;
        const action = undoRef.current;
        clearUndo();

        if (action.type === 'delete' || action.type === 'forgive') {
            const restoredTask = action.task;
            setTasks(prev => [restoredTask, ...prev.filter(t => t.id !== restoredTask.id)]);
            ui.setToastMessage({ type: 'success', text: '↩ Task restored!' });
        } else if (action.type === 'toggle') {
            // Revert completion state
            setTasks(prev => prev.map(t => t.id === action.taskId ? {
                ...t,
                completed: action.prevCompleted,
                completionDate: action.prevCompletionDate
            } : t));
            // Revert grove growth if was completing
            if (!action.prevCompleted && action.wasCompleting) {
                setGrove(prevGrove => {
                    const latestTreeIndex = prevGrove.findLastIndex(tree => tree.growthPoints > 0);
                    if (latestTreeIndex > -1) {
                        const newGrove = [...prevGrove];
                        newGrove[latestTreeIndex] = {
                            ...newGrove[latestTreeIndex],
                            growthPoints: Math.max(0, newGrove[latestTreeIndex].growthPoints - 1)
                        };
                        return newGrove;
                    }
                    return prevGrove;
                });
            }
            ui.setToastMessage({ type: 'success', text: '↩ Status reversed!' });
        } else if (action.type === 'archive') {
            setTasks(prev => prev.map(t => t.id === action.taskId ? { ...t, isArchived: false } : t));
            ui.setToastMessage({ type: 'success', text: '↩ Task unarchived!' });
        }
    }, [setTasks, setGrove, ui, clearUndo]);

    const registerUndo = useCallback((actionData, toastText, toastType = 'info') => {
        clearUndo();
        undoRef.current = actionData;
        ui.setToastMessage({
            type: toastType,
            text: toastText,
            onUndo: performUndo
        });
        undoTimerRef.current = setTimeout(() => {
            undoRef.current = null;
            undoTimerRef.current = null;
        }, 5000);
    }, [clearUndo, performUndo, ui]);

    // Add task (direct or from template) with intelligent metadata parsing
    const addTask = useCallback((text, applyTemplate = null) => {
        playSoundEffect('add');

        if (applyTemplate) {
            const template = templates.find(t => t.name === applyTemplate);
            if (!template) return;
            const newTasks = template.tasks.map(t => ({
                ...t,
                id: crypto.randomUUID(),
                createdAt: new Date().toISOString(),
                subtasks: [],
                win: null,
                completionDate: null,
                notes: '',
                attachments: [],
                tags: [],
                isPinned: false,
                focusSessions: 0,
                isArchived: false
            }));
            setTasks(prev => [...prev, ...newTasks]);
            ui.setTemplateSuggestion(null);
            return;
        }

        if (ui.templateSuggestion) {
            ui.setTemplateSuggestion(null);
        }

        const matchingTemplate = templates.find(t => text.toLowerCase().includes(t.name.toLowerCase()));
        if (matchingTemplate) {
            ui.setTemplateSuggestion({ templateName: matchingTemplate.name, taskText: text });
            return;
        }

        let { deadline, cleanedText, recurring } = parseIntelligentDeadline(text);

        const tagRegex = /@(\w+)/g;
        const tags = [...cleanedText.matchAll(tagRegex)].map(match => match[1]);
        cleanedText = cleanedText.replace(tagRegex, '').trim();

        let priority = 2;
        if (cleanedText.includes('!')) {
            priority = 3;
            cleanedText = cleanedText.replace(/!/g, '').trim();
        }
        if (cleanedText.toLowerCase().includes('urgent')) {
            priority = 3;
            cleanedText = cleanedText.replace(/urgent/ig, '').trim();
        }
        if (cleanedText.toLowerCase().includes('low priority')) {
            priority = 1;
            cleanedText = cleanedText.replace(/low priority/ig, '').trim();
        }

        let category = 'General';
        const categoryMatch = cleanedText.match(/#(\w+)/);
        if (categoryMatch) {
            category = categoryMatch[1].charAt(0).toUpperCase() + categoryMatch[1].slice(1);
            cleanedText = cleanedText.replace(/#\w+/, '').trim();
        }

        let time = 'afternoon';
        if (cleanedText.toLowerCase().includes('morning')) {
            time = 'morning';
            cleanedText = cleanedText.replace(/morning/ig, '').trim();
        }
        if (cleanedText.toLowerCase().includes('evening') || cleanedText.toLowerCase().includes('night')) {
            time = 'evening';
            cleanedText = cleanedText.replace(/evening|night/ig, '').trim();
        }

        let energy = 'flow';
        if (cleanedText.includes('~spark') || cleanedText.toLowerCase().includes('!spark') || cleanedText.toLowerCase().includes('deep focus')) {
            energy = 'spark';
            cleanedText = cleanedText.replace(/~spark|!spark/ig, '').trim();
        } else if (cleanedText.includes('~rest') || cleanedText.toLowerCase().includes('!rest') || cleanedText.toLowerCase().includes('wind down')) {
            energy = 'rest';
            cleanedText = cleanedText.replace(/~rest|!rest/ig, '').trim();
        } else if (cleanedText.includes('~flow') || cleanedText.toLowerCase().includes('!flow')) {
            energy = 'flow';
            cleanedText = cleanedText.replace(/~flow|!flow/ig, '').trim();
        }

        const newTask = {
            id: crypto.randomUUID(),
            createdAt: new Date().toISOString(),
            text: cleanedText.replace(/  +/g, ' ').trim(),
            completed: false,
            priority,
            energy,
            category,
            timeOfDay: time,
            deadline,
            subtasks: [],
            win: null,
            completionDate: null,
            recurring,
            notes: '',
            attachments: [],
            tags,
            isPinned: false,
            focusSessions: 0,
            isArchived: false
        };

        setTasks(prevTasks => [...prevTasks, newTask]);
    }, [templates, setTasks, ui, playSoundEffect]);

    const toggleTask = useCallback((id, isMonolith = false) => {
        const taskToToggle = tasks.find(t => t.id === id);
        if (!taskToToggle) return;

        const isCompleting = !taskToToggle.completed;
        if (isCompleting) {
            playSoundEffect('complete', isMonolith);
        }

        const newTasks = tasks.map(t => {
            if (t.id === id) {
                if (t.recurring) {
                    const nextDate = new Date(t.deadline || getTodayDateString());
                    if (t.recurring.type === 'daily') nextDate.setDate(nextDate.getDate() + 1);
                    if (t.recurring.type === 'weekly') nextDate.setDate(nextDate.getDate() + 7);
                    if (t.recurring.type === 'monthly') nextDate.setMonth(nextDate.getMonth() + 1);
                    return { ...t, deadline: nextDate.toISOString().split('T')[0] };
                }
                return { ...t, completed: !t.completed, completionDate: t.completed ? null : getTodayDateString() };
            }
            return t;
        });

        if (taskToToggle.recurring) {
            const completedInstance = {
                ...taskToToggle,
                id: crypto.randomUUID(),
                createdAt: taskToToggle.createdAt || new Date().toISOString(),
                completed: true,
                recurring: null,
                completionDate: getTodayDateString()
            };
            newTasks.push(completedInstance);
        }

        if (isCompleting) {
            setGrove(prevGrove => {
                const latestTreeIndex = prevGrove.findLastIndex(tree => tree.growthPoints < tree.maxGrowth);
                if (latestTreeIndex > -1) {
                    const newGrove = [...prevGrove];
                    newGrove[latestTreeIndex] = {
                        ...newGrove[latestTreeIndex],
                        growthPoints: newGrove[latestTreeIndex].growthPoints + 1
                    };
                    return newGrove;
                }
                return prevGrove;
            });

            if (taskToToggle.priority >= 2 && !taskToToggle.recurring) {
                ui.setWinModalTaskId(id);
            }
        }

        setTasks(newTasks);

        // Register undo for completion toggle
        const taskName = taskToToggle.text.length > 25 ? taskToToggle.text.substring(0, 25) + '…' : taskToToggle.text;
        registerUndo(
            {
                type: 'toggle',
                taskId: id,
                prevCompleted: taskToToggle.completed,
                prevCompletionDate: taskToToggle.completionDate,
                wasCompleting: isCompleting
            },
            isCompleting ? `Completed: "${taskName}" ✨` : `Active: "${taskName}" ⚡`,
            'success'
        );
    }, [tasks, setTasks, setGrove, playSoundEffect, ui, registerUndo]);

    const togglePin = useCallback((id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
    }, [setTasks]);

    const saveWin = useCallback((id, winText) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, win: winText } : t));
        ui.setWinModalTaskId(null);
    }, [setTasks, ui]);

    const deleteTask = useCallback(async (id, isForgive = false) => {
        const taskToDelete = tasks.find(t => t.id === id);

        // Save to undo stack before deleting
        if (taskToDelete) {
            clearUndo();
            if (taskToDelete.attachments) {
                for (const att of taskToDelete.attachments) {
                    await deleteFile(att.id);
                }
            }
            if (taskToDelete.voiceNotes) {
                for (const vn of taskToDelete.voiceNotes) {
                    await deleteFile(vn.id);
                }
            }
        }

        setTasks(prev => prev.filter(task => task.id !== id));

        // Show toast with undo action (5s window)
        if (taskToDelete) {
            const taskName = taskToDelete.text.length > 25 ? taskToDelete.text.substring(0, 25) + '…' : taskToDelete.text;
            registerUndo(
                {
                    type: isForgive ? 'forgive' : 'delete',
                    task: { ...taskToDelete }
                },
                isForgive ? `Forgiven & released: "${taskName}" 🍃` : `Deleted: "${taskName}"`,
                'info'
            );
        }
    }, [tasks, setTasks, clearUndo, registerUndo]);

    const forgiveTask = useCallback((id) => {
        deleteTask(id, true);
    }, [deleteTask]);

    const archiveTask = useCallback((id) => {
        const taskToArchive = tasks.find(t => t.id === id);
        setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: true } : t));
        if (taskToArchive) {
            const taskName = taskToArchive.text.length > 25 ? taskToArchive.text.substring(0, 25) + '…' : taskToArchive.text;
            registerUndo(
                {
                    type: 'archive',
                    taskId: id
                },
                `Archived: "${taskName}" 📦`,
                'info'
            );
        }
    }, [tasks, setTasks, registerUndo]);

    const restoreTask = useCallback((id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: false } : t));
    }, [setTasks]);

    const saveTaskDetail = useCallback((id, newText, newNotes, newTags, newEnergy) => {
        setTasks(prev => prev.map(t => t.id === id ? {
            ...t,
            text: newText,
            notes: newNotes,
            tags: newTags,
            ...(newEnergy ? { energy: newEnergy } : {})
        } : t));
    }, [setTasks]);

    const moveTaskToSection = useCallback((taskId, targetSection) => {
        if (!['morning', 'afternoon', 'evening'].includes(targetSection)) return;
        playSoundEffect('drop');
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, timeOfDay: targetSection } : t));
    }, [setTasks, playSoundEffect]);

    const setTaskDependency = useCallback((taskId, dependencyId) => {
        setTasks(prev => prev.map(t => t.id === taskId ? { ...t, dependsOn: dependencyId } : t));
    }, [setTasks]);

    const addAttachmentToTask = useCallback(async (taskId, file) => {
        const fileId = crypto.randomUUID();
        const attachmentMeta = { id: fileId, name: file.name, type: file.type };
        await setFile(fileId, file);

        setTasks(currentTasks =>
            currentTasks.map(task => {
                if (task.id === taskId) {
                    const attachments = task.attachments || [];
                    return { ...task, attachments: [...attachments, attachmentMeta] };
                }
                return task;
            })
        );
    }, [setTasks]);

    const deleteAttachmentFromTask = useCallback(async (taskId, attachment) => {
        await deleteFile(attachment.id);
        setTasks(currentTasks =>
            currentTasks.map(task => {
                if (task.id === taskId) {
                    return {
                        ...task,
                        attachments: task.attachments.filter(att => att.id !== attachment.id),
                    };
                }
                return task;
            })
        );
    }, [setTasks]);

    const addVoiceNoteToTask = useCallback(async (taskId, audioBlob, duration = 0) => {
        const voiceId = `voice_${crypto.randomUUID()}`;
        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const voiceMeta = {
            id: voiceId,
            name: `Voice Memo ${timeStr}`,
            duration: Math.round(duration),
            createdAt: new Date().toISOString()
        };
        await setFile(voiceId, audioBlob);

        setTasks(currentTasks =>
            currentTasks.map(task => {
                if (task.id === taskId) {
                    const voiceNotes = task.voiceNotes || [];
                    return { ...task, voiceNotes: [...voiceNotes, voiceMeta] };
                }
                return task;
            })
        );
    }, [setTasks]);

    const deleteVoiceNoteFromTask = useCallback(async (taskId, voiceNoteId) => {
        await deleteFile(voiceNoteId);
        setTasks(currentTasks =>
            currentTasks.map(task => {
                if (task.id === taskId) {
                    return {
                        ...task,
                        voiceNotes: (task.voiceNotes || []).filter(vn => vn.id !== voiceNoteId)
                    };
                }
                return task;
            })
        );
    }, [setTasks]);

    const saveTemplate = useCallback((category, tasksToSave) => {
        const templateTasks = tasksToSave.map(t => ({
            text: t.text,
            category: t.category,
            priority: t.priority,
            timeOfDay: t.timeOfDay
        }));
        setTemplates(prev => [...prev, { name: category, tasks: templateTasks }]);
        ui.setToastMessage({ type: 'success', text: `Saved template: ${category}` });
    }, [setTemplates, ui]);

    const reorderTask = useCallback((taskId, direction) => {
        const tasksToSort = tasks.filter(t => !t.completed);
        const completedTasks = tasks.filter(t => t.completed);

        const index = tasksToSort.findIndex(t => t.id === taskId);
        if (index === -1) return;

        const newIndex = direction === 'up' ? index - 1 : index + 1;
        if (newIndex < 0 || newIndex >= tasksToSort.length) return;

        const [movedTask] = tasksToSort.splice(index, 1);
        tasksToSort.splice(newIndex, 0, movedTask);

        setTasks([...tasksToSort, ...completedTasks]);
    }, [tasks, setTasks]);

    const toggleSubtask = useCallback((taskId, subtaskText) => {
        setTasks(prev => prev.map(task => {
            if (task.id === taskId) {
                let isChecked = false;
                const newSubtasks = task.subtasks.map(st => {
                    if (st.text === subtaskText) {
                        isChecked = !st.completed;
                        return { ...st, completed: !st.completed };
                    }
                    return st;
                });

                const completedCount = newSubtasks.filter(st => st.completed).length;
                const totalCount = newSubtasks.length;

                if (playSoundEffect) {
                    playSoundEffect('subtask', false, {
                        completedCount,
                        totalCount,
                        isChecked
                    });
                }

                return { ...task, subtasks: newSubtasks };
            }
            return task;
        }));
    }, [setTasks, playSoundEffect]);

    const reorderSectionTasks = useCallback((orderedSectionTasks) => {
        if (!orderedSectionTasks || orderedSectionTasks.length === 0) return;
        setTasks(prevTasks => {
            const currentSectionIds = new Set(orderedSectionTasks.map(t => t.id));
            let sectionIndex = 0;
            return prevTasks.map(t => {
                if (currentSectionIds.has(t.id)) {
                    return orderedSectionTasks[sectionIndex++];
                }
                return t;
            });
        });
    }, [setTasks]);

    return {
        addTask,
        toggleTask,
        togglePin,
        saveWin,
        deleteTask,
        forgiveTask,
        archiveTask,
        restoreTask,
        saveTaskDetail,
        setTaskDependency,
        addAttachmentToTask,
        deleteAttachmentFromTask,
        addVoiceNoteToTask,
        deleteVoiceNoteFromTask,
        saveTemplate,
        reorderTask,
        reorderSectionTasks,
        moveTaskToSection,
        toggleSubtask,
        undoDelete: performUndo,
        undoLastAction: performUndo
    };
};

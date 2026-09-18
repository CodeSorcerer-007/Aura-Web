import { useCallback } from 'react';
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
    // Add task (direct or from template) with intelligent metadata parsing
    const addTask = useCallback((text, applyTemplate = null) => {
        playSoundEffect('add');

        if (applyTemplate) {
            const template = templates.find(t => t.name === applyTemplate);
            if (!template) return;
            const newTasks = template.tasks.map(t => ({
                ...t,
                id: Date.now() + Math.random(),
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

        const newTask = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            text: cleanedText.replace(/  +/g, ' ').trim(),
            completed: false,
            priority,
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

    const toggleTask = useCallback((id) => {
        const taskToToggle = tasks.find(t => t.id === id);
        if (!taskToToggle) return;

        const isCompleting = !taskToToggle.completed;
        if (isCompleting) {
            playSoundEffect('complete');
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
                id: Date.now(),
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
    }, [tasks, setTasks, setGrove, playSoundEffect, ui]);

    const togglePin = useCallback((id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, isPinned: !t.isPinned } : t));
    }, [setTasks]);

    const saveWin = useCallback((id, winText) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, win: winText } : t));
        ui.setWinModalTaskId(null);
    }, [setTasks, ui]);

    const deleteTask = useCallback(async (id) => {
        const taskToDelete = tasks.find(t => t.id === id);
        if (taskToDelete && taskToDelete.attachments) {
            for (const att of taskToDelete.attachments) {
                await deleteFile(att.id);
            }
        }
        setTasks(prev => prev.filter(task => task.id !== id));
    }, [tasks, setTasks]);

    const archiveTask = useCallback((id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: true } : t));
    }, [setTasks]);

    const restoreTask = useCallback((id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, isArchived: false } : t));
    }, [setTasks]);

    const saveTaskDetail = useCallback((id, newText, newNotes, newTags) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, text: newText, notes: newNotes, tags: newTags } : t));
    }, [setTasks]);

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
                const newSubtasks = task.subtasks.map(st =>
                    st.text === subtaskText ? { ...st, completed: !st.completed } : st
                );
                return { ...task, subtasks: newSubtasks };
            }
            return task;
        }));
    }, [setTasks]);

    return {
        addTask,
        toggleTask,
        togglePin,
        saveWin,
        deleteTask,
        archiveTask,
        restoreTask,
        saveTaskDetail,
        setTaskDependency,
        addAttachmentToTask,
        deleteAttachmentFromTask,
        saveTemplate,
        reorderTask,
        toggleSubtask
    };
};

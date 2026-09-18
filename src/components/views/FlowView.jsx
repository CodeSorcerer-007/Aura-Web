import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { defaultCategories } from '../../utils/constants';
import { DayDatePanel } from '../common/DayDatePanel';
import { FilterBar } from '../common/FilterBar';
import { TimeSection } from '../common/TimeSection';
import {
    PinIcon,
    SunIcon,
    SunsetIcon,
    MoonIcon,
    CheckIcon
} from '../common/Icons';

export const FlowView = ({
    tasks,
    toggleTask,
    deleteTask,
    onFocus,
    activeFilter,
    setActiveFilter,
    onReorder,
    onToggleSubtask,
    allTasks,
    allCategories,
    onOpenDetail,
    onTogglePin,
    onArchive
}) => {
    const nonArchivedTasks = tasks.filter(t => !t.isArchived);
    const pinnedTasks = nonArchivedTasks.filter(t => t.isPinned && !t.completed);
    const uncompletedTasks = nonArchivedTasks.filter(t => !t.isPinned && !t.completed);
    const morningTasks = uncompletedTasks.filter(t => t.timeOfDay === 'morning'); 
    const afternoonTasks = uncompletedTasks.filter(t => t.timeOfDay === 'afternoon'); 
    const eveningTasks = uncompletedTasks.filter(t => t.timeOfDay === 'evening'); 
    const completedTasks = nonArchivedTasks.filter(t => t.completed);
    
    const categories = useMemo(() => [
        ...Object.keys(defaultCategories),
        ...Object.keys(allCategories).filter(c => !defaultCategories[c])
    ], [allCategories]);
    
    const allTags = useMemo(() => [...new Set(tasks.flatMap(t => t.tags || []))], [tasks]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.5 }} 
            className="max-w-2xl mx-auto"
        >
            <DayDatePanel />
            <FilterBar 
                activeFilter={activeFilter} 
                setActiveFilter={setActiveFilter} 
                categories={categories} 
                allTags={allTags}
            />
            <div className="space-y-12 mt-6">
                {pinnedTasks.length > 0 && (
                    <TimeSection 
                        title="Pinned" 
                        icon={<PinIcon />} 
                        tasks={pinnedTasks} 
                        {...{ toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }} 
                    />
                )}
                <TimeSection 
                    title="Morning" 
                    icon={<SunIcon />} 
                    tasks={morningTasks} 
                    {...{ toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }} 
                />
                <TimeSection 
                    title="Afternoon" 
                    icon={<SunsetIcon />} 
                    tasks={afternoonTasks} 
                    {...{ toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }} 
                />
                <TimeSection 
                    title="Evening" 
                    icon={<MoonIcon />} 
                    tasks={eveningTasks} 
                    {...{ toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }} 
                />
                {completedTasks.length > 0 && (
                    <TimeSection 
                        title="Completed" 
                        icon={<CheckIcon />} 
                        tasks={completedTasks} 
                        {...{ toggleTask, deleteTask, onFocus, onReorder, onToggleSubtask, allCategories, allTasks, onOpenDetail, onTogglePin, onArchive }} 
                        isCompletedSection 
                    />
                )}
            </div>
        </motion.div>
    );
};

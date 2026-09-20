import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { playHarmonicUiSound } from '../../hooks/useSoundEffects';
import { ConstellationControls } from '../constellations/ConstellationControls';
import { ClusterListView } from '../constellations/ClusterListView';
import { OrbitVisualization } from '../constellations/OrbitVisualization';

export const ConstellationsView = ({ tasks = [], toggleTask, onSaveTemplate, templates = [], allCategories = {} }) => {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [zoomLevel, setZoomLevel] = useState(1);
    const [viewMode, setViewMode] = useState(() => {
        if (typeof window !== 'undefined' && window.innerWidth < 640) {
            return 'cluster';
        }
        return 'orbit';
    });

    const nonArchivedTasks = tasks.filter(t => !t.isArchived);

    const projects = useMemo(() => {
        const grouped = nonArchivedTasks.reduce((acc, task) => {
            const cat = task.category || 'General';
            (acc[cat] = acc[cat] || []).push(task);
            return acc;
        }, {});
        return Object.entries(grouped);
    }, [nonArchivedTasks]);

    const activeProjects = useMemo(() => {
        if (selectedCategory === 'all') return projects;
        return projects.filter(([category]) => category === selectedCategory);
    }, [projects, selectedCategory]);

    const handleTaskClick = (taskId) => {
        playHarmonicUiSound('complete');
        if (toggleTask) toggleTask(taskId);
    };

    const handleZoomIn = () => setZoomLevel(z => Math.min(1.5, Math.round((z + 0.15) * 100) / 100));
    const handleZoomOut = () => setZoomLevel(z => Math.max(0.65, Math.round((z - 0.15) * 100) / 100));
    const handleResetZoom = () => setZoomLevel(1);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-6xl mx-auto select-none relative"
        >
            {/* Header, Galaxy Chips, & Floating Controls Bar */}
            <ConstellationControls
                projects={projects}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                viewMode={viewMode}
                setViewMode={setViewMode}
                zoomLevel={zoomLevel}
                handleZoomIn={handleZoomIn}
                handleZoomOut={handleZoomOut}
                handleResetZoom={handleResetZoom}
            />

            {/* View Mode: Star Cluster List (Mobile & Focused List) */}
            {viewMode === 'cluster' && (
                <ClusterListView
                    activeProjects={activeProjects}
                    allCategories={allCategories}
                    onTaskClick={handleTaskClick}
                />
            )}

            {/* View Mode: Cosmic Orbital Topology with Multi-Ring Gravitation */}
            {viewMode === 'orbit' && (
                <OrbitVisualization
                    zoomLevel={zoomLevel}
                    activeProjects={activeProjects}
                    templates={templates}
                    allCategories={allCategories}
                    onSaveTemplate={onSaveTemplate}
                    onTaskClick={handleTaskClick}
                />
            )}
        </motion.div>
    );
};

export default ConstellationsView;

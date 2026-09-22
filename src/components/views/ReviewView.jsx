import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { formatLocalDate } from '../../utils/dateUtils';
import { ProductivityHeatmap } from './ProductivityHeatmap';
import { ReviewStatsCards } from '../review/ReviewStatsCards';
import { FocusAnalyticsPanel } from '../review/FocusAnalyticsPanel';
import { CategoryTagDistribution } from '../review/CategoryTagDistribution';
import { StaleTasksTriage } from '../review/StaleTasksTriage';
import { AchievementsSection } from '../review/AchievementsSection';
import { ProductivityReportModal } from '../review/ProductivityReportModal';

export const ReviewView = ({
    tasks = [],
    achievements = [],
    allCategories = {},
    stats = {},
    focusHistory = [],
    onDeleteStale,
    onRecommitTask,
    onSnoozeTask,
    onForgiveTask
}) => {
    const [isReportOpen, setIsReportOpen] = useState(false);

    const completedTasks = useMemo(() => {
        return tasks.filter(t => t.completed && t.completionDate);
    }, [tasks]);

    const categoryData = useMemo(() => {
        const data = completedTasks.reduce((acc, task) => {
            acc[task.category] = (acc[task.category] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(data).sort((a, b) => b[1] - a[1]);
    }, [completedTasks]);

    const tagData = useMemo(() => {
        const data = completedTasks.reduce((acc, task) => {
            (task.tags || []).forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
            return acc;
        }, {});
        return Object.entries(data).sort((a, b) => b[1] - a[1]);
    }, [completedTasks]);

    const staleTasks = useMemo(() => {
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
        return tasks.filter(task => {
            if (task.completed || task.isArchived) return false;
            const createdDate = task.createdAt 
                ? new Date(task.createdAt) 
                : (typeof task.id === 'number' && task.id > 1000000000000 ? new Date(task.id) : null);
            if (!createdDate || isNaN(createdDate.getTime())) return false;
            return createdDate < twoWeeksAgo;
        });
    }, [tasks]);

    // Focus & Pomodoro Analytics
    // Fix 2: use the canonical focusHistory from GroveContext (passed as prop) instead
    // of reading localStorage directly. No more dual-source reconciliation needed.
    const focusStats = useMemo(() => {
        const taskSessionsCount = tasks.reduce((sum, t) => sum + (t.focusSessions || 0), 0);
        const totalSessions = Math.max(taskSessionsCount, focusHistory.length);

        const now = new Date();
        const startOfWeek = new Date(now);
        const day = startOfWeek.getDay();
        const diffToMonday = (day === 0 ? -6 : 1) - day;
        startOfWeek.setDate(startOfWeek.getDate() + diffToMonday);
        startOfWeek.setHours(0, 0, 0, 0);

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        let sessionsThisWeek = 0;
        let sessionsThisMonth = 0;

        focusHistory.forEach(item => {
            const d = new Date(item.timestamp);
            if (d >= startOfWeek) sessionsThisWeek++;
            if (d >= startOfMonth) sessionsThisMonth++;
        });

        const categoryCounts = {};
        if (focusHistory.length > 0) {
            focusHistory.forEach(item => {
                const cat = item.category || 'General';
                categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
            });
        } else {
            tasks.forEach(t => {
                if (t.focusSessions > 0) {
                    const cat = t.category || 'General';
                    categoryCounts[cat] = (categoryCounts[cat] || 0) + t.focusSessions;
                }
            });
        }
        const sortedCats = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1]);
        const topCategory = sortedCats[0]?.[0] || 'General';
        const topCategoryCount = sortedCats[0]?.[1] || 0;

        const totalMinutes = totalSessions * 25;
        const hours = Math.floor(totalMinutes / 60);
        const mins = totalMinutes % 60;
        const deepWorkFormatted = hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;

        const focusDates = new Set();
        focusHistory.forEach(h => {
            if (h.timestamp) focusDates.add(h.timestamp.split('T')[0]);
        });
        tasks.forEach(t => {
            if (t.focusSessions > 0 && t.completionDate) focusDates.add(t.completionDate);
        });

        let streak = 0;
        let tempDate = new Date();
        const hasToday = focusDates.has(formatLocalDate(tempDate));
        if (!hasToday) {
            tempDate.setDate(tempDate.getDate() - 1);
        }
        while (focusDates.has(formatLocalDate(tempDate))) {
            streak++;
            tempDate.setDate(tempDate.getDate() - 1);
        }

        return {
            totalSessions,
            sessionsThisWeek,
            sessionsThisMonth,
            deepWorkFormatted,
            topCategory,
            topCategoryCount,
            focusStreak: streak
        };
    }, [tasks, focusHistory]);

    // Energy Distribution & Completion Velocity
    const energyData = useMemo(() => {
        let spark = 0;
        let flow = 0;
        let rest = 0;
        completedTasks.forEach(t => {
            const e = (t.energy || '').toLowerCase();
            if (e === 'spark' || e === 'high') spark++;
            else if (e === 'rest' || e === 'low') rest++;
            else flow++;
        });
        const total = completedTasks.length || 1;
        return {
            spark,
            flow,
            rest,
            sparkPct: Math.round((spark / total) * 100),
            flowPct: Math.round((flow / total) * 100),
            restPct: Math.round((rest / total) * 100),
            totalCompleted: completedTasks.length,
            completionRate: tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0
        };
    }, [completedTasks, tasks]);

    return (
        <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }} 
            transition={{ duration: 0.5 }} 
            className="max-w-4xl mx-auto space-y-8 pb-28 sm:pb-36"
        >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Your Review</h2>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-0.5">Reflect on your productivity and progress.</p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsReportOpen(true)}
                    className="self-start sm:self-auto px-4 py-2 rounded-xl bg-[var(--color-bg-secondary)] hover:bg-white/10 text-[var(--color-text-primary)] border border-[var(--color-border)] text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[var(--color-accent)]"
                >
                    <span>📊</span> Export Summary Report
                </button>
            </div>

            {/* GitHub-style Full Year Productivity Heatmap */}
            <ProductivityHeatmap completedTasks={completedTasks} streak={stats?.streak || 0} />

            {/* High-Level Productivity Stats Cards */}
            <ReviewStatsCards energyData={energyData} stats={stats} />

            {/* Focus Mastery & Pomodoro Stats */}
            <FocusAnalyticsPanel focusStats={focusStats} />

            {/* Category & Tag Breakdown */}
            <CategoryTagDistribution
                categoryData={categoryData}
                tagData={tagData}
                allCategories={allCategories}
                totalCompleted={completedTasks.length}
                completedTasks={completedTasks}
            />

            {/* Anti-Backlog Sanctuary: Forgive & Release */}
            <StaleTasksTriage
                staleTasks={staleTasks}
                onRecommitTask={onRecommitTask}
                onSnoozeTask={onSnoozeTask}
                onForgiveTask={onForgiveTask}
                onDeleteStale={onDeleteStale}
            />

            {/* Achievements Trophy Showcase */}
            <AchievementsSection achievements={achievements} />

            {/* Productivity Markdown Report Modal */}
            <ProductivityReportModal
                isOpen={isReportOpen}
                onClose={() => setIsReportOpen(false)}
                stats={stats}
                energyData={energyData}
                focusStats={focusStats}
                completedTasks={completedTasks}
            />
        </motion.div>
    );
};

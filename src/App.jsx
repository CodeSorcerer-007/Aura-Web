import React, { useState, useEffect, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { UIProvider, useUI } from './context/UIContext';
import { TaskProvider, useTasks } from './context/TaskContext';
import { SettingsProvider, useSettings } from './context/SettingsContext';
import { GroveProvider, useGrove } from './context/GroveContext';

import { ThemeBackground } from './components/backgrounds/ThemeBackground';
import { Header } from './components/common/Header';
import { AssistantPrompt } from './components/common/AssistantPrompt';
import { CaptureInput } from './components/common/CaptureInput';
import { BottomNav } from './components/common/BottomNav';
import { LoadingScreen } from './components/common/LoadingScreen';
import { ModalManager } from './components/common/ModalManager';
import { XIcon } from './components/common/Icons';

import { FlowView } from './components/views/FlowView';
import SkipToContent from './components/common/SkipToContent';

const ConstellationsView = React.lazy(() => import('./components/views/ConstellationsView').then(m => ({ default: m.ConstellationsView })));
const GroveView = React.lazy(() => import('./components/views/GroveView').then(m => ({ default: m.GroveView })));
const JournalView = React.lazy(() => import('./components/views/JournalView').then(m => ({ default: m.JournalView })));
const ReviewView = React.lazy(() => import('./components/views/ReviewView').then(m => ({ default: m.ReviewView })));

import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

const AuraAppContent = () => {
    const { theme, themeLoaded, customThemes, customThemesLoaded } = useTheme();
    const {
        currentView, setCurrentView,
        setIsSettingsOpen,
        setIsSearchOpen,
        setIsMindfulMinuteOpen,
        setIsShareSummaryOpen,
        setIsShortcutsOpen,
        setIsAmbientSoundOpen,
        setIsBrainSweepOpen,
        activeFilter, setActiveFilter,
        assistantMessage, setAssistantMessage,
        setFocusTaskId,
        setDetailModal,
        togglePin,
    } = useUI();

    const {
        allDataLoaded,
        tasks,
        setTasks,
        templates,
        momentumProgress,
        dailyQuote,
        addTask,
        toggleTask,
        deleteTask,
        forgiveTask,
        archiveTask,
        saveTemplate,
        reorderTask,
        reorderSectionTasks,
        toggleSubtask,
        handlePlantSeed,
        shutdownRitual,
        setShutdownRitual,
        shutdownRitualMessages,
        plantTomorrowSeed,
        moveTaskToSection,
    } = useTasks();

    const {
        allCategories,
        journalEntries, setJournalEntries,
        monolithTaskId, setMonolithTaskId,
        tunnelVision, setTunnelVision,
    } = useSettings();

    const { stats, grove, unlockedAchievements } = useGrove();

    // Keyboard shortcuts
    useKeyboardShortcuts({ setCurrentView, setIsBrainSweepOpen });

    const isLoading = !allDataLoaded || !themeLoaded || !customThemesLoaded;

    const [welcomeBanner, setWelcomeBanner] = useState(null);

    // Session Continuity: Restore scroll position & persist on scroll
    useEffect(() => {
        try {
            const savedScroll = sessionStorage.getItem(`aura-scroll-${currentView}`);
            if (savedScroll) {
                window.scrollTo({ top: parseInt(savedScroll, 10), behavior: 'instant' });
            }
        } catch {}

        const handleScroll = () => {
            sessionStorage.setItem(`aura-scroll-${currentView}`, window.scrollY.toString());
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [currentView]);

    // Session Continuity: Welcome Back context on app reopen (>15 min)
    useEffect(() => {
        if (!allDataLoaded) return;
        try {
            const lastSessionTime = localStorage.getItem('aura-last-session-timestamp');
            const now = Date.now();
            localStorage.setItem('aura-last-session-timestamp', now.toString());

            if (lastSessionTime && now - parseInt(lastSessionTime, 10) > 15 * 60 * 1000) {
                const activeCount = tasks.filter(t => !t.completed && !t.isArchived).length;
                const viewName = currentView.charAt(0).toUpperCase() + currentView.slice(1);
                setWelcomeBanner({
                    viewName,
                    activeCount
                });
                const timer = setTimeout(() => setWelcomeBanner(null), 7000);
                return () => clearTimeout(timer);
            }
        } catch {}
    }, [allDataLoaded]);

    const filteredTasks = useMemo(() => {
        const nonArchived = tasks.filter(t => !t.isArchived);
        if (activeFilter.type === 'all') return nonArchived;
        if (activeFilter.type === 'priority') return nonArchived.filter(t => t.priority === 3);
        if (activeFilter.type === 'category') return nonArchived.filter(t => t.category === activeFilter.value);
        if (activeFilter.type === 'tag') return nonArchived.filter(t => (t.tags || []).includes(activeFilter.value));
        if (activeFilter.type === 'due_this_week') {
            const today = new Date();
            const endOfWeek = new Date();
            endOfWeek.setDate(today.getDate() + (6 - today.getDay()) + 1);
            return nonArchived.filter(t => !t.completed && t.deadline && new Date(t.deadline) <= endOfWeek);
        }
        return nonArchived;
    }, [tasks, activeFilter]);

    const allTags = useMemo(() => [...new Set(tasks.flatMap(t => t.tags || []))], [tasks]);

    // Active custom theme styles
    const activeCustomTheme = useMemo(() => customThemes.find(ct => ct.id === theme), [customThemes, theme]);

    // Stale task handlers
    const handleRecommitStaleTask = (id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, timeOfDay: 'morning', createdAt: new Date().toISOString(), priority: 3 } : t));
    };
    const handleSnoozeStaleTask = (id) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, tags: [...new Set([...(t.tags || []), 'someday'])], priority: 1 } : t));
    };
    const handleForgiveStaleTask = (id) => {
        if (forgiveTask) forgiveTask(id);
        else deleteTask(id);
    };

    return (
        <div className={`theme-wrapper theme-${theme} min-h-screen font-sans antialiased bg-[var(--color-bg)] text-[var(--color-text-primary)] flex flex-col`}>
            {activeCustomTheme && (
                <style>{`
                    .theme-${activeCustomTheme.id} {
                        --color-bg: ${activeCustomTheme.bg};
                        --color-bg-secondary: ${activeCustomTheme.bgSecondary};
                        --color-bg-secondary-hover: ${activeCustomTheme.bgSecondary};
                        --color-bg-input: ${activeCustomTheme.bgSecondary}80;
                        --color-text-primary: ${activeCustomTheme.textPrimary};
                        --color-text-secondary: ${activeCustomTheme.textSecondary};
                        --color-border: ${activeCustomTheme.textSecondary}40;
                        --color-accent: ${activeCustomTheme.accent};
                    }
                `}</style>
            )}

            <ThemeBackground theme={theme} />

            <AnimatePresence>
                {isLoading && <LoadingScreen key="loading" />}
            </AnimatePresence>

            {!isLoading && (
                <motion.div
                    key="main-app"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col flex-grow main-container"
                >
                    <SkipToContent targetId="main-content" />
                    <main id="main-content" tabIndex="-1" className="flex-grow pt-8 pb-48 px-4 sm:px-6 lg:px-8 relative z-10 focus:outline-none">
                        {/* Session Continuity Welcome Back Banner */}
                        <AnimatePresence>
                            {welcomeBanner && (
                                <motion.div
                                    initial={{ opacity: 0, y: -20, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -15, scale: 0.98 }}
                                    transition={{ duration: 0.3 }}
                                    className="max-w-2xl mx-auto mb-6 p-3 sm:px-4 sm:py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-purple-500/10 to-teal-500/15 border border-amber-400/30 backdrop-blur-xl shadow-lg flex items-center justify-between gap-3 text-xs"
                                >
                                    <div className="flex items-center gap-2.5">
                                        <span className="text-base">🌙</span>
                                        <p className="text-[var(--color-text-primary)] font-medium">
                                            <span className="font-bold text-amber-300">Welcome back</span> — you left off in <span className="font-semibold text-purple-300">{welcomeBanner.viewName}</span>. You have <span className="font-bold text-emerald-400">{welcomeBanner.activeCount} active tasks</span> for today.
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => setWelcomeBanner(null)}
                                        className="p-1 text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] rounded transition-colors flex-shrink-0"
                                        aria-label="Dismiss welcome banner"
                                    >
                                        <XIcon className="w-3.5 h-3.5" />
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <Header
                            momentumProgress={momentumProgress}
                            onSettingsClick={() => setIsSettingsOpen(true)}
                            onSearchClick={() => setIsSearchOpen(true)}
                            onMindfulClick={() => setIsMindfulMinuteOpen(true)}
                            dailyQuote={dailyQuote}
                            onShare={() => setIsShareSummaryOpen(true)}
                            onShortcutsClick={() => setIsShortcutsOpen(true)}
                            onAmbientClick={() => setIsAmbientSoundOpen(true)}
                        />

                        <AnimatePresence>
                            {assistantMessage && (
                                <AssistantPrompt
                                    message={assistantMessage.message}
                                    action={assistantMessage.action}
                                    onAction={() => {}}
                                    onClose={() => setAssistantMessage(null)}
                                    showNext={shutdownRitual.active && shutdownRitual.step < shutdownRitualMessages.length - 1}
                                    onNext={() => {
                                        setShutdownRitual(s => ({ ...s, step: s.step + 1 }));
                                        if (shutdownRitual.step >= shutdownRitualMessages.length - 2) {
                                            setShutdownRitual({ active: false, step: 0 });
                                        }
                                    }}
                                    allowSeedInput={shutdownRitual.active && shutdownRitual.step === 1}
                                    onPlantSeed={plantTomorrowSeed}
                                    />
                            )}
                        </AnimatePresence>

                        <React.Suspense fallback={null}>
                            <AnimatePresence mode="wait">
                                {currentView === 'flow' && (
                                    <FlowView
                                        key="flow"
                                        tasks={filteredTasks}
                                        toggleTask={toggleTask}
                                        deleteTask={deleteTask}
                                        onFocus={setFocusTaskId}
                                        activeFilter={activeFilter}
                                        setActiveFilter={setActiveFilter}
                                        onReorder={reorderTask}
                                        onReorderSectionTasks={reorderSectionTasks}
                                        onToggleSubtask={toggleSubtask}
                                        allTasks={tasks}
                                        allCategories={allCategories}
                                        onOpenDetail={(id) => setDetailModal({ isOpen: true, taskId: id })}
                                        onTogglePin={togglePin}
                                        onArchive={archiveTask}
                                        monolithTaskId={monolithTaskId}
                                        setMonolithTaskId={setMonolithTaskId}
                                        tunnelVision={tunnelVision}
                                        setTunnelVision={setTunnelVision}
                                        moveTaskToSection={moveTaskToSection}
                                        stats={stats}
                                    />
                                )}
                                {currentView === 'constellations' && (
                                    <ConstellationsView
                                        key="constellations"
                                        tasks={tasks}
                                        toggleTask={toggleTask}
                                        onSaveTemplate={saveTemplate}
                                        templates={templates}
                                        allCategories={allCategories}
                                    />
                                )}
                                {currentView === 'grove' && (
                                    <GroveView
                                        key="grove"
                                        tasks={tasks}
                                        grove={grove}
                                        goldenSeeds={stats.goldenSeeds}
                                        onPlantSeed={handlePlantSeed}
                                        allCategories={allCategories}
                                        onOpenHarvestCard={() => setIsBrainSweepOpen(false)}
                                    />
                                )}
                                {currentView === 'journal' && (
                                    <JournalView
                                        key="journal"
                                        journalEntries={journalEntries}
                                        setJournalEntries={setJournalEntries}
                                        completedTasks={tasks.filter(t => t.completed && !t.isArchived)}
                                    />
                                )}
                                {currentView === 'review' && (
                                    <ReviewView
                                        key="review"
                                        tasks={tasks}
                                        achievements={unlockedAchievements}
                                        allCategories={allCategories}
                                        stats={stats}
                                        onDeleteStale={deleteTask}
                                        onRecommitTask={handleRecommitStaleTask}
                                        onSnoozeTask={handleSnoozeStaleTask}
                                        onForgiveTask={handleForgiveStaleTask}
                                    />
                                )}
                            </AnimatePresence>
                        </React.Suspense>
                    </main>

                    {currentView === 'flow' && (
                        <CaptureInput
                            onAddTask={addTask}
                            onOpenBrainSweep={() => setIsBrainSweepOpen(true)}
                            allTags={allTags}
                        />
                    )}
                    <BottomNav currentView={currentView} setCurrentView={setCurrentView} />

                    {/* All modals managed by ModalManager */}
                    <ModalManager />
                </motion.div>
            )}
        </div>
    );
};

export default function App() {
    return (
        <UIProvider>
            <ThemeProvider>
                <SettingsProvider>
                    <GroveProvider>
                        <TaskProvider>
                            <AuraAppContent />
                        </TaskProvider>
                    </GroveProvider>
                </SettingsProvider>
            </ThemeProvider>
        </UIProvider>
    );
}

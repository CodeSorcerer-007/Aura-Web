import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { WelcomeBanner } from './components/common/WelcomeBanner';
import { QuickStatsWidget } from './components/common/QuickStatsWidget';
import { getTodayDateString } from './utils/dateUtils';

import { FlowView } from './components/views/FlowView';
import SkipToContent from './components/common/SkipToContent';
import { ErrorBoundary } from './components/common/ErrorBoundary';

const ConstellationsView = React.lazy(() => import('./components/views/ConstellationsView').then(m => ({ default: m.ConstellationsView })));
const GroveView = React.lazy(() => import('./components/views/GroveView').then(m => ({ default: m.GroveView })));
const JournalView = React.lazy(() => import('./components/views/JournalView').then(m => ({ default: m.JournalView })));
const ReviewView = React.lazy(() => import('./components/views/ReviewView').then(m => ({ default: m.ReviewView })));

import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { useFilteredTasks } from './hooks/useFilteredTasks';
import { useStaleTasks } from './hooks/useStaleTasks';

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
        setToastMessage,
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
    const welcomeCheckedRef = useRef(false);
    useEffect(() => {
        if (!allDataLoaded || welcomeCheckedRef.current) return;
        welcomeCheckedRef.current = true;
        try {
            const lastSessionTime = localStorage.getItem('aura-last-session-timestamp');
            const now = Date.now();
            localStorage.setItem('aura-last-session-timestamp', now.toString());

            if (lastSessionTime && now - parseInt(lastSessionTime, 10) > 15 * 60 * 1000) {
                const activeCount = tasks.filter(t => !t.completed && !t.isArchived).length;
                const viewName = currentView.charAt(0).toUpperCase() + currentView.slice(1);
                const timer = setTimeout(() => {
                    setWelcomeBanner({
                        viewName,
                        activeCount
                    });
                }, 50);
                const dismissTimer = setTimeout(() => setWelcomeBanner(null), 7050);
                return () => {
                    clearTimeout(timer);
                    clearTimeout(dismissTimer);
                };
            }
        } catch {}
    }, [allDataLoaded, tasks, currentView]);

    // Audio Autoplay Guard: Re-engagement Toast when ambient audio is active but suspended
    useEffect(() => {
        const handleAmbientState = async (e) => {
            if (e.detail?.isSuspended) {
                const { resumeAudioContext } = await import('./hooks/useAmbientSound');
                setToastMessage({
                    type: 'warning',
                    text: '🎧 Soundscape waiting for gesture — click anywhere to enable audio',
                    actionText: 'Enable',
                    onAction: async () => {
                        await resumeAudioContext();
                    }
                });
            }
        };
        window.addEventListener('aura-ambient-state-changed', handleAmbientState);
        return () => window.removeEventListener('aura-ambient-state-changed', handleAmbientState);
    }, [setToastMessage]);

    // Filtered tasks and tags via custom hook
    const { filteredTasks, allTags } = useFilteredTasks(tasks, activeFilter);

    // Stale task operations via custom hook
    const { handleRecommitStaleTask, handleSnoozeStaleTask, handleForgiveStaleTask } = useStaleTasks(
        setTasks,
        deleteTask,
        forgiveTask
    );

    // Active custom theme styles
    const activeCustomTheme = useMemo(() => customThemes.find(ct => ct.id === theme), [customThemes, theme]);

    // Completed today count for quick stats widget
    const completedTodayCount = useMemo(() => {
        const todayStr = getTodayDateString();
        return tasks.filter(t => t.completed && t.completionDate === todayStr).length;
    }, [tasks]);

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
                        <WelcomeBanner
                            welcomeBanner={welcomeBanner}
                            onDismiss={() => setWelcomeBanner(null)}
                        />

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

                        {/* Mindful Momentum Quick Stats Bar */}
                        <QuickStatsWidget
                            stats={stats}
                            completedTodayCount={completedTodayCount}
                            groveCount={grove?.length || 0}
                            onStreakClick={() => setCurrentView('review')}
                            onGroveClick={() => setCurrentView('grove')}
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

                        <ErrorBoundary>
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
                        </ErrorBoundary>
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

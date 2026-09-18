import React, { useMemo, useRef, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import { ThemeProvider, useTheme } from './context/ThemeContext';
import { UIProvider, useUI } from './context/UIContext';
import { TaskProvider, useTasks } from './context/TaskContext';

import { ThemeBackground } from './components/backgrounds/ThemeBackground';
import { Header } from './components/common/Header';
import { AssistantPrompt } from './components/common/AssistantPrompt';
import { CaptureInput } from './components/common/CaptureInput';
import { BottomNav } from './components/common/BottomNav';
import { LoadingScreen } from './components/common/LoadingScreen';
import { AchievementToast, GenericToast } from './components/common/Toast';

import { FlowView } from './components/views/FlowView';
import { ConstellationsView } from './components/views/ConstellationsView';
import { GroveView, PlantingAnimation } from './components/views/GroveView';
import { JournalView } from './components/views/JournalView';
import { ReviewView } from './components/views/ReviewView';
import { FocusView } from './components/views/FocusView';

import { SettingsModal } from './components/modals/SettingsModal';
import { SearchModal } from './components/modals/SearchModal';
import { MindfulMinuteModal } from './components/modals/MindfulMinuteModal';
import { ThemeCreatorModal } from './components/modals/ThemeCreatorModal';
import { ArchiveModal } from './components/modals/ArchiveModal';
import { ShareSummaryModal } from './components/modals/ShareSummaryModal';
import { CommandPalette } from './components/modals/CommandPalette';
import { WinModal } from './components/modals/WinModal';
import { TemplateSuggestionModal } from './components/modals/TemplateSuggestionModal';
import { TaskDetailModal } from './components/modals/TaskDetailModal';
import { ShortcutsModal } from './components/modals/ShortcutsModal';

const AuraAppContent = () => {
    const { theme, setTheme, themeLoaded, customThemes, setCustomThemes, customThemesLoaded, allThemes } = useTheme();
    const {
        currentView, setCurrentView,
        focusTaskId, setFocusTaskId,
        isSettingsOpen, setIsSettingsOpen,
        isSearchOpen, setIsSearchOpen,
        isMindfulMinuteOpen, setIsMindfulMinuteOpen,
        isThemeCreatorOpen, setIsThemeCreatorOpen,
        isArchiveOpen, setIsArchiveOpen,
        isShareSummaryOpen, setIsShareSummaryOpen,
        isCommandPaletteOpen, setIsCommandPaletteOpen,
        isShortcutsOpen, setIsShortcutsOpen,
        detailModal, setDetailModal,
        activeFilter, setActiveFilter,
        toastMessage, setToastMessage,
        achievementToast, setAchievementToast,
        winModalTaskId, setWinModalTaskId,
        templateSuggestion, setTemplateSuggestion,
        assistantMessage, setAssistantMessage,
        isPlanting
    } = useUI();

    const {
        allDataLoaded,
        tasks,
        templates,
        stats,
        unlockedAchievements,
        grove,
        customCategories,
        setCustomCategories,
        allCategories,
        journalEntries,
        setJournalEntries,
        shutdownTime,
        setShutdownTime,
        soundEffectsEnabled,
        setSoundEffectsEnabled,
        autoArchiveEnabled,
        setAutoArchiveEnabled,
        notificationsEnabled,
        handleSetNotifications,
        shutdownRitual,
        setShutdownRitual,
        shutdownRitualMessages,
        dailyQuote,
        dailyStats,
        momentumProgress,
        addTask,
        toggleTask,
        togglePin,
        deleteTask,
        archiveTask,
        restoreTask,
        saveTaskDetail,
        setTaskDependency,
        addAttachmentToTask,
        deleteAttachmentFromTask,
        saveTemplate,
        handlePlantSeed,
        finishPlanting,
        reorderTask,
        toggleSubtask,
        saveWin,
        handleFocusComplete,
        handleExport,
        handleImportFile
    } = useTasks();

    const importInputRef = useRef(null);

    const isLoading = !allDataLoaded || !themeLoaded || !customThemesLoaded;

    const focusTask = useMemo(() => tasks.find(t => t.id === focusTaskId), [tasks, focusTaskId]);
    const detailTask = useMemo(() => tasks.find(t => t.id === detailModal.taskId), [tasks, detailModal.taskId]);

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

    // Active custom theme styles
    const activeCustomTheme = useMemo(() => {
        return customThemes.find(ct => ct.id === theme);
    }, [customThemes, theme]);

    // Keyboard Shortcuts
    useEffect(() => {
        const handleKeyDown = (e) => {
            const activeEl = document.activeElement;
            const isInputFocused = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'p') {
                e.preventDefault();
                setIsCommandPaletteOpen(prev => !prev);
                return;
            }

            if (e.key === 'Escape') {
                if (isCommandPaletteOpen) setIsCommandPaletteOpen(false);
                else if (isSearchOpen) setIsSearchOpen(false);
                else if (isSettingsOpen) setIsSettingsOpen(false);
                else if (detailModal.isOpen) setDetailModal({ isOpen: false, taskId: null });
                else if (focusTaskId) setFocusTaskId(null);
                else if (isMindfulMinuteOpen) setIsMindfulMinuteOpen(false);
                else if (isThemeCreatorOpen) setIsThemeCreatorOpen(false);
                else if (isArchiveOpen) setIsArchiveOpen(false);
                else if (isShareSummaryOpen) setIsShareSummaryOpen(false);
                else if (isShortcutsOpen) setIsShortcutsOpen(false);
                return;
            }

            if (isInputFocused) return;

            if (e.key === '?' || (e.shiftKey && e.key === '/')) {
                e.preventDefault();
                setIsShortcutsOpen(prev => !prev);
                return;
            }

            switch (e.key) {
                case 'n':
                case 'N':
                    e.preventDefault();
                    document.querySelector('input[placeholder*="Capture a thought"]')?.focus();
                    break;
                case 's':
                case 'S':
                    e.preventDefault();
                    setIsSettingsOpen(true);
                    break;
                case '1': setCurrentView('flow'); break;
                case '2': setCurrentView('constellations'); break;
                case '3': setCurrentView('grove'); break;
                case '4': setCurrentView('journal'); break;
                case '5': setCurrentView('review'); break;
                default: break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isCommandPaletteOpen, isSearchOpen, isSettingsOpen, detailModal.isOpen, focusTaskId, isMindfulMinuteOpen, isThemeCreatorOpen, isArchiveOpen, isShareSummaryOpen, isShortcutsOpen, setCurrentView, setIsCommandPaletteOpen, setIsSearchOpen, setIsSettingsOpen, setDetailModal, setFocusTaskId, setIsMindfulMinuteOpen, setIsThemeCreatorOpen, setIsArchiveOpen, setIsShareSummaryOpen, setIsShortcutsOpen]);

    const commands = useMemo(() => [
        { label: "New Task", action: () => document.querySelector('input[placeholder*="Capture a thought"]')?.focus(), shortcut: "N" },
        { label: "Open Search", action: () => setIsSearchOpen(true), shortcut: "Ctrl+P" },
        { label: "Open Settings", action: () => setIsSettingsOpen(true), shortcut: "S" },
        { label: "Keyboard Shortcuts", action: () => setIsShortcutsOpen(true), shortcut: "?" },
        { label: "Mindful Breathing Minute", action: () => setIsMindfulMinuteOpen(true), shortcut: "" },
        { label: "Share Today's Wins", action: () => setIsShareSummaryOpen(true), shortcut: "" },
        { label: "Archived Tasks", action: () => setIsArchiveOpen(true), shortcut: "" },
        { label: "Go to Flow", action: () => setCurrentView('flow'), shortcut: "1" },
        { label: "Go to Projects", action: () => setCurrentView('constellations'), shortcut: "2" },
        { label: "Go to Grove", action: () => setCurrentView('grove'), shortcut: "3" },
        { label: "Go to Journal", action: () => setCurrentView('journal'), shortcut: "4" },
        { label: "Go to Review", action: () => setCurrentView('review'), shortcut: "5" },
        { label: "Toggle Theme: Dark", action: () => setTheme('dark'), shortcut: "" },
        { label: "Toggle Theme: Light", action: () => setTheme('light'), shortcut: "" },
    ], [setCurrentView, setIsArchiveOpen, setIsMindfulMinuteOpen, setIsSearchOpen, setIsSettingsOpen, setIsShareSummaryOpen, setIsShortcutsOpen, setTheme]);

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
                    <main className="flex-grow pt-8 pb-48 px-4 sm:px-6 lg:px-8 relative z-10">
                        <Header
                            momentumProgress={momentumProgress}
                            onSettingsClick={() => setIsSettingsOpen(true)}
                            onSearchClick={() => setIsSearchOpen(true)}
                            onMindfulClick={() => setIsMindfulMinuteOpen(true)}
                            dailyQuote={dailyQuote}
                            onShare={() => setIsShareSummaryOpen(true)}
                            onShortcutsClick={() => setIsShortcutsOpen(true)}
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
                                />
                            )}
                        </AnimatePresence>

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
                                    onToggleSubtask={toggleSubtask}
                                    allTasks={tasks}
                                    allCategories={allCategories}
                                    onOpenDetail={(id) => setDetailModal({ isOpen: true, taskId: id })}
                                    onTogglePin={togglePin}
                                    onArchive={archiveTask}
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
                                />
                            )}
                        </AnimatePresence>
                    </main>

                    {currentView === 'flow' && <CaptureInput onAddTask={addTask} />}
                    <BottomNav currentView={currentView} setCurrentView={setCurrentView} />

                    {/* Modals & Dialogs */}
                    <AnimatePresence>
                        {isSettingsOpen && (
                            <SettingsModal
                                isOpen={isSettingsOpen}
                                onClose={() => setIsSettingsOpen(false)}
                                theme={theme}
                                setTheme={setTheme}
                                customCategories={customCategories}
                                onUpdateCustomCategories={setCustomCategories}
                                allThemes={allThemes}
                                onOpenThemeCreator={() => setIsThemeCreatorOpen(true)}
                                shutdownTime={shutdownTime}
                                onSetShutdownTime={setShutdownTime}
                                soundEffectsEnabled={soundEffectsEnabled}
                                onSetSoundEffectsEnabled={setSoundEffectsEnabled}
                                onOpenArchive={() => setIsArchiveOpen(true)}
                                autoArchiveEnabled={autoArchiveEnabled}
                                onSetAutoArchiveEnabled={setAutoArchiveEnabled}
                                onExport={handleExport}
                                onTriggerImport={() => importInputRef.current?.click()}
                                notificationsEnabled={notificationsEnabled}
                                onSetNotificationsEnabled={handleSetNotifications}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isPlanting && (
                            <PlantingAnimation onComplete={() => finishPlanting('oak')} />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {focusTask && (
                            <FocusView
                                task={focusTask}
                                onClose={() => setFocusTaskId(null)}
                                onComplete={handleFocusComplete}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {winModalTaskId && (
                            <WinModal
                                task={tasks.find(t => t.id === winModalTaskId)}
                                onSave={saveWin}
                                onClose={() => setWinModalTaskId(null)}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {templateSuggestion && (
                            <TemplateSuggestionModal
                                suggestion={templateSuggestion}
                                onApply={() => addTask(null, templateSuggestion.templateName)}
                                onContinue={() => addTask(templateSuggestion.taskText)}
                                onClose={() => setTemplateSuggestion(null)}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {achievementToast && (
                            <AchievementToast
                                achievement={achievementToast}
                                onClose={() => setAchievementToast(null)}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {toastMessage && (
                            <GenericToast
                                message={toastMessage}
                                onClose={() => setToastMessage(null)}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isSearchOpen && (
                            <SearchModal
                                isOpen={isSearchOpen}
                                onClose={() => setIsSearchOpen(false)}
                                tasks={tasks.filter(t => !t.isArchived)}
                                onTaskClick={(id) => {
                                    setDetailModal({ isOpen: true, taskId: id });
                                    setIsSearchOpen(false);
                                }}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {detailModal.isOpen && (
                            <TaskDetailModal
                                isOpen={detailModal.isOpen}
                                onClose={() => setDetailModal({ isOpen: false, taskId: null })}
                                task={detailTask}
                                onSave={saveTaskDetail}
                                onSetDependency={setTaskDependency}
                                allTasks={tasks.filter(t => !t.isArchived)}
                                onAddAttachment={addAttachmentToTask}
                                onDeleteAttachment={deleteAttachmentFromTask}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isMindfulMinuteOpen && (
                            <MindfulMinuteModal
                                isOpen={isMindfulMinuteOpen}
                                onClose={() => setIsMindfulMinuteOpen(false)}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isThemeCreatorOpen && (
                            <ThemeCreatorModal
                                isOpen={isThemeCreatorOpen}
                                onClose={() => setIsThemeCreatorOpen(false)}
                                onSave={(newTheme) => setCustomThemes(ct => [...ct, newTheme])}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isArchiveOpen && (
                            <ArchiveModal
                                isOpen={isArchiveOpen}
                                onClose={() => setIsArchiveOpen(false)}
                                archivedTasks={tasks.filter(t => t.isArchived)}
                                onRestore={restoreTask}
                                onDelete={deleteTask}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isShareSummaryOpen && (
                            <ShareSummaryModal
                                isOpen={isShareSummaryOpen}
                                onClose={() => setIsShareSummaryOpen(false)}
                                dailyStats={dailyStats}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isCommandPaletteOpen && (
                            <CommandPalette
                                isOpen={isCommandPaletteOpen}
                                onClose={() => setIsCommandPaletteOpen(false)}
                                commands={commands}
                            />
                        )}
                    </AnimatePresence>

                    <AnimatePresence>
                        {isShortcutsOpen && (
                            <ShortcutsModal
                                isOpen={isShortcutsOpen}
                                onClose={() => setIsShortcutsOpen(false)}
                            />
                        )}
                    </AnimatePresence>

                    <input
                        type="file"
                        ref={importInputRef}
                        onChange={handleImportFile}
                        className="hidden"
                        accept=".json"
                    />
                </motion.div>
            )}
        </div>
    );
};

export default function App() {
    return (
        <UIProvider>
            <ThemeProvider>
                <TaskProvider>
                    <AuraAppContent />
                </TaskProvider>
            </ThemeProvider>
        </UIProvider>
    );
}

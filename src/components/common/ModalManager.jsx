import React, { lazy, Suspense, useMemo, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';

import { useUI } from '../../context/UIContext';
import { useNotification } from '../../context/NotificationContext';
import { useTasks } from '../../context/TaskContext';
import { useSettings } from '../../context/SettingsContext';
import { useGrove } from '../../context/GroveContext';
import { useTheme } from '../../context/ThemeContext';

// Lazy-loaded modals — loaded on-demand when first opened
const SettingsModal = lazy(() => import('../modals/SettingsModal').then(m => ({ default: m.SettingsModal })));
const SearchModal = lazy(() => import('../modals/SearchModal').then(m => ({ default: m.SearchModal })));
const MindfulMinuteModal = lazy(() => import('../modals/MindfulMinuteModal').then(m => ({ default: m.MindfulMinuteModal })));
const ThemeCreatorModal = lazy(() => import('../modals/ThemeCreatorModal').then(m => ({ default: m.ThemeCreatorModal })));
const ArchiveModal = lazy(() => import('../modals/ArchiveModal').then(m => ({ default: m.ArchiveModal })));
const ShareSummaryModal = lazy(() => import('../modals/ShareSummaryModal').then(m => ({ default: m.ShareSummaryModal })));
const CommandPalette = lazy(() => import('../modals/CommandPalette').then(m => ({ default: m.CommandPalette })));
const WinModal = lazy(() => import('../modals/WinModal').then(m => ({ default: m.WinModal })));
const TemplateSuggestionModal = lazy(() => import('../modals/TemplateSuggestionModal').then(m => ({ default: m.TemplateSuggestionModal })));
const TaskDetailModal = lazy(() => import('../modals/TaskDetailModal').then(m => ({ default: m.TaskDetailModal })));
const ShortcutsModal = lazy(() => import('../modals/ShortcutsModal').then(m => ({ default: m.ShortcutsModal })));
const AmbientSoundModal = lazy(() => import('../modals/AmbientSoundModal').then(m => ({ default: m.AmbientSoundModal })));
const BrainSweepModal = lazy(() => import('../modals/BrainSweepModal').then(m => ({ default: m.BrainSweepModal })));
const HarvestCardModal = lazy(() => import('../modals/HarvestCardModal').then(m => ({ default: m.HarvestCardModal })));

// Eagerly loaded (always visible)
import { PlantingAnimation } from './PlantingAnimation';
import { AchievementToast, GenericToast } from './Toast';
import { OnboardingOverlay } from './OnboardingOverlay';

// Suspense fallback (invisible — modals handle their own loading state)
const ModalFallback = null;

import { useFocusTrap } from '../../hooks/useFocusTrap';

// Lazy-load wrapper with accessible focus trapping and ARIA dialog semantics
const LazyModal = ({ isOpen, onClose, ariaLabel = "Dialog", children }) => {
    const containerRef = useRef(null);
    useFocusTrap(containerRef, isOpen, onClose);

    if (!isOpen) return null;
    return (
        <Suspense fallback={ModalFallback}>
            <div ref={containerRef} role="dialog" aria-modal="true" aria-label={ariaLabel} className="contents">
                {children}
            </div>
        </Suspense>
    );
};

export const ModalManager = () => {
    const {
        isSettingsOpen, setIsSettingsOpen,
        isSearchOpen, setIsSearchOpen,
        isMindfulMinuteOpen, setIsMindfulMinuteOpen,
        isThemeCreatorOpen, setIsThemeCreatorOpen,
        isArchiveOpen, setIsArchiveOpen,
        isShareSummaryOpen, setIsShareSummaryOpen,
        isCommandPaletteOpen, setIsCommandPaletteOpen,
        isShortcutsOpen, setIsShortcutsOpen,
        detailModal, setDetailModal,
        focusTaskId, setFocusTaskId,
        isAmbientSoundOpen, setIsAmbientSoundOpen,
        isBrainSweepOpen, setIsBrainSweepOpen,
        isHarvestCardOpen, setIsHarvestCardOpen,
        isOnboardingOpen, setIsOnboardingOpen,
        setCurrentView
    } = useUI();

    const {
        toastMessage, setToastMessage,
        achievementToast, setAchievementToast,
        winModalTaskId, setWinModalTaskId,
        templateSuggestion, setTemplateSuggestion,
        isPlanting,
    } = useNotification();

    const {
        tasks,
        dailyStats,
        addTask,
        deleteTask,
        saveTaskDetail,
        setTaskDependency,
        addAttachmentToTask,
        deleteAttachmentFromTask,
        addVoiceNoteToTask,
        deleteVoiceNoteFromTask,
        restoreTask,
        saveWin,
        finishPlanting,
        handleFocusComplete,
        handleExport,
        handleImportFile,
        testShutdownReminder,
        getRollingSnapshots,
        restoreSnapshotById,
        handleSaveSafetyVault
    } = useTasks();

    const {
        customCategories, setCustomCategories,
        shutdownTime, setShutdownTime,
        soundEffectsEnabled, setSoundEffectsEnabled,
        autoArchiveEnabled, setAutoArchiveEnabled,
        notificationsEnabled, handleSetNotifications
    } = useSettings();

    const { stats, grove } = useGrove();
    const { theme, setTheme, allThemes, setCustomThemes } = useTheme();

    const importInputRef = useRef(null);

    const focusTask = useMemo(() => tasks.find(t => t.id === focusTaskId), [tasks, focusTaskId]);
    const detailTask = useMemo(() => tasks.find(t => t.id === detailModal.taskId), [tasks, detailModal.taskId]);

    const handleSweepTasks = useCallback((lines) => {
        lines.forEach(line => addTask(line));
        setToastMessage({ type: 'success', text: `Swept ${lines.length} thoughts into your Flow!` });
    }, [addTask, setToastMessage]);

    const commands = useMemo(() => [
        { label: "New Task", action: () => document.querySelector('input[placeholder*="Capture a thought"]')?.focus(), shortcut: "N" },
        { label: "Zen Brain Sweep", action: () => setIsBrainSweepOpen(true), shortcut: "B" },
        { label: "Harvest Polaroid Card", action: () => setIsHarvestCardOpen(true), shortcut: "" },
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
    ], [setCurrentView, setIsArchiveOpen, setIsMindfulMinuteOpen, setIsSearchOpen, setIsSettingsOpen, setIsShareSummaryOpen, setIsShortcutsOpen, setIsBrainSweepOpen, setIsHarvestCardOpen, setTheme]);

    return (
        <>
            {/* Focus View */}
            <AnimatePresence>
                {focusTask && (
                    <Suspense fallback={ModalFallback}>
                        <FocusViewLazy
                            task={focusTask}
                            onClose={() => setFocusTaskId(null)}
                            onComplete={handleFocusComplete}
                        />
                    </Suspense>
                )}
            </AnimatePresence>

            {/* Settings */}
            <AnimatePresence>
                <LazyModal isOpen={isSettingsOpen}>
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
                        onTestShutdownReminder={testShutdownReminder}
                        onSaveSafetyVault={handleSaveSafetyVault}
                        onRestoreSnapshot={restoreSnapshotById}
                        getRollingSnapshots={getRollingSnapshots}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Planting Animation */}
            <AnimatePresence>
                {isPlanting && (
                    <PlantingAnimation onComplete={() => finishPlanting('oak')} />
                )}
            </AnimatePresence>

            {/* Win Modal */}
            <AnimatePresence>
                <LazyModal isOpen={!!winModalTaskId}>
                    <WinModal
                        task={tasks.find(t => t.id === winModalTaskId)}
                        onSave={saveWin}
                        onClose={() => setWinModalTaskId(null)}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Template Suggestion */}
            <AnimatePresence>
                <LazyModal isOpen={!!templateSuggestion}>
                    <TemplateSuggestionModal
                        suggestion={templateSuggestion}
                        onApply={() => addTask(null, templateSuggestion.templateName)}
                        onContinue={() => addTask(templateSuggestion.taskText)}
                        onClose={() => setTemplateSuggestion(null)}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Achievement Toast */}
            <AnimatePresence>
                {achievementToast && (
                    <AchievementToast
                        achievement={achievementToast}
                        onClose={() => setAchievementToast(null)}
                    />
                )}
            </AnimatePresence>

            {/* Generic Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <GenericToast
                        message={toastMessage}
                        onClose={() => setToastMessage(null)}
                    />
                )}
            </AnimatePresence>

            {/* Search */}
            <AnimatePresence>
                <LazyModal isOpen={isSearchOpen}>
                    <SearchModal
                        isOpen={isSearchOpen}
                        onClose={() => setIsSearchOpen(false)}
                        tasks={tasks.filter(t => !t.isArchived)}
                        onTaskClick={(id) => {
                            setDetailModal({ isOpen: true, taskId: id });
                            setIsSearchOpen(false);
                        }}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Task Detail */}
            <AnimatePresence>
                <LazyModal isOpen={detailModal.isOpen}>
                    <TaskDetailModal
                        isOpen={detailModal.isOpen}
                        onClose={() => setDetailModal({ isOpen: false, taskId: null })}
                        task={detailTask}
                        onSave={saveTaskDetail}
                        onSetDependency={setTaskDependency}
                        allTasks={tasks.filter(t => !t.isArchived)}
                        onAddAttachment={addAttachmentToTask}
                        onDeleteAttachment={deleteAttachmentFromTask}
                        onAddVoiceNote={addVoiceNoteToTask}
                        onDeleteVoiceNote={deleteVoiceNoteFromTask}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Mindful Minute */}
            <AnimatePresence>
                <LazyModal isOpen={isMindfulMinuteOpen}>
                    <MindfulMinuteModal
                        isOpen={isMindfulMinuteOpen}
                        onClose={() => setIsMindfulMinuteOpen(false)}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Theme Creator */}
            <AnimatePresence>
                <LazyModal isOpen={isThemeCreatorOpen}>
                    <ThemeCreatorModal
                        isOpen={isThemeCreatorOpen}
                        onClose={() => setIsThemeCreatorOpen(false)}
                        onSave={(newTheme) => setCustomThemes(ct => [...ct, newTheme])}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Archive */}
            <AnimatePresence>
                <LazyModal isOpen={isArchiveOpen}>
                    <ArchiveModal
                        isOpen={isArchiveOpen}
                        onClose={() => setIsArchiveOpen(false)}
                        archivedTasks={tasks.filter(t => t.isArchived)}
                        onRestore={restoreTask}
                        onDelete={deleteTask}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Share Summary */}
            <AnimatePresence>
                <LazyModal isOpen={isShareSummaryOpen}>
                    <ShareSummaryModal
                        isOpen={isShareSummaryOpen}
                        onClose={() => setIsShareSummaryOpen(false)}
                        dailyStats={dailyStats}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Command Palette */}
            <AnimatePresence>
                <LazyModal isOpen={isCommandPaletteOpen}>
                    <CommandPalette
                        isOpen={isCommandPaletteOpen}
                        onClose={() => setIsCommandPaletteOpen(false)}
                        commands={commands}
                        tasks={tasks}
                        onTaskSelect={(id) => setDetailModal({ isOpen: true, taskId: id })}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Shortcuts */}
            <AnimatePresence>
                <LazyModal isOpen={isShortcutsOpen}>
                    <ShortcutsModal
                        isOpen={isShortcutsOpen}
                        onClose={() => setIsShortcutsOpen(false)}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Ambient Sound */}
            <AnimatePresence>
                <LazyModal isOpen={isAmbientSoundOpen}>
                    <AmbientSoundModal
                        isOpen={isAmbientSoundOpen}
                        onClose={() => setIsAmbientSoundOpen(false)}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Brain Sweep */}
            <AnimatePresence>
                <LazyModal isOpen={isBrainSweepOpen}>
                    <BrainSweepModal
                        isOpen={isBrainSweepOpen}
                        onClose={() => setIsBrainSweepOpen(false)}
                        onSweepTasks={handleSweepTasks}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* Harvest Card */}
            <AnimatePresence>
                <LazyModal isOpen={isHarvestCardOpen}>
                    <HarvestCardModal
                        isOpen={isHarvestCardOpen}
                        onClose={() => setIsHarvestCardOpen(false)}
                        grove={grove}
                        stats={stats}
                        tasks={tasks}
                    />
                </LazyModal>
            </AnimatePresence>

            {/* 4-Step Onboarding Coach Tour */}
            <OnboardingOverlay
                isOpen={isOnboardingOpen}
                onClose={() => setIsOnboardingOpen(false)}
            />

            {/* Hidden file input for import */}
            <input
                type="file"
                ref={importInputRef}
                onChange={handleImportFile}
                className="hidden"
                accept=".json"
            />
        </>
    );
};

// Lazy FocusView (heavy component with Tone.js integration)
const FocusViewLazy = lazy(() => import('../views/FocusView').then(m => ({ default: m.FocusView })));

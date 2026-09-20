import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
    const [currentView, setCurrentViewState] = useState(() => {
        try {
            const saved = localStorage.getItem('aura-last-view');
            return saved && ['flow', 'constellations', 'grove', 'journal', 'review'].includes(saved)
                ? saved
                : 'flow';
        } catch {
            return 'flow';
        }
    });

    const setCurrentView = (viewOrUpdater) => {
        setCurrentViewState(prev => {
            const nextView = typeof viewOrUpdater === 'function' ? viewOrUpdater(prev) : viewOrUpdater;
            try {
                localStorage.setItem('aura-last-view', nextView);
            } catch (e) {
                console.error('Failed to persist view', e);
            }
            return nextView;
        });
    };
    const [focusTaskId, setFocusTaskId] = useState(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMindfulMinuteOpen, setIsMindfulMinuteOpen] = useState(false);
    const [isThemeCreatorOpen, setIsThemeCreatorOpen] = useState(false);
    const [isArchiveOpen, setIsArchiveOpen] = useState(false);
    const [isShareSummaryOpen, setIsShareSummaryOpen] = useState(false);
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
    const [detailModal, setDetailModal] = useState({ isOpen: false, taskId: null });
    const [activeFilter, setActiveFilter] = useState({ type: 'all', value: null });
    const [toastMessage, setToastMessage] = useState(null);
    const [achievementToast, setAchievementToast] = useState(null);
    const [winModalTaskId, setWinModalTaskId] = useState(null);
    const [templateSuggestion, setTemplateSuggestion] = useState(null);
    const [assistantMessage, setAssistantMessage] = useState(null);
    const [isPlanting, setIsPlanting] = useState(false);
    // Moved from App.jsx local state into UIContext for ModalManager access
    const [isAmbientSoundOpen, setIsAmbientSoundOpen] = useState(false);
    const [isBrainSweepOpen, setIsBrainSweepOpen] = useState(false);
    const [isHarvestCardOpen, setIsHarvestCardOpen] = useState(false);
    const [isOnboardingOpen, setIsOnboardingOpen] = useState(() => {
        try {
            return !localStorage.getItem('aura-onboarding-completed');
        } catch {
            return false;
        }
    });

    const value = {
        currentView,
        setCurrentView,
        focusTaskId,
        setFocusTaskId,
        isSettingsOpen,
        setIsSettingsOpen,
        isSearchOpen,
        setIsSearchOpen,
        isMindfulMinuteOpen,
        setIsMindfulMinuteOpen,
        isThemeCreatorOpen,
        setIsThemeCreatorOpen,
        isArchiveOpen,
        setIsArchiveOpen,
        isShareSummaryOpen,
        setIsShareSummaryOpen,
        isCommandPaletteOpen,
        setIsCommandPaletteOpen,
        isShortcutsOpen,
        setIsShortcutsOpen,
        detailModal,
        setDetailModal,
        activeFilter,
        setActiveFilter,
        toastMessage,
        setToastMessage,
        achievementToast,
        setAchievementToast,
        winModalTaskId,
        setWinModalTaskId,
        templateSuggestion,
        setTemplateSuggestion,
        assistantMessage,
        setAssistantMessage,
        isPlanting,
        setIsPlanting,
        isAmbientSoundOpen,
        setIsAmbientSoundOpen,
        isBrainSweepOpen,
        setIsBrainSweepOpen,
        isHarvestCardOpen,
        setIsHarvestCardOpen,
        isOnboardingOpen,
        setIsOnboardingOpen
    };

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within UIProvider');
    return context;
};

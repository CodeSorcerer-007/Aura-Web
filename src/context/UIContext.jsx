import React, { createContext, useContext, useState } from 'react';

const UIContext = createContext(null);

export const UIProvider = ({ children }) => {
    const [currentView, setCurrentView] = useState('flow');
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
        setIsPlanting
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

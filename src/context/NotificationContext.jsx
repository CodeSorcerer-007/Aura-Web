/**
 * NotificationContext
 *
 * Holds all transient feedback state — toasts, achievement toasts, the
 * assistant/shutdown-ritual message, the win-recording modal, template
 * suggestions, and the planting animation flag.
 *
 * Splitting these out of UIContext means that a toast appearing or
 * disappearing no longer triggers a re-render in every component that
 * calls useUI() only for navigation state or modal flags.
 *
 * Consumers that need notification state call useNotification().
 * Consumers that only need navigation / modals call useUI() as before —
 * they are now completely isolated from notification re-renders.
 */

import React, { createContext, useContext, useState } from 'react';

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const [toastMessage, setToastMessage] = useState(null);
    const [achievementToast, setAchievementToast] = useState(null);
    const [assistantMessage, setAssistantMessage] = useState(null);
    const [isPlanting, setIsPlanting] = useState(false);
    const [winModalTaskId, setWinModalTaskId] = useState(null);
    const [templateSuggestion, setTemplateSuggestion] = useState(null);

    const value = {
        toastMessage,
        setToastMessage,
        achievementToast,
        setAchievementToast,
        assistantMessage,
        setAssistantMessage,
        isPlanting,
        setIsPlanting,
        winModalTaskId,
        setWinModalTaskId,
        templateSuggestion,
        setTemplateSuggestion,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};

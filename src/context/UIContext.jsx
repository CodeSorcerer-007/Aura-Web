/**
 * UIContext — Navigation & Modal State
 *
 * Deliberately narrow: only holds state that drives view routing, active
 * filter, and modal open/close flags.  Transient feedback (toasts,
 * achievements, assistant prompts, planting) lives in NotificationContext
 * so that notification changes never re-render navigation consumers.
 */

import React, { createContext, useContext, useState, useReducer, useCallback } from 'react';

// ---------------------------------------------------------------------------
// Modal State — managed via useReducer so that opening one modal does NOT
// trigger re-renders in components that only care about a different modal.
// ---------------------------------------------------------------------------

/** All recognised modal keys. */
const MODAL_KEYS = [
    'settings',
    'search',
    'mindfulMinute',
    'themeCreator',
    'archive',
    'shareSummary',
    'commandPalette',
    'shortcuts',
    'ambientSound',
    'brainSweep',
    'harvestCard',
    'onboarding',
];

const initialModalState = MODAL_KEYS.reduce((acc, key) => {
    acc[key] = false;
    return acc;
}, {});

// Initialise onboarding flag synchronously from localStorage.
// aura-onboarding-completed is written by OnboardingOverlay when the user
// completes or skips onboarding, so it's intentionally raw here — it only
// needs to be read once at startup, not reactively tracked.
try {
    if (typeof window !== 'undefined' && !window.localStorage.getItem('aura-onboarding-completed')) {
        initialModalState.onboarding = true;
    }
} catch {}

function modalReducer(state, action) {
    switch (action.type) {
        case 'OPEN':
            if (state[action.modal] === true) return state; // no-op → no re-render
            return { ...state, [action.modal]: true };
        case 'CLOSE':
            if (state[action.modal] === false) return state;
            return { ...state, [action.modal]: false };
        case 'TOGGLE':
            return { ...state, [action.modal]: !state[action.modal] };
        default:
            return state;
    }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const UIContext = createContext(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export const UIProvider = ({ children }) => {
    // -----------------------------------------------------------------------
    // Navigation — hash-based so the browser back/forward button works and
    // each view has a deep-linkable URL (e.g. /#review, /#grove).
    //
    // aura-last-view is written here directly (not via usePreferences) because
    // it is tightly coupled to window.history.pushState — the two writes must
    // stay in sync in the same callback.  usePreferences would add an
    // unnecessary React render cycle for what is purely a persistence side-effect.
    // -----------------------------------------------------------------------
    const [currentView, setCurrentViewState] = useState(() => {
        try {
            const VALID = ['flow', 'constellations', 'grove', 'journal', 'review'];
            const hash = window.location.hash.replace('#', '');
            if (VALID.includes(hash)) return hash;
            const saved = localStorage.getItem('aura-last-view');
            if (saved && VALID.includes(saved)) return saved;
        } catch {}
        return 'flow';
    });

    const setCurrentView = useCallback((viewOrUpdater) => {
        setCurrentViewState(prev => {
            const nextView = typeof viewOrUpdater === 'function' ? viewOrUpdater(prev) : viewOrUpdater;
            try {
                window.history.pushState(null, '', `#${nextView}`);
                localStorage.setItem('aura-last-view', nextView);
            } catch (e) {
                console.error('[UIContext] Failed to persist view:', e);
            }
            return nextView;
        });
    }, []);

    // Back/forward button support
    React.useEffect(() => {
        const VALID = ['flow', 'constellations', 'grove', 'journal', 'review'];
        const handlePopState = () => {
            const hash = window.location.hash.replace('#', '');
            if (VALID.includes(hash)) setCurrentViewState(hash);
        };
        window.addEventListener('popstate', handlePopState);
        // On first mount ensure the URL hash reflects the active view without
        // pushing a new history entry.
        try {
            const currentHash = window.location.hash.replace('#', '');
            if (!VALID.includes(currentHash)) {
                const saved = localStorage.getItem('aura-last-view') || 'flow';
                window.history.replaceState(null, '', `#${saved}`);
            }
        } catch {}
        return () => window.removeEventListener('popstate', handlePopState);
    }, []);

    // -----------------------------------------------------------------------
    // Filter & task-detail state
    // -----------------------------------------------------------------------
    const [focusTaskId, setFocusTaskId] = useState(null);
    const [detailModal, setDetailModal] = useState({ isOpen: false, taskId: null });
    const [activeFilter, setActiveFilter] = useState({ type: 'all', value: null });

    // -----------------------------------------------------------------------
    // Modal state via reducer
    // -----------------------------------------------------------------------
    const [modalState, dispatchModal] = useReducer(modalReducer, initialModalState);

    const openModal  = useCallback((modal) => dispatchModal({ type: 'OPEN',   modal }), []);
    const closeModal = useCallback((modal) => dispatchModal({ type: 'CLOSE',  modal }), []);
    const toggleModal= useCallback((modal) => dispatchModal({ type: 'TOGGLE', modal }), []);

    // Backwards-compatible setter shims — generated from MODAL_KEYS so existing
    // consumers (`setIsSettingsOpen(true/false)`) keep working unchanged.
    // These setters are stable references (dispatchModal never changes).
    const modalSetters = React.useMemo(() => {
        const setters = {};
        for (const key of MODAL_KEYS) {
            const name = `setIs${key.charAt(0).toUpperCase() + key.slice(1)}Open`;
            setters[name] = (valueOrUpdater) => {
                const next = typeof valueOrUpdater === 'function'
                    ? valueOrUpdater(modalState[key])
                    : valueOrUpdater;
                dispatchModal({ type: next ? 'OPEN' : 'CLOSE', modal: key });
            };
        }
        return setters;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // stable — closed over dispatchModal which never changes

    const modalValues = React.useMemo(() => {
        const vals = {};
        for (const key of MODAL_KEYS) {
            vals[`is${key.charAt(0).toUpperCase() + key.slice(1)}Open`] = modalState[key];
        }
        return vals;
    }, [modalState]);

    const value = React.useMemo(() => ({
        currentView,
        setCurrentView,
        focusTaskId,
        setFocusTaskId,
        detailModal,
        setDetailModal,
        activeFilter,
        setActiveFilter,
        openModal,
        closeModal,
        toggleModal,
        ...modalValues,
        ...modalSetters,
    }), [
        currentView, setCurrentView,
        focusTaskId, detailModal, activeFilter,
        openModal, closeModal, toggleModal,
        modalValues, modalSetters,
    ]);

    return (
        <UIContext.Provider value={value}>
            {children}
        </UIContext.Provider>
    );
};

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useUI = () => {
    const context = useContext(UIContext);
    if (!context) throw new Error('useUI must be used within UIProvider');
    return context;
};

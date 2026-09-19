import { useEffect } from 'react';
import { useUI } from '../context/UIContext';

/**
 * Keyboard shortcuts hook extracted from App.jsx.
 * Handles Ctrl+P, Escape cascade, N, B, S, ?, 1-5 view switching.
 */
export const useKeyboardShortcuts = ({
    setCurrentView,
    setIsBrainSweepOpen,
}) => {
    const {
        isCommandPaletteOpen, setIsCommandPaletteOpen,
        isSearchOpen, setIsSearchOpen,
        isSettingsOpen, setIsSettingsOpen,
        detailModal, setDetailModal,
        focusTaskId, setFocusTaskId,
        isMindfulMinuteOpen, setIsMindfulMinuteOpen,
        isThemeCreatorOpen, setIsThemeCreatorOpen,
        isArchiveOpen, setIsArchiveOpen,
        isShareSummaryOpen, setIsShareSummaryOpen,
        isShortcutsOpen, setIsShortcutsOpen,
        isAmbientSoundOpen, setIsAmbientSoundOpen,
        isBrainSweepOpen,
        isHarvestCardOpen, setIsHarvestCardOpen,
    } = useUI();

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
                else if (isAmbientSoundOpen) setIsAmbientSoundOpen(false);
                else if (isBrainSweepOpen) setIsBrainSweepOpen(false);
                else if (isHarvestCardOpen) setIsHarvestCardOpen(false);
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
                case 'b':
                case 'B':
                    e.preventDefault();
                    setIsBrainSweepOpen(true);
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
    }, [
        isCommandPaletteOpen, isSearchOpen, isSettingsOpen, detailModal.isOpen,
        focusTaskId, isMindfulMinuteOpen, isThemeCreatorOpen, isArchiveOpen,
        isShareSummaryOpen, isShortcutsOpen, isAmbientSoundOpen, isBrainSweepOpen,
        isHarvestCardOpen,
        setCurrentView, setIsCommandPaletteOpen, setIsSearchOpen, setIsSettingsOpen,
        setDetailModal, setFocusTaskId, setIsMindfulMinuteOpen, setIsThemeCreatorOpen,
        setIsArchiveOpen, setIsShareSummaryOpen, setIsShortcutsOpen, setIsAmbientSoundOpen,
        setIsBrainSweepOpen, setIsHarvestCardOpen
    ]);
};

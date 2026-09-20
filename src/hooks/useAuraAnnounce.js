import { useCallback } from 'react';

/**
 * useAuraAnnounce
 * Accessibility hook for dispatching polite announcements to assistive technology screen readers.
 * Triggers an 'aura-announce' event caught by ScreenReaderAnnouncer.
 */
export const announceToScreenReader = (message, priority = 'polite') => {
    if (!message || typeof window === 'undefined') return;
    try {
        window.dispatchEvent(new CustomEvent('aura-announce', {
            detail: { message, priority }
        }));
    } catch {
        // Graceful fallback for non-DOM test environments
    }
};

export const useAuraAnnounce = () => {
    const announce = useCallback((message, priority = 'polite') => {
        announceToScreenReader(message, priority);
    }, []);

    return { announce };
};

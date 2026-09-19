import { useEffect, useRef } from 'react';

/**
 * Traps keyboard focus within an element when active (e.g. modals, dialogs).
 * Automatically restores focus to previous element when deactivated.
 * 
 * @param {React.RefObject} containerRef - Ref of the container DOM node
 * @param {boolean} isActive - Whether focus trapping is currently enabled
 * @param {Function} [onEscape] - Optional callback triggered on Escape key press
 */
export function useFocusTrap(containerRef, isActive = true, onEscape = null) {
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (!isActive) return;

        // Remember element that was focused prior to opening
        previousFocusRef.current = document.activeElement;

        const container = containerRef.current;
        if (!container) return;

        const focusableSelectors = [
            'a[href]',
            'button:not([disabled])',
            'textarea:not([disabled])',
            'input:not([disabled])',
            'select:not([disabled])',
            '[tabindex]:not([tabindex="-1"])'
        ].join(', ');

        // Auto-focus first focusable element or the container itself
        const getFocusableElements = () => {
            if (!containerRef.current) return [];
            return Array.from(containerRef.current.querySelectorAll(focusableSelectors))
                .filter(el => !el.hasAttribute('disabled') && el.getAttribute('aria-hidden') !== 'true');
        };

        const focusable = getFocusableElements();
        if (focusable.length > 0) {
            focusable[0].focus();
        } else {
            container.setAttribute('tabindex', '-1');
            container.focus();
        }

        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && onEscape) {
                e.preventDefault();
                onEscape();
                return;
            }

            if (e.key !== 'Tab') return;

            const focusables = getFocusableElements();
            if (focusables.length === 0) {
                e.preventDefault();
                return;
            }

            const firstElement = focusables[0];
            const lastElement = focusables[focusables.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement || !container.contains(document.activeElement)) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement || !container.contains(document.activeElement)) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            if (previousFocusRef.current && typeof previousFocusRef.current.focus === 'function') {
                previousFocusRef.current.focus();
            }
        };
    }, [isActive, containerRef, onEscape]);
}

export default useFocusTrap;

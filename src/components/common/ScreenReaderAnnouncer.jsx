import React, { useState, useEffect } from 'react';

/**
 * ScreenReaderAnnouncer
 * Invisible accessibility element with aria-live="polite" and aria-live="assertive"
 * that dynamically speaks messages to screen readers (NVDA, JAWS, VoiceOver)
 * on task status transitions, timer events, and modal actions.
 */
export const ScreenReaderAnnouncer = () => {
    const [politeMessage, setPoliteMessage] = useState('');
    const [assertiveMessage, setAssertiveMessage] = useState('');

    useEffect(() => {
        const handleAnnounce = (e) => {
            const { message, priority = 'polite' } = e.detail || {};
            if (!message) return;

            if (priority === 'assertive') {
                setAssertiveMessage('');
                requestAnimationFrame(() => setAssertiveMessage(message));
            } else {
                setPoliteMessage('');
                requestAnimationFrame(() => setPoliteMessage(message));
            }
        };

        window.addEventListener('aura-announce', handleAnnounce);
        return () => window.removeEventListener('aura-announce', handleAnnounce);
    }, []);

    return (
        <div className="sr-only pointer-events-none" aria-hidden="false">
            <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
                id="aura-live-polite"
            >
                {politeMessage}
            </div>
            <div
                role="alert"
                aria-live="assertive"
                aria-atomic="true"
                id="aura-live-assertive"
            >
                {assertiveMessage}
            </div>
        </div>
    );
};

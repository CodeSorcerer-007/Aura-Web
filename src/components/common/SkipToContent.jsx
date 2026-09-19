import React from 'react';

/**
 * Accessible skip link for keyboard/screen-reader users.
 * Hidden offscreen until focused via Tab key.
 */
export default function SkipToContent({ targetId = 'main-content' }) {
    return (
        <a
            href={`#${targetId}`}
            className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[9999] focus:px-4 focus:py-2.5 focus:bg-[var(--color-accent)] focus:text-[var(--color-bg)] focus:font-medium focus:text-sm focus:rounded-xl focus:shadow-2xl focus:ring-2 focus:ring-offset-2 focus:ring-[var(--color-accent)] focus:outline-none transition-all duration-200"
        >
            Skip to main content
        </a>
    );
}

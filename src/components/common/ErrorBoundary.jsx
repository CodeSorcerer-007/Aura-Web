import React from 'react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.warn('Aura View Error Caught:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center p-8 my-12 rounded-3xl bg-[var(--color-bg-secondary)]/80 border border-white/10 text-center max-w-md mx-auto backdrop-blur-xl">
                    <span className="text-4xl mb-3">🌱</span>
                    <h2 className="text-lg font-semibold text-[var(--color-text-primary)] mb-1">
                        Peaceful Pause
                    </h2>
                    <p className="text-xs text-[var(--color-text-secondary)] mb-4 leading-relaxed">
                        Aura encountered a brief transition pause while rendering this view.
                    </p>
                    <button
                        type="button"
                        onClick={this.handleRetry}
                        className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-black font-semibold text-xs hover:opacity-90 transition-opacity cursor-pointer shadow-lg"
                    >
                        Restore View
                    </button>
                </div>
            );
        }
        return this.props.children;
    }
}

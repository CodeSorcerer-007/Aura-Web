import React from 'react';
import { ZoomIn, ZoomOut, RotateCcw, Orbit, LayoutGrid } from 'lucide-react';

export const ConstellationControls = ({
    projects = [],
    selectedCategory = 'all',
    setSelectedCategory,
    viewMode = 'orbit',
    setViewMode,
    zoomLevel = 1,
    handleZoomIn,
    handleZoomOut,
    handleResetZoom
}) => {
    return (
        <div className="mb-6">
            <div className="flex items-center justify-center gap-2 mb-1">
                <span className="text-3xl animate-pulse" aria-hidden="true">🌌</span>
                <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-[var(--color-text-primary)] font-display">
                    Cosmic Constellations
                </h2>
            </div>
            <p className="text-[var(--color-text-secondary)] text-xs sm:text-sm max-w-md mx-auto">
                A celestial topology where projects form gravitational hubs and tasks orbit across concentric stellar shells.
            </p>

            {/* Filter & Galaxy Focus Chips */}
            {projects.length > 1 && (
                <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4" role="tablist" aria-label="Constellation Galaxies">
                    <button
                        onClick={() => setSelectedCategory('all')}
                        aria-pressed={selectedCategory === 'all'}
                        className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all border ${
                            selectedCategory === 'all'
                                ? 'bg-[var(--color-accent)] text-black border-transparent shadow-[0_0_12px_rgba(52,211,153,0.4)] scale-105'
                                : 'bg-[var(--color-bg-secondary)]/70 text-[var(--color-text-secondary)] border-white/5 hover:border-white/20 hover:text-[var(--color-text-primary)]'
                        }`}
                    >
                        All Galaxies ({projects.length})
                    </button>
                    {projects.map(([cat, cTasks]) => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            aria-pressed={selectedCategory === cat}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all border ${
                                selectedCategory === cat
                                    ? 'bg-[var(--color-accent)] text-black border-transparent shadow-[0_0_12px_rgba(52,211,153,0.4)] font-bold scale-105'
                                    : 'bg-[var(--color-bg-secondary)]/70 text-[var(--color-text-secondary)] border-white/5 hover:border-white/20 hover:text-[var(--color-text-primary)]'
                            }`}
                        >
                            {cat} ({cTasks.length})
                        </button>
                    ))}
                </div>
            )}

            {/* Floating Controls Bar: Zoom & View Mode Toggle */}
            <div className="flex items-center justify-center gap-2 mt-4 mb-2">
                <div className="aura-glass-floating px-2.5 py-1 rounded-full flex items-center gap-1 shadow-lg">
                    {viewMode === 'orbit' && (
                        <>
                            <button
                                onClick={handleZoomOut}
                                disabled={zoomLevel <= 0.65}
                                aria-label="Zoom out constellation map"
                                className="p-1.5 rounded-full text-[var(--color-text-secondary)] hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                            >
                                <ZoomOut className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-[11px] font-mono px-2 text-[var(--color-text-secondary)] font-semibold" aria-live="polite">
                                {Math.round(zoomLevel * 100)}%
                            </span>
                            <button
                                onClick={handleZoomIn}
                                disabled={zoomLevel >= 1.5}
                                aria-label="Zoom in constellation map"
                                className="p-1.5 rounded-full text-[var(--color-text-secondary)] hover:text-white hover:bg-white/10 disabled:opacity-30 transition-all"
                            >
                                <ZoomIn className="w-3.5 h-3.5" />
                            </button>
                            {zoomLevel !== 1 && (
                                <button
                                    onClick={handleResetZoom}
                                    aria-label="Reset zoom level"
                                    className="p-1.5 rounded-full text-amber-400 hover:bg-white/10 transition-all ml-1"
                                    title="Reset zoom"
                                >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                </button>
                            )}
                            <div className="w-px h-4 bg-white/10 mx-1" />
                        </>
                    )}

                    <button
                        onClick={() => setViewMode(v => v === 'orbit' ? 'cluster' : 'orbit')}
                        className="p-1.5 rounded-full text-[var(--color-text-secondary)] hover:text-white hover:bg-white/10 transition-all flex items-center gap-1 text-xs font-semibold px-2"
                        title={viewMode === 'orbit' ? 'Switch to Star Cluster List view' : 'Switch to Cosmic Orbital view'}
                        aria-label="Toggle constellation view format"
                    >
                        {viewMode === 'orbit' ? (
                            <>
                                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                                <span className="text-[11px]">List</span>
                            </>
                        ) : (
                            <>
                                <Orbit className="w-3.5 h-3.5 text-purple-400" />
                                <span className="text-[11px]">Orbits</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConstellationControls;

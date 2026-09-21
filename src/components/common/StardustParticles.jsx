import React, { useEffect } from 'react';

/**
 * StardustParticles creates an ethereal burst of celestial embers
 * that drift upwards when a task is mindfully completed.
 */
export const StardustBurst = ({ active, onComplete }) => {
    useEffect(() => {
        if (!active) return;
        const timer = setTimeout(() => {
            if (onComplete) onComplete();
        }, 900);
        return () => clearTimeout(timer);
    }, [active, onComplete]);

    if (!active) return null;

    const count = 16;
    const colors = ['#fde047', '#f59e0b', '#2dd4bf', '#a78bfa', '#ffffff', '#38bdf8'];
    const particles = Array.from({ length: count }, (_, i) => {
        const angle = (i / count) * 2 * Math.PI + (i % 2 === 0 ? 0.2 : -0.2);
        const distance = 28 + (i * 3) % 40;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance - 25 - (i * 2) % 20;
        const size = 3 + (i % 4);
        const color = colors[i % colors.length];
        const duration = 0.7 + (i % 3) * 0.15;

        return { id: i, tx, ty, size, color, duration };
    });

    return (
        <div className="absolute inset-0 pointer-events-none z-30 overflow-visible flex items-center justify-center">
            {particles.map(p => (
                <span
                    key={p.id}
                    className="absolute rounded-full"
                    style={{
                        width: `${p.size}px`,
                        height: `${p.size}px`,
                        backgroundColor: p.color,
                        boxShadow: `0 0 8px ${p.color}`,
                        animation: `stardust-burst-drift ${p.duration}s cubic-bezier(0.2, 0.8, 0.2, 1) forwards`,
                        '--tx': `${p.tx}px`,
                        '--ty': `${p.ty}px`
                    }}
                />
            ))}
        </div>
    );
};

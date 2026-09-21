import React, { useState, useEffect, useMemo } from 'react';

const CYBER_CODE_CHARS = ['0', '1', 'A', 'Z', '9', 'X', '7', '4', 'F', 'B', 'Ω', 'λ', 'Ψ', '8', '3', 'E', 'Q', '5', 'R', 'K'];

// Circadian Sky Biorhythm Engine
const CircadianSky = () => {
    const [now, setNow] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 30000);
        return () => clearInterval(interval);
    }, []);

    const hour = now.getHours();

    const { phase, title, skyGradient, celestialElement, particles } = useMemo(() => {
        if (hour >= 5 && hour < 9) {
            return {
                phase: 'dawn',
                title: 'Dawn Radiance',
                skyGradient: 'linear-gradient(to top, #3b1f2b 0%, #1c1427 50%, #0d0c18 100%)',
                celestialElement: (
                    <div 
                        className="circadian-sun"
                        style={{
                            bottom: '15%',
                            left: '20%',
                            background: 'radial-gradient(circle, #fde68a 0%, #f59e0b 60%, rgba(245,158,11,0) 100%)',
                            boxShadow: '0 0 80px rgba(251, 191, 36, 0.5)'
                        }}
                    />
                ),
                particles: [...Array(12)].map((_, i) => ({
                    id: i,
                    top: `${40 + (i * 4)}%`,
                    left: `${(i * 8) % 100}%`,
                    size: 2,
                    color: '#fef08a',
                    delay: `${(i * 0.4).toFixed(1)}s`
                }))
            };
        } else if (hour >= 9 && hour < 17) {
            return {
                phase: 'noon',
                title: 'High Noon Clarity',
                skyGradient: 'linear-gradient(to top, #1e3a5f 0%, #10233b 50%, #0a1122 100%)',
                celestialElement: (
                    <div 
                        className="circadian-sun"
                        style={{
                            top: '12%',
                            right: '25%',
                            background: 'radial-gradient(circle, #fffbeb 0%, #38bdf8 40%, rgba(56,189,248,0) 100%)',
                            boxShadow: '0 0 100px rgba(56, 189, 248, 0.45)'
                        }}
                    />
                ),
                particles: [
                    { id: 1, top: '18%', left: '-10%', width: 140, height: 35, duration: '60s' },
                    { id: 2, top: '28%', left: '-15%', width: 180, height: 45, duration: '80s' },
                    { id: 3, top: '42%', left: '-12%', width: 120, height: 30, duration: '70s' },
                ]
            };
        } else if (hour >= 17 && hour < 21) {
            return {
                phase: 'twilight',
                title: 'Twilight Dusk',
                skyGradient: 'linear-gradient(to top, #4c1d38 0%, #28143a 45%, #0f091f 100%)',
                celestialElement: (
                    <div 
                        className="circadian-sun"
                        style={{
                            bottom: '18%',
                            right: '22%',
                            background: 'radial-gradient(circle, #fda4af 0%, #f43f5e 50%, rgba(244,63,94,0) 100%)',
                            boxShadow: '0 0 90px rgba(244, 63, 94, 0.45)'
                        }}
                    />
                ),
                particles: [...Array(15)].map((_, i) => ({
                    id: i,
                    top: `${10 + (i * 3)}%`,
                    left: `${(i * 7) % 100}%`,
                    size: 2,
                    color: '#f472b6',
                    delay: `${(i * 0.3).toFixed(1)}s`
                }))
            };
        } else {
            return {
                phase: 'midnight',
                title: 'Cosmic Midnight',
                skyGradient: 'linear-gradient(to top, #070c18 0%, #04060c 60%, #010204 100%)',
                celestialElement: (
                    <div 
                        className="circadian-moon"
                        style={{
                            top: '15%',
                            left: '18%',
                            background: 'radial-gradient(circle at 35% 35%, #ffffff 0%, #cbd5e1 50%, #64748b 100%)',
                            boxShadow: '0 0 50px rgba(255, 255, 255, 0.35)'
                        }}
                    >
                        <div className="absolute top-2 left-3 w-3 h-3 rounded-full bg-slate-400/30"></div>
                        <div className="absolute top-6 left-7 w-2 h-2 rounded-full bg-slate-400/20"></div>
                    </div>
                ),
                particles: [...Array(35)].map((_, i) => ({
                    id: i,
                    top: `${(i * 7.7) % 85}%`,
                    left: `${(i * 13.3) % 96}%`,
                    size: (i % 3 === 0) ? 3 : 1.5,
                    color: '#ffffff',
                    delay: `${(i * 0.25).toFixed(1)}s`
                }))
            };
        }
    }, [hour]);

    return (
        <div className="circadian-sky" style={{ background: skyGradient }}>
            {celestialElement}

            {/* Drifting Clouds for High Noon */}
            {phase === 'noon' && particles.map(cloud => (
                <div 
                    key={cloud.id}
                    className="circadian-cloud"
                    style={{
                        top: cloud.top,
                        left: cloud.left,
                        width: `${cloud.width}px`,
                        height: `${cloud.height}px`,
                        animationDuration: cloud.duration
                    }}
                />
            ))}

            {/* Stars / Glowing Stardust for Dawn, Twilight, Midnight */}
            {phase !== 'noon' && particles.map(star => (
                <div 
                    key={star.id}
                    className="circadian-star"
                    style={{
                        top: star.top,
                        left: star.left,
                        width: `${star.size}px`,
                        height: `${star.size}px`,
                        backgroundColor: star.color,
                        animationDelay: star.delay
                    }}
                />
            ))}

            {/* Subtle Phase Indicator Pill */}
            <div className="absolute top-3 left-4 text-[10px] tracking-wider uppercase font-semibold text-white/30 px-2.5 py-1 rounded-full bg-white/5 backdrop-blur-sm pointer-events-none select-none border border-white/10 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400/70 animate-pulse"></span>
                <span>{title}</span>
            </div>
        </div>
    );
};

export const ThemeBackground = ({ theme }) => {
    return (
        <div className={`theme-bg theme-bg-${theme}`}>
            {theme === 'dark' && (
                <div className="dark-stardust pointer-events-none">
                    <div className="dark-aurora-glow"></div>
                    {[...Array(25)].map((_, i) => (
                        <div 
                            key={i} 
                            className="dark-star"
                            style={{
                                top: `${(i * 7.9) % 95}%`,
                                left: `${(i * 13.1) % 98}%`,
                                animationDuration: `${4 + (i % 5) * 1.5}s`,
                                animationDelay: `${(i * 0.4).toFixed(1)}s`
                            }}
                        />
                    ))}
                </div>
            )}
            {theme === 'circadian' && (
                <CircadianSky />
            )}
            {theme === 'light' && (
                <div className="light-bg">
                    <div className="sun-rays"></div>
                </div>
            )}
            {theme === 'forest' && (
                <div className="forest-bg">
                    <div className="forest-particles">
                        {[...Array(20)].map((_, i) => <div key={i} className="particle"></div>)}
                    </div>
                    <div className="forest-trees"></div>
                    <div className="fireflies">
                        {[...Array(15)].map((_, i) => <div key={i} className="firefly"></div>)}
                    </div>
                </div>
            )}
            {theme === 'sakura' && (
                <div className="sakura-petals">
                    {[...Array(25)].map((_, i) => <div key={i} className="petal">🌸</div>)}
                </div>
            )}
            {theme === 'dracula' && (
                <div className="dracula-bg">
                    <div className="dracula-moon"></div>
                    <div className="dracula-graveyard"></div>
                    <div className="dracula-fog"></div>
                    <div className="dracula-bats">
                        {[...Array(7)].map((_, i) => <div key={i} className="bat">🦇</div>)}
                    </div>
                </div>
            )}
            {theme === 'cyberpunk' && (
                <div className="cyber-code">
                    {[...Array(40)].map((_, i) => (
                        <div key={i} className="code-char" style={{ '--char': `'${CYBER_CODE_CHARS[i % CYBER_CODE_CHARS.length]}'` }} ></div>
                    ))}
                    <div className="cyber-grid"></div>
                </div>
            )}
            {theme === 'crimson' && (
                <div className="crimson-bg">
                    <div className="crimson-mist">
                        {[...Array(5)].map((_, i) => <div key={i} className="mist-particle"></div>)}
                    </div>
                    <div className="crimson-embers">
                        {[...Array(20)].map((_, i) => <div key={i} className="ember"></div>)}
                    </div>
                </div>
            )}
            {theme === 'ocean' && (
                <div className="ocean-bg">
                    <div className="ocean-caustics"></div>
                    <div className="ocean-bubbles">
                        {[...Array(20)].map((_, i) => <div key={i} className="bubble"></div>)}
                    </div>
                    <div className="ocean-fauna">
                        <div className="fish-group">{`><(((°>`}</div>
                        <div className="fish-group fish-group-2">{`><(((°>`}</div>
                    </div>
                </div>
            )}
            {theme === 'dune' && (
                <div className="dune-sand">
                    {[...Array(50)].map((_, i) => <div key={i} className="sand-particle"></div>)}
                    <div className="dune-haze"></div>
                </div>
            )}
            {theme === 'solarized' && (
                <div className="solarized-code">
                    <div className="solarized-grid"></div>
                    <svg className="solarized-traces" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                        <path d="M 0 50 L 100 50 L 100 150 L 200 150" />
                        <path d="M 50 0 L 50 100 L 150 100 L 150 200" />
                    </svg>
                </div>
            )}
            {theme === 'nord' && (
                <div className="nord-bg">
                    <div className="aurora">
                        <div className="aurora-band"></div>
                        <div className="aurora-band"></div>
                        <div className="aurora-band"></div>
                    </div>
                    <div className="nord-snow">
                        {[...Array(50)].map((_, i) => <div key={i} className="snow-flake"></div>)}
                    </div>
                </div>
            )}
            {theme === 'monokai' && (
                <div className="monokai-glitch">
                    <div className="scanlines"></div>
                </div>
            )}
            {theme === 'latte' && (
                <div className="latte-steam">
                    {[...Array(10)].map((_, i) => <div key={i} className="steam-wisp"></div>)}
                </div>
            )}
            {theme === 'gruvbox' && (
                <div className="gruvbox-gears">
                    <div className="gruvbox-grid"></div>
                    {[...Array(5)].map((_, i) => <div key={i} className="gear">⚙️</div>)}
                </div>
            )}
            {theme === 'rose_pine' && (
                <div className="rose_pine-sky">
                    <div className="rose_pine-stars"></div>
                    <div className="rose_pine-twinkling"></div>
                    <div className="rose_pine-nebula"></div>
                </div>
            )}
            {theme === 'matcha' && (
                <div className="matcha-pond">
                    <div className="ripple"></div>
                    <div className="ripple"></div>
                    <div className="ripple"></div>
                </div>
            )}
        </div>
    );
};

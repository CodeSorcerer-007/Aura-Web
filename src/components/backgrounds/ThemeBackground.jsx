import React from 'react';

const CYBER_CODE_CHARS = ['0', '1', 'A', 'Z', '9', 'X', '7', '4', 'F', 'B', 'Ω', 'λ', 'Ψ', '8', '3', 'E', 'Q', '5', 'R', 'K'];

export const ThemeBackground = ({ theme }) => {
    return (
        <div className={`theme-bg theme-bg-${theme}`}>
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

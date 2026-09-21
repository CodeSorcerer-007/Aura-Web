import React from 'react';
import { motion } from 'framer-motion';

// --- Procedural Biophilic Trees with Multi-Stage Botanical Lifecycles ---

export const OakTree = React.memo(({ growth }) => {
    const isSprout = growth <= 0.18;
    const isSapling = growth > 0.18 && growth <= 0.35;
    const isMature = growth > 0.35;

    const trunkProgress = Math.min(1, growth * 1.4);
    const canopyScale = Math.max(0.2, (growth - 0.2) / 0.8 * 0.8 + 0.2);

    // Sprout stage metrics
    const sproutProgress = Math.min(1, growth / 0.18);
    const sproutHeight = 10 + sproutProgress * 14;
    const sproutApexY = 95 - sproutHeight;

    // Sapling stage metrics
    const saplingProgress = (growth - 0.18) / 0.17;
    const saplingHeight = 24 + saplingProgress * 22;
    const saplingApexY = 95 - saplingHeight;

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible select-none" aria-label={`Oak Tree, ${(growth * 100).toFixed(0)}% grown`}>
            <defs>
                <linearGradient id="oakBark" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#78350f" />
                    <stop offset="100%" stopColor="#92400e" />
                </linearGradient>
                <linearGradient id="sproutStem" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#047857" />
                    <stop offset="100%" stopColor="#34d399" />
                </linearGradient>
                <radialGradient id="oakLeafMain" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#34d399" />
                    <stop offset="60%" stopColor="#059669" />
                    <stop offset="100%" stopColor="#064e3b" />
                </radialGradient>
                <radialGradient id="oakLeafLight" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#6ee7b7" />
                    <stop offset="70%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                </radialGradient>
            </defs>

            {/* Tree Base Soil Mound */}
            <ellipse cx="50" cy="95" rx="16" ry="3.2" fill="#451a03" opacity="0.4" />

            {/* STAGE 1: Seedling Sprout & Cotyledon Leaves (0% - 18%) */}
            {isSprout && (
                <g className="oak-sprout-stage">
                    {/* Split Acorn Husk at base */}
                    <path d="M 46 95 C 46 92, 54 92, 54 95 Z" fill="#78350f" stroke="#92400e" strokeWidth="0.8" />
                    <ellipse cx="50" cy="95.5" rx="5" ry="1.2" fill="#b45309" opacity="0.6" />

                    {/* Bioluminescent Root Fibrils */}
                    <path d="M 48 95 Q 44 98 39 99" stroke="#10b981" strokeWidth="0.9" fill="none" opacity="0.45" strokeDasharray="1 2" />
                    <path d="M 52 95 Q 56 98 61 99" stroke="#10b981" strokeWidth="0.9" fill="none" opacity="0.45" strokeDasharray="1 2" />

                    {/* Tender Curling Green Shoot */}
                    <motion.path
                        d={`M 50 95 Q ${48 + sproutProgress * 3} ${95 - sproutHeight * 0.5} 50 ${sproutApexY}`}
                        stroke="url(#sproutStem)"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8 }}
                    />

                    {/* Twin Cotyledon Seedling Leaves */}
                    <g style={{ animation: 'branch-sway-soft 5s ease-in-out infinite alternate', transformOrigin: `50px ${sproutApexY}px` }}>
                        <motion.path
                            d={`M 50 ${sproutApexY} C 42 ${sproutApexY - 1}, 38 ${sproutApexY - 7}, 42 ${sproutApexY - 10} C 46 ${sproutApexY - 9}, 48 ${sproutApexY - 4}, 50 ${sproutApexY}`}
                            fill="url(#oakLeafLight)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                        <motion.path
                            d={`M 50 ${sproutApexY} C 58 ${sproutApexY - 1}, 62 ${sproutApexY - 7}, 58 ${sproutApexY - 10} C 54 ${sproutApexY - 9}, 52 ${sproutApexY - 4}, 50 ${sproutApexY}`}
                            fill="url(#oakLeafLight)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                        />
                        <line x1="50" y1={sproutApexY} x2="44" y2={sproutApexY - 7} stroke="#047857" strokeWidth="0.6" opacity="0.5" />
                        <line x1="50" y1={sproutApexY} x2="56" y2={sproutApexY - 7} stroke="#047857" strokeWidth="0.6" opacity="0.5" />

                        {/* Sparkling Morning Dewdrop */}
                        <motion.circle
                            cx="50"
                            cy={sproutApexY - 4}
                            r="2.2"
                            fill="#38bdf8"
                            animate={{ scale: [1, 1.25, 1], opacity: [0.85, 1, 0.85] }}
                            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                            style={{ filter: 'drop-shadow(0 0 3px #38bdf8)' }}
                        />
                    </g>
                </g>
            )}

            {/* STAGE 2: Young Sapling & Branching Buds (18% - 35%) */}
            {isSapling && (
                <g className="oak-sapling-stage">
                    <motion.path
                        d={`M 49 95 Q 51 78 48 68 Q 46 58 50 ${saplingApexY}`}
                        stroke="url(#oakBark)"
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.9 }}
                    />
                    <path d={`M 48 74 Q 40 68 34 65`} stroke="url(#oakBark)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    <path d={`M 50 64 Q 58 58 64 56`} stroke="url(#oakBark)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

                    <g style={{ animation: 'branch-sway-soft 6s ease-in-out infinite alternate', transformOrigin: '50px 70px' }}>
                        <circle cx="33" cy="64" r="6.5" fill="url(#oakLeafMain)" />
                        <circle cx="34" cy="62" r="5" fill="url(#oakLeafLight)" />
                        <circle cx="65" cy="55" r="7" fill="url(#oakLeafMain)" />
                        <circle cx="66" cy="53" r="5.5" fill="url(#oakLeafLight)" />
                        <circle cx="50" cy={saplingApexY - 2} r="8" fill="url(#oakLeafMain)" />
                        <circle cx="50" cy={saplingApexY - 4} r="6.5" fill="url(#oakLeafLight)" />
                    </g>
                </g>
            )}

            {/* STAGE 3 & 4: Mature Oak Tree & Flourishing Canopy (35% - 100%) */}
            {isMature && (
                <g className="oak-mature-stage">
                    <motion.path
                        d="M 48 95 Q 49 75 47 60 Q 45 45 50 32"
                        stroke="url(#oakBark)"
                        strokeWidth={Math.max(2.8, 4.5 * trunkProgress)}
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />

                    <g style={{ animation: 'branch-sway 6.5s ease-in-out infinite alternate', transformOrigin: '50px 60px' }}>
                        <motion.path
                            d="M 47 62 Q 40 54 32 50 Q 26 48 22 45"
                            stroke="url(#oakBark)"
                            strokeWidth="2.6"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <motion.path
                            d="M 49 55 Q 58 48 68 46 Q 74 44 78 40"
                            stroke="url(#oakBark)"
                            strokeWidth="2.4"
                            strokeLinecap="round"
                            fill="none"
                        />
                        {growth > 0.5 && (
                            <motion.path
                                d="M 48 44 Q 44 36 38 30"
                                stroke="url(#oakBark)"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                fill="none"
                            />
                        )}

                        <motion.g
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: canopyScale, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            style={{ transformOrigin: '50px 32px' }}
                        >
                            <circle cx="34" cy="46" r="11" fill="url(#oakLeafMain)" opacity="0.95" />
                            <circle cx="66" cy="42" r="12" fill="url(#oakLeafMain)" opacity="0.95" />
                            <circle cx="50" cy="24" r="14" fill="url(#oakLeafMain)" opacity="0.95" />
                            
                            <circle cx="42" cy="30" r="12" fill="url(#oakLeafLight)" />
                            <circle cx="58" cy="32" r="11" fill="url(#oakLeafLight)" />
                            <circle cx="50" cy="38" r="13" fill="url(#oakLeafLight)" />

                            {growth >= 0.75 && (
                                <>
                                    <circle cx="38" cy="48" r="2.5" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 3px #f59e0b)' }} />
                                    <circle cx="64" cy="40" r="2.5" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 3px #f59e0b)' }} />
                                    <circle cx="52" cy="26" r="2.8" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 3px #f59e0b)' }} />
                                </>
                            )}
                        </motion.g>

                        {growth >= 0.8 && (
                            <g className="biophilic-spores pointer-events-none">
                                <circle cx="30" cy="36" r="1.4" fill="#a7f3d0" style={{ animation: 'petal-flutter 4.5s ease-in-out infinite', filter: 'drop-shadow(0 0 3px #34d399)' }} />
                                <circle cx="68" cy="28" r="1.6" fill="#fde047" style={{ animation: 'petal-flutter 5.2s ease-in-out infinite 1.2s', filter: 'drop-shadow(0 0 3px #fbbf24)' }} />
                                <circle cx="50" cy="16" r="1.5" fill="#6ee7b7" style={{ animation: 'petal-flutter 4.8s ease-in-out infinite 2.1s', filter: 'drop-shadow(0 0 3px #10b981)' }} />
                            </g>
                        )}
                    </g>
                </g>
            )}
        </svg>
    );
});

export const CherryBlossom = React.memo(({ growth }) => {
    const isSprout = growth <= 0.18;
    const isSapling = growth > 0.18 && growth <= 0.35;
    const isMature = growth > 0.35;

    const canopyScale = Math.max(0.2, (growth - 0.2) / 0.8 * 0.8 + 0.2);

    const sproutProgress = Math.min(1, growth / 0.18);
    const sproutHeight = 10 + sproutProgress * 15;
    const sproutApexY = 95 - sproutHeight;

    const saplingProgress = (growth - 0.18) / 0.17;
    const saplingHeight = 25 + saplingProgress * 25;
    const saplingApexY = 95 - saplingHeight;

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible select-none" aria-label={`Cherry Blossom Tree, ${(growth * 100).toFixed(0)}% grown`}>
            <defs>
                <linearGradient id="sakuraBark" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#451a03" />
                    <stop offset="100%" stopColor="#581c87" />
                </linearGradient>
                <linearGradient id="sakuraSproutStem" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#047857" />
                    <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
                <radialGradient id="sakuraPetalGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fdf2f8" />
                    <stop offset="60%" stopColor="#fbcfe8" />
                    <stop offset="100%" stopColor="#f472b6" />
                </radialGradient>
                <radialGradient id="sakuraDeepPetal" cx="40%" cy="40%" r="60%">
                    <stop offset="0%" stopColor="#f472b6" />
                    <stop offset="70%" stopColor="#db2777" />
                    <stop offset="100%" stopColor="#9d174d" />
                </radialGradient>
            </defs>

            {/* Base Mound */}
            <ellipse cx="50" cy="95" rx="15" ry="3" fill="#3f1a08" opacity="0.35" />

            {/* STAGE 1: Delicate Sakura Shoot with Rosy Bud (0% - 18%) */}
            {isSprout && (
                <g className="sakura-sprout-stage">
                    <ellipse cx="50" cy="95.5" rx="4.5" ry="1.2" fill="#831843" opacity="0.5" />
                    
                    <motion.path
                        d={`M 50 95 Q ${51 - sproutProgress * 4} ${95 - sproutHeight * 0.5} 50 ${sproutApexY}`}
                        stroke="url(#sakuraSproutStem)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8 }}
                    />

                    <g style={{ animation: 'branch-sway-soft 4.5s ease-in-out infinite alternate', transformOrigin: `50px ${sproutApexY}px` }}>
                        <motion.ellipse
                            cx="48"
                            cy={sproutApexY - 3}
                            rx="3.5"
                            ry="5.5"
                            fill="url(#sakuraPetalGrad)"
                            transform={`rotate(-25 48 ${sproutApexY - 3})`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2 }}
                        />
                        <motion.ellipse
                            cx="52"
                            cy={sproutApexY - 3}
                            rx="3.5"
                            ry="5.5"
                            fill="url(#sakuraPetalGrad)"
                            transform={`rotate(25 52 ${sproutApexY - 3})`}
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.3 }}
                        />
                        <circle cx="50" cy={sproutApexY - 4} r="2.2" fill="#f43f5e" />
                    </g>
                </g>
            )}

            {/* STAGE 2: Slender Branching Blossom Sapling (18% - 35%) */}
            {isSapling && (
                <g className="sakura-sapling-stage">
                    <motion.path
                        d={`M 50 95 C 48 80, 53 68, 50 ${saplingApexY}`}
                        stroke="url(#sakuraBark)"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.9 }}
                    />
                    <path d={`M 50 72 C 43 65, 36 62, 32 58`} stroke="url(#sakuraBark)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                    <path d={`M 51 60 C 58 54, 65 52, 70 48`} stroke="url(#sakuraBark)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

                    <g style={{ animation: 'branch-sway-soft 5s ease-in-out infinite alternate', transformOrigin: '50px 65px' }}>
                        <circle cx="31" cy="56" r="6" fill="url(#sakuraPetalGrad)" />
                        <circle cx="71" cy="46" r="7" fill="url(#sakuraPetalGrad)" />
                        <circle cx="50" cy={saplingApexY - 2} r="8" fill="url(#sakuraPetalGrad)" />
                        <circle cx="31" cy="56" r="2" fill="#be185d" />
                        <circle cx="71" cy="46" r="2" fill="#be185d" />
                        <circle cx="50" cy={saplingApexY - 2} r="2.2" fill="#be185d" />
                    </g>
                </g>
            )}

            {/* STAGE 3 & 4: Magnificent Blossoming Sakura Tree (35% - 100%) */}
            {isMature && (
                <g className="sakura-mature-stage">
                    <motion.path
                        d="M 50 95 C 47 75, 54 55, 50 28"
                        stroke="url(#sakuraBark)"
                        strokeWidth={Math.max(2.5, 4.2 * Math.min(1, growth * 1.3))}
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />

                    <g style={{ animation: 'branch-sway 7s ease-in-out infinite alternate', transformOrigin: '50px 60px' }}>
                        <motion.path
                            d="M 50 56 C 40 48, 30 45, 20 40"
                            stroke="url(#sakuraBark)"
                            strokeWidth="2.2"
                            strokeLinecap="round"
                            fill="none"
                        />
                        <motion.path
                            d="M 50 42 C 58 38, 68 38, 76 32"
                            stroke="url(#sakuraBark)"
                            strokeWidth="2"
                            strokeLinecap="round"
                            fill="none"
                        />
                        {growth > 0.5 && (
                            <motion.path
                                d="M 50 28 C 42 22, 36 18, 30 14"
                                stroke="url(#sakuraBark)"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                fill="none"
                            />
                        )}

                        <motion.g
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: canopyScale, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            style={{ transformOrigin: '50px 30px' }}
                        >
                            <circle cx="24" cy="38" r="10" fill="url(#sakuraDeepPetal)" opacity="0.9" />
                            <circle cx="74" cy="30" r="11" fill="url(#sakuraDeepPetal)" opacity="0.9" />
                            <circle cx="48" cy="18" r="12" fill="url(#sakuraDeepPetal)" opacity="0.9" />

                            <circle cx="32" cy="32" r="11" fill="url(#sakuraPetalGrad)" />
                            <circle cx="62" cy="28" r="12" fill="url(#sakuraPetalGrad)" />
                            <circle cx="44" cy="24" r="13" fill="url(#sakuraPetalGrad)" />
                            <circle cx="56" cy="36" r="10" fill="url(#sakuraPetalGrad)" />

                            <circle cx="20" cy="44" r="3" fill="#fff1f2" />
                            <circle cx="78" cy="36" r="3.2" fill="#fff1f2" />
                            <circle cx="42" cy="14" r="3" fill="#fff1f2" />
                            <circle cx="68" cy="22" r="3.2" fill="#fff1f2" />

                            {growth >= 0.7 && (
                                <g className="drifting-petals pointer-events-none">
                                    <circle cx="36" cy="52" r="2.2" fill="#f472b6" style={{ animation: 'petal-flutter 5s ease-in-out infinite' }} />
                                    <circle cx="64" cy="48" r="2" fill="#fda4af" style={{ animation: 'petal-flutter 4.5s ease-in-out infinite 1.5s' }} />
                                    <circle cx="48" cy="62" r="1.8" fill="#fb7185" style={{ animation: 'petal-flutter 5.5s ease-in-out infinite 2.5s' }} />
                                </g>
                            )}
                        </motion.g>
                    </g>
                </g>
            )}
        </svg>
    );
});

export const PineTree = React.memo(({ growth }) => {
    const isSprout = growth <= 0.18;
    const isSapling = growth > 0.18 && growth <= 0.35;
    const isMature = growth > 0.35;

    const foliageScale = Math.max(0.2, (growth - 0.2) / 0.8 * 0.8 + 0.2);

    const sproutProgress = Math.min(1, growth / 0.18);
    const sproutHeight = 10 + sproutProgress * 14;
    const sproutApexY = 95 - sproutHeight;

    const saplingProgress = (growth - 0.18) / 0.17;
    const saplingHeight = 24 + saplingProgress * 20;

    const trunkHeight = 10 + growth * 48;

    return (
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible select-none" aria-label={`Pine Tree, ${(growth * 100).toFixed(0)}% grown`}>
            <defs>
                <linearGradient id="pineTrunk" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#3f2e23" />
                    <stop offset="100%" stopColor="#594234" />
                </linearGradient>
                <linearGradient id="pineBoughLow" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#065f46" />
                    <stop offset="100%" stopColor="#022c22" />
                </linearGradient>
                <linearGradient id="pineBoughHigh" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#047857" />
                </linearGradient>
            </defs>

            {/* Base Soil */}
            <ellipse cx="50" cy="95" rx="14" ry="2.8" fill="#291c13" opacity="0.4" />

            {/* STAGE 1: Needle Bud Sprout (0% - 18%) */}
            {isSprout && (
                <g className="pine-sprout-stage">
                    <line x1="50" y1="95" x2="50" y2={sproutApexY} stroke="#047857" strokeWidth="2.2" strokeLinecap="round" />
                    
                    <g style={{ animation: 'branch-sway-soft 4s ease-in-out infinite alternate', transformOrigin: `50px ${sproutApexY}px` }}>
                        <line x1="50" y1={sproutApexY} x2="43" y2={sproutApexY - 6} stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
                        <line x1="50" y1={sproutApexY} x2="50" y2={sproutApexY - 9} stroke="#34d399" strokeWidth="1.8" strokeLinecap="round" />
                        <line x1="50" y1={sproutApexY} x2="57" y2={sproutApexY - 6} stroke="#10b981" strokeWidth="1.8" strokeLinecap="round" />
                        <motion.circle
                            cx="50"
                            cy={sproutApexY - 9}
                            r="1.8"
                            fill="#38bdf8"
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ duration: 2.2, repeat: Infinity }}
                            style={{ filter: 'drop-shadow(0 0 3px #38bdf8)' }}
                        />
                    </g>
                </g>
            )}

            {/* STAGE 2: Young Pine Sapling with Early Needled Tiers (18% - 35%) */}
            {isSapling && (
                <g className="pine-sapling-stage">
                    <line x1="50" y1="95" x2="50" y2={95 - saplingHeight} stroke="url(#pineTrunk)" strokeWidth="3" strokeLinecap="round" />
                    
                    {/* Lower tier */}
                    <path
                        d={`M 50 ${95 - saplingHeight * 0.4} L 34 ${95 - saplingHeight * 0.28} Q 50 ${95 - saplingHeight * 0.35} 66 ${95 - saplingHeight * 0.28} Z`}
                        fill="url(#pineBoughLow)"
                    />
                    {/* Top tier */}
                    <path
                        d={`M 50 ${95 - saplingHeight * 0.95} L 38 ${95 - saplingHeight * 0.65} Q 50 ${95 - saplingHeight * 0.72} 62 ${95 - saplingHeight * 0.65} Z`}
                        fill="url(#pineBoughHigh)"
                    />
                </g>
            )}

            {/* STAGE 3 & 4: Mature Tiered Pine (35% - 100%) */}
            {isMature && (
                <g className="pine-mature-stage">
                    <motion.line
                        x1="50"
                        y1="95"
                        x2="50"
                        y2={95 - trunkHeight}
                        stroke="url(#pineTrunk)"
                        strokeWidth={Math.max(2.5, 4.2 * growth)}
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.1, ease: "easeOut" }}
                    />

                    <g style={{ animation: 'branch-sway-soft 8s ease-in-out infinite alternate', transformOrigin: '50px 80px' }}>
                        {/* Bottom Tier */}
                        <motion.path
                            d={`M 50 ${92 - trunkHeight * 0.35} C 36 ${96 - trunkHeight * 0.28}, 22 ${95 - trunkHeight * 0.18}, 20 ${93 - trunkHeight * 0.16} C 26 ${88 - trunkHeight * 0.25}, 36 ${88 - trunkHeight * 0.32}, 50 ${85 - trunkHeight * 0.4} C 64 ${88 - trunkHeight * 0.32}, 74 ${88 - trunkHeight * 0.25}, 80 ${93 - trunkHeight * 0.16} C 78 ${95 - trunkHeight * 0.18}, 64 ${96 - trunkHeight * 0.28}, 50 ${92 - trunkHeight * 0.35} Z`}
                            fill="url(#pineBoughLow)"
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: foliageScale, opacity: 1 }}
                            transition={{ delay: 0.25 }}
                            style={{ transformOrigin: `50px ${90 - trunkHeight * 0.35}px` }}
                        />

                        {/* Middle Tier */}
                        {growth > 0.4 && (
                            <motion.path
                                d={`M 50 ${90 - trunkHeight * 0.6} C 38 ${94 - trunkHeight * 0.52}, 28 ${92 - trunkHeight * 0.44}, 27 ${90 - trunkHeight * 0.42} C 34 ${86 - trunkHeight * 0.5}, 42 ${86 - trunkHeight * 0.56}, 50 ${83 - trunkHeight * 0.64} C 58 ${86 - trunkHeight * 0.56}, 66 ${86 - trunkHeight * 0.5}, 73 ${90 - trunkHeight * 0.42} C 72 ${92 - trunkHeight * 0.44}, 62 ${94 - trunkHeight * 0.52}, 50 ${90 - trunkHeight * 0.6} Z`}
                                fill="url(#pineBoughHigh)"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: foliageScale, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                style={{ transformOrigin: `50px ${88 - trunkHeight * 0.6}px` }}
                            />
                        )}

                        {/* Top Apex Tier */}
                        {growth > 0.6 && (
                            <motion.path
                                d={`M 50 ${95 - trunkHeight * 0.98} L 36 ${92 - trunkHeight * 0.72} Q 50 ${90 - trunkHeight * 0.78} 64 ${92 - trunkHeight * 0.72} Z`}
                                fill="url(#pineBoughHigh)"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: foliageScale, opacity: 1 }}
                                transition={{ delay: 0.55 }}
                                style={{ transformOrigin: `50px ${95 - trunkHeight * 0.85}px` }}
                            />
                        )}

                        {/* Pinecone Accents when mature */}
                        {growth >= 0.8 && (
                            <>
                                <ellipse cx="34" cy={93 - trunkHeight * 0.28} rx="2.5" ry="3.8" fill="#78350f" />
                                <ellipse cx="66" cy={93 - trunkHeight * 0.28} rx="2.5" ry="3.8" fill="#78350f" />
                                <ellipse cx="50" cy={95 - trunkHeight * 1.02} rx="2" ry="2.8" fill="#fde047" style={{ filter: 'drop-shadow(0 0 4px #fbbf24)' }} />
                            </>
                        )}
                    </g>
                </g>
            )}
        </svg>
    );
});

export const Tree = React.memo(({ type, growth }) => {
    switch (type) {
        case 'pine': return <PineTree growth={growth} />;
        case 'cherry': return <CherryBlossom growth={growth} />;
        default: return <OakTree growth={growth} />;
    }
});

export default Tree;

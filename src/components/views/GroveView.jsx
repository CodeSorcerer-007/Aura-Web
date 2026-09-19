import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { defaultCategories } from '../../utils/constants';
import { StarIcon, QuoteIcon } from '../common/Icons';
import { playHarmonicUiSound } from '../../hooks/useSoundEffects';

// --- Procedural Biophilic Trees ---

// --- Procedural Biophilic Trees with Multi-Stage Botanical Lifecycles ---

export const OakTree = ({ growth }) => {
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
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible select-none">
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
                        {/* Left Cotyledon Leaf */}
                        <motion.path
                            d={`M 50 ${sproutApexY} C 42 ${sproutApexY - 1}, 38 ${sproutApexY - 7}, 42 ${sproutApexY - 10} C 46 ${sproutApexY - 9}, 48 ${sproutApexY - 4}, 50 ${sproutApexY}`}
                            fill="url(#oakLeafLight)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        />
                        {/* Right Cotyledon Leaf */}
                        <motion.path
                            d={`M 50 ${sproutApexY} C 58 ${sproutApexY - 1}, 62 ${sproutApexY - 7}, 58 ${sproutApexY - 10} C 54 ${sproutApexY - 9}, 52 ${sproutApexY - 4}, 50 ${sproutApexY}`}
                            fill="url(#oakLeafLight)"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                        />
                        {/* Central Sprout Leaf Vein */}
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
                    {/* Developing Bark Trunk */}
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
                    {/* Young Lateral Branches */}
                    <path d={`M 48 74 Q 40 68 34 65`} stroke="url(#oakBark)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
                    <path d={`M 50 64 Q 58 58 64 56`} stroke="url(#oakBark)" strokeWidth="1.8" strokeLinecap="round" fill="none" />

                    {/* Young Foliage Clusters */}
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
                    {/* Organic Curving Trunk */}
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

                    {/* Natural Bezier Branches with Wind Sway */}
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

                        {/* Lush Layered Foliage Clouds */}
                        <motion.g
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: canopyScale, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            style={{ transformOrigin: '50px 32px' }}
                        >
                            {/* Background deeper foliage */}
                            <circle cx="34" cy="46" r="11" fill="url(#oakLeafMain)" opacity="0.95" />
                            <circle cx="66" cy="42" r="12" fill="url(#oakLeafMain)" opacity="0.95" />
                            <circle cx="50" cy="24" r="14" fill="url(#oakLeafMain)" opacity="0.95" />
                            
                            {/* Foreground luminous canopy clusters */}
                            <circle cx="42" cy="30" r="12" fill="url(#oakLeafLight)" />
                            <circle cx="58" cy="32" r="11" fill="url(#oakLeafLight)" />
                            <circle cx="50" cy="38" r="13" fill="url(#oakLeafLight)" />

                            {/* Golden Acorns when mature */}
                            {growth >= 0.75 && (
                                <>
                                    <circle cx="38" cy="48" r="2.5" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 3px #f59e0b)' }} />
                                    <circle cx="64" cy="40" r="2.5" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 3px #f59e0b)' }} />
                                    <circle cx="52" cy="26" r="2.8" fill="#fbbf24" style={{ filter: 'drop-shadow(0 0 3px #f59e0b)' }} />
                                </>
                            )}
                        </motion.g>

                        {/* Biophilic Floating Forest Spores if Fully Grown */}
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
};

export const CherryBlossom = ({ growth }) => {
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
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible select-none">
            <defs>
                <linearGradient id="sakuraBark" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#451a03" />
                    <stop offset="100%" stopColor="#581c87" />
                </linearGradient>
                <linearGradient id="sakuraSproutStem" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#047857" />
                    <stop offset="60%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#fbcfe8" />
                </linearGradient>
                <radialGradient id="sakuraPetalGrad" cx="30%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#fff1f2" />
                    <stop offset="60%" stopColor="#fbcfe8" />
                    <stop offset="100%" stopColor="#f472b6" />
                </radialGradient>
                <radialGradient id="sakuraDeepPetal" cx="35%" cy="35%" r="65%">
                    <stop offset="0%" stopColor="#fbcfe8" />
                    <stop offset="70%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#be123c" />
                </radialGradient>
            </defs>

            {/* Tree Base Soil Mound */}
            <ellipse cx="50" cy="95" rx="15" ry="3" fill="#451a03" opacity="0.35" />

            {/* STAGE 1: Sakura Sprout & Blossom Seedling (0% - 18%) */}
            {isSprout && (
                <g className="sakura-sprout-stage">
                    {/* Split Cherry Seed Hull */}
                    <circle cx="50" cy="95" r="3.2" fill="#701a75" opacity="0.7" />
                    {/* Glowing Rootlets */}
                    <path d="M 48 95 Q 43 97 39 99" stroke="#ec4899" strokeWidth="0.8" fill="none" opacity="0.4" strokeDasharray="1 2" />
                    <path d="M 52 95 Q 57 97 61 99" stroke="#ec4899" strokeWidth="0.8" fill="none" opacity="0.4" strokeDasharray="1 2" />

                    {/* Delicate S-Curved Stem */}
                    <motion.path
                        d={`M 50 95 C 47 ${95 - sproutHeight * 0.4}, 53 ${95 - sproutHeight * 0.7}, 50 ${sproutApexY}`}
                        stroke="url(#sakuraSproutStem)"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8 }}
                    />

                    {/* Twin Seedling Leaves with Central Flower Bud */}
                    <g style={{ animation: 'branch-sway-soft 6s ease-in-out infinite alternate', transformOrigin: `50px ${sproutApexY}px` }}>
                        <path
                            d={`M 50 ${sproutApexY} C 43 ${sproutApexY}, 38 ${sproutApexY - 6}, 42 ${sproutApexY - 9} C 46 ${sproutApexY - 8}, 48 ${sproutApexY - 4}, 50 ${sproutApexY}`}
                            fill="#6ee7b7"
                        />
                        <path
                            d={`M 50 ${sproutApexY} C 57 ${sproutApexY}, 62 ${sproutApexY - 6}, 58 ${sproutApexY - 9} C 54 ${sproutApexY - 8}, 52 ${sproutApexY - 4}, 50 ${sproutApexY}`}
                            fill="#6ee7b7"
                        />
                        {/* Swelling Rose Calyx Flower Bud */}
                        <motion.circle
                            cx="50"
                            cy={sproutApexY - 3.5}
                            r="2.8"
                            fill="url(#sakuraDeepPetal)"
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                            style={{ filter: 'drop-shadow(0 0 3px #f43f5e)' }}
                        />
                        <circle cx="50" cy={sproutApexY - 3.5} r="1.2" fill="#fff1f2" />
                    </g>
                </g>
            )}

            {/* STAGE 2: Sakura Bonsai Sapling (18% - 35%) */}
            {isSapling && (
                <g className="sakura-sapling-stage">
                    <motion.path
                        d={`M 50 95 C 46 82, 54 72, 48 60 C 44 52, 52 46, 50 ${saplingApexY}`}
                        stroke="url(#sakuraBark)"
                        strokeWidth="2.8"
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.9 }}
                    />
                    {/* Young Branches */}
                    <path d={`M 48 70 C 42 66, 36 64, 30 62`} stroke="url(#sakuraBark)" strokeWidth="1.6" strokeLinecap="round" fill="none" />
                    <path d={`M 49 56 C 56 52, 64 50, 70 48`} stroke="url(#sakuraBark)" strokeWidth="1.6" strokeLinecap="round" fill="none" />

                    {/* Miniature Floral Clusters */}
                    <g style={{ animation: 'branch-sway-soft 6.5s ease-in-out infinite alternate', transformOrigin: '50px 65px' }}>
                        <circle cx="28" cy="62" r="6" fill="url(#sakuraDeepPetal)" />
                        <circle cx="29" cy="60" r="4.5" fill="url(#sakuraPetalGrad)" />
                        <circle cx="71" cy="48" r="6.5" fill="url(#sakuraDeepPetal)" />
                        <circle cx="72" cy="46" r="5" fill="url(#sakuraPetalGrad)" />
                        <circle cx="50" cy={saplingApexY - 2} r="8" fill="url(#sakuraDeepPetal)" />
                        <circle cx="50" cy={saplingApexY - 4} r="6.5" fill="url(#sakuraPetalGrad)" />
                        <circle cx="48" cy={saplingApexY - 5} r="2" fill="#fff1f2" />
                    </g>
                </g>
            )}

            {/* STAGE 3 & 4: Mature Sakura Bonsai (35% - 100%) */}
            {isMature && (
                <g className="sakura-mature-stage">
                    {/* Graceful S-Curve Bonsai Trunk */}
                    <motion.path
                        d="M 50 95 C 46 80, 56 68, 48 50 C 42 38, 54 28, 51 18"
                        stroke="url(#sakuraBark)"
                        strokeWidth={Math.max(2.4, 3.8 * growth)}
                        strokeLinecap="round"
                        fill="none"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 1.3, ease: "easeOut" }}
                    />

                    {/* Gentle Swaying Branch Group */}
                    <g style={{ animation: 'branch-sway-soft 7s ease-in-out infinite alternate', transformOrigin: '50px 50px' }}>
                        <motion.path
                            d="M 48 52 C 40 46, 30 46, 22 40"
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

                        {/* Sakura Floral Blossom Clouds */}
                        <motion.g
                            initial={{ scale: 0, opacity: 0 }}
                            animate={{ scale: canopyScale, opacity: 1 }}
                            transition={{ duration: 0.8 }}
                            style={{ transformOrigin: '50px 30px' }}
                        >
                            {/* Deep Rose Clusters */}
                            <circle cx="24" cy="38" r="10" fill="url(#sakuraDeepPetal)" opacity="0.9" />
                            <circle cx="74" cy="30" r="11" fill="url(#sakuraDeepPetal)" opacity="0.9" />
                            <circle cx="48" cy="18" r="12" fill="url(#sakuraDeepPetal)" opacity="0.9" />

                            {/* Soft Light Pink Foreground Blossoms */}
                            <circle cx="32" cy="32" r="11" fill="url(#sakuraPetalGrad)" />
                            <circle cx="62" cy="28" r="12" fill="url(#sakuraPetalGrad)" />
                            <circle cx="44" cy="24" r="13" fill="url(#sakuraPetalGrad)" />
                            <circle cx="56" cy="36" r="10" fill="url(#sakuraPetalGrad)" />

                            {/* Individual Blooming Petals */}
                            <circle cx="20" cy="44" r="3" fill="#fff1f2" />
                            <circle cx="78" cy="36" r="3.2" fill="#fff1f2" />
                            <circle cx="42" cy="14" r="3" fill="#fff1f2" />
                            <circle cx="68" cy="22" r="3.2" fill="#fff1f2" />

                            {/* Drifting Petals if Mature */}
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
};

export const PineTree = ({ growth }) => {
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
        <svg viewBox="0 0 100 100" className="w-full h-full overflow-visible select-none">
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

            {/* STAGE 1: Pine Seedling Rosette (0% - 18%) */}
            {isSprout && (
                <g className="pine-sprout-stage">
                    {/* Pinecone seed hull */}
                    <polygon points="48,95 52,95 50,92" fill="#78350f" opacity="0.8" />
                    {/* Rootlets */}
                    <path d="M 48 95 Q 44 98 40 99" stroke="#10b981" strokeWidth="0.8" fill="none" opacity="0.4" strokeDasharray="1 2" />
                    <path d="M 52 95 Q 56 98 60 99" stroke="#10b981" strokeWidth="0.8" fill="none" opacity="0.4" strokeDasharray="1 2" />

                    {/* Upright Tender Stem */}
                    <motion.line
                        x1="50"
                        y1="95"
                        x2="50"
                        y2={sproutApexY}
                        stroke="#059669"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: 1 }}
                        transition={{ duration: 0.8 }}
                    />

                    {/* Starburst Rosette Needle Tuft (True Pine Seedling Morphology) */}
                    <g style={{ animation: 'branch-sway-soft 5s ease-in-out infinite alternate', transformOrigin: `50px ${sproutApexY}px` }}>
                        <line x1="50" y1={sproutApexY} x2="41" y2={sproutApexY - 6} stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" />
                        <line x1="50" y1={sproutApexY} x2="45" y2={sproutApexY - 9} stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" />
                        <line x1="50" y1={sproutApexY} x2="50" y2={sproutApexY - 10} stroke="#6ee7b7" strokeWidth="1.5" strokeLinecap="round" />
                        <line x1="50" y1={sproutApexY} x2="55" y2={sproutApexY - 9} stroke="#34d399" strokeWidth="1.4" strokeLinecap="round" />
                        <line x1="50" y1={sproutApexY} x2="59" y2={sproutApexY - 6} stroke="#10b981" strokeWidth="1.4" strokeLinecap="round" />

                        {/* Central Dewdrop Gem */}
                        <motion.circle
                            cx="50"
                            cy={sproutApexY - 3}
                            r="2"
                            fill="#38bdf8"
                            animate={{ scale: [1, 1.25, 1] }}
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
                    {/* Upright Evergreen Trunk */}
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

                    {/* Tiered Needled Pine Canopy */}
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
};

export const Tree = ({ type, growth }) => {
    switch (type) {
        case 'pine': return <PineTree growth={growth} />;
        case 'cherry': return <CherryBlossom growth={growth} />;
        default: return <OakTree growth={growth} />;
    }
};

export { PlantingAnimation } from '../common/PlantingAnimation';

export const GroveView = ({ tasks, grove, goldenSeeds, onPlantSeed, allCategories, onOpenHarvestCard }) => {
    const [isRaining, setIsRaining] = useState(false);
    const [isPlantingEffect, setIsPlantingEffect] = useState(false);

    const wins = tasks.filter(t => t.win);

    const getSeason = () => {
        const month = new Date().getMonth();
        if (month >= 2 && month <= 4) return 'spring';
        if (month >= 5 && month <= 7) return 'summer';
        if (month >= 8 && month <= 10) return 'autumn';
        return 'winter';
    };
    const season = getSeason();
    const seasonGradients = {
        spring: 'from-pink-500/10 via-emerald-500/10 to-teal-500/15',
        summer: 'from-amber-500/10 via-sky-500/10 to-emerald-500/15',
        autumn: 'from-orange-500/10 via-amber-600/10 to-rose-600/15',
        winter: 'from-blue-500/10 via-indigo-500/10 to-slate-600/15',
    };

    const handlePlant = () => {
        if (goldenSeeds <= 0) return;
        setIsPlantingEffect(true);
        playHarmonicUiSound('plant_seed');
        if (onPlantSeed) onPlantSeed();
        setTimeout(() => setIsPlantingEffect(false), 1400);
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto pb-28 sm:pb-36"
        >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-4">
                <div className="text-left">
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">🌱</span>
                        <h2 className="text-3xl font-bold text-[var(--color-text-primary)]">Your Grove</h2>
                    </div>
                    <p className="text-[var(--color-text-secondary)] text-sm mt-0.5">A living botanical sanctuary that blossoms with every mindful finish.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsRaining(!isRaining)}
                        className={`px-3.5 py-1.5 rounded-full border text-xs font-medium transition-all flex items-center gap-1.5 shadow-sm ${
                            isRaining
                                ? 'bg-sky-500/20 text-sky-300 border-sky-400/40 ring-1 ring-sky-400/30'
                                : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border-[var(--color-border)] hover:text-[var(--color-text-primary)]'
                        }`}
                        title="Toggle serene rainfall weather over the grove"
                    >
                        <span>🌧️</span>
                        <span>{isRaining ? 'Rain Active' : 'Rain Weather'}</span>
                    </button>
                    {onOpenHarvestCard && (
                        <button
                            onClick={onOpenHarvestCard}
                            className="px-3.5 py-1.5 rounded-full bg-amber-400/15 hover:bg-amber-400/25 border border-amber-400/30 text-amber-200 text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5"
                            title="Export monthly accomplishments polaroid card"
                        >
                            <span>📸</span>
                            <span>Harvest Card</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Golden Seeds Planting Shrine */}
            <div className="mb-8 p-4 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/15 border border-amber-400/30 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="flex items-center justify-between gap-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shadow-inner">
                            <StarIcon className="w-5 h-5" />
                        </div>
                        <div className="text-left">
                            <p className="font-bold text-base sm:text-lg text-amber-300 flex items-center gap-1.5">
                                <span>Golden Seeds</span>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 font-mono">
                                    {goldenSeeds} available
                                </span>
                            </p>
                            <p className="text-xs text-amber-200/70">
                                Earned through consistent mindful momentum. Plant one to nurture a new living tree.
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={handlePlant}
                        disabled={goldenSeeds === 0}
                        className="bg-amber-400 hover:bg-amber-300 active:scale-95 text-black px-6 py-2.5 rounded-full font-bold text-sm disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20 transition-all flex items-center gap-2 flex-shrink-0"
                    >
                        <span>🌰</span>
                        <span>Plant Seed</span>
                    </button>
                </div>

                {/* Golden Seed Drop & Sprout Visual */}
                <AnimatePresence>
                    {isPlantingEffect && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-amber-400/20 backdrop-blur-[2px] flex items-center justify-center z-20 pointer-events-none"
                        >
                            <div className="flex flex-col items-center">
                                <span className="text-3xl animate-bounce">🌰</span>
                                <span className="text-xs font-semibold text-amber-200 mt-1 uppercase tracking-wider">
                                    Seed embedded into sacred earth...
                                </span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Living Botanical Garden Grid */}
            <div className={`relative overflow-hidden grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-12 min-h-[220px] p-6 rounded-3xl bg-gradient-to-br ${seasonGradients[season]} border border-[var(--color-border)] shadow-xl backdrop-blur-md`}>
                {/* Weather Rainfall and Droplet Ripples */}
                {isRaining && (
                    <div className="absolute inset-0 pointer-events-none z-10 overflow-hidden">
                        {[...Array(35)].map((_, i) => (
                            <React.Fragment key={i}>
                                <div
                                    className="absolute w-[1.5px] h-8 bg-sky-200/60 rounded-full"
                                    style={{
                                        left: `${(i * 3.1) % 100}%`,
                                        animation: 'rain-fall 1.0s linear infinite',
                                        animationDelay: `${((i * 0.13) % 1.4).toFixed(2)}s`
                                    }}
                                />
                                {i % 4 === 0 && (
                                    <div
                                        className="absolute w-4 h-1.5 border border-sky-300/40 rounded-full"
                                        style={{
                                            left: `${(i * 3.1) % 100}%`,
                                            bottom: `${10 + (i % 5) * 6}%`,
                                            animation: 'rain-ripple 1.2s ease-out infinite',
                                            animationDelay: `${((i * 0.21) % 1.4).toFixed(2)}s`
                                        }}
                                    />
                                )}
                            </React.Fragment>
                        ))}
                    </div>
                )}

                {grove.map((tree, idx) => {
                    const progress = tree.growthPoints / tree.maxGrowth;
                    return (
                        <motion.div
                            key={tree.id}
                            initial={{ scale: 0.85, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            className="p-3 bg-[var(--color-bg-secondary)]/70 hover:bg-[var(--color-bg-secondary)] backdrop-blur-md rounded-2xl border border-[var(--color-border)] hover:border-emerald-500/40 shadow-sm transition-all flex flex-col items-center justify-between group cursor-default"
                        >
                            <div className="w-full h-36 flex items-center justify-center p-1 relative">
                                <Tree type={tree.type} growth={progress} />
                            </div>

                            <div className="w-full mt-2 text-center">
                                <p className="text-xs font-semibold text-[var(--color-text-primary)] capitalize">
                                    {tree.type} Tree
                                </p>
                                <div className="w-full bg-[var(--color-bg)]/80 rounded-full h-1.5 mt-1.5 overflow-hidden border border-[var(--color-border)]">
                                    <div
                                        className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-500"
                                        style={{ width: `${Math.min(100, Math.round(progress * 100))}%` }}
                                    />
                                </div>
                                <span className="text-[10px] text-[var(--color-text-secondary)] font-mono mt-0.5 block">
                                    {tree.growthPoints} / {tree.maxGrowth} pts
                                </span>
                            </div>
                        </motion.div>
                    );
                })}

                {grove.length === 0 && (
                    <div className="col-span-full self-center py-12 flex flex-col items-center justify-center text-center">
                        <span className="text-4xl mb-2">🌸</span>
                        <p className="text-base font-semibold text-[var(--color-text-primary)]">Your Grove Sanctuary Awaits</p>
                        <p className="text-xs text-[var(--color-text-secondary)] max-w-sm mt-1">
                            Plant your first golden seed to sprout an organic tree that flourishes with every task you conquer.
                        </p>
                    </div>
                )}
            </div>

            {/* Accomplishment Wins Journal */}
            <div className="mt-8 text-left">
                <h3 className="text-2xl font-bold text-[var(--color-text-primary)] mb-4 flex items-center gap-2">
                    <span>🏆</span>
                    <span>Accomplishment Journal</span>
                </h3>
                <div className="space-y-3">
                    {wins.length > 0 ? (
                        wins.map((winTask, i) => (
                            <motion.div
                                key={winTask.id}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.08 }}
                                className={`p-4 rounded-2xl border text-left backdrop-blur-sm shadow-sm ${
                                    winTask.isGolden
                                        ? 'border-amber-400/60 bg-amber-500/15'
                                        : allCategories[winTask.category]?.border || defaultCategories['General'].border
                                } ${!winTask.isGolden && (allCategories[winTask.category]?.bg || defaultCategories['General'].bg)}`}
                            >
                                <p className="font-bold text-sm text-[var(--color-text-primary)]">{winTask.text}</p>
                                <div className="flex items-start gap-2.5 mt-2 text-[var(--color-text-primary)]/80 text-xs">
                                    <QuoteIcon className="w-4 h-4 flex-shrink-0 mt-0.5 opacity-50" />
                                    <p className="italic leading-relaxed">{winTask.win}</p>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <p className="text-xs text-[var(--color-text-secondary)] italic">
                            Complete high-priority tasks to record your proudest moments in this mindful journal.
                        </p>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

# Changelog

All notable changes to the **Aura WebApp** project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.2.0] - 2026-09-21

### Resilience, Error-Free Architecture & Theme Animation Milestone

This release delivers comprehensive error resilience, self-healing storage, memory leak prevention, full test determinism, and restores live animations across all 17 aesthetic themes.

### Added
- **Top-Level Fail-Safe Error Boundary**: Wrapped the entire application shell in `<ErrorBoundary>` with a serene recovery screen, guaranteeing immunity to uncaught component render crashes.
- **Self-Healing LocalStorage Recovery**: In `usePreferences`, corrupted or invalid JSON storage is automatically identified and healed back to a safe default state with zero user interruption.
- **Web Audio Node Lifecycle Cleanup**: Added automatic `.dispose()` scheduling in `useSoundEffects` for procedural singing bowls, preventing Web Audio node accumulation during extended usage.
- **Media Recorder Unmount Safeguard**: Safeguarded audio recording lifecycle in `TaskDetailModal` against memory leaks or async state updates on unmount.
- **Deterministic Test Architecture**: Configured `fileParallelism: false` in `vite.config.js` for stable, timeout-free jsdom execution across all 27 test files on Windows.

### Fixed
- **Stardust Keyframe Collision**: Renamed kinetic burst keyframe to `stardust-burst-drift` in `theme-effects.css` and `StardustParticles.jsx`, restoring twinkling cosmic stardust in OLED Dark and custom themes.
- **Cyberpunk Matrix Stream & Grid**: Fixed `@keyframes code-drift-up` bounds and added `@keyframes cyber-grid-scroll` to drive continuous perspective grid rolling and drift across all 40 glyphs.
- **Circadian Sky Class Selectors**: Added missing CSS selector definitions (`.circadian-sky`, `.circadian-sun`, `.circadian-moon`, `.circadian-cloud`, `.circadian-star`) in `theme-effects.css`.
- **Dynamic Particle Coverage**: Fully populated coordinate, duration, and delay attributes across all 9 ambient particle themes (Forest, Sakura, Dracula, Crimson, Ocean, Dune, Nord, Latte, Gruvbox) in `ThemeBackground.jsx`.
- **Reduced-Motion Isolation**: Scoped `@media (prefers-reduced-motion: reduce)` in `index.css` to exclude `.theme-bg`, preserving ambient canvas animations while honoring UI motion accessibility.
- **Re-Render Cascade Loop**: Memoized context value in `NotificationContext.jsx` and decoupled cyclic callbacks in `SettingsContext.jsx` and `TaskContext.jsx`, resolving `Maximum update depth exceeded`.
- **Linter Compliance**: Eliminated all `react-hooks/exhaustive-deps` and unused variable warnings in `TaskContext.jsx` to achieve 0 warnings and 0 errors in `oxlint` across all 120 files.

---

## [1.1.0] - 2026-09-20

### Harmonic Architecture & Mindful Depth Release

This milestone elevates Aura into a fully modular, air-gapped, zero-leakage mindful productivity platform with 100% test coverage for core hooks and offline operations, strict accessibility compliance, and rich spatial visualizations.

### Added
- **Botanical Grove Modular Tree System (`TreeRenderer.jsx`)**:
  - Extracted independent parametric SVG renderers for Oak, Cherry Blossom, Evergreen Pine, Japanese Bonsai, and Weeping Willow.
  - Added seasonal weather simulation (gentle rain precipitation overlay, dynamic day/twilight sky gradients).
  - Added `AccomplishmentJournal.jsx` dedicated wins archival modal with export capabilities.
  - Added `GoldenSeedPanel.jsx` shrine for cultivating long-term intentions.
- **Cosmic Constellations Spatial Architecture (`OrbitVisualization.jsx`)**:
  - Implemented multi-ring gravitational orbit physics simulation with canvas rendering.
  - Added `ConstellationControls.jsx` for smooth zoom magnification (0.6x – 1.8x), realm filtering, and view mode toggles.
  - Added `ClusterListView.jsx` for keyboard-accessible card-based cluster exploration.
- **Advanced Breathing Rhythms (`MindfulMinuteModal.jsx`)**:
  - Added 3 scientific breathing patterns: Box Breathing (4-4-4-4), Relax & Release (4-7-8), and Energize & Spark (2-1-2-1).
  - Added session duration selection (1m, 3m, 5m) and lifetime mindful breath counter persisted across sessions.
- **Real-Time Syntax Chip Preview (`CaptureInput.jsx`)**:
  - Live chip badges for natural language tokens (`#category`, `!priority`, `~energy`, `@tag`, `~due`) rendered below the input with one-click token removal.
  - Mobile virtual keyboard optimization: added `enterKeyHint="done"`, `autoCapitalize="sentences"`, and input focus stabilization.
- **Offline Data Health Dashboard (`SettingsModal.jsx`)**:
  - Real-time client-side IndexedDB footprint and storage quota meter via `navigator.storage.estimate()`.
  - Air-gapped validation indicator verifying zero external network telemetry.
  - Integrated "What's New in Aura" collapsible release notes card directly inside Settings.
- **Momentum Quick Stats Widget (`QuickStatsWidget.jsx`)**:
  - Ambient header ribbon displaying active streak, today's harvested victories count, grove tree count, and available golden seeds with quick-navigation shortcuts.
- **Energy Harmony & Velocity Analytics (`ReviewView.jsx`)**:
  - Segmented proportional energy distribution gauge (⚡ Spark vs 🌊 Flow vs 🍃 Rest).
  - Completion velocity tracker and anti-backlog status metrics.
- **7-Day Mood Resonance Trail (`JournalView.jsx`)**:
  - Weekly mood sparkline calendar strip with mood emojis and reflection consistency tracker.
  - Words penned counter and reflection victory counter.
- **Universal Delightful Empty State (`EmptyState.jsx`)**:
  - Standardized mindful empty state across Flow, Constellations, Grove, and Journal with gentle encouraging micro-copy.
- **Onboarding Tour (`OnboardingOverlay.jsx`)**:
  - Dismissible 4-step coach tour introducing Zen philosophy, keyboard shortcuts, ambient soundscapes, and offline safety.
- **Comprehensive Unit & Integration Test Suite (13 test files, 60 passing tests)**:
  - Added test suites for `snapshotVault`, `useFilteredTasks`, `useStaleTasks`, `useKeyboardShortcuts`, `CommandPalette`, `CaptureInput`, `MindfulMinuteModal`, `useAmbientSound`, and `constants`.

### Changed
- **Decomposed Monolithic Components**:
  - Refactored `App.jsx` from 890+ lines into an orchestration layer (< 350 lines), delegating state to `useFilteredTasks`, `useStaleTasks`, and dedicated feature contexts.
  - Refactored `GroveView.jsx` from 834 lines into 109 lines by delegating to modular botanical components.
  - Refactored `ConstellationsView.jsx` from 507 lines into 82 lines by extracting canvas simulation and controls.
- **Visual Polish & Design System**:
  - Enhanced `index.css` with `.aura-skeleton` shimmer animation, `.animate-fade-in-scale`, `.safe-pb`, and `.safe-pt` safe-area padding.
  - Upgraded `LoadingScreen.jsx` to a cinematic glowing ambient splash screen with progress indicator.
  - Redesigned `Toast.jsx` with glassmorphic iconography and animated auto-dismiss progress bar.
- **Platform & PWA Standards**:
  - Updated `manifest.json` with `launch_handler: { "client_mode": "focus-existing" }`, `edge_side_panel`, `handle_links: "preferred"`, and quick shortcuts.
  - Updated `index.html` with `color-scheme: dark light` and Schema.org `WebApplication` structured data.

### Fixed
- Fixed audio mock stability in test environments by providing clean Tone.js and AudioContext mocks.
- Fixed mobile bottom navigation overlap on devices with home indicator bars using `safe-pb` and `env(safe-area-inset-bottom)`.
- Fixed keyboard accessibility on `ProductivityHeatmap` day tiles with proper ARIA attributes (`role="gridcell"`).

---

## [1.0.0] - 2026-09-18

### Initial Release

- **Mindful Task Flow**: Eisenhower-inspired focus, tag filtering, task pinning, and inline subtasks.
- **Ambient Generative Audio**: Procedural Tone.js soundscapes (Binaural Alpha, Zen Bells, Singing Bowls, Temple Rain, Forest Dawn).
- **Anti-Backlog Sanctuary**: Stale task forgiveness, recommitment, and snooze to #someday.
- **Evening Shutdown Ritual**: Reflective wind-down reminder to cultivate peace before rest.
- **Living Grove & Constellations**: Organic visual metaphors connecting productivity to nature and the cosmos.
- **Air-Gapped Privacy**: 100% local IndexedDB storage with manual export/import and zero trackers.

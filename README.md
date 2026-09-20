# 🌸 Aura — Mindful Productivity & Ambient Flow

[![Offline](https://img.shields.io/badge/Offline-100%25%20Air--Gapped-success?style=flat-square&logo=shield)](#readme)
[![Privacy](https://img.shields.io/badge/Privacy-Zero%20Telemetry-blue?style=flat-square)](#readme)
[![Tests](https://img.shields.io/badge/Tests-190%2F190%20Passing-brightgreen?style=flat-square&logo=vitest)](tests/)
[![Lint](https://img.shields.io/badge/Lint-0%20Warnings%20%7C%200%20Errors-brightgreen?style=flat-square&logo=oxlint)](.oxlintrc.json)
[![A11y](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AA-success?style=flat-square)](#accessibility-statement)
[![Version](https://img.shields.io/badge/Version-v1.2.0-orange?style=flat-square)](package.json)
[![Storage](https://img.shields.io/badge/Storage-IndexedDB%20v2%20Vault-purple?style=flat-square)](src/utils/db.js)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](package.json)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=flat-square&logo=tailwind-css)](package.json)
[![Audio](https://img.shields.io/badge/Web_Audio-Tone.js%20Synthesis-orange?style=flat-square)](src/hooks/useAmbientSound.js)
[![Platform](https://img.shields.io/badge/Platform-Windows%2011%20Desktop%20%7C%20PWA-informational?style=flat-square&logo=windows)](setup-shortcut.ps1)

> **Aura** is a calming, spatial, and mindful productivity sanctuary engineered for deep personal focus. Built with **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **Tone.js**, Aura transforms task management from a stress-inducing checklist into a restorative experience through visual time-blocking, procedural botanical growth, orbiting project constellations, mathematical sound synthesis, and ambient dynamic environments.

---

### 🛡️ The Single-PC, 100% Air-Gapped Philosophy
Aura is deliberately designed to run **locally on a single machine for a single person**.

- 🚫 **No Sign-In, No Passwords, No Cloud Accounts**: Instant launch with zero login friction.
- 🚫 **Zero External Network Calls**: Completely immune to internet outages. Zero CDNs, zero telemetry, and zero remote font or texture downloads.
- 🚫 **No Backend or Database Administration**: All personal tasks, journal reflections, attachments, and voice memos persist securely in your local browser's **IndexedDB v2** (`AuraDB`) and `localStorage`.
- 🔒 **Absolute Data Sovereignty**: Your thoughts, energy levels, and reflections never leave your device.

---

## 💻 Native Windows Desktop App & PWA Setup

Aura runs as an independent native desktop application with custom Windows 11 Window Controls Overlay (WCO) titlebar integration.

### Method 1: Desktop Shortcut Setup (Instant)
1. Run [`setup-shortcut.ps1`](setup-shortcut.ps1) in PowerShell or double-click [`install-app.bat`](install-app.bat).
2. The script compiles the offline production bundle and creates an **Aura** shortcut on your **Windows Desktop** and in your **Start Menu Programs**.
3. Double-click the **Aura** Desktop shortcut to launch Aura instantly—it runs silently via [`launch-aura.vbs`](launch-aura.vbs) with **no background terminal window**, opening directly in a borderless standalone app window!

### Method 2: Install as a Progressive Web App (PWA)
1. Run `npm run preview` (or `npm run dev`) and open the local URL in **Google Chrome** or **Microsoft Edge**.
2. Click the **"Install App"** button in Aura's header (or the install icon in your browser address bar).
3. Chrome or Edge will install Aura directly to your **Windows Start Menu**, **Taskbar**, and **Desktop**.

---

## ✨ Features & Capabilities in Current Version

### 1. 🌊 Fluid Flow View (Mindful Time-Blocking)
- **Natural Cadence**: Organize tasks across **Morning**, **Afternoon**, and **Evening** blocks.
- **Single Sacred MIT (Most Important Task)**: Designate a primary monolith focus goal with an optional **Tunnel Vision Mode** that dims all secondary distractions.
- **Energy-Aware Prioritization**: Tag tasks by mental energy requirements:
  - ⚡ **Spark** (`~spark` / `!spark`): High-focus creative or architectural problem-solving.
  - 🌊 **Flow** (`~flow` / `!flow`): Steady, engaged execution.
  - 🍃 **Rest** (`~rest` / `!rest`): Low-friction administrative or wind-down tasks.
- **Subtask Checklists, Notes & Attachments**: Expand any task card to add subtasks, rich notes, file attachments, and audio voice notes.
- **Tactile Reordering**: Drag cards by their handle to smoothly reorder tasks within or across time sections.
- **Sanctuary of Clarity**: When all tasks are cleared, enjoy a tranquil empty state designed to celebrate mental stillness.

### 2. 🌱 The Grove (Procedural Botanical Momentum)
- **Living SVGs**: Watch your daily accomplishments blossom into parametric botanical trees that leaf, branch, and sway as you complete tasks.
- **5 Unlockable Botanical Species**:
  - 🌳 **Ancient Oak**: Foundational, sturdy progress.
  - 🌸 **Cherry Blossom**: Delicate creative flow.
  - 🌲 **Evergreen Pine**: Unshakable consistency.
  - 🎍 **Japanese Bonsai**: Precision and mindfulness.
  - 🌿 **Weeping Willow**: Reflection and restorative pause.
- **Weather & Ambiance Toggle**: Toggle gentle falling rain particles and dynamic twilight sky gradients.
- **Golden Seeds Shrine**: Cultivate rare seeds earned from daily momentum.
- **Accomplishment Journal & Polaroid Cards**: Export beautiful milestone cards celebrating completed focus cycles.

### 3. 🌌 Cosmic Constellations (Spatial Topology)
- **Gravitational Orbit Physics**: Projects and tasks are rendered as celestial bodies orbiting core project hubs connected by gravitational filaments.
- **Interactive Physics Canvas**: Pan, drag nodes, filter realms, and smoothly zoom from **0.6x to 1.8x**.
- **Cluster List View**: A keyboard-accessible alternative view organizing constellation clusters into clear cards.

### 4. 🎚️ Procedural Dual-Track Ambient Soundscapes & Frequencies
Aura includes a real-time mathematical audio synthesizer powered by **Tone.js**. **Zero audio files are downloaded**—all audio is generated dynamically on your CPU using noise generators, filters, and sine oscillators:
- **Atmospheric Generators**:
  - 🌧️ *Rain Shower*: Filtered pink noise with stochastic droplet envelopes.
  - 🌊 *Ocean Waves*: LFO-modulated brownian noise with low-frequency swells.
  - 🍃 *Forest Wind*: Sweeping gentle bandpass noise.
  - 🟫 *Brownian Noise*: Deep, grounding low-frequency rumble.
  - 🌸 *Pink Noise*: Balanced 1/f noise for reading and focus.
  - ⚪ *White Noise*: Broadband acoustic masking.
- **Sacred Frequency Oscillators**:
  - 🧘 *432 Hz*: Natural acoustic harmony and calm.
  - ✨ *528 Hz*: Clarity and cellular renewal resonance.
  - 🧠 *Theta Waves (6 Hz)*: Binaural beat for relaxed focus and intuition.
  - ⚡ *Alpha Waves (10 Hz)*: Binaural beat for relaxed alertness.
  - 🔔 *Tibetan Singing Bowls*: Inharmonic overtone resonance.
- **Mixer Controls**: Independent Atmosphere, Frequency, and Master volume faders with curated 1-click presets (*Deep Focus*, *Ocean Theta*, *Forest Zen*, *528 Hz Renewal*).
- **Sleep Timer**: Gradual auto-fadeout after 15, 30, 45, or 60 minutes.

### 5. 🧘 Mindful Minute Meditation Timer
- **3 Breathing Rhythms**:
  - **Box Breathing (4-4-4-4)**: Focus and mental centering.
  - **Relax & Release (4-7-8)**: Stress reduction and evening calm.
  - **Energize & Spark (2-1-2-1)**: Quick alertness boost.
- **Session Durations**: Choose 1-minute, 3-minute, or 5-minute sessions.
- **Lifetime Breath Tracking**: Tracks cumulative completed mindful sessions locally.

### 6. ⏱️ Focus Pomodoro Timer
- Dedicated focus sprint timer with gentle auditory start/finish chimes.
- Seamlessly pairs with active ambient soundscapes.
- Logs completed focus sessions directly into your local daily history.

### 7. 📖 Mindful Daily Journal
- **7-Day Mood Resonance Trail**: Interactive calendar strip tracking daily moods and journaling consistency.
- **Mood Selector**: Tag entries with mood states (*Calm*, *Energized*, *Focused*, *Grateful*, *Reflective*).
- **Daily Reflection Prompts**: Curated prompts for gratitude and mindful perspective.
- **Victories List**: Inspect all tasks completed on that date directly alongside your reflections.
- **Word & Entry Counters**: Real-time writing statistics stored locally.

### 8. 📊 53-Week Productivity Heatmap & Review Analytics
- **Full 53-Week Calendar Grid**: 365-day GitHub-style momentum matrix flowing chronologically with formatted month headers and weekday indicators.
- **Hover Inspection Tooltips**: View exact dates and completed task counts per day.
- **Energy Harmony Distribution**: Visual breakdown of your completed work across Spark, Flow, and Rest energy levels.
- **Exportable Markdown Report**: Generate and download an executive summary of your productivity accomplishments.

### 9. 🍃 Anti-Backlog Sanctuary (Brain Sweep)
- Surfaces stale tasks that have lingered untouched for 14+ days.
- Choose without guilt:
  - **Recommit**: Bring directly into today's flow.
  - **Someday**: Move to the long-term backlog vault.
  - **Forgive & Release**: Archive stale tasks with zero penalty.

### 10. 🎨 16 Curated Themes & Theme Creator Studio
- **16 Handcrafted Aesthetic Themes**:
  - *OLED Dark*, *Clean Light*, *Cyberpunk*, *Crimson*, *Forest*, *Ocean*, *Dune*, *Sakura*, *Solarized*, *Dracula*, *Nord*, *Gruvbox*, *Monokai*, *Rosé Pine*, *Matcha*, and *Latte*.
- **Custom Theme Creator Studio**: Create, test, and save custom themes with real-time preview of background, surface, text, border, and accent colors.

### 11. 🛡️ Air-Gapped Data Health & Rolling Snapshots
- **IndexedDB Footprint & Quota Meter**: Inspect local storage usage and available capacity via `navigator.storage.estimate()`.
- **Automated Rolling Snapshots**: 14-day rolling recovery points stored locally in IndexedDB.
- **Lossless JSON Safety Vault**: Export your full state (including binary attachments and voice notes converted to Base64) to a `.json` backup and restore anytime via the File System Access API.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | **Command Palette** | Spotlight search across tasks, tags, categories, and commands |
| <kbd>N</kbd> | **Quick Capture** | Focus the task input field immediately |
| <kbd>1</kbd> | **Flow View** | Navigate to daily time-blocked task flow |
| <kbd>2</kbd> | **Constellations View** | Navigate to spatial project topology canvas |
| <kbd>3</kbd> | **The Grove** | Inspect your growing botanical garden |
| <kbd>4</kbd> | **Daily Journal** | Open daily reflection and win log |
| <kbd>5</kbd> | **Review & Heatmap** | Open 53-week productivity calendar & analytics |
| <kbd>B</kbd> | **Brain Sweep** | Open Anti-Backlog Sanctuary |
| <kbd>S</kbd> | **Settings** | Open preferences, theme picker, and backup vault |
| <kbd>?</kbd> | **Shortcuts** | Toggle keyboard shortcuts modal |
| <kbd>Esc</kbd> | **Close** | Dismiss any active modal or search view |

---

## ✍️ Smart Task Input Syntax

Aura's input parser automatically detects categories, tags, priority, energy levels, and time slots directly from natural language with live chip previews:

```text
Draft system architecture #Work @deepwork !urgent ~spark tomorrow morning
```

| Syntax Pattern | Effect | Example |
| :--- | :--- | :--- |
| `@tag` | Assigns context tag | `@deepwork`, `@ritual`, `@errand`, `@study` |
| `#Category` | Categorizes task | `#Work`, `#Design`, `#Personal`, `#Study` |
| `!` or `urgent` | High Priority | `Fix memory leak !` or `urgent review` |
| `low priority` | Low Priority | `Clean desk low priority` |
| `~spark` / `!spark` | High Energy (Spark) | `Write chapter 3 ~spark` |
| `~flow` / `!flow` | Medium Energy (Flow) | `Code feature ~flow` |
| `~rest` / `!rest` | Low Energy (Rest) | `Clear inbox ~rest` |
| `morning` | Schedules in Morning block | `Morning standup morning` |
| `afternoon` | Schedules in Afternoon block | `Deep work sprint afternoon` |
| `evening` / `night` | Schedules in Evening block | `Evening tea & reflection evening` |
| `today` / `tomorrow` | Intelligent relative date | `Submit report tomorrow` |
| `in X days/weeks` | Relative deadline offset | `Review roadmap in 3 days` |
| `on friday` / `next monday` | Next weekday assignment | `Sprint retro on friday` |
| `every day` / `every week` | Recurring cadence | `Daily walk every day` |

---

## 🏛️ Offline Architecture

```
┌────────────────────────────────────────────────────────┐
│               Aura Single-PC Client Architecture       │
└────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐
│  React 19 Shell  │             │ Tone.js Synthesizer│
│  (State Contexts)│             │ (Dual-Track Audio)│
└────────┬─────────┘             └──────────────────┘
         │
         ├─── UI Preferences ──────────► localStorage (~1KB)
         │
         ├─── Core State & Vault ──────► IndexedDB v2 (AuraDB)
         │    • 14-Day Rolling Snapshots  • attachments store
         │    • Audio/Voice Notes         • snapshots store
         │    • File Attachments
         │
         └─── Lossless Local Backup ───► .json Safety Vault Export (Disk)
              (Base64 Rehydrated)
```

1. **Zero External Network Requests**: Font stack utilizes native system typography (`Inter`, `Segoe UI Variable`, `Segoe UI`, `SF Pro`, `Roboto`, `system-ui`) with zero font or texture CDN downloads.
2. **Dual-Tier Storage Architecture**: `localStorage` is strictly reserved for scalar UI settings (< 1KB). `IndexedDB v2` (`AuraDB`) manages heavy object stores: `snapshots` (automated 14-day rolling recovery points) and `attachments` (binary Blobs for voice notes and files), eliminating `QuotaExceededError` risks.
3. **Offline Service Worker**: Automatically precaches all production chunks (`dist/assets/`) and logo assets using a cache-first strategy.

---

## 📁 Project Directory Structure

```text
Aura WebApp/
├── Aura.bat                     # Silent Windows borderless app launcher
├── install-app.bat              # 1-click Windows installer & shortcut builder
├── launch-aura.vbs              # Silent launcher (prevents black CMD window)
├── setup-shortcut.ps1           # Desktop & Start Menu shortcut generator
├── CHANGELOG.md                 # Semantic version changelog
├── public/
│   ├── Aura_logo.png            # Official high-resolution 1024x1024 app logo
│   ├── favicon.ico              # Multi-size Windows & browser favicon
│   ├── favicon.png              # 48x48 PNG favicon
│   ├── favicon-32x32.png        # 32x32 PNG favicon
│   ├── favicon-16x16.png        # 16x16 PNG favicon
│   ├── favicon.svg              # SVG application favicon
│   ├── icon-192.png / .svg      # PWA 192x192 icons
│   ├── icon-512.png / .svg      # PWA 512x512 icons
│   ├── manifest.json            # PWA manifest with Window Controls Overlay & maskable icons
│   └── sw.js                    # Offline Service Worker (Cache-First strategy)
├── src/
│   ├── assets/                  # App logo and static assets
│   ├── components/
│   │   ├── backgrounds/         # Dynamic theme canvas backgrounds (Stars, Waves, etc.)
│   │   ├── common/              # Header, BottomNav, QuickStatsWidget, EmptyState, OnboardingOverlay, Toast
│   │   ├── constellations/      # OrbitVisualization (physics canvas), ClusterListView, Controls
│   │   ├── grove/               # TreeRenderer (Oak, Cherry, Pine, Bonsai, Willow), GroveGrid, Journal
│   │   ├── journal/             # CalendarStrip, MoodSelector, PromptCards, VictoriesList
│   │   ├── modals/              # Sound mixer, settings, command palette, shortcuts, brain sweep
│   │   ├── review/              # Heatmap, AnalyticsPanel, StatsCards, StaleTasksTriage, ReportModal
│   │   └── views/               # FlowView, GroveView, ConstellationsView, ReviewView, FocusView, JournalView
│   ├── context/                 # TaskContext, SettingsContext, ThemeContext, GroveContext, UIContext, NotificationContext
│   ├── hooks/                   # useAmbientSound, useFilteredTasks, useStaleTasks, useTaskOperations, useAuraAnnounce
│   ├── utils/                   # db (IndexedDB v2), snapshotVault, dateUtils, constants
│   ├── styles/                  # theme-effects.css
│   ├── App.jsx                  # Main application shell & orchestration layer
│   ├── index.css                # Design system, theme tokens, shimmer skeletons, WCO variables
│   └── main.jsx                 # Entry point with clean install migration & SW registration
├── tests/                       # 27 Vitest test suites (190 passing tests)
│   ├── setup.js                 # Web Audio, Web Speech, matchMedia, and vibration mocks
│   ├── db.test.js               # fake-indexeddb v2 operations
│   ├── snapshotVault.test.js    # Rolling recovery points
│   ├── useFilteredTasks.test.js # Filter & tag logic
│   ├── useStaleTasks.test.js    # Stale task actions
│   └── *.test.jsx               # Component & hook integration suites
├── vite.config.js               # Vite config with automated offline SW bundle generator
└── package.json                 # Project dependencies and scripts
```

---

## 🛠️ Developer Reference

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**

### Available Scripts
```bash
# Start local development server
npm run dev

# Compile production offline bundle & inject SW precache manifest
npm run build

# Preview production build locally on port 4173
npm run preview

# Run fast code linting via oxlint (0 errors, 0 warnings)
npm run lint

# Run automated unit and integration test suite via Vitest (190 passing tests)
npm test

# Run tests in watch mode during development
npm run test:watch
```

---

## ♿ Accessibility Statement (WCAG 2.1 AA)

- **Semantic Landmarks**: Standard HTML5 semantic elements (`<main id="main-content">`, `<nav>`, `<header>`, `<dialog>`).
- **Skip Navigation**: Accessible `SkipToContent` link to immediately bypass navigation docks.
- **Screen Reader Announcer**: Dedicated `ScreenReaderAnnouncer` component with polite and assertive ARIA live regions (`aura-announce`).
- **ARIA 1.2 Compliance**: Attributes across all interactive elements (`aria-label`, `aria-expanded`, `aria-selected`, `role="tab"`, `role="progressbar"`).
- **Reduced Motion Support**: Respects `prefers-reduced-motion: reduce` across Framer Motion transitions and background canvas animations.
- **Contrast & Typography**: Minimum 4.5:1 contrast ratio across standard themes, with high-contrast variants (*OLED Dark*, *Clean Light*).

---

## 🔒 Privacy Guarantee

All personal data—tasks, reflections, custom themes, sound mixer settings, file attachments, voice memos, and achievement trees—remains strictly inside your personal computer's local storage (`IndexedDB` & `localStorage`). 

**No data is ever transmitted to remote servers. Aura is 100% private, local, and distraction-free.**

---

<p align="center">
  <sub>Crafted with peace, care, and precision for mindful flow.</sub>
</p>

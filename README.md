# 🌸 Aura — Mindful Productivity & Ambient Flow

[![Offline](https://img.shields.io/badge/Offline-100%25%20Air--Gapped-success?style=flat-square&logo=shield)](file:///e:/Aura%20WebApp/README.md)
[![Privacy](https://img.shields.io/badge/Privacy-Zero%20Telemetry-blue?style=flat-square)](file:///e:/Aura%20WebApp/README.md)
[![Storage](https://img.shields.io/badge/Storage-IndexedDB%20v2%20Vault-purple?style=flat-square)](file:///e:/Aura%20WebApp/src/utils/db.js)
[![React](https://img.shields.io/badge/React-19.2-61DAFB?style=flat-square&logo=react)](file:///e:/Aura%20WebApp/package.json)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4.3-38B2AC?style=flat-square&logo=tailwind-css)](file:///e:/Aura%20WebApp/package.json)
[![Audio](https://img.shields.io/badge/Web_Audio-Tone.js%20Synthesis-orange?style=flat-square)](file:///e:/Aura%20WebApp/src/hooks/useAmbientSound.js)
[![Platform](https://img.shields.io/badge/Platform-Windows%2011%20PWA%20%7C%20Desktop-informational?style=flat-square&logo=windows)](file:///e:/Aura%20WebApp/install-app.bat)

> **Aura** is a calming, spatial, and mindful productivity companion engineered for deep daily focus. Crafted with **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **Tone.js**, Aura transforms task management from a stress-inducing checklist into a restorative sanctuary through visual time-blocking, procedural botanical growth, orbiting project constellations, mathematical sacred soundscapes, and ambient dynamic environments.

---

### 🛡️ The Single-PC, 100% Air-Gapped Philosophy
Aura is deliberately designed to run **exclusively on a single machine for a single person**. 

- 🚫 **No Sign-In, No Passwords, No Cloud Accounts**: Instant launch with zero onboarding friction.
- 🚫 **Zero External Network Calls**: Completely immune to internet outages. Zero CDNs, zero telemetry, and zero remote font or texture downloads.
- 🚫 **No Backend or Database Administration**: All personal tasks, journal reflections, attachments, and voice memos persist securely in your local browser's **IndexedDB v2** (`AuraDB`) and `localStorage`.
- 🔒 **Absolute Data Sovereignty**: Your thoughts, energy levels, and reflections never leave your device.

---

## 💻 Native Windows Desktop App & PWA Setup

Aura runs as a first-class native desktop application with custom Windows 11 Window Controls Overlay (WCO) titlebar integration.

### Method 1: One-Click Windows Setup (Recommended)
1. Double-click [install-app.bat](file:///e:/Aura%20WebApp/install-app.bat) in the root repository folder.
2. The script will automatically install dependencies, compile the offline production bundle, and create an **Aura** shortcut on your Windows Desktop.
3. Launch Aura anytime via the Desktop shortcut—it starts silently via [launch-aura.vbs](file:///e:/Aura%20WebApp/launch-aura.vbs) with **no black terminal or command prompt window**!

### Method 2: Install as a Progressive Web App (PWA)
1. Run `npm run preview` (or `npm run dev`) and open the local URL in **Google Chrome** or **Microsoft Edge**.
2. Click the glowing **"Install App"** button in Aura's header (or the install icon in your browser address bar).
3. Chrome or Edge will pin Aura directly to your **Windows Start Menu**, **Taskbar**, and **Desktop** as an independent, borderless desktop window.

---

## ✨ God-Tier Features & Capabilities

### 1. 🌊 Fluid Flow View (Mindful Time-Blocking)
- **Natural Cadence**: Organize tasks across **Morning**, **Afternoon**, and **Evening** blocks.
- **Energy-Aware Prioritization**: Tag tasks by mental energy requirements:
  - ⚡ **Spark** (`~spark` / `!spark`): High-focus creative or architectural problem-solving.
  - 🌊 **Flow** (`~flow` / `!flow`): Steady, engaged execution.
  - 🍃 **Rest** (`~rest` / `!rest`): Low-friction administrative or wind-down tasks.
- **Subtask Checklists & Notes**: Expand any task to add checklists, rich notes, file attachments, or voice memos.
- **Generous Viewport Clearance**: Styled with spacious bottom padding so cards and modals never collide with the floating navigation dock.

### 2. 🌱 The Grove (Procedural Botanical Momentum)
- **Living SVGs**: Watch your momentum manifest as living botanical trees that branch, leaf, and sway with the breeze as you complete tasks.
- **5 Unlockable Botanical Species**:
  - 🌳 **Ancient Oak**: Represents sturdy, long-term foundational projects.
  - 🌸 **Cherry Blossom**: Symbolizes delicate creative sprints.
  - 🌲 **Evergreen**: Unshakable daily consistency.
  - 🌿 **Weeping Willow**: Flexible, restorative reflection.
  - 🎍 **Bamboo**: Rapid adaptability and swift execution.
- **Multi-Stage Life Cycles**: Progress from tiny cotyledon sprouts to flourishing saplings and fully bloomed trees with morning dewdrops and golden acorns.
- **Golden Seeds**: Earn collectible seeds with daily streaks to plant rare botanicals.

### 3. 🌌 Constellations View (Spatial Topology)
- **Orbital Gravity Wells**: Tasks are visualized as celestial bodies orbiting core project hubs connected by gravitational lines on an interactive physics canvas.
- **Spatial Awareness**: Zoom, pan, and visually cluster related goals across projects.

### 4. 📊 GitHub-Style 53-Week Productivity Heatmap
- **True Calendar Grid**: 53 vertical weekly columns (Sunday through Saturday rows), displaying your momentum over the past 365 days.
- **Chronological Layout**: Flows chronologically from 52 weeks ago on the left to today on the right.
- **Month & Day Markers**: Formatted month headers (`Oct` → `Sep`) and weekday indicators (`Mon`, `Wed`, `Fri`).
- **Inspection Tooltips**: Hover over any cell to view completed task counts and formatted dates.
- **5-Tier Emerald Scale**: Familiar `Less [0][1][2][3][4] More` intensity scale.

### 5. 🎚️ Dual-Track Ambient Soundscapes & Sacred Frequencies
Aura features a real-time mathematical audio synthesizer powered by **Tone.js**. **Zero MP3 files are downloaded**—all sounds are synthesized directly on your CPU using noise generators, filters, and sine oscillators:
- **Atmospheric Generators**:
  - 🌧️ *Rain Shower*: Filtered pink noise with stochastic droplet envelopes.
  - 🌊 *Ocean Waves*: LFO-modulated brown noise with low-frequency resonance.
  - 🍃 *Forest Wind*: Gentle sweeping bandpass noise.
  - 🟫 *Brownian Noise*: Deep, grounding bass rumble.
  - 🌸 *Pink Noise*: Balanced 1/f noise for reading and focus.
  - ⚪ *White Noise*: Crisp broadband noise for acoustic masking.
- **Sacred Frequency Oscillators**:
  - 🧘 *432 Hz*: Natural acoustic harmony and meditative calm.
  - ✨ *528 Hz*: Transformation, clarity, and cellular resonance.
  - 🧠 *Theta Waves (6 Hz)*: Binaural beat for creative intuition and relaxed focus.
  - ⚡ *Alpha Waves (10 Hz)*: Binaural beat for relaxed alertness and problem solving.
  - 🔔 *Tibetan Singing Bowls*: Complex metallic inharmonic overtone synthesis.
- **Mixer Controls**: Independent Atmosphere, Frequency, and Master volume faders.
- **Harmonic Presets**: 1-click curated mixes (*Deep Focus*, *Ocean Theta*, *Forest Zen*, *528 Hz Renewal*).
- **Sleep Timer**: Gradual auto-fadeout after 15, 30, 45, or 60 minutes.

### 6. 🎵 Harmonic Pentatonic Progression for Subtasks
- Checking off subtasks ascends melodically through the pentatonic scale (`C5` → `D5` → `E5` → `G5` → `A5` → `C6`).
- Checking off the final subtask triggers a warm, resonant Tibetan singing bowl chime for deep completion satisfaction.

### 7. 🍃 Anti-Backlog Sanctuary (Forgive & Release)
- Detects tasks that have lingered untouched for more than 14 days.
- Clear mental clutter with guilt-free choices:
  - **Recommit**: Move directly into today's focus.
  - **Someday**: Snooze to the backlog vault.
  - **Forgive & Release**: Let go of stale intentions with zero penalty or guilt.

### 8. 🔍 Unified Command Palette (`Ctrl+P`)
- Global spotlight search accessible anywhere via `Ctrl+P`.
- Instantly search commands, active tasks, completed wins, `@tags`, `#categories`, and navigation routes.
- Fully operable via keyboard: navigate with `ArrowUp` / `ArrowDown` and trigger with `Enter`.

### 9. 🎨 16 Curated Themes & Custom Theme Studio
- Includes 16 handcrafted aesthetic themes:
  - *OLED Dark*, *Clean Light*, *Cyberpunk*, *Crimson*, *Forest*, *Ocean*, *Dune*, *Sakura*, *Solarized*, *Dracula*, *Nord*, *Gruvbox*, *Monokai*, *Rosé Pine*, *Matcha*, and *Latte*.
- **Custom Theme Studio**: Fine-tune custom background, surface, text, border, and accent colors with live preview.

### 10. 🪟 Windows 11 Titlebar Integration (WCO)
- Built on the modern Progressive Web App `window-controls-overlay` standard.
- The glassmorphic top navigation blends directly into the titlebar region (`-webkit-app-region: drag`), seamlessly integrating with native Windows minimize, maximize, and close buttons.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action | Description |
| :--- | :--- | :--- |
| <kbd>Ctrl</kbd> + <kbd>P</kbd> | **Command Palette** | Open spotlight search for tasks, tags, categories, and commands |
| <kbd>N</kbd> | **Quick Capture** | Instantly focus the task input field |
| <kbd>1</kbd> | **Flow View** | Navigate to daily time-blocked task flow |
| <kbd>2</kbd> | **Constellations View** | Navigate to spatial project topology |
| <kbd>3</kbd> | **The Grove** | Inspect your growing botanical garden |
| <kbd>4</kbd> | **Daily Journal** | Open evening reflection and win log |
| <kbd>5</kbd> | **Review & Heatmap** | Open 53-week productivity calendar & analytics |
| <kbd>B</kbd> | **Brain Sweep** | Open Anti-Backlog Sanctuary |
| <kbd>S</kbd> | **Settings** | Open preferences, theme picker, and backup vault |
| <kbd>?</kbd> | **Shortcuts Cheatsheet** | Toggle modal displaying all keyboard shortcuts |
| <kbd>Esc</kbd> | **Escape / Close** | Dismiss any active modal, drawer, or search view |

---

## ✍️ Smart Task Input Syntax

Aura's input parser automatically detects deadlines, categories, tags, priority, energy levels, and time slots directly from natural language:

```text
Draft design system architecture #Work @deepwork !urgent ~spark tomorrow morning
```

| Syntax Pattern | Effect | Example |
| :--- | :--- | :--- |
| `@tag` | Assigns context tag | `@deepwork`, `@home`, `@errand`, `@admin` |
| `#Category` | Categorizes task | `#Work`, `#Health`, `#Finance`, `#Learning` |
| `!` or `urgent` | High Priority | `Fix server memory leak !` or `urgent bugfix` |
| `low priority` | Low Priority | `Organize bookshelf low priority` |
| `~spark` / `!spark` | High Energy (Spark) | `Write chapter 3 ~spark` |
| `~flow` / `!flow` | Medium Energy (Flow) | `Update documentation ~flow` |
| `~rest` / `!rest` | Low Energy (Rest) | `Clear inbox ~rest` |
| `morning` | Schedules in Morning block | `Review pull requests morning` |
| `afternoon` | Schedules in Afternoon block | `Client call afternoon` |
| `evening` / `night` | Schedules in Evening block | `Stretching & meditation evening` |
| `today` / `tomorrow` | Intelligent relative date | `Submit expense report tomorrow` |
| `in X days/weeks` | Relative deadline offset | `Review roadmap in 3 days` |
| `on friday` / `next monday` | Next weekday assignment | `Team sprint review on friday` |
| `every day` / `every week` | Recurring cadence | `Daily meditation every day` |

---

## 🏛️ Offline Architecture & Engineering

```
┌────────────────────────────────────────────────────────┐
│               Aura Single-PC Client Architecture       │
└────────────────────────────────────────────────────────┘
                          │
         ┌────────────────┴────────────────┐
         ▼                                 ▼
┌──────────────────┐             ┌──────────────────┐
│  React 19 Shell  │             │ Tone.js Synthesizer│
│  (State Contexts)│             │ (Dual-Track Audio│
└────────┬─────────┘             └──────────────────┘
         │
         ├─── UI Preferences ──────────► localStorage (~1KB)
         │
         ├─── Core State & History ────► IndexedDB v2 (AuraDB)
         │    • Snapshots (14 days)       • attachments store
         │    • Audio/Voice Memos         • snapshots store
         │    • File Attachments
         │
         └─── Lossless Local Backup ───► .json Vault Export (Disk)
              (Base64 Rehydrated)
```

### 1. Zero External Network Requests
- **No Google Fonts CDN**: Font stack utilizes native, high-performance system typography (`Inter`, `Segoe UI Variable`, `Segoe UI`, `SF Pro`, `Roboto`, `system-ui`) with zero FOUT/FOIT.
- **Inline SVG Textures**: The Dune theme’s sand texture is generated via inline SVG fractal noise data URIs rather than external PNG/JPG downloads.
- **Offline Code-Splitting**: A custom Vite build plugin (`auraOfflineServiceWorkerPlugin`) discovers all 33 production chunks in `dist/assets/` during `npm run build` and injects them into the service worker pre-cache manifest.

### 2. IndexedDB v2 & Quota Protection
- Browser `localStorage` is restricted to ~5MB per origin. Storing full snapshot history, attachments, and voice notes in `localStorage` inevitably triggers `QuotaExceededError`.
- Aura solves this with **IndexedDB v2** (`AuraDB`):
  - `snapshots` store: Holds up to 14 automated rolling daily backups.
  - `attachments` store: Holds multi-megabyte binary files and WebM audio notes.
  - `localStorage` is strictly reserved for small scalar UI preferences (~1KB).
- Legacy snapshot data from earlier versions is automatically migrated and purged.

### 3. Lossless Safety Vault & Media Rehydration
- Export your complete system state to an unencrypted `.json` backup file using the native **File System Access API**.
- File attachments and voice memos stored as binary Blobs are losslessly serialized into Base64 Data URLs upon export and converted back to Blobs upon import.

---

## 📁 Project Directory Structure

```text
Aura WebApp/
├── Aura.bat                     # Windows borderless launcher batch script
├── install-app.bat              # 1-click Windows installer & desktop shortcut creator
├── launch-aura.vbs              # Silent VBScript launcher (prevents black CMD window)
├── setup-shortcut.ps1           # PowerShell desktop shortcut generator
├── public/
│   ├── favicon.svg              # SVG application favicon
│   ├── icon-192.svg             # PWA 192x192 icon
│   ├── icon-512.svg             # PWA 512x512 icon
│   ├── manifest.json            # PWA manifest with Window Controls Overlay
│   └── sw.js                    # Offline Service Worker (Cache-First strategy)
├── src/
│   ├── components/
│   │   ├── backgrounds/         # Dynamic theme canvas backgrounds (Stars, Waves, etc.)
│   │   ├── common/              # Header, navigation, InstallAppButton, icons, ErrorBoundary
│   │   ├── modals/              # Sound mixer, settings, command palette, shortcuts, brain sweep
│   │   └── views/               # FlowView, GroveView, ConstellationsView, ReviewView, Heatmap
│   ├── context/                 # TaskContext, SettingsContext, ThemeContext, GroveContext, UIContext
│   ├── hooks/                   # useAmbientSound, useSoundEffects, useTaskOperations, useStatsAndGrove
│   ├── utils/                   # db (IndexedDB v2), snapshotVault, dateUtils, constants
│   ├── styles/                  # theme-effects.css
│   ├── App.jsx                  # Main application shell & view routing
│   ├── index.css                # Design system, theme tokens, WCO variables
│   └── main.jsx                 # Entry point with Service Worker registration
├── vite.config.js               # Vite config with automated offline SW bundle generator
├── tailwind.config.js           # Tailwind configuration
└── package.json
```

---

## 🛠️ Developer Reference

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** / **pnpm** / **yarn**

### Available Scripts
```bash
# Start local development server
npm run dev

# Compile production offline bundle & generate SW manifest
npm run build

# Preview production build locally on port 4173
npm run preview

# Run fast code linting via oxlint
npm run lint
```

---

## 🔒 Privacy & Local Data Guarantee

All personal data—including tasks, reflections, custom themes, sound mixer settings, file attachments, voice memos, and achievement trees—remains strictly inside your personal computer's local browser storage (`IndexedDB` & `localStorage`). 

**No data is ever transmitted to remote servers. Aura is your private, distraction-free sanctuary.**

---

<p align="center">
  <sub>Crafted with peace, care, and precision for mindful flow.</sub>
</p>

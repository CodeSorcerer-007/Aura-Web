# Aura — Mindful Productivity & Ambient Flow 🌸

> A calming, spatial, and mindful productivity companion built with **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **Tone.js**. Aura transforms everyday task management into a restorative experience through visual time-blocking, procedural bonsai growth, orbiting project constellations, acoustic sacred frequencies, and immersive dynamic environments.

**Aura is 100% Offline and Private.** No login, no servers, no database setup, and no telemetry. Everything lives right on your machine in local storage and client-side service workers.

---

## 💻 Native-Like Windows App & PWA (Works 100% Offline)

Aura can be installed on your computer just like **WhatsApp Web** or **Instagram**:

### Method 1: One-Click Windows Setup (Recommended for Git Users)
1. Double-click `install-app.bat` in the repository folder.
2. It will install packages, compile the offline production bundle, and place an **Aura** shortcut right onto your Windows Desktop!
3. Double-click the **Aura** desktop shortcut anytime to open the app in a clean, borderless native window—**no terminal commands needed**!

### Method 2: Install as a Progressive Web App (PWA)
1. Run `npm run preview` (or `npm run dev`) and open the URL in **Google Chrome** or **Microsoft Edge**.
2. Click the glowing **"Install App"** button in Aura's header (or the install icon in your browser address bar).
3. Chrome/Edge will add Aura directly to your **Windows Start Menu**, **Taskbar**, and **Desktop**.
4. You can now launch Aura directly from your Windows Start Menu anytime completely offline!

---

## ✨ Key Features & Mindful Capabilities

### 🛡️ 100% Offline Sanctuary & Local Vault
- **No Sign-In / No Passwords**: Jump straight into your flow. No accounts, emails, verification codes, or passwords.
- **Local Auto-Snapshots**: Maintains up to 7 automated rolling daily snapshots in local storage.
- **1-Click Restore**: Expand snapshot history in Settings to review previous states and restore instantly.
- **Local File System Vault**: Save unencrypted `.json` backup files directly to your hard drive using the native File System Access API.

### 📊 GitHub-Style 53-Week Productivity Heatmap
- **True Calendar Grid**: 53 vertical weekly columns (Sunday through Saturday rows), flowing chronologically from 52 weeks ago on the left to today on the right.
- **Month & Weekday Markers**: Accurate month headers across the top (`Oct` → `Sep`) and weekday indicators (`Mon`, `Wed`, `Fri`) on the left.
- **Active Inspection Tooltip**: Hover over any square to see task counts and formatted dates (e.g., `1 task completed on Sep 19, 2026`).
- **Streak & Wins Badges**: Live day streak counter and total win tracker integrated into the card header.
- **Five-Tier Density Legend**: Familiar `Less [0][1][2][3][4] More` emerald shading scale.

### 🎚️ Dual-Track Ambient Soundscapes & Sacred Frequencies
- **Layered Audio Engine**: Powered by Tone.js client-side synthesis. Concurrently mix natural atmospheres with acoustic frequencies:
  - **Atmospheres**: Rain, Ocean Waves, Forest Wind, Brown Noise, Pink Noise, White Noise.
  - **Sacred Frequencies**: 432 Hz Alpha, 528 Hz Transformation, Theta Binaural Beat (6 Hz), Alpha Binaural Beat (10 Hz), Resonant Tibetan Singing Bowls.
- **Independent Mix Controls**: Separate Atmosphere Volume, Frequency Volume, and Master Volume sliders.
- **Harmonic Presets**: 1-click presets including *Deep Focus*, *Ocean Theta*, *Forest Zen*, and *528 Hz Renewal*.
- **Sleep Timer**: Gentle auto-fadeout after 15, 30, 45, or 60 minutes.

### 🎵 Harmonic Pentatonic Progression for Subtasks
- Checking off subtasks ascends through the harmonic pentatonic scale (`C5` → `D5` → `E5` → `G5` → `A5` → `C6`).
- Completing the final subtask triggers a warm, resonant Tibetan singing bowl chime for maximum accomplishment satisfaction.

### 🍃 Anti-Backlog Sanctuary (Forgive & Release)
- Detects tasks lingering untouched for more than 14 days.
- Free your subconscious mind: choose to **Recommit** for today, snooze to **Someday**, or gracefully **Forgive** and release without guilt.

### 🌊 Fluid Flow View
- Organize tasks naturally across Morning, Afternoon, and Evening blocks.
- Drag-and-drop reordering, pin priority, subtask lists, and smart natural-language capture (`@tags`, `#Category`, `!priority`, dates like `tomorrow` or `in 3 days`).

### 🌱 The Grove
- Procedurally generated SVG trees (Bonsai, Cherry Blossom, Evergreen, Willow, Bamboo) that physically grow, branch, and bloom as you accomplish your goals.
- Rewards daily momentum with collectible Golden Seeds.

### 🌌 Constellations View
- Category-based spatial topology visualizing tasks as celestial bodies orbiting core focus hubs, connected by gravitational lines.

### 🧘 Mindful Focus & Pomodoro
- Deep work timer with optional ambient soundscape accompaniment, break intervals, and audio alerts.

### 📖 Daily Journal & Reflections
- Guided evening wind-down with daily gratitude prompts and a persistent log of completed wins.

### 🎨 16 Curated Themes & Custom Theme Creator
- OLED Dark, Clean Light, Cyberpunk, Crimson, Forest, Ocean, Dune, Sakura, Solarized, Dracula, Nord, Gruvbox, Monokai, Rosé Pine, Matcha, and Latte.
- Create and fine-tune your own custom color palettes.

### 🪟 Windows 11 Titlebar Integration (WCO)
- Uses modern Progressive Web App `window-controls-overlay` standard.
- Custom glassmorphic header blends seamlessly into the top edge of the window (`-webkit-app-region: drag`) with native window control buttons.

---

## 🚀 Getting Started (Development)

### Prerequisites
- Node.js 18+
- npm, pnpm, or yarn

### Quick Setup
```bash
# Clone the repository
git clone https://github.com/CodeSorcerer-007/Aura-Web.git
cd Aura-Web

# Install dependencies
npm install

# Start development server
npm run dev

# Build production offline bundle
npm run build

# Preview offline PWA build locally
npm run preview
```

---

## 📁 Project Structure

```text
Aura WebApp/
├── Aura.bat                     # Windows borderless launcher
├── install-app.bat              # 1-click Windows installer & desktop shortcut creator
├── launch-aura.vbs              # Silent VBScript launcher (no black CMD window)
├── setup-shortcut.ps1           # PowerShell desktop shortcut script
├── public/
│   ├── favicon.svg              # App icons
│   ├── icon-192.svg
│   ├── icon-512.svg
│   ├── manifest.json            # PWA manifest with Window Controls Overlay
│   └── sw.js                    # Offline Service Worker (Cache-First strategy)
├── src/
│   ├── components/
│   │   ├── backgrounds/         # Dynamic theme canvas backgrounds
│   │   ├── common/              # Header, navigation, InstallAppButton, icons
│   │   ├── modals/              # Ambient sound mixer, settings, brain sweep, shortcuts
│   │   └── views/               # FlowView, GroveView, ConstellationsView, ReviewView, ProductivityHeatmap
│   ├── context/                 # TaskContext, SettingsContext, ThemeContext, GroveContext
│   ├── hooks/                   # useAmbientSound, useSoundEffects, useTaskOperations, useStatsAndGrove
│   ├── utils/                   # snapshotVault, dateUtils, constants, storage
│   ├── App.jsx                  # Main application shell
│   ├── index.css                # Design system, theme tokens, WCO variables
│   └── main.jsx                 # Entry point with Service Worker registration
└── package.json
```

---

## 🔒 Privacy & Local-First Guarantee

All personal data—tasks, reflections, themes, sound settings, and achievements—remain exclusively within your local device's browser storage (`localStorage` & cache). No data is ever transmitted to remote servers.

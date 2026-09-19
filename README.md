# Aura — Mindful Productivity & Task Flow 🌸

> A calming, spatial, and mindful productivity companion built with **React 19**, **Tailwind CSS v4**, **Framer Motion**, and **Tone.js**. Aura transforms everyday task management into a restorative experience through visual time-blocking, procedural bonsai growth, orbiting project constellations, and immersive dynamic environments.

---

## ✨ Features

- **🌐 Online Anywhere, Anytime**: Sign in with **just a username and password** from any computer, tablet, or mobile phone. No mandatory email loops, verification captchas, or tedious onboarding.
- **☁️ 100% Full-Feature Cloud Sync**:
  - Tasks, subtasks, priorities, and deadlines
  - Procedural Grove garden & Golden Seeds
  - Momentum streaks and unlocked achievements
  - Daily reflections & gratitude journal
  - Custom categories, saved templates, and personalized themes
  - Real-time debounced auto-sync with offline resilience
- **✨ WOW Live-Animated Entrance**:
  - Celestial glassmorphic card with drifting aurora glow and breathing light rings
  - Sign in, account registration, and built-in **Forgot Password** account recovery
  - Seamless "Continue as Guest" option to explore locally before creating an account
- **🌊 Fluid Flow View**: Organize tasks naturally across Morning, Afternoon, and Evening blocks with drag reordering, pinning, subtasks, and intelligent natural-language capture (`@tags`, `#Category`, `!priority`, deadlines).
- **🌱 The Grove**: Procedurally generated SVG trees (Bonsai, Cherry Blossom, Evergreen, Willow, Bamboo) that physically grow and bloom as you accomplish your goals, rewarding daily momentum with Golden Seeds.
- **🌌 Constellations View**: Category-based topology visualizing tasks as celestial bodies orbiting core focus hubs, connected by gravitational lines.
- **🧘 Mindful Focus & Pomodoro**: Deep work countdown with integrated ambient noise generator (Rain, Ocean, Forest Wind, Binaural Beats, White/Pink/Brown noise).
- **📖 Daily Journal & Reflections**: Guided evening wind-down with daily gratitude prompts and a log of completed wins.
- **📊 Review & Productivity Heatmap**: Github-style 365-day productivity heatmap, streak tracking, category distributions, and stale task clean-up.
- **🎨 16 Curated Live Themes & Theme Creator**:
  - *OLED Dark, Clean Light, Cyberpunk, Crimson, Forest, Ocean, Dune, Sakura, Solarized, Dracula, Nord, Gruvbox, Monokai, Rosé Pine, Matcha, and Latte.*
- **⚡ Command Palette & Keyboard Shortcuts**: Quick navigation via `Ctrl+P`, `N` for fast capture, and `?` for the interactive shortcuts cheatsheet modal.

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- npm, pnpm, or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/CodeSorcerer-007/Aura-Web.git
cd Aura-Web

# Install dependencies
npm install

# Start both Vite frontend & Cloud Sync backend concurrently
npm run dev:all
```
- Frontend runs on `http://localhost:5173`
- Backend API runs on `http://localhost:5000` (automatically proxied by Vite)

---

## ☁️ 100% Free Cloud Hosting on Vercel ⚡

Aura is optimized for **Vercel Free Tier** — offering **zero cold starts (<100ms)**, global edge CDN, unlimited bandwidth, and instant serverless API execution without ever sleeping.

### Deploying to Vercel in 1-Click:
1. Push your repository to your GitHub account.
2. Go to [Vercel Dashboard](https://vercel.com) and click **"Add New Project"**.
3. Select your `Aura-Web` repository.
4. Framework Preset: **Vite** (automatically detected).
5. Environment Variables:
   - `JWT_SECRET`: Any random secure string (e.g. `my-aura-secret-key-2026`)
   - `MONGODB_URI` (optional): Connection string from MongoDB Atlas free sandbox for cloud persistence across devices.
6. Click **Deploy**!
   - Both your Vite frontend and serverless API endpoints (`/api/*`) are deployed together automatically via [vercel.json](file:///e:/Aura%20WebApp/vercel.json).

---

### 🍃 Permanent Free Database: MongoDB Atlas (Optional)
Aura comes with an automatic, zero-config local document store. To enable cloud persistence across deployments without server resets:

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/atlas/database).
2. Create a **Free Shared Cluster (M0)** (512 MB permanent free storage, no credit card required).
3. Under **Database Access**, create a user (e.g. `aura_admin`).
4. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`).
5. Copy your connection string (`mongodb+srv://...`) and add it as `MONGODB_URI` in your Vercel Project Settings.

---

## 🛠️ Tech Stack

- **Frontend Framework**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 8](https://vitejs.dev/)
- **Backend**: [Node.js](https://nodejs.org/) & [Express 5](https://expressjs.com/)
- **Audio Synthesis**: [Tone.js](https://tonejs.github.io/)
- **Authentication**: JWT & salted Bcrypt password hashing
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) + Custom Glassmorphic Design System
- **Motion & Physics**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Linter**: [Oxlint](https://oxc.rs/)

---

## 📄 License

MIT License. Designed with care for mindful focus.

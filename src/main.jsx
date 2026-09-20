import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Register PWA Service Worker in production; unregister in development for instant HMR
if ('serviceWorker' in navigator) {
  if (import.meta.env.PROD) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js').catch((err) => {
        console.log('SW registration failed:', err);
      });
    });
  } else {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      for (const registration of registrations) {
        registration.unregister();
      }
    });
    if ('caches' in window) {
      caches.keys().then((keys) => {
        keys.forEach((key) => caches.delete(key));
      });
    }
  }
}

// Clean install migration: remove all legacy demo data on install so workspace starts clean
try {
  if (typeof window !== 'undefined' && !window.localStorage.getItem('aura-clean-install-v1')) {
    window.localStorage.setItem('aura-clean-install-v1', 'true');
    window.localStorage.setItem('aura-tasks', '[]');
    window.localStorage.setItem('aura-stats', JSON.stringify({ streak: 0, goldenSeeds: 0, lastActiveDate: '', focusedTasksCompleted: 0 }));
    window.localStorage.setItem('aura-grove', '[]');
    window.localStorage.setItem('aura-focus-history', '[]');
    window.localStorage.setItem('aura-journal-entries', '[]');
    window.localStorage.removeItem('aura-rolling-snapshots');
    window.localStorage.removeItem('aura-snapshots-meta');
  }
} catch {}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Plugin to automatically discover all generated assets and inject them into dist/sw.js
function auraOfflineServiceWorkerPlugin() {
  return {
    name: 'aura-offline-sw-generator',
    closeBundle() {
      if (process.env.VITEST) return;
      const distDir = path.resolve(__dirname, 'dist');
      const assetsDir = path.join(distDir, 'assets');
      const swSourceFile = path.resolve(__dirname, 'public', 'sw.js');
      const swDistFile = path.join(distDir, 'sw.js');

      if (!fs.existsSync(assetsDir) || !fs.existsSync(swSourceFile)) {
        return;
      }

      const assetFiles = fs.readdirSync(assetsDir).map(file => `/assets/${file}`);
      const staticAssets = [
        '/',
        '/index.html',
        '/manifest.json',
        '/favicon.svg',
        '/icon-192.svg',
        '/icon-512.svg',
        ...assetFiles
      ];

      const cacheVersion = `aura-offline-v6-${Date.now()}`;
      let swContent = fs.readFileSync(swSourceFile, 'utf-8');

      // Replace cache name and static assets
      swContent = swContent.replace(
        /const CACHE_NAME = ['"][^'"]+['"];/,
        `const CACHE_NAME = '${cacheVersion}';`
      );
      swContent = swContent.replace(
        /const STATIC_ASSETS = \[[^\]]*\];/s,
        `const STATIC_ASSETS = ${JSON.stringify(staticAssets, null, 4)};`
      );

      fs.writeFileSync(swDistFile, swContent, 'utf-8');
      console.log(`[Aura SW Generator] Injected ${staticAssets.length} offline precache assets into dist/sw.js (${cacheVersion})`);
    }
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), auraOfflineServiceWorkerPlugin()],
  server: {
    port: 5173
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html']
    }
  },
  build: {
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('tone') || id.includes('@tonejs')) {
              return 'vendor-tone';
            }
            if (id.includes('framer-motion')) {
              return 'vendor-framer';
            }
            if (id.includes('lucide-react')) {
              return 'vendor-lucide';
            }
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
          }
        }
      }
    }
  }
})

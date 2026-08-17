import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Build timestamp used as SW cache-bust version.
// Every production build gets a unique version so the service worker
// automatically invalidates the old static-asset cache on deployment.
const SW_VERSION = `v${Date.now()}`;

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    // Force a single copy of React & ReactDOM across all packages (Zustand v5 fix)
    dedupe: ['react', 'react-dom'],
  },
  // Stage 1: inject SW_VERSION into the service worker at build time.
  // The SW reads self.__SW_VERSION__ to name its cache, which forces
  // browsers to activate the new SW (and drop the old cache) on every deploy.
  define: {
    'self.__SW_VERSION__': JSON.stringify(SW_VERSION),
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'zustand'],
  },
  build: {
    // Target modern browsers for smaller, more efficient output
    target: 'esnext',
    // Split CSS per chunk for better caching
    cssCodeSplit: true,
    // Disable sourcemaps in production
    sourcemap: false,
    // Stage 1: minify with esbuild (default, fast) and remove debug artifacts
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          // React core — most-cached chunk, changes rarely
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor-react';
          }
          // Router
          if (id.includes('node_modules/react-router') || id.includes('node_modules/@remix-run')) {
            return 'vendor-router';
          }
          // State management
          if (id.includes('node_modules/zustand')) {
            return 'vendor-zustand';
          }
          // UI utilities
          if (
            id.includes('node_modules/axios') ||
            id.includes('node_modules/react-hot-toast')
          ) {
            return 'vendor-ui';
          }
        },
      },
    },
  },
});

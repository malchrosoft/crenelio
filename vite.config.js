import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Build output goes to api/public/assets so PHP serves them.
  build: {
    outDir: 'api/public/assets',
    emptyOutDir: true,
    // Use relative paths so assets work under subdirectories.
    assetsDir: '',
    rollupOptions: {
      output: {
        // Stable filenames for long-term caching.
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name][extname]',
      },
    },
  },
  // Proxy API calls to local PHP dev server during development.
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});

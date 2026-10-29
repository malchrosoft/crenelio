import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
// Build : le site déployé sert le bundle sous /assets/ (réécrit vers api/public/assets/ par le
// .htaccess racine). En développement, Vite sert l'application à la racine.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/assets/' : '/',
  plugins: [react()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  // Build output goes to api/public/assets so PHP serves them.
  build: {
    outDir: 'api/public/assets',
    emptyOutDir: true,
    // La grille AG Grid (≈ 1 Mo, ≈ 280 ko compressés, chargée seulement dans l'espace Pro) dépasse
    // le seuil par défaut
    chunkSizeWarningLimit: 1100,
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
}));

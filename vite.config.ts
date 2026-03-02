import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repositoryName =
  process.env.GITHUB_REPOSITORY?.split('/')[1] || 'Comic-Gen-PWA';

export default defineConfig({
  base: `/${repositoryName}/`,
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  build: {
    target: 'es2022',
    sourcemap: false,
    minify: 'esbuild',
    cssCodeSplit: true,
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react';
          }
          if (id.includes('node_modules/react-redux') || id.includes('node_modules/@reduxjs/toolkit') || id.includes('node_modules/redux-undo') || id.includes('node_modules/reselect')) {
            return 'state';
          }
          if (id.includes('node_modules/d3-')) {
            return 'd3';
          }
          if (id.includes('node_modules/@google/genai')) {
            return 'ai';
          }
          if (id.includes('node_modules/framer-motion')) {
            return 'motion';
          }
          if (id.includes('node_modules/idb') || id.includes('node_modules/jszip')) {
            return 'data';
          }
        },
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
});

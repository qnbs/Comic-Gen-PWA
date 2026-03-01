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
        manualChunks: {
          react: ['react', 'react-dom', 'react-redux', '@reduxjs/toolkit'],
          d3: ['d3-hierarchy', 'd3-force', 'd3-cloud'],
          vendor: ['jszip', 'idb', 'redux-undo', 'reselect'],
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

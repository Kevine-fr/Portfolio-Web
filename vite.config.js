import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',   // obligatoire pour Docker
    port: 5173,
    watch: {
      usePolling: true, // obligatoire pour hot-reload dans Docker
    },
  },
  build: {
    rollupOptions: {
      output: {
        // Vendor chunks change rarely: browsers keep them cached across deploys
        manualChunks: {
          three: ['three'],
          react: ['react', 'react-dom', 'react-router-dom'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.js'],
    include: ['src/**/*.test.{js,jsx}'],
    css: false,
    restoreMocks: true,
  },
});

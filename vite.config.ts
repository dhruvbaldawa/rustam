import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Split Firebase into its own chunk (it's large)
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore', 'firebase/database'],
          // Group React and related libraries
          react: ['react', 'react-dom', 'react-router-dom'],
          // Other vendor libraries
          vendor: ['lucide-react', 'clsx', 'tailwind-merge', 'class-variance-authority'],
        },
      },
    },
  },
});

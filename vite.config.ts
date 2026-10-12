import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
    warmup: {
      clientFiles: [
        './src/main.tsx',
        './src/App.tsx',
        './src/pages/Login.tsx',
        './src/layouts/DashboardLayout.tsx',
        './src/pages/admin/HospitalAdminDashboardPage.tsx',
        './src/pages/admin/SuperAdminDashboardPage.tsx',
      ],
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@reduxjs/toolkit',
      'react-redux',
      'lucide-react',
      'framer-motion',
      'recharts',
      'clsx',
      'tailwind-merge',
      'react-hook-form'
    ],
    holdUntilCrawlEnd: false,
  },
  build: {
    target: 'esnext',
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1500,
  },
});

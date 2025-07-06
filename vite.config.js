import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  define: { global: 'globalThis' },
  build: {
    outDir: 'dist/client',
  },
  resolve: {
    alias: {
      'react-router-dom/server': 'react-router-dom/server.mjs'
    }
  }
});
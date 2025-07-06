import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    global: 'globalThis',
  },
  build: {
    ssr: true,
  },
  resolve: {
  alias: {
    'react-router-dom/server': 'react-router-dom/server.mjs'
  }
}

})

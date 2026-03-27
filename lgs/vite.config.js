import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// proxy vers ton backend local
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:5000',
      '/uploads': 'http://127.0.0.1:5000',
    },
  },
  plugins: [react()],
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; connect-src 'self' ws://localhost:5173; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline';"
    },
    proxy: {
      '/api': 'http://localhost:3000'
    }
  }
})
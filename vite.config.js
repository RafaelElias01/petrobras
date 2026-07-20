import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    rollupOptions: {
      input: 'index.html'
    }
  },
  server: {
    headers: {
      'Content-Security-Policy': "default-src 'self'; connect-src 'self' ws://localhost:5173 https://www.google-analytics.com https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline' https://connect.facebook.net https://www.googletagmanager.com; img-src 'self' data: https://www.facebook.com https://www.google-analytics.com;"
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        configure: (proxy) => {
          proxy.on('error', () => {});
        }
      }
    }
  }
})
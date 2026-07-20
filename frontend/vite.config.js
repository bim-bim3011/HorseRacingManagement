import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        cookieDomainRewrite: { '*': '' },
        cookiePathRewrite: { '*': '/' },
      },
      '/ws': {
        target: 'http://localhost:8080',
        ws: true,
      },
    },
  },
})

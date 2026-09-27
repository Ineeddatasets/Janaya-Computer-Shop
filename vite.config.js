import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// In development the app runs on :5173 and the API on :4000. Proxying /api keeps
// them same-origin in the browser, so the session cookie is sent normally and
// there is no CORS to configure. In production one server serves both.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.API_ORIGIN || 'http://localhost:4000',
        changeOrigin: true,
      },
    },
  },
})

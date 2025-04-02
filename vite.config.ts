import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: 8080,
    host: true, // listen on all addresses
    strictPort: true, // fail if port is already in use
    allowedHosts: ['app-010c5f04-282e-4860-83c1-f688be97c218.cleverapps.io', '.cleverapps.io']
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
    allowedHosts: ['app-010c5f04-282e-4860-83c1-f688be97c218.cleverapps.io', '.cleverapps.io']
  }
})
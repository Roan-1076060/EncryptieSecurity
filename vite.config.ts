import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    host: '0.0.0.0',
    port: 8080,
    // Explicitly allow the Clever Cloud domain
    allowedHosts: [
      'app-010c5f04-282e-4860-83c1-f688be97c218.cleverapps.io',
      'localhost',
      '.cleverapps.io', // This will match all subdomains of cleverapps.io
      'all' // This should allow all hosts
    ]
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
  }
})
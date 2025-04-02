import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  preview: {
    port: 8080,
    host: true, // listen on all addresses
    strictPort: true, // fail if port is already in use
  },
  server: {
    host: '0.0.0.0',
    port: 8080,
  }
})
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/Frame_Applyer/",
  server: {
    port: 3000,
    host: true, // Needed for --host flag to work
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  publicDir: 'public',
})
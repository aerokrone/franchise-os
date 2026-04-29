import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Reliable saves on some Windows / synced drives (OneDrive, etc.)
      usePolling: true,
      interval: 400,
    },
  },
})

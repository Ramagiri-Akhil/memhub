import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Using 127.0.0.1 (not "localhost") avoids a Windows IPv6 quirk
// where node sometimes resolves localhost to ::1 first.
const BACKEND_URL = 'http://127.0.0.1:5000'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/generate-captions': BACKEND_URL,
    },
  },
})

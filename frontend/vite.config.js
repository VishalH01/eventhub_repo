import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    // Force Vite to always resolve these packages to the same physical node_modules path
    // to prevent hook errors with pre-bundled libraries like lucide-react.
    dedupe: ['react', 'react-dom']
  }
})

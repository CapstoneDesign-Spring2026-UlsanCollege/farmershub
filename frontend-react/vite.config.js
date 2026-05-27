import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages serves this repository under /farmershub/
export default defineConfig({
  base: '/farmershub/',
  plugins: [react()],
})

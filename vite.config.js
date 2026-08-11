import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // IMPORTANTE: cambia 'rana-mecanica' por el nombre exacto de tu repo en GitHub
  base: '/rana-mecanica/',
  build: {
    outDir: 'dist',
    sourcemap: false,
  }
})

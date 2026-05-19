import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { sharedBuildConfig } from '../../vite.shared'

export default defineConfig({
  build: sharedBuildConfig,
  plugins: [react()],
  server: { port: 5174 },
})

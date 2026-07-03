import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/',
  build: {
    outDir: '../docs',
    // docs/ lives outside the project root, so Vite won't clear it unless
    // we opt in. CNAME/.nojekyll/favicon are sourced from public/, so a
    // full wipe is safe and prevents stale hashed bundles from piling up.
    emptyOutDir: true,
  },
})

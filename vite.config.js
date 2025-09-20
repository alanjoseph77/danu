import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/3d-portfolio/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
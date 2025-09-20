import { defineConfig } from 'vite'

export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/danu/' : '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
})
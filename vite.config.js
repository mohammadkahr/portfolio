import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'
import resumePlugin from './scripts/resume/vite-plugin-resume.mjs'
import { ssgRoutes, writeSeoFiles } from './scripts/seo.mjs'

export default defineConfig({
  plugins: [vue(), tailwindcss(), resumePlugin()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~profile': fileURLToPath(new URL('./profile.json', import.meta.url))
    }
  },
  build: {
    cssMinify: 'lightningcss',
    reportCompressedSize: false
  },
  ssgOptions: {
    script: 'async',
    formatting: 'minify',
    dirStyle: 'nested',
    // Pre-render every locale × page × article defined in profile.json.
    includedRoutes: () => ssgRoutes(),
    onFinished: () => writeSeoFiles()
  }
})

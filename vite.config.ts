import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  // GitHub Pages 以相對路徑部署，支援任意子路徑（/repo-name/）
  base: './',
  plugins: [tailwindcss(), react()],
})

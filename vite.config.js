import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Set base if deploying to GitHub Pages user/repo
    base: '/wanted-list/',
})

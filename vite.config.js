import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    // Set base if deploying to GitHub Pages user/repo, usually it's needed but I'll leave it default for now or add a comment
    // base: '/wanted-list/', 
})

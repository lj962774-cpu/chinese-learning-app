import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// GitHub Pages는 /chinese-learning-app/ 하위 경로로 서비스되므로 base 설정이 필요하다.
export default defineConfig({
  base: '/chinese-learning-app/',
  plugins: [react()],
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert' // если используете HTTPS

export default defineConfig({
  plugins: [
    vue(),
    mkcert()
  ],
  server: {
    https: true, 
    host: 'localhost',
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
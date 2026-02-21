import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'

export default defineConfig({
  plugins: [
    vue(),
    mkcert()
  ],
  server: {
    https: true, 
    host: 'localhost',
    port: 3000,
    open: true,
    proxy: {
      // Прокси для API запросов
      '/api': {
        target: 'https://localhost:8085',
        changeOrigin: true,
        secure: false, // игнорируем самоподписанные сертификаты
        rewrite: (path) => path.replace(/^\/api/, ''),
        // Для отладки (можно убрать в продакшене)
        configure: (proxy, _options) => {
          proxy.on('error', (err, _req, _res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, _res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, _res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': '/src'
    }
  }
})
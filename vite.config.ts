import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8088',
        changeOrigin: true
      },
      // WebSocket 代理：浏览器连接同源的 /ws，由 Vite 转发到后端 WebSocket 服务。
      // ws: true 开启 WebSocket 协议升级转发。target 用 127.0.0.1 保证在服务器本机也能连通。
      '/ws': {
        target: 'ws://127.0.0.1:9090',
        changeOrigin: true,
        ws: true
      }
    }
  }
})

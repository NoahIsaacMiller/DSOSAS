import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // 添加Cesium别名配置
      'cesium': path.resolve(__dirname, 'node_modules/cesium')
    },
  },
  optimizeDeps: {
    // 排除整个Cesium包，避免依赖优化问题
    exclude: ['cesium']
  },
  // 配置静态资源处理
  server: {
    fs: {
      allow: ['..']
    }
  },
  // 构建配置
  build: {
    // 禁用CSS代码分割以避免Cesium样式问题
    cssCodeSplit: false,
    // 增大chunk大小限制
    chunkSizeWarningLimit: 1600
  }
})

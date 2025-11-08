import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://your-ease.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // 🚀 OPTIMIZED: Better chunk splitting
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'icons-vendor': ['lucide-react', 'react-icons'],
          'utils-vendor': ['axios'],
          'charts-vendor': ['recharts'],
        }
      }
    },
    chunkSizeWarningLimit: 800, // 🚀 Reduced from 1000
    minify: 'terser', // 🚀 Added minification
    terserOptions: {
      compress: {
        drop_console: true, // 🚀 Remove console logs in production
      },
    },
  },
  css: {
    devSourcemap: false,
    modules: {
      localsConvention: 'camelCase',
    },
  }
})
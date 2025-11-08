import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Vite proxy configuration + PERFORMANCE OPTIMIZATION
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
  // ✅ BUILD OPTIMIZATION SECTION:
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Group vendor libraries into separate chunks
          'react-vendor': ['react', 'react-dom'],
          'router-vendor': ['react-router-dom'],
          'ui-vendor': ['lucide-react'],
          'utils-vendor': ['axios'],
        }
      }
    },
    chunkSizeWarningLimit: 1000,
  },
  // ✅ ADD CSS OPTIMIZATION HERE:
  css: {
    devSourcemap: false, // Disable sourcemaps in production
    modules: {
      localsConvention: 'camelCase',
    },
  }
})

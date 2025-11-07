import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// ✅ Vite proxy configuration + PERFORMANCE OPTIMIZATION
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  // ✅ ADD THIS BUILD OPTIMIZATION SECTION:
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
    chunkSizeWarningLimit: 1000, // Increase warning limit
  }
})

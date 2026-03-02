import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'build',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          'chart-js': ['chart.js', 'react-chartjs-2'],
          'react-vendor': ['react', 'react-dom'],
          'utils': ['./src/utils/formatters.js', './src/utils/export.js'],
          'hooks': ['./src/hooks/useData.js', './src/hooks/useFilterSync.js'],
        },
      },
    },
    chunkSizeWarningLimit: 400,
  },
  optimizeDeps: {
    include: ['chart.js', 'react-chartjs-2'],
  },
})

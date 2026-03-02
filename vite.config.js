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
          // Сторонние библиотеки
          'react-vendor': ['react', 'react-dom'],
          'chart-js': ['chart.js', 'react-chartjs-2'],
          'xlsx': ['xlsx'],
          // Компоненты UI
          'ui-skeleton': ['./src/components/Skeleton/Skeleton.jsx'],
          'ui-tooltip': ['./src/components/Tooltip/Tooltip.jsx'],
          'ui-toast': ['./src/components/Toast/Toast.jsx'],
          'ui-kpi': ['./src/components/KPICard/KPICard.jsx'],
          'ui-charts': ['./src/components/ChartCard/ChartCard.jsx', './src/components/MarketShareCard/MarketShareCard.jsx'],
          // Хуки и утилиты
          'utils': ['./src/utils/formatters.js', './src/utils/export.js'],
          'hooks': ['./src/hooks/useData.js', './src/hooks/useFilterSync.js', './src/hooks/useTheme.js'],
        },
      },
    },
    chunkSizeWarningLimit: 400,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: process.env.NODE_ENV === 'production',
      },
    },
  },
  optimizeDeps: {
    include: ['chart.js', 'react-chartjs-2'],
  },
})

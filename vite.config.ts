import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const target = env.VITE_API_URL || 'http://localhost:8000';

  return {
    plugins: [react()],
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        'primereact/timeline',
        'primereact/panelmenu',
        'primereact/chart',
        'react-icons/fa',
        'primereact/button',
        'primereact/avatar',
        'primereact/divider',
        'primereact/progressbar',
        'primereact/menubar',
        'primereact/card'
      ]
    },
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
        '@components': resolve(__dirname, 'src/components'),
        '@pages': resolve(__dirname, 'src/pages'),
        '@features': resolve(__dirname, 'src/features'),
        '@services': resolve(__dirname, 'src/services'),
        '@utils': resolve(__dirname, 'src/utils'),
        '@hooks': resolve(__dirname, 'src/hooks'),
        '@types': resolve(__dirname, 'src/types'),
      },
    },
    server: {
      port: 5173,
      open: true,
      strictPort: true,
      fs: {
        strict: false
      },
      hmr: {
        overlay: false
      },
      proxy: {
        '/api': {
          target,
          changeOrigin: true,
          secure: false,
        },
        // Sanctum CSRF cookie endpoint
        '/sanctum': {
          target,
          changeOrigin: true,
          secure: false,
        }
      }
    },
    build: {
      chunkSizeWarningLimit: 1000,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'prime-vendor': [
              'primereact/timeline',
              'primereact/panelmenu',
              'primereact/chart',
              'primereact/button',
              'primereact/avatar',
              'primereact/divider',
              'primereact/progressbar',
              'primereact/menubar',
              'primereact/card'
            ],
            'icons-vendor': ['react-icons/fa']
          }
        }
      }
    }
  };
});

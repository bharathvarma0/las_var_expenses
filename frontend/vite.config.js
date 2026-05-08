import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    server: {
      port: 3000,
      proxy: {
        // In dev, proxy /api → local backend
        '/api': {
          target: env.VITE_API_URL || 'http://localhost:3001',
          changeOrigin: true,
        },
      },
    },
    // Make VITE_API_URL available as import.meta.env.VITE_API_URL in the build
    define: {
      __APP_API_URL__: JSON.stringify(env.VITE_API_URL || ''),
    },
  };
});

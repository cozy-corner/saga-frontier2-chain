import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
  resolve: {
    alias: {
      '@': '/src',
      '@api': '/src/api',
      '@components': '/src/components',
      '@features': '/src/features',
      '@layouts': '/src/layouts',
      '@utils': '/src/utils'
    }
  }
});

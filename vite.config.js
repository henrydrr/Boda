import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'scene-01-hero-castillo.jpg') {
            return 'assets/og-imagen.jpg';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});

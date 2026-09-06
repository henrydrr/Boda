import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'scene-07-dijesi.webp') {
            return 'assets/og-imagen.webp';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
});

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: 'example',
  // Alias the package name to the live source so changes hot-reload instantly
  resolve: {
    alias: {
      '@nairaramp/sdk-react': path.resolve(__dirname, 'src/index.ts'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});

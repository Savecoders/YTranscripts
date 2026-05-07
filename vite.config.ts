import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';
import { crx } from '@crxjs/vite-plugin';
import { readFileSync } from 'fs';

const manifest = JSON.parse(readFileSync('./src/manifest.json', { encoding: 'utf-8' }));

export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    crx({ manifest }),
  ],

  optimizeDeps: {
    include: ['@chakra-ui/react', '@emotion/react', '@emotion/styled', 'framer-motion'],
  },
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      input: {
        dashboard: 'src/pages/dashboard/index.html',
      },
    },
  },
});

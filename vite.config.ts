import { defineConfig } from 'vite';
import preact from "@preact/preset-vite";
import tsconfigPaths from 'vite-tsconfig-paths';
import { crx } from '@crxjs/vite-plugin';
import { readFileSync } from 'fs';

const manifest = JSON.parse(readFileSync('./src/manifest.json', { encoding: 'utf-8' }));

export default defineConfig({
  plugins: [
    preact(),
    tsconfigPaths(),
    crx({ manifest }),
  ],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      input: {
        dashboard: 'src/pages/dashboard/index.html',
      },
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('@chakra-ui') ||
              id.includes('@emotion') ||
              id.includes('framer-motion') ||
              id.includes('next-themes')
            ) {
              return 'ui-vendor';
            }

            // Core React
            if (
              id.includes('/react/') ||
              id.includes('/react-dom/') ||
              id.includes('/react-icons/') ||
              id.includes('/scheduler/') ||
              id.includes('/prop-types/')
            ) {
              return 'react-vendor';
            }
          }
        },
      },
    },
  },
});

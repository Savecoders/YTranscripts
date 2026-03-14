import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { crx } from '@crxjs/vite-plugin';
import { readFileSync } from 'fs';

const manifest = JSON.parse(readFileSync('./src/manifest.json', { encoding: 'utf-8' }));

export default defineConfig({
  plugins: [
    preact({ prefreshEnabled: false, reactAliasesEnabled: true }),
    tsconfigPaths(),
    crx({ manifest }),
  ],
  resolve: {
    alias: {
      react: 'preact/compat',
      'react-dom/test-utils': 'preact/test-utils',
      'react-dom': 'preact/compat',
      'react/jsx-runtime': 'preact/jsx-runtime',
    },
  },
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

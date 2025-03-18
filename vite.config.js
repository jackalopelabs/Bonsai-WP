import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'assets',
    assetsDir: '',
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'bonsai-planets-bundle': resolve(__dirname, 'src/main.ts'),
      },
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name]-[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'images/[name]-[hash][extname]';
          }
          if (/\.css$/.test(name ?? '')) {
            return 'css/[name][extname]';
          }
          return 'assets/[name]-[hash][extname]';
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    cors: true,
  },
}); 
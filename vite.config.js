import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: path.resolve(__dirname, 'resources'),
  base: '/wp-content/plugins/bonsai-planets/public/',
  
  build: {
    outDir: path.resolve(__dirname, 'public'),
    emptyOutDir: true,
    manifest: true,
    
    rollupOptions: {
      input: {
        app: path.resolve(__dirname, 'resources/scripts/app.ts')
      },
      
      output: {
        entryFileNames: 'js/[name].js',
        chunkFileNames: 'js/[name].[hash].js',
        assetFileNames: ({name}) => {
          if (/\.(gif|jpe?g|png|svg)$/.test(name ?? '')) {
            return 'images/[name][extname]';
          }
          
          if (/\.css$/.test(name ?? '')) {
            return 'css/[name][extname]';
          }
          
          return 'assets/[name][extname]';
        },
      },
    },
  },
  
  server: {
    cors: true,
    host: '0.0.0.0',
    port: 3000,
  },
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'resources'),
    },
  },
  
  optimizeDeps: {
    include: ['three']
  }
}); 
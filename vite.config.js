import { defineConfig } from 'vite';
import { resolve } from 'path';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    react()
  ],
  root: resolve(__dirname, 'resources'),
  base: '/wp-content/plugins/bonsai-planets-wp/dist/',
  
  build: {
    target: 'esnext',
    outDir: resolve(__dirname, 'dist'),
    emptyOutDir: true,
    manifest: true,
    
    rollupOptions: {
      input: {
        'bonsai-planets': resolve(__dirname, 'resources/scripts/tiny-planets.ts'),
        'block': resolve(__dirname, 'resources/scripts/block.tsx'),
      },
      
      // External dependencies that shouldn't be bundled
      external: [
        'react', 
        'react-dom', 
        '@wordpress/blocks', 
        '@wordpress/block-editor', 
        '@wordpress/components', 
        '@wordpress/element',
        '@wordpress/i18n'
      ],
      
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
        assetFileNames: '[name].[ext]',
        
        // Map external dependencies to global variables
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
          '@wordpress/blocks': 'wp.blocks',
          '@wordpress/block-editor': 'wp.blockEditor',
          '@wordpress/components': 'wp.components',
          '@wordpress/element': 'wp.element',
          '@wordpress/i18n': 'wp.i18n',
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
      '@': resolve(__dirname, 'resources'),
    },
  },
  
  optimizeDeps: {
    include: ['three', 'react', 'react-dom']
  },
  
  // Temporarily disable TypeScript checking during build to avoid JSX errors
  esbuild: {
    jsxInject: `import React from 'react'`,
    jsx: 'react',
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
}); 
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
    lib: {
      // Could also be a dictionary or array of multiple entry points
      entry: {
        'bonsai-planets': resolve(__dirname, 'resources/scripts/tiny-planets.ts'),
        'block': resolve(__dirname, 'resources/scripts/block.tsx'),
      },
      formats: ['es'],
    },
    rollupOptions: {
      // Externalize deps that shouldn't be bundled
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
        // Global variables to use in UMD build for externalized deps
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          '@wordpress/blocks': 'wp.blocks',
          '@wordpress/block-editor': 'wp.blockEditor',
          '@wordpress/components': 'wp.components',
          '@wordpress/element': 'wp.element',
          '@wordpress/i18n': 'wp.i18n',
        },
        // Create separate CSS files
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return '[name].css';
          return '[name].[ext]';
        },
        // Configure chunk files
        chunkFileNames: '[name].js',
        // Configure entry files
        entryFileNames: '[name].js',
      },
    },
  },
  css: {
    postcss: {
      plugins: [
        require('tailwindcss'),
        require('autoprefixer'),
      ],
    },
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'resources'),
    },
  },
  // Base public path when served in production
  base: '/wp-content/plugins/bonsai-planets-wp/',
}); 
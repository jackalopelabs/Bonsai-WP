# Building the Bonsai Planets WordPress Plugin

This document explains how to set up the development environment and build the plugin for distribution.

## Requirements

- [Node.js](https://nodejs.org/) (v16 or higher recommended)
- [npm](https://www.npmjs.com/) (v7 or higher)

## Development Setup

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/bonsai-planets-wp.git
   cd bonsai-planets-wp
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the development build process with file watching:
   ```
   npm run dev
   ```
   This will start a local development server using Vite, which allows for fast refresh during development.

4. For a production build:
   ```
   npm run build
   ```

## Plugin Structure

- `/resources/scripts/` - TypeScript source files
  - `tiny-planets.ts` - Main entry point for the plugin
  - `worlds/planet.ts` - Planet generation code
  - `block.tsx` - Gutenberg block implementation
- `/resources/styles/` - CSS files using Tailwind
  - `app.css` - Main CSS file with Tailwind directives
  - `block.css` - Styles for the Gutenberg block editor
- `/dist/` - Compiled JavaScript and CSS (generated)
- `bonsai-planets-wp.php` - Main plugin file
- `README.md` - Plugin documentation

## Build System

This project uses:
- [Vite](https://vitejs.dev/) for blazing fast builds and development
- [TypeScript](https://www.typescriptlang.org/) for type-safe code
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling with the `bp-` prefix to avoid conflicts

## Building for Production

To build the plugin for production distribution:

1. Run a production build:
   ```
   npm run build
   ```

2. The compiled files will be placed in the `/dist/` directory.

3. Create a distributable zip file:
   ```
   # Exclude development files
   zip -r bonsai-planets-wp.zip . -x "*.git*" "node_modules/*" "*.md" "*.json" "*.lock" "*.config.js" "resources/*"
   ```

## Third-Party Dependencies

The plugin relies on:

- [Three.js](https://threejs.org/) - 3D JavaScript library
- [WordPress Block Editor](https://developer.wordpress.org/block-editor/) - For Gutenberg integration
- [React](https://reactjs.org/) - For block editor components

## WordPress Integration

The plugin is designed to integrate with WordPress through:

1. A shortcode: `[bonsai_planet]`
2. A Gutenberg block: "Bonsai Planet"

Both methods allow customization of the planet's appearance through attributes/settings.

## Troubleshooting

- If you encounter TypeScript errors, make sure your TypeScript version is compatible (v4.5+).
- For Tailwind-related issues, check the Tailwind configuration in `tailwind.config.js`.
- For build errors, check your Vite configuration in `vite.config.js`. 
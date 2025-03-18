# Bonsai Planets WordPress Plugin - Development Guide

This document provides development guidelines for the Bonsai Planets WordPress plugin.

## Plugin Structure

The Bonsai Planets WordPress plugin is a **completely self-contained** package that includes all necessary code and assets without depending on any external project. The plugin has the following structure:

```
bonsai-planets-wp/
├── assets/                   # Built assets (JS/CSS)
├── includes/                 # PHP includes
│   └── planet-template.php   # Template for the shortcode
├── public/                   # Public assets
│   └── lowpoly_nature/       # GLTF 3D models
├── src/                      # Source code
│   ├── Providers/            # Acorn service providers
│   ├── worlds/               # Core ThreeJS planet generation code
│   │   ├── helper/           # Helper utilities
│   │   ├── materials/        # Custom materials
│   │   ├── planet.ts         # Planet class
│   │   ├── stars.ts          # Stars class
│   │   ├── presets.ts        # Planet presets
│   │   └── ...               # Other related files
│   ├── main.ts               # Main entry point
│   └── types.d.ts            # Type definitions
├── scripts/                  # Build scripts
├── bonsai-planets.php        # Main plugin file
├── composer.json             # Composer config
├── package.json              # NPM config
└── vite.config.js            # Vite build config
```

## Development Setup

### Prerequisites

- Node.js (v14+)
- npm or yarn
- PHP 7.4+
- WordPress development environment (local)
- Sage 11 theme (for testing Blade directive integration)

### Initial Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/jackalopelabs/bonsai-planets-wp.git
   cd bonsai-planets-wp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the setup script to verify all required files are present:
   ```bash
   node scripts/copy-assets.js
   ```

4. Build the assets:
   ```bash
   npm run build
   ```

### Development Workflow

During development, you can use Vite's development server:

```bash
npm run dev
```

This will start a development server and watch for changes to your source files.

### Building for Production

To build the production assets:

```bash
npm run build
```

This will create optimized JavaScript and CSS files in the `assets` directory.

## Plugin Assets

### 3D Models

The plugin includes all necessary 3D models in the `public/lowpoly_nature` directory. These are GLTF format files that are loaded by the ThreeJS code at runtime.

### JavaScript Architecture

The plugin's JavaScript is organized as follows:

- **main.ts**: Entry point that initializes the 3D planet visualization
- **worlds/**: Contains all planet generation code
  - **planet.ts**: Core planet generation class
  - **stars.ts**: Background star field generation
  - **presets.ts**: Different planet presets (beach, forest, snow)
  - **biome.ts**: Biome-specific settings
  - **worker.ts**: Web worker for planet generation
  - **helper/**: Utility functions
  - **materials/**: Custom ThreeJS materials

## WordPress Integration

### Shortcode

The plugin provides a `[bonsai_planet]` shortcode that can be used in any WordPress content.

### Blade Directive

For Sage 11 themes, a `@bonsaiPlanet()` Blade directive is available.

## Testing

To test the plugin in a WordPress environment:

1. Build the plugin assets as described above
2. Install the plugin in your WordPress site:
   - Manually by copying to `wp-content/plugins/`
   - Via Composer: `composer require jackalopelabs/bonsai-planets-wp`
3. Activate the plugin in the WordPress admin
4. Use the shortcode or Blade directive to add a planet to your content

## Troubleshooting

If you encounter issues during development:

1. Check for JavaScript errors in the browser console
2. Verify that all 3D model files are correctly located in the `public/lowpoly_nature` directory
3. Ensure the plugin is properly activated in WordPress
4. Check that the shortcode is properly formatted 
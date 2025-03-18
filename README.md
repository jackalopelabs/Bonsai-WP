# Bonsai Planets for WordPress

Interactive 3D planets with ThreeJS for Sage 11 themes.

![Bonsai Planets Demo](https://github.com/user-attachments/assets/55ba1872-d064-483b-9a31-2c95adaa201a)

## Description

Bonsai Planets is a WordPress plugin that adds beautiful interactive 3D planets to your Sage 11 WordPress theme. With simple shortcodes, you can embed procedurally generated planets with different biomes that users can interact with.

## Features

- Interactive 3D planets with ThreeJS
- Multiple planet types (beach, forest, snow)
- Interactive character (bunny) that can jump and move around the planets
- Full camera controls (zoom, rotate, etc.)
- Compatible with Sage 11, Tailwind CSS, and Alpine.js
- Shortcode and Blade directive support

## Requirements

- WordPress 5.8+
- Sage 11+ theme
- PHP 7.4+
- Modern browser with WebGL support

## Installation

### Via Composer (recommended)

```bash
composer require jackalopelabs/bonsai-planets-wp
```

### Manual Installation

1. Download the plugin from the GitHub repository
2. Upload the plugin files to your `/wp-content/plugins/bonsai-planets-wp` directory
3. Activate the plugin through the 'Plugins' screen in WordPress

## Usage

### Basic Shortcode

```
[bonsai_planet]
```

### Shortcode with Options

```
[bonsai_planet id="my-planet" height="600px" width="100%"]
```

### Blade Directive (in Sage 11 themes)

```php
@bonsaiPlanet('id="my-planet" height="600px"')
```

### Options

- `id` - Custom ID for the planet container (default: randomly generated)
- `height` - Height of the planet container (default: 600px)
- `width` - Width of the planet container (default: 100%)

## Controls

- **WASD or Arrow Keys**: Roll the ball (relative to camera view)
- **Space**: Jump (ball jumps away from planet)
- **Mouse Wheel**: Zoom in/out
- **Click and Drag**: Change camera angle around the ball
- **R**: Toggle planet auto-rotation
- **1, 2, 3**: Switch planet type

## Development

### Prerequisites

- Node.js (v14+)
- npm or yarn

### Setup

1. Clone the repository
2. Run `npm install` to install dependencies
3. Run `npm run dev` for development
4. Run `npm run build` for production build

## Credits

Based on the original [Bonsai Planets](https://github.com/yourusername/bonsai-planets) project.

## License

MIT 
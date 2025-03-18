# Bonsai Planets for WordPress

A WordPress plugin that adds beautiful, interactive 3D procedural planets to your website.

## Description

Bonsai Planets is a lightweight plugin that uses Three.js to create stunning procedural planets that can be embedded in your WordPress posts and pages. Each planet is unique, generated on-the-fly, and fully interactive.

## Features

- Procedurally generated 3D planets
- Customizable planet properties (colors, terrain, atmosphere, etc.)
- Interactive rotation and zoom controls
- Responsive design that works on all devices
- Easy to use shortcode and Gutenberg block
- Lightweight and optimized for performance

## Installation

1. Upload the `bonsai-planets-wp` folder to the `/wp-content/plugins/` directory
2. Activate the plugin through the 'Plugins' menu in WordPress
3. Use the shortcode or block editor to add planets to your content

## Usage

### Shortcode

Add a planet to your post or page using the shortcode:

```
[bonsai_planet]
```

### Shortcode with options

Customize your planet using shortcode attributes:

```
[bonsai_planet 
  width="600px" 
  height="400px" 
  seed="42" 
  water-level="0.35" 
  has-atmosphere="true" 
  water-color="#2288ff" 
  land-color="#44aa44"
]
```

### Gutenberg Block

1. In the block editor, click the (+) button to add a new block
2. Search for "Planet" or find it in the "Widgets" category
3. Add the block and customize the planet using the block settings panel

## Available Options

| Option | Description | Default |
|--------|-------------|---------|
| width | Width of the planet container | 100% |
| height | Height of the planet container | 400px |
| radius | Planet radius | 1.0 |
| resolution | Planet geometry resolution (higher = more detailed but slower) | 64 |
| seed | Random seed for planet generation | Random |
| water-level | Height of the water level (0.0-1.0) | 0.4 |
| has-atmosphere | Whether to show atmosphere | true |
| has-ocean | Whether to show ocean | true |
| has-vegetation | Whether to show vegetation | true |
| water-color | Color of the ocean | #3399ff |
| land-color | Color of the land | #4d9a4d |
| mountain-color | Color of the mountains | #8c7853 |
| snow-color | Color of the snow-capped peaks | #ffffff |
| atmosphere-color | Color of the atmosphere | #88aaff |
| min-tree-height | Minimum elevation for tree placement | 0.5 |
| max-tree-height | Maximum elevation for tree placement | 0.8 |
| vegetation-density | Density of vegetation (0.0-1.0) | 0.5 |

## Examples

### Basic Planet

```
[bonsai_planet]
```

### Earth-like Planet

```
[bonsai_planet 
  water-level="0.4" 
  water-color="#0077be" 
  land-color="#3d5e3a" 
  mountain-color="#8c7853" 
  snow-color="#ffffff" 
  atmosphere-color="#aaccff"
]
```

### Desert Planet

```
[bonsai_planet 
  water-level="0.2" 
  water-color="#a67c52" 
  land-color="#d9a066" 
  mountain-color="#aa6c39" 
  has-vegetation="false" 
  atmosphere-color="#f8d099"
]
```

### Alien Planet

```
[bonsai_planet 
  water-level="0.5" 
  water-color="#8844ff" 
  land-color="#44dd88" 
  mountain-color="#2288aa" 
  snow-color="#ddffee" 
  atmosphere-color="#aa88ff"
]
```

## Requirements

- WordPress 5.0 or higher
- Modern browser with WebGL support (Chrome, Firefox, Safari, Edge)

## License

This plugin is licensed under the GPL v2 or later.

## Credits

- Uses [Three.js](https://threejs.org/) for 3D rendering
- Inspired by various procedural planet generation techniques

## Support

For support, feature requests, or bug reports, please open an issue on the [GitHub repository](https://github.com/yourusername/bonsai-planets-wp). 
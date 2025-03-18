# Bonsai Planets WordPress Plugin Usage

This document provides detailed usage instructions for the Bonsai Planets WordPress plugin.

## Basic Usage

### Shortcode

The most basic way to add a planet to your WordPress content is to use the provided shortcode:

```
[bonsai_planet]
```

This will create a 3D planet with default settings (beach theme, 600px height, 100% width).

### Shortcode with Options

You can customize the planet by adding parameters to the shortcode:

```
[bonsai_planet id="my-custom-planet" height="800px" width="100%"]
```

Available parameters:
- `id` - Custom ID for the planet container (default: randomly generated)
- `height` - Height of the planet container (default: 600px)
- `width` - Width of the planet container (default: 100%)

## Advanced Usage with Sage 11

If you're using a Sage 11 theme with Blade templates, you can use the `@bonsaiPlanet` directive:

### Basic Blade Directive

```php
@bonsaiPlanet()
```

### Blade Directive with Options

```php
@bonsaiPlanet('id="homepage-planet" height="500px" width="100%"')
```

## Integration Examples

### Adding to a Page/Post

Simply add the shortcode to any WordPress page or post content:

```
<h2>Explore Our Universe</h2>
<p>Interact with our 3D planet below:</p>

[bonsai_planet height="600px"]

<p>Use WASD keys to move the character, space to jump, and mouse to rotate the view.</p>
```

### Adding to a Template

In a Sage 11 theme template (e.g., `resources/views/front-page.blade.php`):

```php
@extends('layouts.app')

@section('content')
  <div class="container mx-auto my-12">
    <h1 class="text-4xl font-bold mb-8">Welcome to Our Universe</h1>
    
    <div class="bg-gray-900 rounded-lg overflow-hidden shadow-xl">
      @bonsaiPlanet('height="600px"')
    </div>
    
    <div class="mt-8 prose max-w-none">
      <h2>How to Interact</h2>
      <ul>
        <li><strong>WASD or Arrow Keys:</strong> Move the character</li>
        <li><strong>Space:</strong> Jump</li>
        <li><strong>Mouse:</strong> Rotate view</li>
        <li><strong>Mouse Wheel:</strong> Zoom in/out</li>
      </ul>
    </div>
  </div>
@endsection
```

### Adding to a Sidebar Widget Area

Create a custom HTML widget in your sidebar and add the shortcode:

```
<div class="sidebar-planet-container">
  <h3>Mini Planet Explorer</h3>
  [bonsai_planet height="300px"]
  <p class="text-xs mt-2">Click and drag to explore!</p>
</div>
```

## Performance Considerations

The 3D planet rendering requires WebGL and can be resource-intensive. Consider these recommendations:

1. Limit the number of planets per page to avoid performance issues
2. Use a reasonable size for your planet containers
3. Consider adding a loading state for slower devices

## Customizing the Planet Style

The plugin includes default styling that can be customized using CSS:

```css
/* Make the planet container larger */
.bonsai-planet-container {
  min-height: 800px;
}

/* Style the control buttons */
.bonsai-planet-btn {
  background-color: #6366f1 !important;
  border-radius: 9999px !important;
  padding: 0.5rem 1rem !important;
  transition: all 0.2s ease-in-out !important;
}

.bonsai-planet-btn:hover {
  background-color: #4f46e5 !important;
  transform: translateY(-2px) !important;
}

/* Style the instructions panel */
.bonsai-planet-instructions {
  background-color: rgba(17, 24, 39, 0.8) !important;
  border-radius: 0.5rem !important;
  border-left: 4px solid #6366f1 !important;
}
```

## Troubleshooting

If you encounter issues with the plugin:

1. **Planet not showing**: Make sure your browser supports WebGL
2. **Performance issues**: Try reducing the size of the planet container
3. **Plugin conflicts**: Disable other 3D or heavy JavaScript plugins to check for conflicts

For additional support, please visit our GitHub repository at https://github.com/jackalopelabs/bonsai-planets-wp/issues 
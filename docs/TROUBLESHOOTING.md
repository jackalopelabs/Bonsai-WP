# Troubleshooting

## Blade Directive Not Working

If the `@bonsaiPlanet()` directive isn't working in your Sage theme, try one of these solutions:

### Solution 1: Add Directive Registration to Your Theme

The most reliable way to ensure the Blade directive works is to register it directly in your theme.

1. Copy the file `docs/register-directive.php` from this plugin to your theme's `app/` directory.
2. Rename it to `register-bonsai-directive.php`
3. In your theme's `app/setup.php` file, add this line at the bottom:

```php
require_once get_theme_file_path('app/register-bonsai-directive.php');
```

4. Clear your cache and reload the page.

### Solution 2: Use the Shortcode Instead

If you prefer not to modify your theme files, you can use the shortcode directly in your Blade templates:

```php
{!! do_shortcode('[bonsai_planet id="my-planet" height="500px" width="100%"]') !!}
```

### Solution 3: Check WordPress Logs

The plugin includes detailed logging. Check your WordPress debug log for messages from "Bonsai Planets:" to see if there are any specific errors.

### Solution 4: Deactivate and Reactivate

Sometimes simply deactivating and reactivating the plugin can resolve directive registration issues:

1. Go to your WordPress admin > Plugins
2. Deactivate "Bonsai Planets"
3. Reactivate "Bonsai Planets"
4. Clear any cache plugins you might be using
5. Reload your site

## Assets Not Loading

If the planet appears but looks incorrect or throws JavaScript errors:

1. Check your browser console for any 404 errors
2. Ensure the plugin's assets are being built correctly by running:

```bash
cd /path/to/wp-content/plugins/bonsai-planets-wp
npm run build
```

3. Check that the following directory exists and contains files:
   - `bonsai-planets-wp/assets/js/`
   - `bonsai-planets-wp/assets/css/`

## Invalid Models

If the model files aren't loading:

1. Check that the `public/lowpoly_nature/` directory contains GLTF model files
2. If missing, copy them from the original project or rebuild the plugin assets

## Contact Support

If you continue to have issues, please contact support with:

1. Your WordPress version
2. Your Sage theme version
3. Any error messages from your browser console
4. The contents of your WordPress debug log 
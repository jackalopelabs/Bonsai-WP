<?php
/**
 * Bonsai Planets - Blade Directive Registration
 * 
 * Copy this file to your theme's app/ directory and include it in your theme's setup.php file.
 * 
 * In app/setup.php, add: require_once get_theme_file_path('app/register-bonsai-directive.php');
 */

namespace App;

/**
 * Register Bonsai Planet Blade directive
 */
add_filter('sage/blade/directives', function ($directives) {
    /**
     * @bonsaiPlanet() directive
     * 
     * Usage: @bonsaiPlanet('id="my-planet" height="500px" width="100%"')
     */
    $directives['bonsaiPlanet'] = function($expression) {
        return "<?php echo do_shortcode('[bonsai_planet ' . {$expression} . ']'); ?>";
    };
    
    return $directives;
}); 
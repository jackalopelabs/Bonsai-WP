<?php
/**
 * Add this code to your Sage theme's app/setup.php or functions.php file
 * to register the bonsaiPlanet Blade directive.
 * 
 * This is a direct approach that bypasses the plugin's registration mechanism
 * and should work in any Sage 10+ theme.
 */

/**
 * Register Blade directives
 */
add_filter('sage/blade/directives', function ($directives) {
    $directives['bonsaiPlanet'] = function($expression) {
        return "<?php echo do_shortcode('[bonsai_planet ' . {$expression} . ']'); ?>";
    };
    
    return $directives;
}); 
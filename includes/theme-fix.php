<?php
/**
 * DIRECT FIX FOR BONSAI PLANETS
 * 
 * Add the following code to your theme's functions.php file:
 */

// Register the Bonsai Planet Blade directive
add_action('after_setup_theme', function() {
    add_filter('sage/blade/directives', function($directives) {
        $directives['bonsaiPlanet'] = function($expression) {
            return '<?php echo do_shortcode("[bonsai_planet " . ' . $expression . ' . "]"); ?>';
        };
        return $directives;
    });
}, 20); 
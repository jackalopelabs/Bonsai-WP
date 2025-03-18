<?php
/**
 * Bonsai Planets - Sage Helper
 * 
 * This file can be included in your Sage theme's functions.php as a last resort
 * if the automatic Blade directive registration doesn't work.
 * 
 * Usage: 
 * - Copy this file to your theme
 * - Add this line to your functions.php: require_once('path/to/sage-helper.php');
 */

if (!function_exists('bonsai_planets_register_blade_directive')) {
    /**
     * Register the bonsaiPlanet Blade directive
     */
    function bonsai_planets_register_blade_directive() {
        add_action('after_setup_theme', function() {
            if (function_exists('Roots\app') && is_callable([Roots\app(), 'bind'])) {
                // Get the current blade compiler
                if (Roots\app()->bound('blade.compiler')) {
                    $blade = Roots\app()->make('blade.compiler');
                    
                    // Register the directive
                    $blade->directive('bonsaiPlanet', function ($expression) {
                        return "<?php 
                        // Parse the expression to extract attributes
                        \$planetExpression = $expression;
                        \$planetMatches = [];
                        preg_match_all('/(\w+)\s*=\s*[\'\"](.*?)[\'\"]/', \$planetExpression, \$planetMatches);
                        
                        \$planetAttrs = [];
                        if (!empty(\$planetMatches[0])) {
                            for (\$i = 0; \$i < count(\$planetMatches[0]); \$i++) {
                                \$planetAttrs[\$planetMatches[1][\$i]] = \$planetMatches[2][\$i];
                            }
                        }
                        
                        // Set default values
                        \$id = \$planetAttrs['id'] ?? 'bonsai-planet-' . uniqid();
                        \$width = \$planetAttrs['width'] ?? '100%';
                        \$height = \$planetAttrs['height'] ?? '500px';
                        
                        // Include the template
                        \$template = WP_PLUGIN_DIR . '/bonsai-planets-wp/includes/planet-template.php';
                        
                        if (file_exists(\$template)) {
                            include \$template;
                        } else {
                            echo 'Planet template not found at ' . \$template;
                        }
                        ?>";
                    });
                    
                    error_log('Bonsai Planets: Blade directive registered via Sage helper');
                } else {
                    error_log('Bonsai Planets: Blade compiler not found in Sage app container');
                }
            } else {
                error_log('Bonsai Planets: Sage app() function not found or bind method not available');
            }
        }, 20);
    }
    
    // Register the directive
    bonsai_planets_register_blade_directive();
} 
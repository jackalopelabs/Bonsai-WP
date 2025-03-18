<?php
/**
 * Plugin Name: Bonsai Planets
 * Plugin URI: https://yoursite.com/bonsai-planets
 * Description: Interactive 3D planets built with Three.js for WordPress
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://yoursite.com
 * Text Domain: bonsai-planets
 * Requires at least: 5.9
 * Requires PHP: 7.4
 */

namespace BonsaiPlanets\Frontend;

// Exit if accessed directly
if (!defined('ABSPATH')) exit;

// Plugin constants
define('BONSAI_PLANETS_VERSION', '1.0.0');
define('BONSAI_PLANETS_DIR', plugin_dir_path(__FILE__));
define('BONSAI_PLANETS_URL', plugin_dir_url(__FILE__));
define('BONSAI_PLANETS_DIST_DIR', BONSAI_PLANETS_DIR . 'public/');
define('BONSAI_PLANETS_DIST_URL', BONSAI_PLANETS_URL . 'public/');

// Autoload plugin classes
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

// Initialize the plugin
if (!function_exists('bonsai_planets_init')):
    function bonsai_planets_init() {
        // Check if Sage is active and properly configured
        if (!class_exists('\Roots\Sage\Container')) {
            // If not using Sage, register assets directly
            add_action('init', function() {
                // Register styles and scripts
                wp_register_style(
                    'bonsai-planets-styles',
                    BONSAI_PLANETS_DIST_URL . 'css/app.css',
                    [],
                    BONSAI_PLANETS_VERSION
                );
                
                wp_register_script(
                    'bonsai-planets-scripts',
                    BONSAI_PLANETS_DIST_URL . 'js/app.js',
                    [],
                    BONSAI_PLANETS_VERSION,
                    true
                );
            });
        } else {
            // If using Sage, load assets through their asset system
            // (Typically handled differently, but this is a fallback)
            add_action('init', function() {
                // Register styles and scripts
                wp_register_style(
                    'bonsai-planets-styles',
                    BONSAI_PLANETS_DIST_URL . 'css/app.css',
                    [],
                    BONSAI_PLANETS_VERSION
                );
                
                wp_register_script(
                    'bonsai-planets-scripts',
                    BONSAI_PLANETS_DIST_URL . 'js/app.js',
                    [],
                    BONSAI_PLANETS_VERSION,
                    true
                );
            });
        }
        
        // Register shortcode
        add_shortcode('bonsai_planet', 'BonsaiPlanets\\Frontend\\bonsai_planets_shortcode');
    }
endif;

// Shortcode callback
if (!function_exists('bonsai_planets_shortcode')):
    function bonsai_planets_shortcode($atts) {
        // Parse shortcode attributes
        $atts = shortcode_atts([
            'preset' => 'forest',
            'width' => '100%',
            'height' => '600px',
            'controls' => 'true',
            'autorotate' => 'true',
            'resolution' => '6',
        ], $atts);
        
        // Enqueue required assets
        wp_enqueue_style('bonsai-planets-styles');
        wp_enqueue_script('bonsai-planets-scripts');
        
        // Start output buffering
        ob_start();
        
        // Include the view template
        include BONSAI_PLANETS_DIR . 'resources/views/planet.php';
        
        // Return the buffered content
        return ob_get_clean();
    }
endif;

// Create frontend class
if (!class_exists('BonsaiPlanets\\Frontend\\Planets')):
    class Planets {
        public function __construct() {
            // Initialize frontend functionality
        }
        
        public function render_planet($preset, $width, $height, $controls, $autorotate) {
            // Render planet (future implementation)
        }
    }
endif;

// Hook into WordPress
add_action('plugins_loaded', 'BonsaiPlanets\\Frontend\\bonsai_planets_init'); 
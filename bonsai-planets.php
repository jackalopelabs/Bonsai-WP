<?php
/**
 * Plugin Name: Bonsai Planets
 * Plugin URI: https://github.com/jackalopelabs/bonsai-planets-wp
 * Description: Interactive 3D planets with ThreeJS for WordPress
 * Version: 1.0.0
 * Author: Jackalope Labs
 * Author URI: https://jackalopelabs.com
 * License: MIT
 * License URI: https://opensource.org/licenses/MIT
 * Text Domain: bonsai-planets
 * Domain Path: /languages
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('BONSAI_PLANETS_VERSION', '1.0.0');
define('BONSAI_PLANETS_PATH', plugin_dir_path(__FILE__));
define('BONSAI_PLANETS_URL', plugin_dir_url(__FILE__));
define('BONSAI_PLANETS_ASSETS', BONSAI_PLANETS_URL . 'assets/');

// Autoload classes
if (file_exists(__DIR__ . '/vendor/autoload.php')) {
    require_once __DIR__ . '/vendor/autoload.php';
}

// Main plugin class
class BonsaiPlanets {
    /**
     * Plugin instance
     */
    private static $instance = null;

    /**
     * Get the singleton instance
     */
    public static function getInstance() {
        if (is_null(self::$instance)) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        $this->init();
    }

    /**
     * Initialize the plugin
     */
    public function init() {
        // Load the Sage filter early for Blade directive registration
        require_once plugin_dir_path(__FILE__) . 'includes/sage-filter.php';
        
        // Register assets
        add_action('wp_enqueue_scripts', [$this, 'registerAssets']);
        
        // Register shortcode
        add_shortcode('bonsai_planet', [$this, 'planetShortcode']);
        
        // Register with Sage/Acorn if available
        add_action('acorn/init', function() {
            if (class_exists('\Illuminate\Support\ServiceProvider')) {
                acorn()->register(\BonsaiPlanets\SageServiceProvider::class);
                
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Bonsai Planets: Service provider registered with Acorn');
                }
            }
        });
        
        // Fallback for non-Acorn environments
        add_filter('sage/blade/directives', function($directives) {
            $directives['bonsaiPlanet'] = function($expression) {
                return "<?php echo do_shortcode('[bonsai_planet ' . {$expression} . ']'); ?>";
            };
            return $directives;
        });
    }

    /**
     * Register Blade directive
     */
    public function registerBladeDirective() {
        // Use the Sage app container to register the directive properly
        add_action('after_setup_theme', function() {
            if (function_exists('Roots\app') && is_callable([Roots\app(), 'singleton'])) {
                Roots\app()->singleton('sage.directives', function () {
                    return [
                        'bonsaiPlanet' => function ($expression) {
                            $attributes = $this->parseExpression($expression);
                            return "<?php
                                \$id = {$attributes['id']};
                                \$width = {$attributes['width']};
                                \$height = {$attributes['height']};
                                echo \$this->renderPlanet(\$id, \$width, \$height);
                            ?>";
                        },
                    ];
                });
                
                // Add debug information
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Bonsai Planets: Directive registered with Sage app container');
                }
            } else {
                // Fallback for non-Sage themes
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log('Bonsai Planets: Sage app() function not found, using shortcode fallback');
                }
            }
        }, 100); // Run late to ensure Sage is loaded
    }
    
    /**
     * Parse the Blade directive expression
     */
    private function parseExpression($expression) {
        // Extract attributes from the expression string
        preg_match_all('/(\w+)\s*=\s*["\']([^"\']*)["\']/', trim($expression, "'\""), $matches);
        
        $attributes = [];
        if (!empty($matches[0])) {
            for ($i = 0; $i < count($matches[0]); $i++) {
                $attributes[$matches[1][$i]] = "'" . $matches[2][$i] . "'";
            }
        }
        
        // Set default values for missing attributes
        if (!isset($attributes['id'])) {
            $attributes['id'] = "'bonsai-planet-" . uniqid() . "'";
        }
        if (!isset($attributes['width'])) {
            $attributes['width'] = "'100%'";
        }
        if (!isset($attributes['height'])) {
            $attributes['height'] = "'500px'";
        }
        
        return $attributes;
    }
    
    /**
     * Render the planet template
     */
    public function renderPlanet($id, $width, $height) {
        ob_start();
        include plugin_dir_path(__FILE__) . 'includes/planet-template.php';
        return ob_get_clean();
    }

    /**
     * Register and enqueue scripts and styles
     */
    public function registerAssets() {
        // Register ThreeJS from CDN
        wp_register_script(
            'threejs',
            'https://cdnjs.cloudflare.com/ajax/libs/three.js/0.162.0/three.min.js',
            [],
            '0.162.0',
            true
        );

        // Register main bundle with type="module"
        wp_register_script(
            'bonsai-planets-bundle',
            plugin_dir_url(__FILE__) . 'assets/js/main-bundle.js',
            ['threejs'],
            '1.0.0',
            true
        );
        wp_script_add_data('bonsai-planets-bundle', 'type', 'module');

        // Register styles with correct MIME type
        wp_register_style(
            'bonsai-planets-style',
            plugin_dir_url(__FILE__) . 'assets/css/main.css',
            [],
            '1.0.0'
        );
        add_filter('style_loader_tag', function($tag, $handle) {
            if ($handle === 'bonsai-planets-style') {
                return str_replace("rel='stylesheet'", "rel='stylesheet' type='text/css'", $tag);
            }
            return $tag;
        }, 10, 2);
    }

    /**
     * Shortcode handler for [bonsai_planet]
     */
    public function planetShortcode($atts) {
        // Extract attributes
        $atts = shortcode_atts([
            'id' => 'bonsai-planet-' . uniqid(),
            'height' => '600px',
            'width' => '100%',
        ], $atts);

        // Enqueue required assets
        wp_enqueue_script('threejs');
        wp_enqueue_script('bonsai-planets-bundle');
        wp_enqueue_style('bonsai-planets-style');

        // Get the HTML template
        ob_start();
        include BONSAI_PLANETS_PATH . 'includes/planet-template.php';
        return ob_get_clean();
    }
}

// Initialize the plugin
BonsaiPlanets::getInstance();

// Include Composer dependencies if using Acorn
if (class_exists('Roots\\Acorn\\Application')) {
    // Support for Sage/Acorn setup
    add_action('acorn/init', function () {
        // Register service provider if using Acorn
        \Roots\Acorn\Acorn::resolve()->register(\BonsaiPlanets\Providers\BonsaiPlanetsServiceProvider::class);
    });
} 
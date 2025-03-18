<?php
/**
 * Plugin Name: Bonsai Planets
 * Plugin URI: https://github.com/jackalopelabs/bonsai-planets-wp
 * Description: Interactive 3D planets with ThreeJS for Sage 11 themes
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
    private function init() {
        // Register scripts and styles
        add_action('wp_enqueue_scripts', [$this, 'registerAssets']);
        
        // Register shortcode
        add_shortcode('bonsai_planet', [$this, 'planetShortcode']);
    }

    /**
     * Register and enqueue scripts and styles
     */
    public function registerAssets() {
        // Register the ThreeJS bundle
        wp_register_script(
            'bonsai-planets-bundle',
            BONSAI_PLANETS_ASSETS . 'js/bonsai-planets-bundle.js',
            [],
            BONSAI_PLANETS_VERSION,
            true
        );

        // Register the plugin styles
        wp_register_style(
            'bonsai-planets-styles',
            BONSAI_PLANETS_ASSETS . 'css/bonsai-planets.css',
            [],
            BONSAI_PLANETS_VERSION
        );
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
        wp_enqueue_script('bonsai-planets-bundle');
        wp_enqueue_style('bonsai-planets-styles');

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
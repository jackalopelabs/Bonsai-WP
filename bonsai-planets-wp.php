<?php
/**
 * Plugin Name: Bonsai Planets for WordPress
 * Plugin URI: https://example.com/bonsai-planets-wp
 * Description: Add interactive 3D planets to your WordPress site
 * Version: 1.0.0
 * Author: Your Name
 * Author URI: https://example.com
 * License: GPL-2.0+
 * License URI: http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain: bonsai-planets-wp
 * Domain Path: /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
    die;
}

/**
 * Define plugin constants
 */
define( 'BONSAI_PLANETS_VERSION', '1.0.0' );
define( 'BONSAI_PLANETS_PATH', plugin_dir_path( __FILE__ ) );
define( 'BONSAI_PLANETS_URL', plugin_dir_url( __FILE__ ) );
define( 'BONSAI_PLANETS_BASENAME', plugin_basename( __FILE__ ) );

/**
 * Main plugin class
 */
class Bonsai_Planets {
    /**
     * Instance of this class
     */
    private static $instance = null;

    /**
     * Get an instance of this class
     */
    public static function get_instance() {
        if ( null === self::$instance ) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Initialize the plugin
     */
    private function __construct() {
        // Register activation and deactivation hooks
        register_activation_hook( __FILE__, array( $this, 'activate' ) );
        register_deactivation_hook( __FILE__, array( $this, 'deactivate' ) );

        // Load plugin text domain for translations
        add_action( 'plugins_loaded', array( $this, 'load_textdomain' ) );

        // Register scripts and styles
        add_action( 'wp_enqueue_scripts', array( $this, 'register_scripts' ) );

        // Register shortcode
        add_shortcode( 'bonsai_planet', array( $this, 'planet_shortcode' ) );

        // Add Gutenberg block
        add_action( 'init', array( $this, 'register_block' ) );
    }

    /**
     * Plugin activation
     */
    public function activate() {
        // Nothing to do for now
    }

    /**
     * Plugin deactivation
     */
    public function deactivate() {
        // Nothing to do for now
    }

    /**
     * Load text domain for translations
     */
    public function load_textdomain() {
        load_plugin_textdomain(
            'bonsai-planets-wp',
            false,
            dirname( BONSAI_PLANETS_BASENAME ) . '/languages/'
        );
    }

    /**
     * Register scripts and styles
     */
    public function register_scripts() {
        // Register Three.js library
        wp_register_script(
            'threejs',
            'https://cdn.jsdelivr.net/npm/three@0.152.2/build/three.min.js',
            array(),
            '0.152.2',
            true
        );

        // Register OrbitControls addon
        wp_register_script(
            'threejs-orbit-controls',
            'https://cdn.jsdelivr.net/npm/three@0.152.2/examples/jsm/controls/OrbitControls.js',
            array( 'threejs' ),
            '0.152.2',
            true
        );

        // Register plugin scripts
        wp_register_script(
            'bonsai-planets',
            BONSAI_PLANETS_URL . 'dist/bonsai-planets.js',
            array( 'threejs', 'threejs-orbit-controls' ),
            BONSAI_PLANETS_VERSION,
            true
        );

        // Register plugin styles
        wp_register_style(
            'bonsai-planets',
            BONSAI_PLANETS_URL . 'dist/bonsai-planets.css',
            array(),
            BONSAI_PLANETS_VERSION
        );
    }

    /**
     * Planet shortcode
     */
    public function planet_shortcode( $atts ) {
        // Enqueue required scripts and styles
        wp_enqueue_script( 'bonsai-planets' );
        wp_enqueue_style( 'bonsai-planets' );

        // Parse attributes
        $atts = shortcode_atts(
            array(
                'id'                 => 'planet-' . uniqid(),
                'width'              => '100%',
                'height'             => '400px',
                'radius'             => '1.0',
                'resolution'         => '6',
                'seed'               => mt_rand( 1, 1000000 ),
                'water-level'        => '0.4',
                'has-atmosphere'     => 'true',
                'has-ocean'          => 'true',
                'has-vegetation'     => 'true',
                'water-color'        => '#3399ff',
                'land-color'         => '#4d9a4d',
                'mountain-color'     => '#8c7853',
                'snow-color'         => '#ffffff',
                'atmosphere-color'   => '#88aaff',
                'min-tree-height'    => '0.5',
                'max-tree-height'    => '0.8',
                'vegetation-density' => '0.5',
                'class'              => '',
            ),
            $atts,
            'bonsai_planet'
        );

        // Convert attributes to data attributes
        $data_attrs = array();
        foreach ( $atts as $key => $value ) {
            if ( $key === 'id' || $key === 'width' || $key === 'height' || $key === 'class' ) {
                continue;
            }
            $data_key = 'data-' . esc_attr( $key );
            $data_attrs[] = $data_key . '="' . esc_attr( $value ) . '"';
        }

        // Create container with data attributes
        $container_style = 'width: ' . esc_attr( $atts['width'] ) . '; height: ' . esc_attr( $atts['height'] ) . ';';
        $container_class = 'bp-planet-container ' . esc_attr( $atts['class'] );
        
        $output = sprintf(
            '<div id="%s" class="%s" style="%s" %s></div>',
            esc_attr( $atts['id'] ),
            esc_attr( $container_class ),
            esc_attr( $container_style ),
            implode( ' ', $data_attrs )
        );

        return $output;
    }

    /**
     * Register Gutenberg block
     */
    public function register_block() {
        // Check if Gutenberg is available
        if ( ! function_exists( 'register_block_type' ) ) {
            return;
        }

        // Register block script
        wp_register_script(
            'bonsai-planets-block',
            BONSAI_PLANETS_URL . 'dist/block.js',
            array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-editor' ),
            BONSAI_PLANETS_VERSION
        );

        // Register block style
        wp_register_style(
            'bonsai-planets-block-editor',
            BONSAI_PLANETS_URL . 'dist/block.css',
            array( 'wp-edit-blocks' ),
            BONSAI_PLANETS_VERSION
        );

        // Register block
        register_block_type( 'bonsai-planets/planet', array(
            'editor_script'   => 'bonsai-planets-block',
            'editor_style'    => 'bonsai-planets-block-editor',
            'render_callback' => array( $this, 'render_block' ),
            'attributes'      => array(
                'id'                 => array( 'type' => 'string', 'default' => '' ),
                'width'              => array( 'type' => 'string', 'default' => '100%' ),
                'height'             => array( 'type' => 'string', 'default' => '400px' ),
                'radius'             => array( 'type' => 'string', 'default' => '1.0' ),
                'resolution'         => array( 'type' => 'string', 'default' => '64' ),
                'seed'               => array( 'type' => 'string', 'default' => '' ),
                'waterLevel'         => array( 'type' => 'string', 'default' => '0.4' ),
                'hasAtmosphere'      => array( 'type' => 'boolean', 'default' => true ),
                'hasOcean'           => array( 'type' => 'boolean', 'default' => true ),
                'hasVegetation'      => array( 'type' => 'boolean', 'default' => true ),
                'waterColor'         => array( 'type' => 'string', 'default' => '#3399ff' ),
                'landColor'          => array( 'type' => 'string', 'default' => '#4d9a4d' ),
                'mountainColor'      => array( 'type' => 'string', 'default' => '#8c7853' ),
                'snowColor'          => array( 'type' => 'string', 'default' => '#ffffff' ),
                'atmosphereColor'    => array( 'type' => 'string', 'default' => '#88aaff' ),
                'minTreeHeight'      => array( 'type' => 'string', 'default' => '0.5' ),
                'maxTreeHeight'      => array( 'type' => 'string', 'default' => '0.8' ),
                'vegetationDensity'  => array( 'type' => 'string', 'default' => '0.5' ),
                'className'          => array( 'type' => 'string', 'default' => '' ),
            ),
        ) );
    }

    /**
     * Render Gutenberg block
     */
    public function render_block( $attributes ) {
        // Ensure we have a unique ID
        if ( empty( $attributes['id'] ) ) {
            $attributes['id'] = 'planet-' . uniqid();
        }

        // Ensure we have a random seed if none provided
        if ( empty( $attributes['seed'] ) ) {
            $attributes['seed'] = mt_rand( 1, 1000000 );
        }

        // Convert block attributes to shortcode attributes
        $shortcode_atts = array(
            'id'                 => $attributes['id'],
            'width'              => $attributes['width'],
            'height'             => $attributes['height'],
            'radius'             => $attributes['radius'],
            'resolution'         => $attributes['resolution'],
            'seed'               => $attributes['seed'],
            'water-level'        => $attributes['waterLevel'],
            'has-atmosphere'     => $attributes['hasAtmosphere'] ? 'true' : 'false',
            'has-ocean'          => $attributes['hasOcean'] ? 'true' : 'false',
            'has-vegetation'     => $attributes['hasVegetation'] ? 'true' : 'false',
            'water-color'        => $attributes['waterColor'],
            'land-color'         => $attributes['landColor'],
            'mountain-color'     => $attributes['mountainColor'],
            'snow-color'         => $attributes['snowColor'],
            'atmosphere-color'   => $attributes['atmosphereColor'],
            'min-tree-height'    => $attributes['minTreeHeight'],
            'max-tree-height'    => $attributes['maxTreeHeight'],
            'vegetation-density' => $attributes['vegetationDensity'],
            'class'              => $attributes['className'],
        );

        // Use the shortcode renderer
        return $this->planet_shortcode( $shortcode_atts );
    }
}

// Initialize the plugin
Bonsai_Planets::get_instance(); 
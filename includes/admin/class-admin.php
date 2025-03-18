<?php
/**
 * Admin functionality for Bonsai Planets WP
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Admin class
 */
class Bonsai_Planets_Admin {
    /**
     * Constructor
     */
    public function __construct() {
        // Register admin menu
        add_action('admin_menu', array($this, 'register_admin_menu'));
        
        // Register settings
        add_action('admin_init', array($this, 'register_settings'));
    }

    /**
     * Register admin menu
     */
    public function register_admin_menu() {
        add_menu_page(
            __('Bonsai Planets', 'bonsai-planets-wp'),
            __('Bonsai Planets', 'bonsai-planets-wp'),
            'manage_options',
            'bonsai-planets',
            array($this, 'render_admin_page'),
            'dashicons-admin-site',
            30
        );

        add_submenu_page(
            'bonsai-planets',
            __('Settings', 'bonsai-planets-wp'),
            __('Settings', 'bonsai-planets-wp'),
            'manage_options',
            'bonsai-planets-settings',
            array($this, 'render_settings_page')
        );
    }

    /**
     * Register settings
     */
    public function register_settings() {
        register_setting(
            'bonsai_planets_settings',
            'bonsai_planets_default_options',
            array(
                'type' => 'array',
                'sanitize_callback' => array($this, 'sanitize_options')
            )
        );

        add_settings_section(
            'bonsai_planets_main_section',
            __('Default Planet Options', 'bonsai-planets-wp'),
            array($this, 'render_main_section'),
            'bonsai_planets_settings'
        );

        // Register settings fields
        add_settings_field(
            'seed',
            __('Random Seed', 'bonsai-planets-wp'),
            array($this, 'render_number_field'),
            'bonsai_planets_settings',
            'bonsai_planets_main_section',
            array(
                'id' => 'seed',
                'label' => __('Random seed for planet generation', 'bonsai-planets-wp'),
                'min' => 0,
                'max' => 10000,
                'step' => 1
            )
        );

        add_settings_field(
            'radius',
            __('Planet Radius', 'bonsai-planets-wp'),
            array($this, 'render_number_field'),
            'bonsai_planets_settings',
            'bonsai_planets_main_section',
            array(
                'id' => 'radius',
                'label' => __('Radius of the planet (size)', 'bonsai-planets-wp'),
                'min' => 0.1,
                'max' => 10,
                'step' => 0.1
            )
        );

        add_settings_field(
            'resolution',
            __('Resolution', 'bonsai-planets-wp'),
            array($this, 'render_number_field'),
            'bonsai_planets_settings',
            'bonsai_planets_main_section',
            array(
                'id' => 'resolution',
                'label' => __('Geometry detail level (higher = more detailed)', 'bonsai-planets-wp'),
                'min' => 8,
                'max' => 64,
                'step' => 1
            )
        );

        add_settings_field(
            'water_level',
            __('Water Level', 'bonsai-planets-wp'),
            array($this, 'render_number_field'),
            'bonsai_planets_settings',
            'bonsai_planets_main_section',
            array(
                'id' => 'water_level',
                'label' => __('Water level threshold (0-1)', 'bonsai-planets-wp'),
                'min' => 0,
                'max' => 1,
                'step' => 0.05
            )
        );

        add_settings_field(
            'water_color',
            __('Water Color', 'bonsai-planets-wp'),
            array($this, 'render_color_field'),
            'bonsai_planets_settings',
            'bonsai_planets_main_section',
            array(
                'id' => 'water_color',
                'label' => __('Color of water', 'bonsai-planets-wp')
            )
        );

        add_settings_field(
            'land_color',
            __('Land Color', 'bonsai-planets-wp'),
            array($this, 'render_color_field'),
            'bonsai_planets_settings',
            'bonsai_planets_main_section',
            array(
                'id' => 'land_color',
                'label' => __('Color of land', 'bonsai-planets-wp')
            )
        );

        add_settings_field(
            'has_atmosphere',
            __('Atmosphere', 'bonsai-planets-wp'),
            array($this, 'render_checkbox_field'),
            'bonsai_planets_settings',
            'bonsai_planets_main_section',
            array(
                'id' => 'has_atmosphere',
                'label' => __('Enable atmospheric effect', 'bonsai-planets-wp')
            )
        );

        add_settings_field(
            'has_vegetation',
            __('Vegetation', 'bonsai-planets-wp'),
            array($this, 'render_checkbox_field'),
            'bonsai_planets_settings',
            'bonsai_planets_main_section',
            array(
                'id' => 'has_vegetation',
                'label' => __('Enable vegetation', 'bonsai-planets-wp')
            )
        );
    }

    /**
     * Sanitize options
     */
    public function sanitize_options($options) {
        return $options;
    }

    /**
     * Render main settings section
     */
    public function render_main_section() {
        echo '<p>' . __('Configure the default options for planets created with the shortcode or block.', 'bonsai-planets-wp') . '</p>';
    }

    /**
     * Render number field
     */
    public function render_number_field($args) {
        $options = get_option('bonsai_planets_default_options', array());
        $value = isset($options[$args['id']]) ? $options[$args['id']] : '';
        
        printf(
            '<input type="number" id="%1$s" name="bonsai_planets_default_options[%1$s]" value="%2$s" min="%3$s" max="%4$s" step="%5$s" />',
            esc_attr($args['id']),
            esc_attr($value),
            esc_attr($args['min']),
            esc_attr($args['max']),
            esc_attr($args['step'])
        );
        
        if (isset($args['label'])) {
            printf('<p class="description">%s</p>', esc_html($args['label']));
        }
    }

    /**
     * Render color field
     */
    public function render_color_field($args) {
        $options = get_option('bonsai_planets_default_options', array());
        $value = isset($options[$args['id']]) ? $options[$args['id']] : '';
        
        printf(
            '<input type="color" id="%1$s" name="bonsai_planets_default_options[%1$s]" value="%2$s" />',
            esc_attr($args['id']),
            esc_attr($value)
        );
        
        if (isset($args['label'])) {
            printf('<p class="description">%s</p>', esc_html($args['label']));
        }
    }

    /**
     * Render checkbox field
     */
    public function render_checkbox_field($args) {
        $options = get_option('bonsai_planets_default_options', array());
        $value = isset($options[$args['id']]) ? $options[$args['id']] : '';
        
        printf(
            '<input type="checkbox" id="%1$s" name="bonsai_planets_default_options[%1$s]" value="1" %2$s />',
            esc_attr($args['id']),
            checked($value, 1, false)
        );
        
        if (isset($args['label'])) {
            printf('<label for="%1$s" class="description">%2$s</label>', esc_attr($args['id']), esc_html($args['label']));
        }
    }

    /**
     * Render admin page
     */
    public function render_admin_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <div class="card">
                <h2><?php _e('Welcome to Bonsai Planets', 'bonsai-planets-wp'); ?></h2>
                <p><?php _e('Bonsai Planets allows you to create beautiful, interactive 3D planets that can be embedded anywhere in your WordPress site.', 'bonsai-planets-wp'); ?></p>
            </div>
            
            <div class="card">
                <h2><?php _e('Shortcode Usage', 'bonsai-planets-wp'); ?></h2>
                <p><?php _e('Use the shortcode <code>[bonsai_planet]</code> to add a planet to any post or page.', 'bonsai-planets-wp'); ?></p>
                <p><?php _e('Example with custom parameters:', 'bonsai-planets-wp'); ?></p>
                <pre>[bonsai_planet seed="123" radius="1.2" water_color="#0066aa" land_color="#336633" has_atmosphere="true"]</pre>
            </div>
            
            <div class="card">
                <h2><?php _e('Planet Preview', 'bonsai-planets-wp'); ?></h2>
                <p><?php _e('Here\'s a preview of your default planet configuration:', 'bonsai-planets-wp'); ?></p>
                <div id="bonsai-planet-preview" class="tiny-planets-container" style="height: 400px;"></div>
            </div>
        </div>
        <script>
            document.addEventListener('DOMContentLoaded', function() {
                if (window.TinyPlanets && window.TinyPlanets.init) {
                    window.TinyPlanets.init('#bonsai-planet-preview');
                }
            });
        </script>
        <?php
    }

    /**
     * Render settings page
     */
    public function render_settings_page() {
        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
            
            <form method="post" action="options.php">
                <?php
                settings_fields('bonsai_planets_settings');
                do_settings_sections('bonsai_planets_settings');
                submit_button();
                ?>
            </form>
        </div>
        <?php
    }
} 
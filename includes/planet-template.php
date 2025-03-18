<?php
/**
 * Template for the planet shortcode
 */
?>
<div id="planet-container-<?php echo esc_attr($id); ?>" class="planet-container" style="position: relative; width: <?php echo esc_attr($width); ?>; height: <?php echo esc_attr($height); ?>;">
    <canvas id="planet-canvas-<?php echo esc_attr($id); ?>" style="width: 100%; height: 100%;"></canvas>
    <div class="planet-controls" style="position: absolute; top: 10px; right: 10px; background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <h3 style="margin: 0 0 10px 0;">Controls</h3>
        <p style="margin: 5px 0;">Left Mouse: Rotate</p>
        <p style="margin: 5px 0;">Right Mouse: Pan</p>
        <p style="margin: 5px 0;">Scroll: Zoom</p>
        <p style="margin: 5px 0;">Space: Toggle Rotation</p>
    </div>
    <div class="planet-instructions" style="position: absolute; bottom: 10px; left: 10px; background: rgba(0,0,0,0.7); color: white; padding: 10px; border-radius: 5px; font-size: 14px;">
        <p style="margin: 5px 0;">Press 1-3 to switch presets</p>
        <p style="margin: 5px 0;">Click Random for new planet</p>
    </div>
</div>

<script type="module">
    document.addEventListener('DOMContentLoaded', function() {
        const container = document.getElementById('planet-container-<?php echo esc_attr($id); ?>');
        const canvas = document.getElementById('planet-canvas-<?php echo esc_attr($id); ?>');
        
        if (!container || !canvas) {
            console.error('Planet container or canvas not found');
            return;
        }

        // Initialize the planet
        try {
            const { initPlanet } = await import('<?php echo esc_url(plugin_dir_url(__FILE__) . '../assets/js/main-bundle.js'); ?>');
            initPlanet(canvas, {
                width: container.clientWidth,
                height: container.clientHeight,
                id: '<?php echo esc_attr($id); ?>'
            });
        } catch (error) {
            console.error('Failed to initialize planet:', error);
        }
    });
</script> 
<?php
/**
 * Planet container template
 *
 * @var array $atts Shortcode attributes
 */
?>
<div class="bonsai-planet-container" style="width: <?php echo esc_attr($atts['width']); ?>; height: <?php echo esc_attr($atts['height']); ?>;">
  <canvas id="<?php echo esc_attr($atts['id']); ?>" class="bonsai-planet-canvas"></canvas>
  
  <div class="bonsai-planet-controls">
    <h3>Planet Controls</h3>
    <button class="bonsai-planet-btn" data-planet-type="beach">Beach Planet</button>
    <button class="bonsai-planet-btn" data-planet-type="forest">Forest Planet</button>
    <button class="bonsai-planet-btn" data-planet-type="snow">Snow Forest Planet</button>
    <button class="bonsai-planet-btn" data-planet-type="random">Random Planet</button>
  </div>
  
  <div class="bonsai-planet-instructions">
    <h3>Ball Controls</h3>
    <p>WASD or Arrow Keys: Roll the ball (relative to camera view)</p>
    <p>Space: Jump (ball jumps away from planet)</p>
    <p>Mouse Wheel: Zoom in/out (closer = 10% size & micro-movement, farther = 200% size & faster)</p>
    <p>Click and Drag: Change camera angle around the ball</p>
    <p>R: Toggle planet auto-rotation</p>
    <p>1, 2, 3: Switch planet type</p>
    <p>Ctrl+D: Toggle debug ray visualization</p>
    <p><strong>New Features:</strong> Microscopic zoom level for extreme close-ups!</p>
  </div>
</div>

<script type="text/javascript">
  document.addEventListener('DOMContentLoaded', function() {
    // Initialize the planet once the DOM is fully loaded
    if (typeof initBonsaiPlanet === 'function') {
      initBonsaiPlanet('<?php echo esc_js($atts['id']); ?>');
    } else {
      console.error('Bonsai Planet script not loaded properly');
    }
  });
</script> 
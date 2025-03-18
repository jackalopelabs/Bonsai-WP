<div 
  class="bonsai-planet" 
  data-preset="<?php echo esc_attr($atts['preset']); ?>"
  data-autorotate="<?php echo esc_attr($atts['autorotate']); ?>"
  data-resolution="<?php echo esc_attr($atts['resolution']); ?>"
  style="width: <?php echo esc_attr($atts['width']); ?>; height: <?php echo esc_attr($atts['height']); ?>;">
  <canvas class="bonsai-planet-canvas"></canvas>
  
  <?php if ($atts['controls'] === 'true'): ?>
  <div class="bonsai-planet-controls">
    <button class="bonsai-planet-preset" data-preset="beach">Beach</button>
    <button class="bonsai-planet-preset" data-preset="forest">Forest</button>
    <button class="bonsai-planet-preset" data-preset="snowForest">Snow Forest</button>
    <button class="bonsai-planet-random">Random</button>
  </div>
  <?php endif; ?>
</div> 
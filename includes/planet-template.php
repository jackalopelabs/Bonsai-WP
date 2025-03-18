<?php
/**
 * Template for the planet shortcode
 * 
 * @var string $id The unique identifier for the planet container
 * @var string $width The width of the planet container
 * @var string $height The height of the planet container
 */

// Ensure variables are defined
$id = $id ?? 'bonsai-planet-' . uniqid();
$width = $width ?? '100%';
$height = $height ?? '500px';
?>
<div id="planet-container-<?php echo esc_attr($id); ?>" class="planet-container bonsai-planet-container" style="position: relative; width: <?php echo esc_attr($width); ?>; height: <?php echo esc_attr($height); ?>;">
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

        // Simple fallback renderer that doesn't depend on imports
        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.1, 1000);
        camera.position.z = 2.5;
        
        // Create a simple rotating sphere
        const geometry = new THREE.IcosahedronGeometry(1, 2);
        const material = new THREE.MeshNormalMaterial();
        const planet = new THREE.Mesh(geometry, material);
        scene.add(planet);
        
        function animate() {
            requestAnimationFrame(animate);
            planet.rotation.x += 0.005;
            planet.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        
        // Load Three.js and start animation
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.min.js';
        script.onload = animate;
        document.head.appendChild(script);
    });
</script> 
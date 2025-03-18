import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import '../styles/app.css';
import { biomePresets, planetPresets } from './worlds/presets';

// Initialize planets when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Find all planet containers
  const planetContainers = document.querySelectorAll('.bonsai-planet');
  
  // Initialize each planet
  planetContainers.forEach(container => {
    initPlanet(container as HTMLElement);
  });
});

/**
 * Initialize a single planet
 */
function initPlanet(container: HTMLElement) {
  // Get planet settings from data attributes
  const preset = container.dataset.preset || 'forest';
  const autoRotate = container.dataset.autorotate === 'true';
  
  // Get the canvas element
  const canvas = container.querySelector('.bonsai-planet-canvas') as HTMLCanvasElement;
  if (!canvas) return;
  
  // Create scene
  const scene = new THREE.Scene();
  
  // Create camera
  const camera = new THREE.PerspectiveCamera(
    70,
    container.clientWidth / container.clientHeight,
    0.01,
    30
  );
  camera.position.set(0, 0, 3);
  
  // Create renderer
  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true
  });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  
  // Add orbit controls
  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.enablePan = false;
  
  // Add lights
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(2, 1, 0);
  scene.add(light);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Create a simple sphere to start with
  const planetGeometry = new THREE.IcosahedronGeometry(1, 32);
  const planetMaterial = new THREE.MeshStandardMaterial({
    color: 0x22aa22,
    roughness: 0.8,
  });
  const planet = new THREE.Mesh(planetGeometry, planetMaterial);
  scene.add(planet);
  
  // Setup background stars
  setupStars(scene);
  
  // Handle resize
  const handleResize = () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  };
  
  window.addEventListener('resize', handleResize);
  
  // Animation loop
  let frameId: number;
  const animate = () => {
    frameId = requestAnimationFrame(animate);
    
    // Update controls
    controls.update();
    
    // Auto-rotate the planet if enabled
    if (autoRotate) {
      planet.rotation.y += 0.001;
    }
    
    // Render the scene
    renderer.render(scene, camera);
  };
  
  // Start animation
  animate();
  
  // Add event listeners to buttons
  setupButtonListeners(container, planet, preset);
}

/**
 * Setup star background
 */
function setupStars(scene: THREE.Scene) {
  // Create a geometry for the stars
  const starsGeometry = new THREE.BufferGeometry();
  const starsMaterial = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.02,
  });
  
  // Create random positions for stars
  const starsVertices: number[] = [];
  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 20;
    const y = (Math.random() - 0.5) * 20;
    const z = (Math.random() - 0.5) * 20;
    
    // Keep stars away from center where planet is
    if (Math.sqrt(x*x + y*y + z*z) < 2) continue;
    
    starsVertices.push(x, y, z);
  }
  
  // Add positions to geometry
  starsGeometry.setAttribute(
    'position',
    new THREE.Float32BufferAttribute(starsVertices, 3)
  );
  
  // Create the stars and add to scene
  const stars = new THREE.Points(starsGeometry, starsMaterial);
  scene.add(stars);
}

/**
 * Setup event listeners for the planet control buttons
 */
function setupButtonListeners(container: HTMLElement, planet: THREE.Mesh, currentPreset: string) {
  // Get all preset buttons
  const presetButtons = container.querySelectorAll('.bonsai-planet-preset');
  
  // Add click event listeners
  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const preset = (button as HTMLElement).dataset.preset;
      if (preset && planetPresets[preset]) {
        // Update the planet appearance based on the preset
        updatePlanetAppearance(planet, preset);
        
        // Update active button state
        presetButtons.forEach(btn => btn.classList.remove('bp-opacity-100'));
        button.classList.add('bp-opacity-100');
      }
    });
  });
  
  // Setup random button
  const randomButton = container.querySelector('.bonsai-planet-random');
  if (randomButton) {
    randomButton.addEventListener('click', () => {
      // Generate a random planet appearance
      generateRandomPlanet(planet);
    });
  }
  
  // Set initial planet appearance
  updatePlanetAppearance(planet, currentPreset);
}

/**
 * Update the planet's appearance based on a preset
 */
function updatePlanetAppearance(planet: THREE.Mesh, preset: string) {
  if (!planetPresets[preset]) return;
  
  const options = planetPresets[preset];
  const biome = options.biome;
  
  // For now just update the color to match the preset theme
  if (biome && biome.preset && biomePresets[biome.preset]) {
    const biomeOptions = biomePresets[biome.preset];
    
    // Get the middle color from the biome colors
    if (biomeOptions.colors && biomeOptions.colors.length > 0) {
      const middleColorIndex = Math.floor(biomeOptions.colors.length / 2);
      const color = biomeOptions.colors[middleColorIndex][1];
      
      if (planet.material instanceof THREE.MeshStandardMaterial) {
        planet.material.color.set(color);
      }
    }
  }
}

/**
 * Generate a random planet appearance
 */
function generateRandomPlanet(planet: THREE.Mesh) {
  // Create a random color
  const hue = Math.random();
  const saturation = 0.5 + Math.random() * 0.5;
  const lightness = 0.4 + Math.random() * 0.4;
  
  const color = new THREE.Color().setHSL(hue, saturation, lightness);
  
  // Apply the color to the planet
  if (planet.material instanceof THREE.MeshStandardMaterial) {
    planet.material.color.copy(color);
    planet.material.roughness = Math.random() * 0.7 + 0.3;
  }
}

// Define biome and planet presets
// In a real implementation, these would likely be imported from another file
// or possibly fetched from the server
// For now, we'll use some simple dummy presets
export const presets = {
  beach: {
    colors: [0xccaa00, 0xcc7700, 0x994400],
    seaColor: 0x00f2e5,
  },
  forest: {
    colors: [0x115512, 0x224411, 0x006622],
    seaColor: 0x0042a5,
  },
  snowForest: {
    colors: [0xffffff, 0xeeffff, 0xaaddff],
    seaColor: 0x8899cc,
  },
}; 
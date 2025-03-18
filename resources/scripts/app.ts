import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import '../styles/app.css';
import { biomePresets, planetPresets } from './worlds/presets';
import { Biome } from './worlds/biome';

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
  camera.position.set(0, 0, 2.5);
  
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
  controls.minDistance = 1.5;
  controls.maxDistance = 5;
  
  // Add lights
  const light = new THREE.DirectionalLight(0xffffff, 2);
  light.position.set(2, 1, 1).normalize();
  scene.add(light);
  
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);
  
  // Create planet group
  const planetGroup = new THREE.Group();
  scene.add(planetGroup);
  
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
      planetGroup.rotation.y += 0.001;
    }
    
    // Render the scene
    renderer.render(scene, camera);
  };
  
  // Start animation
  animate();
  
  // Generate initial planet
  const planet = generatePlanet(preset, container);
  planetGroup.add(planet);
  
  // Add event listeners to buttons
  setupButtonListeners(container, planetGroup, preset);
}

/**
 * Generate a planet with terrain and features
 */
function generatePlanet(preset: string, container: HTMLElement) {
  const planetGroup = new THREE.Group();
  
  // Get planet options
  const planetOptions = planetPresets[preset] || planetPresets.forest;
  const biomePreset = biomePresets[planetOptions.biome.preset] || biomePresets.forest;
  
  // Create biome
  const biome = new Biome(biomePreset);
  
  // Create detailed planet geometry
  const resolution = parseInt(container.dataset.resolution || '6', 10);
  const planetGeometry = new THREE.IcosahedronGeometry(1, resolution);
  
  // Create ground and water materials
  const groundMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.2,
    flatShading: true,
  });
  
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(biomePreset.seaColors?.[1]?.[1] || 0x0066ff),
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9,
  });
  
  // Clone geometry for water
  const waterGeometry = planetGeometry.clone();

  // Generate terrain
  generateTerrain(planetGeometry, biome);
  generateWater(waterGeometry);
  
  // Create meshes
  const groundMesh = new THREE.Mesh(planetGeometry, groundMaterial);
  const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
  waterMesh.scale.setScalar(1.01); // Slightly larger to avoid z-fighting
  
  // Add meshes to group
  planetGroup.add(groundMesh);
  planetGroup.add(waterMesh);
  
  // Add atmosphere
  const atmosphere = createAtmosphere(biomePreset);
  planetGroup.add(atmosphere);
  
  return planetGroup;
}

/**
 * Generate terrain with height and color based on noise
 */
function generateTerrain(geometry: THREE.BufferGeometry, biome: Biome) {
  // Get position attribute
  const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
  const positions = positionAttribute.array;
  
  // Create arrays for colors and modified positions
  const colors = new Float32Array(positions.length);
  const newPositions = new Float32Array(positions.length);
  
  // Create an array to store face info (for computing normals later)
  const faces = [];
  
  // Process vertices
  for (let i = 0; i < positions.length; i += 3) {
    // Get original position
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Create position vector
    const pos = new THREE.Vector3(x, y, z).normalize();
    
    // Get height from biome
    const height = biome.getHeight(pos);
    
    // Apply height to position
    newPositions[i] = pos.x * (1 + height);
    newPositions[i + 1] = pos.y * (1 + height);
    newPositions[i + 2] = pos.z * (1 + height);
    
    // Calculate normalized height for coloring
    // Map from min-max height to -1 to 1 range
    const normalizedHeight = (height - biome.min) / (biome.max - biome.min) * 2 - 1;
    
    // Calculate steepness (unused for now, could be used for more advanced coloring)
    const steepness = 0;
    
    // Get color from biome
    const color = biome.getColor(pos, normalizedHeight, steepness);
    
    // Set color
    colors[i] = color.r;
    colors[i + 1] = color.g;
    colors[i + 2] = color.b;
  }
  
  // Update geometry
  geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  
  // Compute vertex normals and update the geometry
  geometry.computeVertexNormals();
}

/**
 * Generate water sphere
 */
function generateWater(geometry: THREE.BufferGeometry) {
  // For water, we keep a perfect sphere but at a height just below the lowest terrain point
  const waterLevel = -0.02; // Adjust as needed
  
  // Get position attribute
  const positionAttribute = geometry.getAttribute('position') as THREE.BufferAttribute;
  const positions = positionAttribute.array;
  
  // Create array for modified positions
  const newPositions = new Float32Array(positions.length);
  
  // Process vertices
  for (let i = 0; i < positions.length; i += 3) {
    // Get original position
    const x = positions[i];
    const y = positions[i + 1];
    const z = positions[i + 2];
    
    // Create normalized position vector
    const pos = new THREE.Vector3(x, y, z).normalize();
    
    // Apply water level height
    newPositions[i] = pos.x * (1 + waterLevel);
    newPositions[i + 1] = pos.y * (1 + waterLevel);
    newPositions[i + 2] = pos.z * (1 + waterLevel);
  }
  
  // Update geometry
  geometry.setAttribute('position', new THREE.BufferAttribute(newPositions, 3));
  
  // Compute vertex normals and update the geometry
  geometry.computeVertexNormals();
}

/**
 * Create atmosphere effect
 */
function createAtmosphere(biomeOptions: any) {
  // Determine atmosphere color based on biome
  let atmosphereColor = new THREE.Color(0x88aaff);
  
  // Use sea color as a hint for atmosphere
  if (biomeOptions.seaColors && biomeOptions.seaColors.length > 0) {
    const seaColor = biomeOptions.seaColors[biomeOptions.seaColors.length - 1][1];
    atmosphereColor = new THREE.Color(seaColor);
    // Make it more transparent/lighter
    atmosphereColor.offsetHSL(0, -0.2, 0.2);
  }
  
  // Create geometry and material
  const geometry = new THREE.SphereGeometry(1.02, 32, 32);
  const material = new THREE.MeshBasicMaterial({
    color: atmosphereColor,
    transparent: true,
    opacity: 0.15,
    side: THREE.BackSide,
  });
  
  return new THREE.Mesh(geometry, material);
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
function setupButtonListeners(container: HTMLElement, planetGroup: THREE.Group, currentPreset: string) {
  // Get all preset buttons
  const presetButtons = container.querySelectorAll('.bonsai-planet-preset');
  
  // Add click event listeners
  presetButtons.forEach(button => {
    button.addEventListener('click', () => {
      const preset = (button as HTMLElement).dataset.preset;
      if (preset && planetPresets[preset]) {
        // Remove old planet
        while (planetGroup.children.length > 0) {
          const child = planetGroup.children[0];
          planetGroup.remove(child);
          if (child instanceof THREE.Mesh) {
            child.geometry.dispose();
            if (Array.isArray(child.material)) {
              child.material.forEach(m => m.dispose());
            } else {
              child.material.dispose();
            }
          }
        }
        
        // Create new planet
        const newPlanet = generatePlanet(preset, container);
        planetGroup.add(newPlanet);
        
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
      // Generate a random planet
      generateRandomPlanet(planetGroup, container);
    });
  }
}

/**
 * Generate a random planet
 */
function generateRandomPlanet(planetGroup: THREE.Group, container: HTMLElement) {
  // Remove old planet
  while (planetGroup.children.length > 0) {
    const child = planetGroup.children[0];
    planetGroup.remove(child);
    if (child instanceof THREE.Mesh) {
      child.geometry.dispose();
      if (Array.isArray(child.material)) {
        child.material.forEach(m => m.dispose());
      } else {
        child.material.dispose();
      }
    }
  }
  
  // Create randomized biome
  const randomBiome = createRandomBiome();
  
  // Create detailed planet geometry
  const resolution = parseInt(container.dataset.resolution || '6', 10);
  const planetGeometry = new THREE.IcosahedronGeometry(1, resolution);
  
  // Create ground and water materials
  const groundMaterial = new THREE.MeshStandardMaterial({
    vertexColors: true,
    roughness: 0.8,
    metalness: 0.2,
    flatShading: true,
  });
  
  const waterMaterial = new THREE.MeshStandardMaterial({
    color: new THREE.Color(randomBiome.seaColors?.[1]?.[1] || 0x0066ff),
    roughness: 0.2,
    metalness: 0.1,
    transparent: true,
    opacity: 0.9,
  });
  
  // Clone geometry for water
  const waterGeometry = planetGeometry.clone();

  // Generate terrain
  const biome = new Biome(randomBiome);
  generateTerrain(planetGeometry, biome);
  generateWater(waterGeometry);
  
  // Create meshes
  const groundMesh = new THREE.Mesh(planetGeometry, groundMaterial);
  const waterMesh = new THREE.Mesh(waterGeometry, waterMaterial);
  waterMesh.scale.setScalar(1.01); // Slightly larger to avoid z-fighting
  
  // Add meshes to group
  planetGroup.add(groundMesh);
  planetGroup.add(waterMesh);
  
  // Add atmosphere
  const atmosphere = createAtmosphere(randomBiome);
  planetGroup.add(atmosphere);
}

/**
 * Create a random biome configuration
 */
function createRandomBiome() {
  // Create a random hue for the planet
  const hue = Math.random();
  const waterHue = (hue + 0.5) % 1; // Complementary color for water
  
  // Generate ground colors
  const groundColors: [number, number][] = [];
  for (let i = -0.5; i <= 1.0; i += 0.5) {
    const colorHue = hue + (Math.random() * 0.1 - 0.05);
    const colorSat = 0.5 + Math.random() * 0.5;
    const colorLit = 0.3 + Math.random() * 0.3;
    
    const color = new THREE.Color().setHSL(colorHue, colorSat, colorLit);
    groundColors.push([i, color.getHex()]);
  }
  
  // Generate water colors
  const seaColors: [number, number][] = [];
  for (let i = -1; i <= -0.1; i += 0.45) {
    const colorHue = waterHue + (Math.random() * 0.1 - 0.05);
    const colorSat = 0.6 + Math.random() * 0.4;
    const colorLit = 0.2 + i * 0.1 + Math.random() * 0.2;
    
    const color = new THREE.Color().setHSL(colorHue, colorSat, colorLit);
    seaColors.push([i, color.getHex()]);
  }
  
  // Create biome options
  return {
    noise: {
      min: -0.05,
      max: 0.05,
      octaves: 2 + Math.floor(Math.random() * 4),
      lacunarity: 1.5 + Math.random() * 1.0,
      gain: {
        min: 0.1 + Math.random() * 0.2,
        max: 0.6 + Math.random() * 0.4,
        scale: 1 + Math.random() * 2,
      },
      warp: 0.1 + Math.random() * 0.5,
      scale: 0.8 + Math.random() * 0.4,
      power: 0.7 + Math.random() * 1.0,
    },
    
    colors: groundColors,
    
    seaColors: seaColors,
    seaNoise: {
      min: -0.005 - Math.random() * 0.005,
      max: 0.002 + Math.random() * 0.006,
      scale: 3 + Math.random() * 4,
    },
  };
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
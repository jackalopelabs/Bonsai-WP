import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Planet, PlanetOptions } from './worlds/planet';
import '../styles/app.css';

/**
 * Extract planet options from container data attributes
 */
function getPlanetOptionsFromContainer(container: HTMLElement): Partial<PlanetOptions> {
  const options: Partial<PlanetOptions> = {};
  
  // Parse numeric options
  if (container.dataset.radius) options.radius = parseFloat(container.dataset.radius);
  if (container.dataset.resolution) options.resolution = parseInt(container.dataset.resolution, 10);
  if (container.dataset.seed) options.seed = parseInt(container.dataset.seed, 10);
  if (container.dataset.waterLevel) options.waterLevel = parseFloat(container.dataset.waterLevel);
  if (container.dataset.minTreeHeight) options.minTreeHeight = parseFloat(container.dataset.minTreeHeight);
  if (container.dataset.maxTreeHeight) options.maxTreeHeight = parseFloat(container.dataset.maxTreeHeight);
  if (container.dataset.vegetationDensity) options.vegetationDensity = parseFloat(container.dataset.vegetationDensity);
  
  // Parse boolean options
  if (container.dataset.hasAtmosphere) options.hasAtmosphere = container.dataset.hasAtmosphere === 'true';
  if (container.dataset.hasOcean) options.hasOcean = container.dataset.hasOcean === 'true';
  if (container.dataset.hasVegetation) options.hasVegetation = container.dataset.hasVegetation === 'true';
  
  // Parse color options
  if (container.dataset.waterColor) options.waterColor = new THREE.Color(container.dataset.waterColor);
  if (container.dataset.landColor) options.landColor = new THREE.Color(container.dataset.landColor);
  if (container.dataset.mountainColor) options.mountainColor = new THREE.Color(container.dataset.mountainColor);
  if (container.dataset.snowColor) options.snowColor = new THREE.Color(container.dataset.snowColor);
  if (container.dataset.atmosphereColor) options.atmosphereColor = new THREE.Color(container.dataset.atmosphereColor);
  
  return options;
}

/**
 * TinyPlanets class - Main entry point for the WordPress plugin
 */
export class TinyPlanets {
  // DOM elements
  private container: HTMLElement;
  
  // Three.js objects
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private planet?: Planet;
  
  // Animation
  private animationId?: number;
  private clock: THREE.Clock;
  
  /**
   * Create a new TinyPlanets instance
   * @param container - DOM element to render into
   * @param options - Planet configuration options
   */
  constructor(container: HTMLElement, options: Partial<PlanetOptions> = {}) {
    this.container = container;
    this.clock = new THREE.Clock();
    
    // Add loading indicator
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'bp-planet-loading';
    container.appendChild(loadingIndicator);
    
    // Initialize Three.js
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60, // Field of view
      container.clientWidth / container.clientHeight, // Aspect ratio
      0.1, // Near plane
      1000 // Far plane
    );
    
    // Position camera
    this.camera.position.set(0, 0, 3);
    
    // Create renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.renderer.outputEncoding = THREE.sRGBEncoding;
    this.renderer.shadowMap.enabled = true;
    
    // Add renderer to container
    container.appendChild(this.renderer.domElement);
    
    // Create controls
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.minDistance = 1.5;
    this.controls.maxDistance = 10;
    
    // Create lights
    this.createLights();
    
    // Create planet
    this.createPlanet(options);
    
    // Setup background stars
    this.setupStars();
    
    // Start animation loop
    this.animate();
    
    // Remove loading indicator
    container.removeChild(loadingIndicator);
    
    // Handle window resize
    window.addEventListener('resize', this.onWindowResize.bind(this));
  }
  
  /**
   * Create lights for the scene
   */
  private createLights(): void {
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
    this.scene.add(ambientLight);
    
    // Add directional light (sun)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 3, 5);
    directionalLight.castShadow = true;
    
    // Configure shadow properties
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 20;
    directionalLight.shadow.camera.left = -5;
    directionalLight.shadow.camera.right = 5;
    directionalLight.shadow.camera.top = 5;
    directionalLight.shadow.camera.bottom = -5;
    directionalLight.shadow.bias = -0.0001;
    
    this.scene.add(directionalLight);
  }
  
  /**
   * Create a planet with the given options
   * @param options - Planet configuration options
   */
  private createPlanet(options: Partial<PlanetOptions> = {}): void {
    // Remove existing planet if any
    if (this.planet) {
      this.planet.removeFromScene(this.scene);
      this.planet.dispose();
    }
    
    // Create new planet
    this.planet = new Planet(options);
    
    // Add planet to scene
    this.planet.addToScene(this.scene);
  }
  
  /**
   * Setup star background
   */
  private setupStars(): void {
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
    this.scene.add(stars);
  }
  
  /**
   * Handle window resize
   */
  private onWindowResize(): void {
    // Update camera aspect ratio
    this.camera.aspect = this.container.clientWidth / this.container.clientHeight;
    this.camera.updateProjectionMatrix();
    
    // Update renderer size
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
  }
  
  /**
   * Animation loop
   */
  private animate(): void {
    this.animationId = requestAnimationFrame(this.animate.bind(this));
    
    // Update controls
    this.controls.update();
    
    // Update planet
    const deltaTime = this.clock.getDelta();
    if (this.planet) {
      this.planet.update(deltaTime);
    }
    
    // Render scene
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * Resize the renderer
   * @param width - New width
   * @param height - New height
   */
  resize(width: number, height: number): void {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }
  
  /**
   * Regenerate the planet with new options
   * @param options - New planet options
   */
  regenerate(options: Partial<PlanetOptions> = {}): void {
    this.createPlanet(options);
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    // Stop animation loop
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    // Remove event listeners
    window.removeEventListener('resize', this.onWindowResize.bind(this));
    
    // Dispose of planet
    if (this.planet) {
      this.planet.removeFromScene(this.scene);
      this.planet.dispose();
    }
    
    // Dispose of renderer
    this.renderer.dispose();
    
    // Remove renderer from DOM
    if (this.renderer.domElement.parentNode) {
      this.renderer.domElement.parentNode.removeChild(this.renderer.domElement);
    }
  }
}

// Make TinyPlanets available globally for WordPress
if (typeof window !== 'undefined') {
  (window as any).BonsaiPlanets = {
    TinyPlanets
  };
}

/**
 * Initialize Bonsai Planets on all containers when the DOM is loaded
 */
document.addEventListener('DOMContentLoaded', () => {
  // Find all containers with the class 'bp-planet-container'
  const containers = document.querySelectorAll<HTMLElement>('.bp-planet-container');
  
  // Create a TinyPlanets instance for each container
  containers.forEach(container => {
    new TinyPlanets(container, getPlanetOptionsFromContainer(container));
  });
}); 
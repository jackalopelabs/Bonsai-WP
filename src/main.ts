import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import Alpine from 'alpinejs';

// Use local imports within the plugin
import { Planet } from './worlds/planet';
import { Stars } from './worlds/stars';
import { planetPresets } from './worlds/presets';

// Initialize Alpine.js
window.Alpine = Alpine;
Alpine.start();

// Global reference to initialized planets
const initializedPlanets = new Map();

/**
 * Initialize a bonsai planet in a container
 * @param {string} canvasId - The ID of the canvas element
 */
export function initBonsaiPlanet(canvasId: string) {
  const canvas = document.getElementById(canvasId) as HTMLCanvasElement;
  if (!canvas) {
    console.error(`Canvas with ID ${canvasId} not found`);
    return;
  }

  const container = canvas.closest('.bonsai-planet-container') as HTMLElement;
  if (!container) {
    console.error('Could not find parent container');
    return;
  }

  // Get container dimensions
  const width = container.clientWidth;
  const height = container.clientHeight;

  // Set up Three.js scene
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(70, width / height, 0.001, 30);
  camera.position.set(0, 1.1, 2.5);
  camera.up.set(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    canvas,
    alpha: true,
  });

  renderer.setSize(width, height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.minDistance = 0.05;
  controls.maxDistance = 5;
  controls.enableDamping = true;
  controls.dampingFactor = 0.1;
  controls.enableRotate = true;
  controls.enabled = true;
  controls.zoomSpeed = 0.5;
  controls.target.set(0, 1.1, 0);

  // Set up basic planet mesh
  const sphereGeometry = new THREE.IcosahedronGeometry(1, 20);
  const sphereMaterial = new THREE.MeshStandardMaterial({
    color: 'white',
    wireframe: true,
    wireframeLinewidth: 10,
  });
  let planetMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  scene.add(planetMesh);

  // Add lighting
  const light = new THREE.DirectionalLight();
  light.intensity = 3;
  light.position.set(2, 2, 1);
  scene.add(light);
  light.castShadow = true;
  light.shadow.mapSize.width = 1024;
  light.shadow.mapSize.height = 1024;
  light.shadow.camera.far = 10;
  light.shadow.camera.near = 0.1;
  light.shadow.bias = 0.001;
  light.shadow.normalBias = 0.02;
  light.shadow.camera.top = 2;
  light.shadow.camera.right = 2;
  light.shadow.camera.bottom = -2;
  light.shadow.camera.left = -2;

  // Add secondary light
  const secondaryLight = new THREE.DirectionalLight(0xffffcc, 1);
  secondaryLight.position.set(-1, 0.5, -1);
  scene.add(secondaryLight);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
  scene.add(ambientLight);

  // Add stars
  const stars = new Stars();
  scene.add(stars);

  // Character variables
  let character: THREE.Object3D | null = null;
  let characterPosition = new THREE.Vector3(0, 1.1, 0);
  let isJumping = false;
  let moveDirection = new THREE.Vector3(0, 0, 0);
  const lastMoveDirection = new THREE.Vector3(0, 0, 1);
  const BASE_MOVE_SPEED = 0.02;
  const MIN_MOVE_SPEED = 0.0005;
  let MOVE_SPEED = BASE_MOVE_SPEED;
  const BASE_CHARACTER_SIZE = 0.05;
  const MAX_CHARACTER_SIZE = 0.1;
  const MIN_CHARACTER_SIZE = 0.005;
  let characterRotation = new THREE.Quaternion();
  let animationTime = 0;
  let hasPlanet = false;
  let rotate = false;
  let total = 0;
  let lastDelta = 0;

  // Create FPS counter
  const fpsCounter = document.createElement('div');
  fpsCounter.className = 'bonsai-fps-counter';
  container.appendChild(fpsCounter);

  // FPS calculation variables
  let frameCount = 0;
  let lastFpsUpdateTime = 0;
  let currentFps = 0;

  // Function to create a planet
  async function createPlanet(preset: string | undefined = undefined) {
    if (!preset) {
      preset = ['beach', 'forest', 'snowForest'][Math.floor(Math.random() * 3)];
    }

    // Save character state
    const hadCharacter = character !== null;
    
    console.log("Creating planet with preset:", preset);
    console.time("planet");
    const planet = new Planet({
      detail: 60,
      ...planetPresets[preset],
    });
    
    try {
      let mesh = await planet.create();
      scene.remove(planetMesh);
      scene.add(mesh);
      planetMesh = mesh;
      
      // Center the planet at the origin
      planetMesh.position.set(0, 0, 0);
      
      // Create character or restore it
      if (!hadCharacter) {
        createCharacter();
      } else {
        // Reset character position to start point above planet surface
        characterPosition = new THREE.Vector3(0, 1.1, 0);
        if (character) {
          character.position.copy(characterPosition);
          // Reset character rotation
          characterRotation = new THREE.Quaternion();
          moveDirection = new THREE.Vector3(0, 0, 0);
          isJumping = false;
        }
      }
      
      // Force terrain detection on the new planet after a small delay
      setTimeout(() => {
        if (character && planetMesh) {
          // Calculate current character size
          const camDistance = camera.position.distanceTo(characterPosition);
          let zoomFactor = Math.min(Math.max((camDistance - controls.minDistance) / (controls.maxDistance - controls.minDistance), 0), 1);
          zoomFactor = Math.pow(zoomFactor, 0.7);
          const currentSize = MIN_CHARACTER_SIZE + (MAX_CHARACTER_SIZE - MIN_CHARACTER_SIZE) * zoomFactor;
          
          // Cast a ray down from the character to find terrain
          const raycaster = new THREE.Raycaster();
          const rayStart = new THREE.Vector3(0, 1.5, 0);
          const rayDirection = new THREE.Vector3(0, -1, 0);
          
          raycaster.set(rayStart, rayDirection);
          const intersects = raycaster.intersectObject(planetMesh, false);
          
          if (intersects.length > 0) {
            // Position character on detected terrain
            const hitPoint = intersects[0].point;
            characterPosition = hitPoint.clone().add(new THREE.Vector3(0, currentSize, 0));
            character.position.copy(characterPosition);
            
            // Update orbit controls target
            controls.target.copy(characterPosition);
          }
        }
      }, 500);
      
      // Manually add models to the planet if needed
      if (mesh.children.length < 3) {
        await planet.addManualModels(mesh);
      }
      
      console.timeEnd("planet");
    } catch (error) {
      console.error("Error creating planet:", error);
      // Create a fallback planet if there's an error
      const geometry = new THREE.IcosahedronGeometry(1, 4);
      const material = new THREE.MeshStandardMaterial({ 
        color: preset === "beach" ? 0x66aaff : preset === "forest" ? 0x33aa66 : 0xeeeeff,
        roughness: 0.8
      });
      const fallbackMesh = new THREE.Mesh(geometry, material);
      scene.remove(planetMesh);
      scene.add(fallbackMesh);
      planetMesh = fallbackMesh;
      console.timeEnd("planet");
    }
  }

  // Character creation logic (simplified for now)
  async function createCharacter() {
    if (character) {
      scene.remove(character);
    }
    
    // Create a basic character placeholder (simplified from original)
    character = new THREE.Group();
    
    // Create bunny body
    const bodyGeometry = new THREE.CylinderGeometry(BASE_CHARACTER_SIZE * 0.5, BASE_CHARACTER_SIZE * 0.6, BASE_CHARACTER_SIZE * 1.2, 8);
    const bodyMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5,
      roughness: 0.7,
      metalness: 0.1
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.name = "body";
    body.position.set(0, 0, 0);
    body.rotation.x = Math.PI / 2;
    body.castShadow = true;
    body.receiveShadow = true;
    character.add(body);
    
    // Create bunny head
    const headGeometry = new THREE.SphereGeometry(BASE_CHARACTER_SIZE * 0.5, 8, 6);
    const headMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xf5f5f5,
      roughness: 0.7,
      metalness: 0.1
    });
    const head = new THREE.Mesh(headGeometry, headMaterial);
    head.name = "head";
    head.position.set(0, BASE_CHARACTER_SIZE * 0.7, BASE_CHARACTER_SIZE * 0.6);
    head.scale.set(0.9, 0.8, 1);
    head.castShadow = true;
    head.receiveShadow = true;
    character.add(head);
    
    // Add ears
    const earGeometry = new THREE.ConeGeometry(BASE_CHARACTER_SIZE * 0.15, BASE_CHARACTER_SIZE * 1, 5);
    const earMaterial = new THREE.MeshStandardMaterial({ 
      color: 0xe0e0e0,
      roughness: 0.7,
      metalness: 0.1
    });
    
    const leftEar = new THREE.Mesh(earGeometry, earMaterial);
    leftEar.name = "leftEar";
    leftEar.position.set(-BASE_CHARACTER_SIZE * 0.25, BASE_CHARACTER_SIZE * 1.2, BASE_CHARACTER_SIZE * 0.6);
    leftEar.rotation.z = Math.PI / 12;
    leftEar.castShadow = true;
    leftEar.receiveShadow = true;
    character.add(leftEar);
    
    const rightEar = new THREE.Mesh(earGeometry, earMaterial);
    rightEar.name = "rightEar";
    rightEar.position.set(BASE_CHARACTER_SIZE * 0.25, BASE_CHARACTER_SIZE * 1.2, BASE_CHARACTER_SIZE * 0.6);
    rightEar.rotation.z = -Math.PI / 12;
    rightEar.castShadow = true;
    rightEar.receiveShadow = true;
    character.add(rightEar);
    
    // Position character
    characterPosition = new THREE.Vector3(0, 1.1, 0);
    character.position.copy(characterPosition);
    
    // Reset character state
    characterRotation = new THREE.Quaternion();
    moveDirection = new THREE.Vector3(0, 0, 0);
    isJumping = false;
    
    // Add to scene
    scene.add(character);
    
    // Update controls target
    controls.target.copy(characterPosition);
  }

  // Animation loop
  renderer.setAnimationLoop((delta) => {
    // Update FPS counter
    frameCount++;
    const now = performance.now();
    if (now - lastFpsUpdateTime > 1000) {
      currentFps = Math.round((frameCount * 1000) / (now - lastFpsUpdateTime));
      fpsCounter.textContent = `FPS: ${currentFps}`;
      frameCount = 0;
      lastFpsUpdateTime = now;
    }

    renderer.render(scene, camera);

    if (rotate) planetMesh.rotation.y += 0.001;

    if (lastDelta > 0) {
      total += delta - lastDelta;
      animationTime += delta;
    }
    lastDelta = delta;

    // Animate water level with a subtle sine wave if it exists
    if (planetMesh && planetMesh.children.length > 0) {
      const oceanMesh = planetMesh.children[0] as THREE.Mesh;
      if (oceanMesh.morphTargetInfluences && oceanMesh.morphTargetInfluences.length > 0) {
        oceanMesh.morphTargetInfluences[0] = Math.sin(total * 0.0003) * 0.3 + 0.3;
      }
      
      // Update caustics material if it exists
      if (oceanMesh.material && (oceanMesh.material as any).update) {
        (oceanMesh.material as any).update();
      }
    }

    if (!hasPlanet) {
      createPlanet("beach");
      hasPlanet = true;
    }
    
    // Update controls
    controls.update();
  });

  // Handle button clicks
  const buttons = container.querySelectorAll('.bonsai-planet-btn');
  buttons.forEach(button => {
    button.addEventListener('click', () => {
      const planetType = button.getAttribute('data-planet-type');
      if (planetType === 'random') {
        const presets = ['beach', 'forest', 'snowForest'];
        createPlanet(presets[Math.floor(Math.random() * presets.length)]);
      } else if (planetType) {
        createPlanet(planetType);
      }
    });
  });

  // Handle window resize
  const handleResize = () => {
    const newWidth = container.clientWidth;
    const newHeight = container.clientHeight;
    
    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();
    
    renderer.setSize(newWidth, newHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
  };

  window.addEventListener('resize', handleResize);

  // Store instance for cleanup
  initializedPlanets.set(canvasId, {
    cleanup: () => {
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      renderer.setAnimationLoop(null);
    }
  });

  return {
    scene,
    camera,
    renderer,
    controls,
    createPlanet
  };
}

// Expose to global scope for WordPress
window.initBonsaiPlanet = initBonsaiPlanet; 
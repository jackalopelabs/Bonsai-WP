// TypeScript declarations for global interfaces
import * as THREE from 'three';

// Extend Window interface to allow our global functions and properties
interface Window {
  Alpine: any;
  initBonsaiPlanet: (canvasId: string) => any;
}

// Define types for our modules instead of using ambient module declarations
interface PlanetOptions {
  detail: number;
  [key: string]: any;
}

interface PlanetClass {
  new(options: PlanetOptions): {
    create(): Promise<THREE.Mesh>;
    addManualModels(mesh: THREE.Mesh): Promise<void>;
  };
}

interface StarsClass {
  new(): THREE.Object3D;
}

interface PlanetPresets {
  [key: string]: any;
}

// Define module augmentations for custom modules
declare global {
  // These are global module augmentations instead of relative imports
  const Planet: PlanetClass;
  const Stars: StarsClass;
  const planetPresets: PlanetPresets;
}

// For Alpine.js
declare module 'alpinejs' {
  const Alpine: any;
  export default Alpine;
} 
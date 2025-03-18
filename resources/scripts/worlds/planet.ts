import * as THREE from 'three';
import { UberNoise } from './helper/noise';
import { Octree } from './helper/octree';
import { loadModels, getModelPathsAndMaterials } from './models';
import { createAtmosphereMaterial } from './materials/AtmosphereMaterial';
import { PlanetMaterialWithCaustics } from './materials/OceanCausticsMaterial';

/**
 * Biome types for planet surface
 */
export enum BiomeType {
  OCEAN = 'ocean',
  BEACH = 'beach',
  DESERT = 'desert',
  GRASSLAND = 'grassland',
  FOREST = 'forest',
  MOUNTAINS = 'mountains',
  SNOW = 'snow',
  TUNDRA = 'tundra',
  RAINFOREST = 'rainforest',
  SAVANNA = 'savanna',
  SWAMP = 'swamp'
}

/**
 * Planet options for configuration
 */
export interface PlanetOptions {
  radius: number;
  resolution: number;
  seed: number;
  waterLevel: number;
  hasAtmosphere: boolean;
  hasOcean: boolean;
  hasVegetation: boolean;
  waterColor: THREE.Color;
  landColor: THREE.Color;
  mountainColor: THREE.Color;
  snowColor: THREE.Color;
  atmosphereColor: THREE.Color;
  minTreeHeight: number;
  maxTreeHeight: number;
  vegetationDensity: number;
}

/**
 * Default planet options
 */
export const DEFAULT_PLANET_OPTIONS: PlanetOptions = {
  radius: 1.0,
  resolution: 64,
  seed: Math.floor(Math.random() * 1000000),
  waterLevel: 0.4,
  hasAtmosphere: true,
  hasOcean: true,
  hasVegetation: true,
  waterColor: new THREE.Color(0x3399ff),
  landColor: new THREE.Color(0x4d9a4d),
  mountainColor: new THREE.Color(0x8c7853),
  snowColor: new THREE.Color(0xffffff),
  atmosphereColor: new THREE.Color(0x88aaff),
  minTreeHeight: 0.5,
  maxTreeHeight: 0.8,
  vegetationDensity: 0.5
};

/**
 * Class representing a procedurally generated planet
 */
export class Planet {
  options: PlanetOptions;
  noise: UberNoise;
  geometry: THREE.BufferGeometry;
  mesh: THREE.Mesh;
  oceanMesh?: THREE.Mesh;
  atmosphereMesh?: THREE.Mesh;
  vegetationGroup?: THREE.Group;
  octree?: Octree;
  biomeData: Map<number, { biome: BiomeType, temperature: number, moisture: number }>;
  
  /**
   * Create a new planet instance
   * @param options - Planet configuration options
   */
  constructor(options: Partial<PlanetOptions> = {}) {
    this.options = { ...DEFAULT_PLANET_OPTIONS, ...options };
    this.biomeData = new Map();
    
    // Initialize noise generator
    this.noise = new UberNoise(this.options.seed, {
      scale: 1.0,
      octaves: 6,
      persistence: 0.5
    });
    
    // Create planet geometry
    this.geometry = this.createPlanetGeometry();
    
    // Create planet mesh
    const material = new THREE.MeshStandardMaterial({
      vertexColors: true,
      roughness: 0.8,
      metalness: 0.1
    });
    
    this.mesh = new THREE.Mesh(this.geometry, material);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Create ocean if enabled
    if (this.options.hasOcean) {
      this.createOcean();
    }
    
    // Create atmosphere if enabled
    if (this.options.hasAtmosphere) {
      this.createAtmosphere();
    }
    
    // Create vegetation if enabled
    if (this.options.hasVegetation) {
      this.createVegetation();
    }
  }
  
  /**
   * Create the planet geometry with terrain features
   */
  private createPlanetGeometry(): THREE.BufferGeometry {
    // Create base icosahedron geometry
    const baseGeometry = new THREE.IcosahedronGeometry(
      this.options.radius, 
      this.options.resolution
    );
    
    const geometry = new THREE.BufferGeometry();
    const positionAttribute = baseGeometry.getAttribute('position');
    const positions = new Float32Array(positionAttribute.array.length);
    const colors = new Float32Array(positionAttribute.array.length);
    const normals = new Float32Array(positionAttribute.array.length);
    
    // Generate heightmap and colors for each vertex
    for (let i = 0; i < positionAttribute.count; i++) {
      const index = i * 3;
      
      // Get original vertex position
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      
      // Normalize to get unit vector from center to vertex
      const pos = new THREE.Vector3(x, y, z).normalize();
      
      // Get elevation noise
      const elevation = this.getElevation(pos);
      
      // Get biome data
      const { biome, temperature, moisture } = this.getBiomeData(pos, elevation);
      
      // Store biome data for later use
      this.biomeData.set(i, { biome, temperature, moisture });
      
      // Get color based on biome
      const color = this.getBiomeColor(biome, elevation, temperature, moisture);
      
      // Apply elevation to position
      const finalRadius = this.options.radius * (1.0 + elevation);
      positions[index] = pos.x * finalRadius;
      positions[index + 1] = pos.y * finalRadius;
      positions[index + 2] = pos.z * finalRadius;
      
      // Store color
      colors[index] = color.r;
      colors[index + 1] = color.g;
      colors[index + 2] = color.b;
      
      // Calculate normal (just use the normalized position for a sphere)
      normals[index] = pos.x;
      normals[index + 1] = pos.y;
      normals[index + 2] = pos.z;
    }
    
    // Set attributes on the geometry
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3));
    
    // Copy face indices from base geometry
    geometry.setIndex(baseGeometry.getIndex());
    
    // Compute vertex normals again for more accurate lighting
    geometry.computeVertexNormals();
    
    return geometry;
  }
  
  /**
   * Create ocean mesh for the planet
   */
  private createOcean(): void {
    // Create ocean geometry (slightly larger than water level)
    const oceanGeometry = new THREE.IcosahedronGeometry(
      this.options.radius * (1.0 + this.options.waterLevel * 0.97),
      Math.max(2, this.options.resolution - 1) // Slightly lower resolution for ocean
    );
    
    // Create ocean material with caustics
    const oceanMaterial = new PlanetMaterialWithCaustics({
      color: this.options.waterColor,
      transparent: true,
      opacity: 0.8,
      roughness: 0.1,
      metalness: 0.2,
      causticStrength: 0.3,
      causticScale: 10.0
    });
    
    // Create ocean mesh
    this.oceanMesh = new THREE.Mesh(oceanGeometry, oceanMaterial);
    this.oceanMesh.castShadow = false;
    this.oceanMesh.receiveShadow = true;
  }
  
  /**
   * Create atmosphere mesh for the planet
   */
  private createAtmosphere(): void {
    // Create atmosphere geometry (larger than planet)
    const atmosphereGeometry = new THREE.IcosahedronGeometry(
      this.options.radius * 1.25, // 25% larger than planet
      Math.max(2, this.options.resolution - 2) // Lower resolution for atmosphere
    );
    
    // Create atmosphere material
    const atmosphereMaterial = createAtmosphereMaterial(this.options.atmosphereColor);
    
    // Create atmosphere mesh
    this.atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
  }
  
  /**
   * Create vegetation for the planet
   */
  private createVegetation(): void {
    // Create a group to hold all vegetation
    this.vegetationGroup = new THREE.Group();
    
    // Create an octree for vegetation placement
    this.octree = new Octree(
      new THREE.Vector3(0, 0, 0), 
      this.options.radius * 2.5
    );
    
    // We'll implement vegetation placement in a separate method
    // This will be populated with models using the functions from models.ts
  }
  
  /**
   * Get elevation for a point on the planet
   * @param position - Normalized position vector on unit sphere
   * @returns Elevation value between -0.1 and 1.0
   */
  private getElevation(position: THREE.Vector3): number {
    // Get base noise values
    const terrainNoise = this.noise.getTerrainNoise(position, {
      continentScale: 0.5,
      mountainScale: 1.0,
      hillScale: 2.0
    });
    
    // Apply adjustments to create varied terrain
    let elevation = terrainNoise;
    
    // Make oceans deeper
    if (elevation < this.options.waterLevel) {
      elevation = this.options.waterLevel - 
        Math.pow(this.options.waterLevel - elevation, 1.2) * 0.1;
    }
    
    // Apply additional noise for small details
    const detailNoise = this.noise.getFractalNoiseFromVector(
      position,
      2, // Fewer octaves for detail
      0.5,
      8.0 // Higher frequency
    ) * 0.05; // Small influence
    
    elevation += detailNoise;
    
    return elevation;
  }
  
  /**
   * Get biome data for a point on the planet
   * @param position - Normalized position vector on unit sphere
   * @param elevation - Elevation value at the position
   * @returns Object with biome type, temperature, and moisture
   */
  private getBiomeData(
    position: THREE.Vector3, 
    elevation: number
  ): { biome: BiomeType, temperature: number, moisture: number } {
    // Get biome noise for temperature and moisture
    const { temperature, moisture } = this.noise.getBiomeNoise(position);
    
    // Adjust temperature based on elevation (higher = colder)
    const adjustedTemperature = temperature - (elevation > this.options.waterLevel ? 
      (elevation - this.options.waterLevel) * 0.7 : 0);
    
    // Determine biome type based on elevation, temperature and moisture
    let biome: BiomeType;
    
    if (elevation <= this.options.waterLevel) {
      biome = BiomeType.OCEAN;
    } else if (elevation < this.options.waterLevel + 0.01) {
      biome = BiomeType.BEACH;
    } else if (adjustedTemperature > 0.7) {
      if (moisture < 0.3) {
        biome = BiomeType.DESERT;
      } else if (moisture < 0.6) {
        biome = BiomeType.SAVANNA;
      } else {
        biome = BiomeType.RAINFOREST;
      }
    } else if (adjustedTemperature > 0.4) {
      if (moisture < 0.3) {
        biome = BiomeType.GRASSLAND;
      } else if (moisture < 0.7) {
        biome = BiomeType.FOREST;
      } else {
        biome = BiomeType.SWAMP;
      }
    } else if (adjustedTemperature > 0.2) {
      if (moisture < 0.5) {
        biome = BiomeType.GRASSLAND;
      } else {
        biome = BiomeType.FOREST;
      }
    } else {
      if (elevation > 0.7) {
        biome = BiomeType.SNOW;
      } else if (moisture < 0.4) {
        biome = BiomeType.TUNDRA;
      } else {
        biome = BiomeType.MOUNTAINS;
      }
    }
    
    return { biome, temperature: adjustedTemperature, moisture };
  }
  
  /**
   * Get color for a biome
   * @param biome - Biome type
   * @param elevation - Elevation value
   * @param temperature - Temperature value
   * @param moisture - Moisture value
   * @returns THREE.Color object
   */
  private getBiomeColor(
    biome: BiomeType, 
    elevation: number, 
    temperature: number, 
    moisture: number
  ): THREE.Color {
    const color = new THREE.Color();
    
    switch (biome) {
      case BiomeType.OCEAN:
        // Ocean color (handled by separate mesh)
        color.copy(this.options.waterColor).multiplyScalar(0.7);
        break;
        
      case BiomeType.BEACH:
        // Sandy beach
        color.set(0xe0d8a8);
        break;
        
      case BiomeType.DESERT:
        // Desert - varies from yellow to red based on temperature
        color.set(0xe6c178).lerp(new THREE.Color(0xb2824d), temperature - 0.7);
        break;
        
      case BiomeType.GRASSLAND:
        // Grassland - varies from light to dark green based on moisture
        color.set(0xbfd064).lerp(new THREE.Color(0x82a854), moisture);
        break;
        
      case BiomeType.FOREST:
        // Forest - varies from light to dark based on moisture
        color.set(0x4a873d).lerp(new THREE.Color(0x1e5631), moisture);
        break;
        
      case BiomeType.MOUNTAINS:
        // Mountains - mix of gray and brown
        const mountainHeight = (elevation - this.options.waterLevel) / (1.0 - this.options.waterLevel);
        color.copy(this.options.mountainColor).lerp(new THREE.Color(0x6b6b6b), mountainHeight);
        break;
        
      case BiomeType.SNOW:
        // Snow - white with a hint of blue
        color.copy(this.options.snowColor).lerp(new THREE.Color(0xd5f0ff), moisture);
        break;
        
      case BiomeType.TUNDRA:
        // Tundra - mix of light brown and gray
        color.set(0xa09a80).lerp(new THREE.Color(0x969682), moisture);
        break;
        
      case BiomeType.RAINFOREST:
        // Rainforest - deep green
        color.set(0x2e6e41).lerp(new THREE.Color(0x124124), moisture);
        break;
        
      case BiomeType.SAVANNA:
        // Savanna - yellow-green
        color.set(0xccc880).lerp(new THREE.Color(0x9da855), moisture);
        break;
        
      case BiomeType.SWAMP:
        // Swamp - dark green-brown
        color.set(0x4d6b50).lerp(new THREE.Color(0x2d4030), moisture);
        break;
        
      default:
        // Default is land color
        color.copy(this.options.landColor);
    }
    
    // Add some variation based on noise
    const variation = this.noise.getNoiseFromVector(
      new THREE.Vector3(temperature * 10, moisture * 10, elevation * 10),
      10.0
    ) * 0.1;
    
    color.r = Math.max(0, Math.min(1, color.r + variation));
    color.g = Math.max(0, Math.min(1, color.g + variation));
    color.b = Math.max(0, Math.min(1, color.b + variation));
    
    return color;
  }
  
  /**
   * Update the planet (for animation)
   * @param deltaTime - Time since last update in seconds
   */
  update(deltaTime: number): void {
    // Update ocean caustics if ocean exists
    if (this.oceanMesh && this.oceanMesh.material instanceof PlanetMaterialWithCaustics) {
      this.oceanMesh.material.update(deltaTime);
    }
  }
  
  /**
   * Add the planet to a scene
   * @param scene - THREE.Scene to add planet to
   */
  addToScene(scene: THREE.Scene): void {
    // Add main planet mesh
    scene.add(this.mesh);
    
    // Add ocean if it exists
    if (this.oceanMesh) {
      scene.add(this.oceanMesh);
    }
    
    // Add atmosphere if it exists
    if (this.atmosphereMesh) {
      scene.add(this.atmosphereMesh);
    }
    
    // Add vegetation if it exists
    if (this.vegetationGroup) {
      scene.add(this.vegetationGroup);
    }
  }
  
  /**
   * Remove the planet from a scene
   * @param scene - THREE.Scene to remove planet from
   */
  removeFromScene(scene: THREE.Scene): void {
    // Remove main planet mesh
    scene.remove(this.mesh);
    
    // Remove ocean if it exists
    if (this.oceanMesh) {
      scene.remove(this.oceanMesh);
    }
    
    // Remove atmosphere if it exists
    if (this.atmosphereMesh) {
      scene.remove(this.atmosphereMesh);
    }
    
    // Remove vegetation if it exists
    if (this.vegetationGroup) {
      scene.remove(this.vegetationGroup);
    }
  }
  
  /**
   * Clean up resources
   */
  dispose(): void {
    // Dispose of geometries
    this.geometry.dispose();
    
    // Dispose of ocean geometry and material
    if (this.oceanMesh) {
      this.oceanMesh.geometry.dispose();
      if (this.oceanMesh.material instanceof THREE.Material) {
        this.oceanMesh.material.dispose();
      } else if (Array.isArray(this.oceanMesh.material)) {
        this.oceanMesh.material.forEach(material => material.dispose());
      }
    }
    
    // Dispose of atmosphere geometry and material
    if (this.atmosphereMesh) {
      this.atmosphereMesh.geometry.dispose();
      if (this.atmosphereMesh.material instanceof THREE.Material) {
        this.atmosphereMesh.material.dispose();
      } else if (Array.isArray(this.atmosphereMesh.material)) {
        this.atmosphereMesh.material.forEach(material => material.dispose());
      }
    }
  }
} 
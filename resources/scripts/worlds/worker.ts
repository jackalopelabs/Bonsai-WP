import * as THREE from 'three';
import { UberNoise } from './helper/noise';

// Since this is a Web Worker, define the interface for messages
interface WorkerMessage {
  type: string;
  options: PlanetWorkerOptions;
}

// Define the interface for planet options in the worker
interface PlanetWorkerOptions {
  seed: number;
  radius: number;
  resolution: number;
  oceanDepth: number;
  mountainHeight: number;
  roughness: number;
  waterLevel: number;
  waterColor: number[];
  landColor: number[];
  hasAtmosphere: boolean;
  atmosphereColor: number[];
  hasVegetation: boolean;
  vegetationDensity: number;
}

/**
 * Web Worker implementation of the UberNoise class for use in the worker context
 * This is necessary because we can't import the class directly in the worker
 */
class WorkerNoise {
  private seed: number;
  private scale: number;
  private octaves: number;
  private persistence: number;
  private lacunarity: number;
  private redistribution: number;

  constructor(seed: number, options: {
    scale?: number,
    octaves?: number,
    persistence?: number,
    lacunarity?: number,
    redistribution?: number
  } = {}) {
    this.seed = seed;
    this.scale = options.scale || 1.0;
    this.octaves = options.octaves || 6;
    this.persistence = options.persistence || 0.5;
    this.lacunarity = options.lacunarity || 2.0;
    this.redistribution = options.redistribution || 1.0;
  }

  get(x: number, y: number, z: number): number {
    x = x * this.scale;
    y = y * this.scale;
    z = z * this.scale;

    let noise = this.fractalNoise(x, y, z);
    
    if (this.redistribution !== 1.0) {
      noise = Math.pow(Math.abs(noise), this.redistribution) * Math.sign(noise);
    }
    
    return noise;
  }

  private fractalNoise(x: number, y: number, z: number): number {
    let amplitude = 1.0;
    let frequency = 1.0;
    let noise = 0.0;
    let maxAmplitude = 0.0;

    for (let i = 0; i < this.octaves; i++) {
      const n = this.simplexNoise(
        x * frequency, 
        y * frequency, 
        z * frequency, 
        this.seed + i * 1000
      );
      
      noise += n * amplitude;
      maxAmplitude += amplitude;
      amplitude *= this.persistence;
      frequency *= this.lacunarity;
    }

    return noise / maxAmplitude;
  }

  private simplexNoise(x: number, y: number, z: number, seed: number): number {
    const dot = (x * 12.9898) + (y * 78.233) + (z * 37.719) + seed;
    const base = Math.sin(dot) * 43758.5453;
    const noise1 = Math.sin(base * 1.0) * 0.5;
    const noise2 = Math.sin(base * 1.7 + x * 1.1) * 0.25;
    const noise3 = Math.sin(base * 2.3 + y * 0.9 + z * 1.3) * 0.125;
    
    return (noise1 + noise2 + noise3) * 1.143;
  }

  getBiome(x: number, y: number, z: number): number {
    const biomeScale = this.scale * 0.5;
    const biomeSeed = this.seed + 42424.2;
    
    let noise = this.simplexNoise(
      x * biomeScale,
      y * biomeScale,
      z * biomeScale,
      biomeSeed
    );
    
    noise += this.simplexNoise(
      x * biomeScale * 2.0,
      y * biomeScale * 2.0,
      z * biomeScale * 2.0,
      biomeSeed + 1000
    ) * 0.5;
    
    return this.normalize(noise);
  }

  getMoisture(x: number, y: number, z: number): number {
    const moistureScale = this.scale * 0.7;
    const moistureSeed = this.seed + 12345.6;
    
    let noise = this.simplexNoise(
      x * moistureScale,
      y * moistureScale,
      z * moistureScale,
      moistureSeed
    );
    
    noise += this.simplexNoise(
      x * moistureScale * 2.0,
      y * moistureScale * 2.0,
      z * moistureScale * 2.0,
      moistureSeed + 1000
    ) * 0.5;
    
    return this.normalize(noise);
  }

  private normalize(value: number): number {
    return (value + 1.0) * 0.5;
  }
}

/**
 * Create a planet geometry based on the provided options
 */
function createGeometry(options: PlanetWorkerOptions) {
  // Create a base icosahedron geometry
  const geometry = new THREE.IcosahedronGeometry(options.radius, options.resolution);
  const positionAttribute = geometry.getAttribute('position');
  const normalAttribute = geometry.getAttribute('normal');
  
  // Create arrays for new data
  const vertices: number[] = [];
  const normals: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  
  // Create arrays for ocean data if we have oceans
  const oceanVertices: number[] = [];
  const oceanNormals: number[] = [];
  
  // Create array for vegetation points
  const vegetationPoints: number[][] = [];
  
  // Create noise generator
  const noise = new WorkerNoise(options.seed, {
    scale: 1.0,
    octaves: 6,
    persistence: 0.5,
    lacunarity: 2.0,
    redistribution: options.roughness
  });
  
  // Convert colors from arrays to THREE.Color
  const waterColor = new THREE.Color(
    options.waterColor[0],
    options.waterColor[1],
    options.waterColor[2]
  );
  
  const landColor = new THREE.Color(
    options.landColor[0],
    options.landColor[1],
    options.landColor[2]
  );
  
  // Process each vertex
  for (let i = 0; i < positionAttribute.count; i++) {
    // Get the original vertex position
    const x = positionAttribute.getX(i);
    const y = positionAttribute.getY(i);
    const z = positionAttribute.getZ(i);
    
    // Normalize to get direction
    const vertex = new THREE.Vector3(x, y, z).normalize();
    
    // Get noise value for this point
    const noiseValue = noise.get(vertex.x, vertex.y, vertex.z);
    
    // Apply noise to vertex position
    const elevation = 1.0 + noiseValue * options.mountainHeight;
    vertex.multiplyScalar(options.radius * elevation);
    
    // Add to vertices array
    vertices.push(vertex.x, vertex.y, vertex.z);
    
    // Calculate normal
    const normal = vertex.clone().normalize();
    normals.push(normal.x, normal.y, normal.z);
    
    // Calculate UV coordinates (equirectangular projection)
    const u = 0.5 + Math.atan2(vertex.z, vertex.x) / (2 * Math.PI);
    const v = 0.5 - Math.asin(vertex.y) / Math.PI;
    uvs.push(u, v);
    
    // Determine if this point is underwater
    const isUnderwater = elevation < 1.0 + options.waterLevel * options.mountainHeight;
    
    // Color the vertex
    if (isUnderwater) {
      // Water color
      colors.push(waterColor.r, waterColor.g, waterColor.b);
      
      // Add to ocean vertices
      const oceanVertex = normal.clone().multiplyScalar(options.radius * (1.0 + options.waterLevel * options.mountainHeight));
      oceanVertices.push(oceanVertex.x, oceanVertex.y, oceanVertex.z);
      oceanNormals.push(normal.x, normal.y, normal.z);
    } else {
      // Land color - optionally add variation based on elevation and biome
      const biomeValue = noise.getBiome(vertex.x, vertex.y, vertex.z);
      const moistureValue = noise.getMoisture(vertex.x, vertex.y, vertex.z);
      
      // Use biome and moisture to determine the land color
      // For simplicity, we just blend between a few colors here
      const elevationFactor = Math.min(1.0, (elevation - (1.0 + options.waterLevel * options.mountainHeight)) / (options.mountainHeight * 0.5));
      
      // Different biome colors
      const lowlandColor = new THREE.Color(0x3d5e3a);  // Default green
      const midlandColor = new THREE.Color(0x726b4a);  // Brownish
      const highlandColor = new THREE.Color(0xcecece);  // Grey/white for mountains
      
      // Desert biome for low moisture
      const desertColor = new THREE.Color(0xd9c6a5);  // Sandy color
      
      // Combine factors for final color
      let finalColor = new THREE.Color();
      
      if (moistureValue < 0.3) {
        // Desert biome
        finalColor.copy(desertColor);
      } else {
        // Normal biomes with elevation-based colors
        if (elevationFactor < 0.4) {
          // Lowlands
          finalColor.copy(lowlandColor);
        } else if (elevationFactor < 0.8) {
          // Midlands - blend between lowland and highland
          const blendFactor = (elevationFactor - 0.4) / 0.4;
          finalColor.copy(lowlandColor).lerp(midlandColor, blendFactor);
        } else {
          // Highlands - blend to snow caps
          const blendFactor = (elevationFactor - 0.8) / 0.2;
          finalColor.copy(midlandColor).lerp(highlandColor, blendFactor);
        }
      }
      
      // Apply final color
      colors.push(finalColor.r, finalColor.g, finalColor.b);
      
      // Determine if this point should have vegetation
      if (options.hasVegetation && 
          !isUnderwater && 
          elevation < 1.0 + options.waterLevel * options.mountainHeight + options.mountainHeight * 0.6 && 
          moistureValue > 0.4 && 
          Math.random() < options.vegetationDensity * moistureValue) {
        
        vegetationPoints.push([vertex.x, vertex.y, vertex.z]);
      }
    }
  }
  
  // Send the results back to the main thread
  postMessage({
    type: 'geometryCreated',
    data: {
      vertices,
      normals,
      colors,
      uvs,
      oceanVertices,
      oceanNormals,
      vegetationPoints
    }
  });
}

// Set up message handler
onmessage = function(e: MessageEvent) {
  const message = e.data as WorkerMessage;
  
  if (message.type === 'createGeometry') {
    createGeometry(message.options);
  }
}; 
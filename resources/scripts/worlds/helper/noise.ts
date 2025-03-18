import * as THREE from 'three';
import { createNoise2D, createNoise3D, createNoise4D } from 'simplex-noise';

/**
 * UberNoise - A comprehensive noise generator for terrain generation
 * Combines multiple noise techniques for realistic terrain features
 */
export class UberNoise {
  private seed: number;
  private scale: number;
  private octaves: number;
  private persistence: number;
  private lacunarity: number;
  private redistribution: number;
  private noise2D: ReturnType<typeof createNoise2D>;
  private noise3D: ReturnType<typeof createNoise3D>;
  private noise4D: ReturnType<typeof createNoise4D>;

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
    
    // Initialize noise generators
    const random = this.mulberry32(this.seed);
    this.noise2D = createNoise2D(random);
    this.noise3D = createNoise3D(random);
    this.noise4D = createNoise4D(random);
  }

  /**
   * Simple random function based on a seed
   * @param seed - The seed value
   */
  private mulberry32(seed: number): () => number {
    return () => {
      let t = seed += 0x6D2B79F5;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  /**
   * Get noise value at a specific point in 3D space
   */
  get(x: number, y: number, z: number): number {
    // Scale the input coordinates
    x = x * this.scale;
    y = y * this.scale;
    z = z * this.scale;

    // Generate fractal noise
    let noise = this.fractalNoise(x, y, z);
    
    // Apply redistribution if needed (can create sharper mountains, etc)
    if (this.redistribution !== 1.0) {
      noise = Math.pow(Math.abs(noise), this.redistribution) * Math.sign(noise);
    }
    
    return noise;
  }

  /**
   * Calculate fractal noise (multiple octaves of noise combined)
   */
  private fractalNoise(x: number, y: number, z: number): number {
    let amplitude = 1.0;
    let frequency = 1.0;
    let noise = 0.0;
    let maxAmplitude = 0.0;

    // Add multiple octaves of noise together
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

    // Normalize to the range [-1, 1]
    return noise / maxAmplitude;
  }

  /**
   * Generate simplex-like noise (an approximation as JS doesn't have native simplex noise)
   */
  private simplexNoise(x: number, y: number, z: number, seed: number): number {
    // This is a placeholder for actual simplex noise
    // In a real implementation, you would use a proper simplex noise algorithm
    // Here we use a combination of sine waves to approximate noise behavior
    
    const dot = (x * 12.9898) + (y * 78.233) + (z * 37.719) + seed;
    const base = Math.sin(dot) * 43758.5453;
    const noise1 = Math.sin(base * 1.0) * 0.5;
    const noise2 = Math.sin(base * 1.7 + x * 1.1) * 0.25;
    const noise3 = Math.sin(base * 2.3 + y * 0.9 + z * 1.3) * 0.125;
    
    return (noise1 + noise2 + noise3) * 1.143; // Normalize to roughly [-1, 1]
  }

  /**
   * Generate a biome value for a point on the planet
   * This uses a different noise pattern than the height noise
   */
  getBiome(x: number, y: number, z: number): number {
    // Use different settings for biome noise
    const biomeScale = this.scale * 0.5; // Larger scale for broader biome regions
    
    // Different seed for biome noise
    const biomeSeed = this.seed + 42424.2;
    
    // Simplified noise function with fewer octaves for biomes
    let noise = this.simplexNoise(
      x * biomeScale,
      y * biomeScale,
      z * biomeScale,
      biomeSeed
    );
    
    // Add a second octave
    noise += this.simplexNoise(
      x * biomeScale * 2.0,
      y * biomeScale * 2.0,
      z * biomeScale * 2.0,
      biomeSeed + 1000
    ) * 0.5;
    
    // Normalize to [0, 1] for easier biome mapping
    return this.normalize(noise, -1, 1);
  }

  /**
   * Get moisture value for a point (useful for biome determination)
   */
  getMoisture(x: number, y: number, z: number): number {
    // Different seed for moisture noise
    const moistureSeed = this.seed + 12345.6;
    
    // Different scale for moisture
    const moistureScale = this.scale * 0.7;
    
    let noise = this.simplexNoise(
      x * moistureScale,
      y * moistureScale,
      z * moistureScale,
      moistureSeed
    );
    
    // Add a second octave
    noise += this.simplexNoise(
      x * moistureScale * 2.0,
      y * moistureScale * 2.0,
      z * moistureScale * 2.0,
      moistureSeed + 1000
    ) * 0.5;
    
    // Normalize to [0, 1]
    return this.normalize(noise, -1, 1);
  }

  /**
   * Get a combined noise value for rivers
   * Rivers tend to follow lower elevation areas
   */
  getRiverNoise(x: number, y: number, z: number, elevation: number): number {
    // Different seed for river noise
    const riverSeed = this.seed + 98765.4;
    
    // Rivers should follow valleys, so use a higher frequency
    const riverScale = this.scale * 3.0;
    
    let noise = this.simplexNoise(
      x * riverScale,
      y * riverScale,
      z * riverScale,
      riverSeed
    );
    
    // Make rivers more likely in lower elevations
    const elevationFactor = 1.0 - Math.min(1.0, Math.max(0.0, elevation));
    noise = noise * 0.5 + 0.5; // Convert to [0, 1]
    
    // Combine with elevation factor
    noise = noise * 0.7 + elevationFactor * 0.3;
    
    // Apply a sharp falloff to create defined river channels
    noise = 1.0 - Math.pow(noise, 8.0);
    
    return Math.max(0.0, Math.min(1.0, noise));
  }

  /**
   * Normalize a value from one range to another (default 0-1)
   * @param value - The value to normalize
   * @param min - Minimum value of original range
   * @param max - Maximum value of original range
   * @param newMin - Minimum value of new range (default: 0)
   * @param newMax - Maximum value of new range (default: 1)
   * @returns Normalized value
   */
  normalize(
    value: number, 
    min: number, 
    max: number, 
    newMin: number = 0, 
    newMax: number = 1
  ): number {
    return newMin + (newMax - newMin) * (value - min) / (max - min);
  }

  /**
   * Get 2D noise at a given position
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param scale - Scale factor (default: 1.0)
   * @returns Noise value between -1 and 1
   */
  getNoise2D(x: number, y: number, scale: number = 1.0): number {
    return this.noise2D(x * scale, y * scale);
  }

  /**
   * Get 3D noise at a given position
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @param scale - Scale factor (default: 1.0)
   * @returns Noise value between -1 and 1
   */
  getNoise3D(x: number, y: number, z: number, scale: number = 1.0): number {
    return this.noise3D(x * scale, y * scale, z * scale);
  }

  /**
   * Get 4D noise at a given position
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @param w - W coordinate (often used for time)
   * @param scale - Scale factor (default: 1.0)
   * @returns Noise value between -1 and 1
   */
  getNoise4D(x: number, y: number, z: number, w: number, scale: number = 1.0): number {
    return this.noise4D(x * scale, y * scale, z * scale, w * scale);
  }

  /**
   * Get noise value from position vector
   * @param position - THREE.Vector3 position
   * @param scale - Scale factor (default: 1.0)
   * @returns Noise value between -1 and 1
   */
  getNoiseFromVector(position: THREE.Vector3, scale: number = 1.0): number {
    return this.getNoise3D(position.x, position.y, position.z, scale);
  }

  /**
   * Create fractal noise (multiple octaves of noise added together)
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @param octaves - Number of octaves (default: 4)
   * @param persistence - How much each octave contributes (default: 0.5)
   * @param scale - Initial scale factor (default: 1.0)
   * @param normalizeOutput - Whether to normalize output to 0-1 range (default: true)
   * @returns Fractal noise value
   */
  getFractalNoise(
    x: number, 
    y: number, 
    z: number, 
    octaves: number = 4, 
    persistence: number = 0.5, 
    scale: number = 1.0,
    normalizeOutput: boolean = true
  ): number {
    let total = 0;
    let frequency = scale;
    let amplitude = 1;
    let maxValue = 0;
    
    // Add successive layers of noise
    for (let i = 0; i < octaves; i++) {
      total += this.getNoise3D(x, y, z, frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    
    // Normalize if requested
    if (normalizeOutput) {
      total = this.normalize(total, -maxValue, maxValue);
    }
    
    return total;
  }

  /**
   * Create fractal noise from a position vector
   * @param position - THREE.Vector3 position
   * @param octaves - Number of octaves (default: 4)
   * @param persistence - How much each octave contributes (default: 0.5)
   * @param scale - Initial scale factor (default: 1.0)
   * @param normalizeOutput - Whether to normalize output to 0-1 range (default: true)
   * @returns Fractal noise value
   */
  getFractalNoiseFromVector(
    position: THREE.Vector3, 
    octaves: number = 4, 
    persistence: number = 0.5, 
    scale: number = 1.0,
    normalizeOutput: boolean = true
  ): number {
    return this.getFractalNoise(
      position.x, 
      position.y, 
      position.z, 
      octaves, 
      persistence, 
      scale,
      normalizeOutput
    );
  }

  /**
   * Generate ridged noise (1 - abs(noise))
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @param scale - Scale factor (default: 1.0)
   * @returns Ridged noise value between 0 and 1
   */
  getRidgedNoise(x: number, y: number, z: number, scale: number = 1.0): number {
    return 1 - Math.abs(this.getNoise3D(x, y, z, scale));
  }

  /**
   * Generate ridged fractal noise
   * @param x - X coordinate
   * @param y - Y coordinate
   * @param z - Z coordinate
   * @param octaves - Number of octaves (default: 4)
   * @param persistence - How much each octave contributes (default: 0.5)
   * @param scale - Initial scale factor (default: 1.0)
   * @returns Ridged fractal noise value between 0 and 1
   */
  getRidgedFractalNoise(
    x: number, 
    y: number, 
    z: number, 
    octaves: number = 4, 
    persistence: number = 0.5, 
    scale: number = 1.0
  ): number {
    let total = 0;
    let frequency = scale;
    let amplitude = 1;
    let maxValue = 0;
    
    // Add successive layers of ridged noise
    for (let i = 0; i < octaves; i++) {
      total += this.getRidgedNoise(x, y, z, frequency) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      frequency *= 2;
    }
    
    // Normalize
    return this.normalize(total, 0, maxValue);
  }

  /**
   * Generate terrain noise with control parameters
   * @param position - THREE.Vector3 position
   * @param options - Terrain noise options
   * @returns Terrain noise value between 0 and 1
   */
  getTerrainNoise(
    position: THREE.Vector3, 
    options: {
      continentScale?: number;
      continentOctaves?: number;
      continentPersistence?: number;
      mountainScale?: number;
      mountainOctaves?: number;
      mountainPersistence?: number;
      hillScale?: number;
      hillOctaves?: number;
      hillPersistence?: number;
      continentWeight?: number;
      mountainWeight?: number;
      hillWeight?: number;
    } = {}
  ): number {
    // Default parameter values
    const defaults = {
      continentScale: 0.2,
      continentOctaves: 2,
      continentPersistence: 0.5,
      mountainScale: 0.8,
      mountainOctaves: 4,
      mountainPersistence: 0.5,
      hillScale: 2.0,
      hillOctaves: 3,
      hillPersistence: 0.5,
      continentWeight: 0.5,
      mountainWeight: 0.35,
      hillWeight: 0.15
    };
    
    // Merge defaults with options
    const params = { ...defaults, ...options };
    
    // Generate different layers of terrain
    const continentNoise = this.getFractalNoiseFromVector(
      position,
      params.continentOctaves,
      params.continentPersistence,
      params.continentScale
    );
    
    const mountainNoise = this.getRidgedFractalNoise(
      position.x,
      position.y,
      position.z,
      params.mountainOctaves,
      params.mountainPersistence,
      params.mountainScale
    );
    
    const hillNoise = this.getFractalNoiseFromVector(
      position,
      params.hillOctaves,
      params.hillPersistence,
      params.hillScale
    );
    
    // Combine layers with weights
    return (
      continentNoise * params.continentWeight +
      mountainNoise * params.mountainWeight +
      hillNoise * params.hillWeight
    );
  }

  /**
   * Generate biome noise with temperature and moisture
   * @param position - THREE.Vector3 position
   * @param options - Biome noise options
   * @returns Object with temperature and moisture values between 0 and 1
   */
  getBiomeNoise(
    position: THREE.Vector3,
    options: {
      temperatureScale?: number;
      temperatureOctaves?: number;
      temperaturePersistence?: number;
      moistureScale?: number;
      moistureOctaves?: number;
      moisturePersistence?: number;
    } = {}
  ): { temperature: number; moisture: number } {
    // Default parameter values
    const defaults = {
      temperatureScale: 0.2,
      temperatureOctaves: 3,
      temperaturePersistence: 0.5,
      moistureScale: 0.3,
      moistureOctaves: 4,
      moisturePersistence: 0.5
    };
    
    // Merge defaults with options
    const params = { ...defaults, ...options };
    
    // Generate temperature noise
    const temperature = this.getFractalNoiseFromVector(
      position,
      params.temperatureOctaves,
      params.temperaturePersistence,
      params.temperatureScale
    );
    
    // Generate moisture noise (using a different seed offset)
    const moisturePos = new THREE.Vector3(
      position.x + 1000,
      position.y + 1000,
      position.z + 1000
    );
    
    const moisture = this.getFractalNoiseFromVector(
      moisturePos,
      params.moistureOctaves,
      params.moisturePersistence,
      params.moistureScale
    );
    
    return { temperature, moisture };
  }
} 
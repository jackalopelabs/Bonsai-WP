import { Color, Vector3 } from "three";
import UberNoise from "../utils/uber-noise";

// Biome options interface definition
export interface BiomeOptions {
  preset?: string;
  
  noise?: {
    min: number;
    max: number;
    octaves?: number;
    lacunarity?: number;
    gain?: {
      min: number;
      max: number;
      scale: number;
    };
    warp?: number;
    scale?: number;
    power?: number;
  };

  tintColor?: number;

  colors?: [number, number][];
  
  seaColors?: [number, number][];
  seaNoise?: {
    min: number;
    max: number;
    scale: number;
  };

  vegetation?: {
    items: {
      name: string;
      density?: number;
      minimumHeight?: number;
      maximumHeight?: number;
      minimumSlope?: number;
      maximumSlope?: number;
      minimumDistance?: number;
      maximumDistance?: number;
      colors?: Record<string, { array: number[] }>;
      ground?: {
        color: number;
        radius: number;
        raise: number;
      };
    }[];
  };
}

export class Biome {
  options: BiomeOptions;
  min: number;
  max: number;
  noise: UberNoise;
  seaNoise: UberNoise;
  groundVegetation: Map<string, {
    positions: Vector3[];
    colors: Record<string, { array: number[] }>;
    ground?: {
      color: number;
      radius: number;
      raise: number;
    };
  }> = new Map();

  constructor(options: BiomeOptions = {}) {
    this.options = options;
    this.min = options.noise?.min ?? -0.05;
    this.max = options.noise?.max ?? 0.05;

    this.noise = new UberNoise({
      min: this.min,
      max: this.max,
      octaves: options.noise?.octaves ?? 4,
      lacunarity: options.noise?.lacunarity ?? 2.0,
      gain: options.noise?.gain,
      warp: options.noise?.warp ?? 0.3,
      scale: options.noise?.scale ?? 1,
      power: options.noise?.power ?? 1.5,
    });

    this.seaNoise = new UberNoise({
      min: options.seaNoise?.min ?? -0.005,
      max: options.seaNoise?.max ?? 0.005,
      scale: options.seaNoise?.scale ?? 5,
    });
  }

  getHeight(position: Vector3): number {
    // Calculate noise value at this position
    return this.noise.get(position);
  }

  getSeaHeight(position: Vector3): number {
    // Calculate sea noise value at this position
    return this.seaNoise.get(position);
  }

  getColor(position: Vector3, normalizedHeight: number, steepness: number): Color {
    if (!this.options.colors || this.options.colors.length === 0) {
      return new Color(1, 1, 1);
    }

    // Calculate color at this position
    // Based on normalized height, find the right color in the gradient
    let r = 1, g = 1, b = 1;
    
    // Sort colors by height
    let sorted = [...this.options.colors].sort((colorEntryA, colorEntryB) => colorEntryA[0] - colorEntryB[0]);
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const [h1, c1] = sorted[i];
      const [h2, c2] = sorted[i + 1];
      
      if (normalizedHeight >= h1 && normalizedHeight <= h2) {
        // Calculate blend ratio
        const ratio = (normalizedHeight - h1) / (h2 - h1);
        
        // Convert hex colors to r, g, b
        const r1 = ((c1 >> 16) & 255) / 255;
        const g1 = ((c1 >> 8) & 255) / 255;
        const b1 = (c1 & 255) / 255;
        
        const r2 = ((c2 >> 16) & 255) / 255;
        const g2 = ((c2 >> 8) & 255) / 255;
        const b2 = (c2 & 255) / 255;
        
        // Linear interpolation
        r = r1 * (1 - ratio) + r2 * ratio;
        g = g1 * (1 - ratio) + g2 * ratio;
        b = b1 * (1 - ratio) + b2 * ratio;
        
        break;
      }
    }
    
    // Add tint if specified
    if (this.options.tintColor) {
      const tintR = ((this.options.tintColor >> 16) & 255) / 255;
      const tintG = ((this.options.tintColor >> 8) & 255) / 255;
      const tintB = (this.options.tintColor & 255) / 255;
      
      // Soft light blend
      r = softLightBlend(r, tintR);
      g = softLightBlend(g, tintG);
      b = softLightBlend(b, tintB);
    }
    
    return new Color(r, g, b);
  }

  getSeaColor(position: Vector3, normalizedHeight: number): Color {
    if (!this.options.seaColors || this.options.seaColors.length === 0) {
      return new Color(0, 0, 1);
    }

    // Calculate sea color at this position
    let r = 0, g = 0, b = 1;
    
    // Sort sea colors by height
    let sorted = [...this.options.seaColors].sort((colorEntryA, colorEntryB) => colorEntryA[0] - colorEntryB[0]);
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const [h1, c1] = sorted[i];
      const [h2, c2] = sorted[i + 1];
      
      if (normalizedHeight >= h1 && normalizedHeight <= h2) {
        // Calculate blend ratio
        const ratio = (normalizedHeight - h1) / (h2 - h1);
        
        // Convert hex colors to r, g, b
        const r1 = ((c1 >> 16) & 255) / 255;
        const g1 = ((c1 >> 8) & 255) / 255;
        const b1 = (c1 & 255) / 255;
        
        const r2 = ((c2 >> 16) & 255) / 255;
        const g2 = ((c2 >> 8) & 255) / 255;
        const b2 = (c2 & 255) / 255;
        
        // Linear interpolation
        r = r1 * (1 - ratio) + r2 * ratio;
        g = g1 * (1 - ratio) + g2 * ratio;
        b = b1 * (1 - ratio) + b2 * ratio;
        
        break;
      }
    }
    
    return new Color(r, g, b);
  }

  addVegetation(item: any, position: Vector3, normalizedHeight: number, steepness: number) {
    if (!this.groundVegetation.has(item.name)) {
      this.groundVegetation.set(item.name, {
        positions: [],
        colors: item.colors || {},
        ground: item.ground,
      });
    }
    
    const vegetation = this.groundVegetation.get(item.name);
    if (vegetation) {
      vegetation.positions.push(position.clone());
    }
  }

  closestVegetationDistance(position: Vector3, maxDistance: number): number | null {
    let closestDistance: number | null = null;
    
    for (const [, vegetation] of this.groundVegetation) {
      for (const pos of vegetation.positions) {
        const distance = position.distanceTo(pos);
        if (distance < maxDistance) {
          if (closestDistance === null || distance < closestDistance) {
            closestDistance = distance;
          }
        }
      }
    }
    
    return closestDistance;
  }

  vegetationHeightAndColorForFace(
    a: Vector3, 
    b: Vector3, 
    c: Vector3, 
    faceColor: { r: number, g: number, b: number }, 
    faceSideLength: number
  ) {
    const mid = new Vector3().copy(a).add(b).add(c).divideScalar(3);
    const result = {
      heightA: 0,
      heightB: 0,
      heightC: 0,
      color: { ...faceColor },
    };
    
    // Go through all vegetation
    for (const [, vegetation] of this.groundVegetation) {
      if (!vegetation.ground) continue;
      
      for (const position of vegetation.positions) {
        // Check if this vegetation ground affects this face
        const distanceToMid = position.distanceTo(mid);
        if (distanceToMid > faceSideLength * 1.5) continue;
        
        // Calculate how much this vegetation affects each vertex
        const radius = vegetation.ground.radius;
        const distanceA = position.distanceTo(a);
        const distanceB = position.distanceTo(b);
        const distanceC = position.distanceTo(c);
        
        // Calculate height based on distance and radius
        if (distanceA < radius) {
          result.heightA += vegetationGroundHeight(distanceA, radius, vegetation.ground.raise);
        }
        
        if (distanceB < radius) {
          result.heightB += vegetationGroundHeight(distanceB, radius, vegetation.ground.raise);
        }
        
        if (distanceC < radius) {
          result.heightC += vegetationGroundHeight(distanceC, radius, vegetation.ground.raise);
        }
        
        // Calculate color influence
        const groundColor = vegetation.ground.color;
        const r = ((groundColor >> 16) & 255) / 255;
        const g = ((groundColor >> 8) & 255) / 255;
        const b = (groundColor & 255) / 255;
        
        if (distanceToMid < radius) {
          const colorInfluence = (1 - distanceToMid / radius) * 0.8;
          result.color.r = result.color.r * (1 - colorInfluence) + r * colorInfluence;
          result.color.g = result.color.g * (1 - colorInfluence) + g * colorInfluence;
          result.color.b = result.color.b * (1 - colorInfluence) + b * colorInfluence;
        }
      }
    }
    
    return result;
  }
}

// Helper function for soft light blend mode
function softLightBlend(a: number, b: number): number {
  if (b < 0.5) {
    return a - (1 - 2 * b) * a * (1 - a);
  } else {
    return a + (2 * b - 1) * (Math.sqrt(a) - a);
  }
}

// Helper function for vegetation ground height calculation
function vegetationGroundHeight(distance: number, radius: number, maxHeight: number): number {
  // Cosine curve for smooth falloff
  const ratio = distance / radius;
  return maxHeight * (Math.cos(ratio * Math.PI) + 1) / 2;
} 
import { Vector3 } from "three";
import { createNoise3D } from "simplex-noise";

interface NoiseOptions {
  min?: number;
  max?: number;
  octaves?: number;
  lacunarity?: number;
  gain?: number | { min: number; max: number; scale: number };
  warp?: number;
  scale?: number;
  power?: number;
  seed?: number;
}

/**
 * UberNoise - A versatile noise generator combining multiple noise techniques
 */
export default class UberNoise {
  options: NoiseOptions;
  noise3D: (x: number, y: number, z: number) => number;
  seed: number;

  constructor(options: NoiseOptions = {}) {
    this.options = {
      min: options.min ?? -1,
      max: options.max ?? 1,
      octaves: options.octaves ?? 1,
      lacunarity: options.lacunarity ?? 2.0,
      gain: options.gain ?? 0.5,
      warp: options.warp ?? 0,
      scale: options.scale ?? 1,
      power: options.power ?? 1,
      seed: options.seed ?? Math.random() * 1000,
    };

    this.seed = this.options.seed ?? 0;
    this.noise3D = createNoise3D(() => this.seed);
  }

  /**
   * Get noise value at a position
   * @param x - X coordinate or Vector3
   * @param y - Y coordinate (optional if x is Vector3)
   * @param z - Z coordinate (optional if x is Vector3)
   */
  get(x: number | Vector3, y?: number, z?: number): number {
    let xCoord: number, yCoord: number, zCoord: number;

    if (x instanceof Vector3) {
      xCoord = x.x;
      yCoord = x.y;
      zCoord = x.z;
    } else {
      xCoord = x;
      yCoord = y ?? 0;
      zCoord = z ?? 0;
    }

    // Apply scale
    const scale = this.options.scale ?? 1;
    xCoord *= scale;
    yCoord *= scale;
    zCoord *= scale;

    let result;

    if (this.options.warp && this.options.warp > 0) {
      // Domain warping (adds more natural-looking distortion)
      const warpAmount = this.options.warp;
      const wX = this.noise3D(xCoord, yCoord + 100, zCoord + 100) * warpAmount;
      const wY = this.noise3D(xCoord + 100, yCoord, zCoord + 100) * warpAmount;
      const wZ = this.noise3D(xCoord + 100, yCoord + 100, zCoord) * warpAmount;

      xCoord += wX;
      yCoord += wY;
      zCoord += wZ;
    }

    if (this.options.octaves && this.options.octaves > 1) {
      // Fractal Brownian Motion implementation
      result = this.fbm(
        xCoord,
        yCoord,
        zCoord,
        this.options.octaves,
        this.options.lacunarity ?? 2.0,
        this.options.gain ?? 0.5
      );
    } else {
      // Simple noise
      result = this.noise3D(xCoord, yCoord, zCoord);
    }

    // Apply power for sharper/smoother transitions
    if (this.options.power !== undefined && this.options.power !== 1) {
      const power = this.options.power;
      result = Math.sign(result) * Math.pow(Math.abs(result), power);
    }

    // Rescale to min/max range
    result = this.rescale(result, -1, 1, this.options.min ?? -1, this.options.max ?? 1);

    return result;
  }

  /**
   * Fractal Brownian Motion to create natural-looking noise
   */
  private fbm(
    x: number,
    y: number,
    z: number,
    octaves: number,
    lacunarity: number,
    gain: number | { min: number; max: number; scale: number }
  ): number {
    let result = 0;
    let amplitude = 1.0;
    let frequency = 1.0;
    let totalAmplitude = 0;

    // For each octave
    for (let i = 0; i < octaves; i++) {
      // Add noise contribution scaled by amplitude
      result += this.noise3D(x * frequency, y * frequency, z * frequency) * amplitude;
      totalAmplitude += amplitude;

      // Increase frequency for next octave
      frequency *= lacunarity;

      // Calculate next amplitude
      if (typeof gain === "object") {
        // Variable gain based on position
        const variableGain =
          gain.min +
          (gain.max - gain.min) *
            ((this.noise3D(x / gain.scale, y / gain.scale, z / gain.scale) + 1) / 2);
        amplitude *= variableGain;
      } else {
        // Fixed gain
        amplitude *= gain;
      }
    }

    // Normalize
    return result / totalAmplitude;
  }

  /**
   * Rescale a value from one range to another
   */
  private rescale(value: number, inMin: number, inMax: number, outMin: number, outMax: number): number {
    return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin);
  }
} 
import { BufferGeometry, Float32BufferAttribute } from "three";

export function createBufferGeometry(
  positions: number[],
  colors: number[],
  normals: number[],
): BufferGeometry {
  const geometry = new BufferGeometry();
  
  // Add attributes
  geometry.setAttribute('position', new Float32BufferAttribute(positions, 3));
  geometry.setAttribute('color', new Float32BufferAttribute(colors, 3));
  geometry.setAttribute('normal', new Float32BufferAttribute(normals, 3));
  
  return geometry;
} 
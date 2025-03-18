import * as THREE from "three";

/**
 * Vertex shader for atmosphere effect
 */
const atmosphereVertexShader = `
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vWorldPosition = worldPosition.xyz;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

/**
 * Fragment shader for atmosphere effect
 */
const atmosphereFragmentShader = `
uniform vec3 glowColor;
uniform vec3 viewPosition;

varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
  vec3 worldViewDirection = normalize(viewPosition - vWorldPosition);
  
  // Fresnel effect for edge glow
  float fresnel = 1.0 - max(0.0, dot(vNormal, worldViewDirection));
  
  // Higher power for sharper edge glow
  fresnel = pow(fresnel, 2.0);
  
  // Final color with alpha based on fresnel
  gl_FragColor = vec4(glowColor, fresnel * 0.7);
}
`;

/**
 * Create an atmosphere material with the given color
 * 
 * @param color Color of the atmosphere
 * @returns ShaderMaterial for atmosphere
 */
export function createAtmosphereMaterial(color: THREE.Color): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      glowColor: { value: color },
      viewPosition: { value: new THREE.Vector3(0, 0, 0) }
    },
    vertexShader: atmosphereVertexShader,
    fragmentShader: atmosphereFragmentShader,
    transparent: true,
    side: THREE.BackSide,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });
  
  return material;
} 
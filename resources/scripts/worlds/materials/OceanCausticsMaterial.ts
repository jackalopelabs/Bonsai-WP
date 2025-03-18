import * as THREE from "three";

/**
 * Vertex shader for water caustics effect
 */
const causticsMaterialVertex = `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

void main() {
    vUv = uv;
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
}`;

/**
 * Fragment shader for water caustics effect
 */
const causticsMaterialFragment = `
uniform vec3 color;
uniform float time;
uniform float opacity;
uniform float roughness;
uniform float causticStrength;
uniform float causticScale;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vWorldPosition;

// Hash function for caustics
float hash(vec2 p) {
    float h = dot(p, vec2(127.1, 311.7));
    return fract(sin(h) * 43758.5453123);
}

// Noise function
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    
    vec2 u = f*f*(3.0-2.0*f);
    
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    
    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

// Gradient noise for caustics
float gradientNoise(vec2 p) {
    float f = 0.0;
    
    // Use multiple octaves for more detail
    f += 0.5000 * noise(p * 1.0);
    f += 0.2500 * noise(p * 2.0);
    f += 0.1250 * noise(p * 4.0);
    f += 0.0625 * noise(p * 8.0);
    
    f = 0.5 + 0.5 * f;
    
    return f;
}

// Caustics pattern generation
float caustics(vec2 uv, float time) {
    // Create two moving layers of noise
    float layer1 = gradientNoise(uv * causticScale + vec2(time * 0.05, time * 0.07));
    float layer2 = gradientNoise(uv * causticScale * 1.3 + vec2(-time * 0.06, time * 0.04));
    
    // Combine layers and add intensity variations
    float pattern = pow(layer1 * layer2, 2.0) * causticStrength;
    
    // Threshold to create more defined caustics lines
    pattern = smoothstep(0.4, 0.8, pattern);
    
    return pattern;
}

void main() {
    // Calculate depth factor (deeper = darker)
    float depthFactor = 0.95;
    
    // Calculate fresnel effect for edge brightness
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float fresnel = pow(1.0 - max(0.0, dot(vNormal, viewDirection)), 4.0);
    
    // Generate caustics pattern
    float causticsPattern = caustics(vUv, time);
    
    // Apply caustics to color
    vec3 finalColor = color * (depthFactor + causticsPattern * 0.5);
    
    // Add fresnel rim
    finalColor += color * fresnel * 0.3;
    
    // Add slight color variations based on depth
    finalColor *= 0.8 + 0.2 * sin(vUv.y * 10.0 + time * 0.1);
    
    // Add subtle wave effect to opacity
    float waveOpacity = opacity * (0.95 + 0.05 * sin(vUv.x * 20.0 + time));
    
    gl_FragColor = vec4(finalColor, waveOpacity);
}`;

/**
 * Custom material for water with caustics effect
 */
export class PlanetMaterialWithCaustics extends THREE.MeshStandardMaterial {
    uniforms: { [uniform: string]: THREE.IUniform<any> };
    
    constructor(parameters?: THREE.MeshStandardMaterialParameters) {
        super(parameters);
        
        // Add custom uniforms
        this.uniforms = {
            time: { value: 0.0 },
            color: { value: new THREE.Color(parameters?.color || 0x0077be) },
            opacity: { value: parameters?.opacity || 0.8 },
            roughness: { value: parameters?.roughness || 0.1 },
            causticStrength: { value: 1.5 },
            causticScale: { value: 2.0 }
        };
        
        // Store custom parameters in userData
        this.userData = {
            time: 0.0,
            causticStrength: 1.5,
            causticScale: 2.0
        };
        
        // Set necessary material properties
        this.transparent = true;
        this.needsUpdate = true;
        
        // Override shader definitions
        this.onBeforeCompile = (shader) => {
            // Add uniforms
            shader.uniforms.time = this.uniforms.time;
            shader.uniforms.causticStrength = this.uniforms.causticStrength;
            shader.uniforms.causticScale = this.uniforms.causticScale;
            
            // Inject custom vertex shader code
            shader.vertexShader = shader.vertexShader.replace(
                'void main() {',
                `
                varying vec3 vWorldPosition;
                void main() {
                    vec4 worldPosition = modelMatrix * vec4(position, 1.0);
                    vWorldPosition = worldPosition.xyz;
                `
            );
            
            // Inject custom fragment shader code
            shader.fragmentShader = shader.fragmentShader.replace(
                '#include <common>',
                `
                #include <common>
                uniform float time;
                uniform float causticStrength;
                uniform float causticScale;
                varying vec3 vWorldPosition;
                
                // Hash function for caustics
                float hash(vec2 p) {
                    float h = dot(p, vec2(127.1, 311.7));
                    return fract(sin(h) * 43758.5453123);
                }
                
                // Noise function
                float noise(vec2 p) {
                    vec2 i = floor(p);
                    vec2 f = fract(p);
                    
                    vec2 u = f*f*(3.0-2.0*f);
                    
                    float a = hash(i);
                    float b = hash(i + vec2(1.0, 0.0));
                    float c = hash(i + vec2(0.0, 1.0));
                    float d = hash(i + vec2(1.0, 1.0));
                    
                    return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
                }
                
                // Gradient noise for caustics
                float gradientNoise(vec2 p) {
                    float f = 0.0;
                    
                    // Use multiple octaves for more detail
                    f += 0.5000 * noise(p * 1.0);
                    f += 0.2500 * noise(p * 2.0);
                    f += 0.1250 * noise(p * 4.0);
                    f += 0.0625 * noise(p * 8.0);
                    
                    f = 0.5 + 0.5 * f;
                    
                    return f;
                }
                
                // Caustics pattern generation
                float caustics(vec2 uv, float time) {
                    // Create two moving layers of noise
                    float layer1 = gradientNoise(uv * causticScale + vec2(time * 0.05, time * 0.07));
                    float layer2 = gradientNoise(uv * causticScale * 1.3 + vec2(-time * 0.06, time * 0.04));
                    
                    // Combine layers and add intensity variations
                    float pattern = pow(layer1 * layer2, 2.0) * causticStrength;
                    
                    // Threshold to create more defined caustics lines
                    pattern = smoothstep(0.4, 0.8, pattern);
                    
                    return pattern;
                }
                `
            );
            
            // Modify the main function in the fragment shader
            shader.fragmentShader = shader.fragmentShader.replace(
                'gl_FragColor = vec4( outgoingLight, diffuseColor.a );',
                `
                // Calculate fresnel effect for edge brightness
                vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
                float fresnel = pow(1.0 - max(0.0, dot(normal, viewDirection)), 4.0);
                
                // Generate caustics pattern
                float causticsPattern = caustics(vUv, time);
                
                // Apply caustics to color
                vec3 finalColor = outgoingLight * (0.95 + causticsPattern * 0.5);
                
                // Add fresnel rim
                finalColor += outgoingLight * fresnel * 0.3;
                
                // Add slight color variations based on depth
                finalColor *= 0.8 + 0.2 * sin(vUv.y * 10.0 + time * 0.1);
                
                // Add subtle wave effect to opacity
                float waveOpacity = diffuseColor.a * (0.95 + 0.05 * sin(vUv.x * 20.0 + time));
                
                gl_FragColor = vec4(finalColor, waveOpacity);
                `
            );
        };
    }
    
    /**
     * Update the material with the current time
     * @param time Current time
     */
    update(time: number) {
        this.uniforms.time.value = time;
        this.userData.time = time;
    }
} 
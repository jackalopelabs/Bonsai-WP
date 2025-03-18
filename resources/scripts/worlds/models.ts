import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Base path for model resources
const BASE_PATH = "/wp-content/plugins/bonsai-planets-wp/resources/models/";

/**
 * Type definitions for model collections
 */
type CollectionModel = {
  name?: string;
  versions?: number;
  materials?: {
    [key: string]: {
      color?: string;
      roughness?: number;
      metalness?: number;
    }
  }
};

type Collection = {
  name: string;
  models: { [key: string]: CollectionModel };
};

/**
 * Collection of low poly nature models
 */
export const lowPolyNatureCollectionModels: { [key: string]: CollectionModel } = {
  BirchTree: {
    versions: 3,
    materials: {
      Bark: { color: '#e8d4b7', roughness: 0.9, metalness: 0.0 },
      Leaves: { color: '#d9ead3', roughness: 0.8, metalness: 0.0 }
    }
  },
  Cactus: {
    versions: 1,
    materials: {
      Cactus: { color: '#4f8346', roughness: 0.8, metalness: 0.0 }
    }
  },
  CommonTree: {
    versions: 5,
    materials: {
      Bark: { color: '#8b4513', roughness: 0.9, metalness: 0.0 },
      Leaves: { color: '#458B00', roughness: 0.8, metalness: 0.0 }
    }
  },
  Grass: {
    versions: 2,
    materials: {
      Grass: { color: '#7caa2d', roughness: 0.8, metalness: 0.0 }
    }
  },
  PalmTree: {
    versions: 2,
    materials: {
      Bark: { color: '#8a5c42', roughness: 0.9, metalness: 0.0 },
      Leaves: { color: '#4a8e3f', roughness: 0.8, metalness: 0.0 }
    }
  },
  PineTree: {
    versions: 3,
    materials: {
      Bark: { color: '#6e4c36', roughness: 0.9, metalness: 0.0 },
      Leaves: { color: '#2d5f2d', roughness: 0.8, metalness: 0.0 }
    }
  },
  Rock: {
    versions: 3,
    materials: {
      Rock: { color: '#808080', roughness: 0.7, metalness: 0.1 }
    }
  },
  Willow: {
    versions: 1,
    materials: {
      Bark: { color: '#736357', roughness: 0.9, metalness: 0.0 },
      Leaves: { color: '#9eb25a', roughness: 0.8, metalness: 0.0 }
    }
  }
};

/**
 * Export the low poly nature collection
 */
export const lowPolyNatureCollection: Collection = {
  name: 'LowPolyNature',
  models: lowPolyNatureCollectionModels
};

/**
 * Get all model names from a collection
 * 
 * @param collection Collection to get model names from
 * @returns Array of model names
 */
export function getModels(collection: Collection = lowPolyNatureCollection): string[] {
  return Object.keys(collection.models);
}

/**
 * Get model paths and materials for a collection
 * 
 * @param collection Collection to get model paths from
 * @returns Object with model paths and materials
 */
export function getModelPathsAndMaterials(collection: Collection = lowPolyNatureCollection): {
  paths: { [key: string]: string[] },
  materials: { [key: string]: { [key: string]: THREE.Material } }
} {
  const paths: { [key: string]: string[] } = {};
  const materials: { [key: string]: { [key: string]: THREE.Material } } = {};
  
  // Process each model in the collection
  Object.entries(collection.models).forEach(([modelName, model]) => {
    paths[modelName] = [];
    materials[modelName] = {};
    
    // Process model materials
    if (model.materials) {
      Object.entries(model.materials).forEach(([materialName, materialProps]) => {
        const material = new THREE.MeshStandardMaterial({
          color: materialProps.color || '#ffffff',
          roughness: materialProps.roughness || 0.5,
          metalness: materialProps.metalness || 0.0
        });
        
        materials[modelName][materialName] = material;
      });
    }
    
    // Add paths for each version
    const versions = model.versions || 1;
    for (let i = 1; i <= versions; i++) {
      paths[modelName].push(`${BASE_PATH}${collection.name}/${modelName}${versions > 1 ? i : ''}.gltf`);
    }
  });
  
  return { paths, materials };
}

/**
 * Load models from a collection
 * 
 * @param collection Collection to load models from
 * @returns Promise that resolves to an array of loaded models
 */
export async function loadModels(collection: Collection = lowPolyNatureCollection): Promise<THREE.Object3D[]> {
  // Get model paths and materials
  const { paths, materials } = getModelPathsAndMaterials(collection);
  
  // Initialize GLTFLoader
  const loader = new GLTFLoader();
  const loadedModels: THREE.Object3D[] = [];
  
  // Load models from paths
  const loadPromises = Object.entries(paths).flatMap(([modelName, modelPaths]) => {
    return modelPaths.map(path => {
      return new Promise<void>((resolve, reject) => {
        loader.load(
          path,
          (gltf) => {
            // Apply materials to model
            gltf.scene.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                const materialName = child.name.split('_')[0];
                if (materials[modelName] && materials[modelName][materialName]) {
                  child.material = materials[modelName][materialName];
                }
              }
            });
            
            // Add model to loaded models
            loadedModels.push(gltf.scene);
            resolve();
          },
          undefined,
          (error) => {
            console.warn(`Error loading model ${path}:`, error);
            resolve(); // Resolve anyway to avoid blocking other models
          }
        );
      });
    });
  });
  
  // Wait for all models to load
  await Promise.all(loadPromises);
  
  return loadedModels;
} 
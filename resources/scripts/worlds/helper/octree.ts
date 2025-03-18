import * as THREE from 'three';

// Constants for octree configuration
const MAX_POINTS = 8;
const MIN_SIZE = 0.01;

/**
 * A node in the octree structure
 */
export class OctreeNode<T extends THREE.Vector3> {
  center: THREE.Vector3;
  size: number;
  points: T[] = [];
  children: OctreeNode<T>[] = [];
  
  constructor(center: THREE.Vector3, size: number) {
    this.center = center.clone();
    this.size = size;
  }
  
  /**
   * Check if a point is contained within this node's boundaries
   */
  contains(point: THREE.Vector3): boolean {
    const halfSize = this.size / 2;
    
    return (
      point.x >= this.center.x - halfSize &&
      point.x <= this.center.x + halfSize &&
      point.y >= this.center.y - halfSize &&
      point.y <= this.center.y + halfSize &&
      point.z >= this.center.z - halfSize &&
      point.z <= this.center.z + halfSize
    );
  }
  
  /**
   * Check if this node intersects with the given bounding box
   */
  intersectsBox(boxCenter: THREE.Vector3, boxSize: number): boolean {
    const halfSize = this.size / 2;
    const halfBoxSize = boxSize / 2;
    
    return (
      Math.abs(this.center.x - boxCenter.x) <= (halfSize + halfBoxSize) &&
      Math.abs(this.center.y - boxCenter.y) <= (halfSize + halfBoxSize) &&
      Math.abs(this.center.z - boxCenter.z) <= (halfSize + halfBoxSize)
    );
  }
  
  /**
   * Split this node into 8 children
   */
  split(): void {
    const halfSize = this.size / 2;
    const quarterSize = this.size / 4;
    
    // Create 8 children for the octants
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          const childCenter = new THREE.Vector3(
            this.center.x + x * quarterSize,
            this.center.y + y * quarterSize,
            this.center.z + z * quarterSize
          );
          
          this.children.push(new OctreeNode<T>(childCenter, halfSize));
        }
      }
    }
    
    // Redistribute points to children
    const pointsToRedistribute = [...this.points];
    this.points = [];
    
    for (const point of pointsToRedistribute) {
      for (const child of this.children) {
        if (child.contains(point)) {
          child.points.push(point);
          break;
        }
      }
    }
  }
}

/**
 * Octree for spatial partitioning and queries
 */
export class Octree<T extends THREE.Vector3> {
  root: OctreeNode<T>;
  count: number = 0;
  
  constructor(center: THREE.Vector3, size: number) {
    this.root = new OctreeNode<T>(center, size);
  }
  
  /**
   * Insert a point into the octree
   */
  insert(point: T): void {
    this.insertNode(point, this.root);
    this.count++;
  }
  
  /**
   * Helper method to insert a point into a specific node
   */
  private insertNode(point: T, node: OctreeNode<T>): void {
    // If the point doesn't fit in this node, don't insert
    if (!node.contains(point)) return;
    
    // If node has children, insert into appropriate child
    if (node.children.length > 0) {
      for (const child of node.children) {
        if (child.contains(point)) {
          this.insertNode(point, child);
          return;
        }
      }
      // Fallback if no child contains the point (shouldn't happen)
      node.points.push(point);
    } 
    // If node is a leaf
    else {
      node.points.push(point);
      
      // Check if we need to split (too many points and big enough)
      if (node.points.length > MAX_POINTS && node.size > MIN_SIZE) {
        node.split();
      }
    }
  }
  
  /**
   * Query all points in a cubic region around a center point
   */
  queryBox(center: THREE.Vector3, size: number): T[] {
    const result: T[] = [];
    this.queryBoxNode(center, size, this.root, result);
    return result;
  }
  
  /**
   * Helper method to query points in a specific node
   */
  private queryBoxNode(center: THREE.Vector3, size: number, node: OctreeNode<T>, result: T[]): void {
    // If this node doesn't intersect with the query box, return
    if (!node.intersectsBox(center, size)) return;
    
    // Add points from this node that are in the query box
    for (const point of node.points) {
      if (this.isPointInBox(point, center, size)) {
        result.push(point);
      }
    }
    
    // Recurse into children
    for (const child of node.children) {
      this.queryBoxNode(center, size, child, result);
    }
  }
  
  /**
   * Check if a point is inside a box defined by center and size
   */
  private isPointInBox(point: THREE.Vector3, center: THREE.Vector3, size: number): boolean {
    const halfSize = size / 2;
    
    return (
      point.x >= center.x - halfSize &&
      point.x <= center.x + halfSize &&
      point.y >= center.y - halfSize &&
      point.y <= center.y + halfSize &&
      point.z >= center.z - halfSize &&
      point.z <= center.z + halfSize
    );
  }
  
  /**
   * Query all points in a spherical region around a center point
   */
  querySphere(center: THREE.Vector3, radius: number): T[] {
    const result: T[] = [];
    
    // Use a cubic bounding box for initial filtering
    const boxSize = radius * 2;
    const boxResults = this.queryBox(center, boxSize);
    
    // Filter results to only include points within the sphere
    for (const point of boxResults) {
      if (point.distanceTo(center) <= radius) {
        result.push(point);
      }
    }
    
    return result;
  }
  
  /**
   * Find the nearest point to a given position
   */
  findNearest(position: THREE.Vector3, maxDistance: number = Infinity): T | null {
    let nearest: T | null = null;
    let nearestDistance = maxDistance;
    
    // Start with a small sphere and expand if needed
    let radius = Math.min(this.root.size * 0.1, maxDistance);
    
    while (radius <= maxDistance) {
      const pointsInSphere = this.querySphere(position, radius);
      
      for (const point of pointsInSphere) {
        const distance = position.distanceTo(point);
        
        if (distance < nearestDistance) {
          nearest = point;
          nearestDistance = distance;
        }
      }
      
      // If we found a point, return it
      if (nearest !== null) {
        return nearest;
      }
      
      // Otherwise, expand search radius
      radius *= 2;
    }
    
    return null;
  }
  
  /**
   * Clear all points from the octree
   */
  clear(): void {
    this.root = new OctreeNode<T>(this.root.center.clone(), this.root.size);
    this.count = 0;
  }
} 
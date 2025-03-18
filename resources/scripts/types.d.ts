// React declarations
declare module 'react' {
  export * from 'react';
}

// WordPress declarations
declare module '@wordpress/blocks' {
  export function registerBlockType(name: string, settings: any): any;
}

declare module '@wordpress/block-editor' {
  export function useBlockProps(props?: any): any;
  export const InspectorControls: any;
}

declare module '@wordpress/components' {
  export const PanelBody: any;
  export const PanelRow: any;
  export const RangeControl: any;
  export const TextControl: any;
  export const ToggleControl: any;
  export const ColorPicker: any;
}

// Three.js OrbitControls declaration
declare module 'three/examples/jsm/controls/OrbitControls.js' {
  import { Camera, EventDispatcher } from 'three';
  export class OrbitControls extends EventDispatcher {
    constructor(camera: Camera, domElement?: HTMLElement);
    enabled: boolean;
    enableDamping: boolean;
    dampingFactor: number;
    minDistance: number;
    maxDistance: number;
    enableZoom: boolean;
    enableRotate: boolean;
    enablePan: boolean;
    update(): void;
    dispose(): void;
  }
} 
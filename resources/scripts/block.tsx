import React from 'react';
import { registerBlockType } from '@wordpress/blocks';
import { 
  InspectorControls, 
  useBlockProps 
} from '@wordpress/block-editor';
import {
  PanelBody,
  PanelRow,
  RangeControl,
  TextControl,
  ToggleControl,
  ColorPicker
} from '@wordpress/components';

import '../styles/block.css';

// Define our attribute types
interface PlanetAttributes {
  id?: string;
  width?: string;
  height?: string;
  radius?: string;
  resolution?: string;
  seed?: string;
  waterLevel?: string;
  hasAtmosphere?: boolean;
  hasOcean?: boolean;
  hasVegetation?: boolean;
  waterColor?: string;
  landColor?: string;
  mountainColor?: string;
  snowColor?: string;
  atmosphereColor?: string;
  minTreeHeight?: string;
  maxTreeHeight?: string;
  vegetationDensity?: string;
  className?: string;
}

// Register the Bonsai Planet block
registerBlockType('bonsai-planets/planet', {
  title: 'Bonsai Planet',
  icon: 'admin-site',
  category: 'widgets',
  supports: {
    html: false,
    align: ['wide', 'full']
  },
  
  // Define attributes
  attributes: {
    id: { type: 'string', default: '' },
    width: { type: 'string', default: '100%' },
    height: { type: 'string', default: '400px' },
    radius: { type: 'string', default: '1.0' },
    resolution: { type: 'string', default: '64' },
    seed: { type: 'string', default: '' },
    waterLevel: { type: 'string', default: '0.4' },
    hasAtmosphere: { type: 'boolean', default: true },
    hasOcean: { type: 'boolean', default: true },
    hasVegetation: { type: 'boolean', default: true },
    waterColor: { type: 'string', default: '#3399ff' },
    landColor: { type: 'string', default: '#4d9a4d' },
    mountainColor: { type: 'string', default: '#8c7853' },
    snowColor: { type: 'string', default: '#ffffff' },
    atmosphereColor: { type: 'string', default: '#88aaff' },
    minTreeHeight: { type: 'string', default: '0.5' },
    maxTreeHeight: { type: 'string', default: '0.8' },
    vegetationDensity: { type: 'string', default: '0.5' },
    className: { type: 'string', default: '' },
  },
  
  // Define edit component
  edit: (props) => {
    const { attributes, setAttributes } = props;
    
    const blockProps = useBlockProps({
      className: 'bp-planet-editor-block',
      style: {
        width: attributes.width || '100%',
        height: attributes.height || '400px',
      }
    });

    // Generate a random seed if needed
    if (!attributes.seed) {
      setAttributes({ seed: Math.floor(Math.random() * 1000000).toString() });
    }

    return (
      <>
        <InspectorControls>
          <PanelBody title="Size Settings" initialOpen={true}>
            <PanelRow>
              <TextControl
                label="Width"
                value={attributes.width || '100%'}
                onChange={(value: string) => setAttributes({ width: value })}
                help="CSS width value (px, %, etc.)"
              />
            </PanelRow>
            <PanelRow>
              <TextControl
                label="Height"
                value={attributes.height || '400px'}
                onChange={(value: string) => setAttributes({ height: value })}
                help="CSS height value (px, rem, etc.)"
              />
            </PanelRow>
          </PanelBody>

          <PanelBody title="Planet Settings" initialOpen={true}>
            <PanelRow>
              <TextControl
                label="Random Seed"
                value={attributes.seed || ''}
                onChange={(value: string) => setAttributes({ seed: value })}
                help="Number used to generate the planet (blank for random)"
              />
            </PanelRow>
            <PanelRow>
              <TextControl
                label="Radius"
                value={attributes.radius || '1.0'}
                onChange={(value: string) => setAttributes({ radius: value })}
                type="number"
                step="0.1"
                min="0.5"
                max="2.0"
                help="Planet radius (0.5-2.0)"
              />
            </PanelRow>
            <PanelRow>
              <TextControl
                label="Resolution"
                value={attributes.resolution || '64'}
                onChange={(value: string) => setAttributes({ resolution: value })}
                type="number"
                step="8"
                min="16"
                max="128"
                help="Planet geometry resolution (16-128)"
              />
            </PanelRow>
            <PanelRow>
              <RangeControl
                label="Water Level"
                value={parseFloat(attributes.waterLevel || '0.4')}
                onChange={(value: number | undefined) => setAttributes({ 
                  waterLevel: value !== undefined ? value.toString() : '0.4' 
                })}
                min={0}
                max={1}
                step={0.05}
                help="Height of the ocean surface (0-1)"
              />
            </PanelRow>
          </PanelBody>

          <PanelBody title="Features" initialOpen={false}>
            <PanelRow>
              <ToggleControl
                label="Atmosphere"
                checked={attributes.hasAtmosphere !== false}
                onChange={(value: boolean) => setAttributes({ hasAtmosphere: value })}
                help="Show atmospheric glow around the planet"
              />
            </PanelRow>
            <PanelRow>
              <ToggleControl
                label="Ocean"
                checked={attributes.hasOcean !== false}
                onChange={(value: boolean) => setAttributes({ hasOcean: value })}
                help="Show water on the planet"
              />
            </PanelRow>
            <PanelRow>
              <ToggleControl
                label="Vegetation"
                checked={attributes.hasVegetation !== false}
                onChange={(value: boolean) => setAttributes({ hasVegetation: value })}
                help="Show trees and plants on the planet"
              />
            </PanelRow>
            {attributes.hasVegetation && (
              <>
                <PanelRow>
                  <RangeControl
                    label="Vegetation Density"
                    value={parseFloat(attributes.vegetationDensity || '0.5')}
                    onChange={(value: number | undefined) => setAttributes({ 
                      vegetationDensity: value !== undefined ? value.toString() : '0.5' 
                    })}
                    min={0.1}
                    max={1}
                    step={0.1}
                    help="Density of trees and plants (0.1-1)"
                  />
                </PanelRow>
                <PanelRow>
                  <TextControl
                    label="Min Tree Height"
                    value={attributes.minTreeHeight || '0.5'}
                    onChange={(value: string) => setAttributes({ minTreeHeight: value })}
                    type="number"
                    step="0.05"
                    min="0.1"
                    max="0.9"
                    help="Minimum elevation for tree placement (0.1-0.9)"
                  />
                </PanelRow>
                <PanelRow>
                  <TextControl
                    label="Max Tree Height"
                    value={attributes.maxTreeHeight || '0.8'}
                    onChange={(value: string) => setAttributes({ maxTreeHeight: value })}
                    type="number"
                    step="0.05"
                    min="0.2"
                    max="1.0"
                    help="Maximum elevation for tree placement (0.2-1.0)"
                  />
                </PanelRow>
              </>
            )}
          </PanelBody>

          <PanelBody title="Colors" initialOpen={false}>
            <PanelRow>
              <div className="bp-planets-color-row">
                <p>Water Color</p>
                <ColorPicker
                  color={attributes.waterColor || '#3399ff'}
                  onChangeComplete={(result: { hex: string }) => 
                    setAttributes({ waterColor: result.hex })
                  }
                  disableAlpha
                />
              </div>
            </PanelRow>
            <PanelRow>
              <div className="bp-planets-color-row">
                <p>Land Color</p>
                <ColorPicker
                  color={attributes.landColor || '#4d9a4d'}
                  onChangeComplete={(result: { hex: string }) => 
                    setAttributes({ landColor: result.hex })
                  }
                  disableAlpha
                />
              </div>
            </PanelRow>
            <PanelRow>
              <div className="bp-planets-color-row">
                <p>Mountain Color</p>
                <ColorPicker
                  color={attributes.mountainColor || '#8c7853'}
                  onChangeComplete={(result: { hex: string }) => 
                    setAttributes({ mountainColor: result.hex })
                  }
                  disableAlpha
                />
              </div>
            </PanelRow>
            <PanelRow>
              <div className="bp-planets-color-row">
                <p>Snow Color</p>
                <ColorPicker
                  color={attributes.snowColor || '#ffffff'}
                  onChangeComplete={(result: { hex: string }) => 
                    setAttributes({ snowColor: result.hex })
                  }
                  disableAlpha
                />
              </div>
            </PanelRow>
            {attributes.hasAtmosphere && (
              <PanelRow>
                <div className="bp-planets-color-row">
                  <p>Atmosphere Color</p>
                  <ColorPicker
                    color={attributes.atmosphereColor || '#88aaff'}
                    onChangeComplete={(result: { hex: string }) => 
                      setAttributes({ atmosphereColor: result.hex })
                    }
                    disableAlpha
                  />
                </div>
              </PanelRow>
            )}
          </PanelBody>
        </InspectorControls>

        <div {...blockProps}>
          <div className="bp-flex bp-flex-col bp-items-center bp-justify-center bp-text-center">
            <span className="dashicons dashicons-admin-site bp-text-5xl bp-opacity-70"></span>
            <p className="bp-text-base">Bonsai Planet</p>
            <p className="bp-text-xs bp-opacity-70">
              This placeholder represents your 3D planet.<br />
              The actual planet will be shown on the frontend.
            </p>
          </div>
        </div>
      </>
    );
  },

  // Define save function - server-side rendering is handled in PHP
  save: () => {
    return null;
  }
}); 
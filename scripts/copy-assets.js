#!/usr/bin/env node

/**
 * This script verifies that all necessary files are present in the plugin directory.
 * It should be run once during initial setup.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const pluginPath = path.resolve(__dirname, '../');
const worldsPath = path.join(pluginPath, 'src/worlds');
const naturePath = path.join(pluginPath, 'public/lowpoly_nature');

// Create directories if they don't exist
const createDirIfNotExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Check if files exist
const checkRequiredFiles = () => {
  const requiredWorldFiles = [
    'planet.ts',
    'stars.ts',
    'presets.ts',
    'biome.ts',
    'models.ts',
    'worker.ts',
    'types.ts'
  ];
  
  const missingFiles = [];
  
  console.log('Checking required files...');
  
  // Check world files
  for (const file of requiredWorldFiles) {
    const filePath = path.join(worldsPath, file);
    if (!fs.existsSync(filePath)) {
      missingFiles.push(filePath);
    }
  }
  
  // Check if helper and materials directories exist
  const helperPath = path.join(worldsPath, 'helper');
  const materialsPath = path.join(worldsPath, 'materials');
  
  if (!fs.existsSync(helperPath)) {
    console.log(`Missing directory: ${helperPath}`);
    missingFiles.push(helperPath);
  }
  
  if (!fs.existsSync(materialsPath)) {
    console.log(`Missing directory: ${materialsPath}`);
    missingFiles.push(materialsPath);
  }
  
  // Check if lowpoly_nature directory exists
  if (!fs.existsSync(naturePath)) {
    console.log(`Missing directory: ${naturePath}`);
    missingFiles.push(naturePath);
  } else {
    // Check if it has files
    const files = fs.readdirSync(naturePath);
    if (files.length === 0) {
      console.log(`Warning: No model files found in ${naturePath}`);
    } else {
      console.log(`Found ${files.length} model files in lowpoly_nature directory`);
    }
  }
  
  return missingFiles;
};

// Main function
const setupPlugin = () => {
  console.log('Setting up Bonsai Planets WordPress plugin...');
  
  try {
    // Ensure required directories exist
    createDirIfNotExists(worldsPath);
    createDirIfNotExists(path.join(worldsPath, 'helper'));
    createDirIfNotExists(path.join(worldsPath, 'materials'));
    createDirIfNotExists(naturePath);
    
    // Check for required files
    const missingFiles = checkRequiredFiles();
    
    if (missingFiles.length > 0) {
      console.warn('Warning: Some required files are missing:');
      missingFiles.forEach(file => console.warn(`  - ${file}`));
      console.warn('\nPlease ensure all necessary files are in place before building the plugin.');
    } else {
      console.log('All required files are present.');
      
      // Run build process
      console.log('\nBuilding plugin assets...');
      process.chdir(pluginPath);
      execSync('npm run build', { stdio: 'inherit' });
      
      console.log('\nPlugin assets built successfully!');
      console.log('\nThe plugin is ready to use. You can install it in your WordPress site.');
    }
  } catch (error) {
    console.error('Error during setup:', error);
    process.exit(1);
  }
};

// Execute the main function
setupPlugin(); 
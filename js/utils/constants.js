import * as THREE from 'three';

/**
 * Rotation axes for each face (in cube space)
 */
export const AXES = {
  'R': new THREE.Vector3(1, 0, 0),   // Right
  'L': new THREE.Vector3(-1, 0, 0),  // Left
  'U': new THREE.Vector3(0, 1, 0),   // Up
  'D': new THREE.Vector3(0, -1, 0),  // Down
  'F': new THREE.Vector3(0, 0, 1),   // Front
  'B': new THREE.Vector3(0, 0, -1)   // Back
};

export const FACES = ['R', 'L', 'U', 'D', 'F', 'B'];
export const MODIFIERS = ['', "'", '2'];

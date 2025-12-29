import * as THREE from 'three';

/**
 * Identifies cube pieces in GLTF scene and builds face mapping
 * @param {THREE.Object3D} gltfScene - The loaded GLTF scene
 * @returns {Object} Object with getPiecesForFace(face) method
 */
export function identifyPiecesAndBuildFaceMap(gltfScene) {
  const allPieces = [];

  // Update world matrices first
  gltfScene.updateMatrixWorld(true);

  // Debug: log all node names to see what's actually in the scene
  const allNames = [];
  gltfScene.traverse((node) => {
    if (node.name) {
      allNames.push(node.name);
    }
  });
  console.log('All node names in scene (first 50):', allNames.slice(0, 50));

  // Find all cube pieces (only parent nodes, not meshes or Object nodes)
  gltfScene.traverse((node) => {
    if (node.name &&
        !node.name.includes('_Rubik_0') &&
        !node.name.startsWith('Object_') &&
        (node.name.startsWith('R2.Center_') ||
         node.name.startsWith('R2.Corner_') ||
         node.name.startsWith('R2.Edge_') ||
         node.name.startsWith('R2Center_') ||
         node.name.startsWith('R2Corner_') ||
         node.name.startsWith('R2Edge_'))
    ) {
      allPieces.push(node);
    }
  });

  console.log(`Found ${allPieces.length} cube pieces`);

  // Helper to get actual world position (center of bounding box)
  const getPieceWorldPosition = (piece) => {
    piece.updateWorldMatrix(true, true);
    const box = new THREE.Box3().setFromObject(piece);
    const center = new THREE.Vector3();
    box.getCenter(center);
    return center;
  };

  // Get all positions to determine threshold
  const positions = allPieces.map(getPieceWorldPosition);

  // Find the range of positions to determine threshold
  let maxX = 0, maxY = 0, maxZ = 0;
  positions.forEach(pos => {
    maxX = Math.max(maxX, Math.abs(pos.x));
    maxY = Math.max(maxY, Math.abs(pos.y));
    maxZ = Math.max(maxZ, Math.abs(pos.z));
  });

  // Calculate threshold as midpoint between center and outer layer
  // Typically pieces are at -1, 0, 1 so threshold should be ~0.5
  const avgMax = (maxX + maxY + maxZ) / 3;
  const threshold = avgMax * 0.4;
  console.log(`Position range: X=${maxX.toFixed(2)}, Y=${maxY.toFixed(2)}, Z=${maxZ.toFixed(2)}`);
  console.log(`Using threshold: ${threshold.toFixed(2)}`);
  console.log(`Piece names found:`, allPieces.map(p => p.name));

  const faceSelectors = {
    'R': (pos) => pos.x > threshold,
    'L': (pos) => pos.x < -threshold,
    'U': (pos) => pos.y > threshold,
    'D': (pos) => pos.y < -threshold,
    'F': (pos) => pos.z > threshold,
    'B': (pos) => pos.z < -threshold
  };

  const getPiecesForFace = (face) => {
    const selector = faceSelectors[face];
    if (!selector) return [];
    return allPieces.filter(piece => selector(getPieceWorldPosition(piece)));
  };

  const faces = ['R', 'L', 'U', 'D', 'F', 'B'];
  faces.forEach(face => {
    console.log(`Face ${face}: ${getPiecesForFace(face).length} pieces`);
  });

  return {
    getPiecesForFace
  };
}

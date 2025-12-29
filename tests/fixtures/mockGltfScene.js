import * as THREE from 'three';

/**
 * Creates a minimal Three.js scene for testing MoveExecutor
 */
export function createMockCubeScene() {
  const scene = new THREE.Scene();
  const cubeRoot = new THREE.Group();
  cubeRoot.name = 'CubeRoot';
  scene.add(cubeRoot);

  // Create a single piece for testing
  const piece = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 1),
    new THREE.MeshBasicMaterial()
  );
  piece.name = 'R2.Corner_FRU';
  piece.position.set(1, 1, 1);
  cubeRoot.add(piece);

  return { scene, cubeRoot, pieces: [piece] };
}

/**
 * Creates a mock piece locator for testing
 */
export function createMockPieceLocator(pieces) {
  return {
    getPiecesForFace: (face) => {
      // Simple mock: return all pieces for any face
      return pieces;
    }
  };
}

/**
 * Creates a full 3x3x3 cube structure for testing piece identification
 */
export function createFullMockCubeScene() {
  const scene = new THREE.Scene();

  // Create pieces at all 26 positions (excluding center)
  const positions = [];
  for (let x = -1; x <= 1; x++) {
    for (let y = -1; y <= 1; y++) {
      for (let z = -1; z <= 1; z++) {
        if (x === 0 && y === 0 && z === 0) continue; // Skip center
        positions.push([x, y, z]);
      }
    }
  }

  positions.forEach((pos, i) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(0.9, 0.9, 0.9),
      new THREE.MeshBasicMaterial()
    );
    mesh.name = `R2.Corner_${i}`;
    mesh.position.set(...pos);
    scene.add(mesh);
  });

  scene.updateMatrixWorld(true);

  return scene;
}

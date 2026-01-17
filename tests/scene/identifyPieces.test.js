// @vitest-environment happy-dom
import { describe, expect, it } from 'vitest';
import { identifyPiecesAndBuildFaceMap } from '../../js/scene/identifyPieces.js';
import { createFullMockCubeScene } from '../fixtures/mockGltfScene.js';

describe('identifyPiecesAndBuildFaceMap', () => {
  it('identifies pieces in scene', () => {
    const scene = createFullMockCubeScene();

    const pieceLocator = identifyPiecesAndBuildFaceMap(scene);

    expect(pieceLocator).toHaveProperty('getPiecesForFace');
    expect(typeof pieceLocator.getPiecesForFace).toBe('function');
  });

  it('returns empty array for invalid face', () => {
    const scene = createFullMockCubeScene();
    const pieceLocator = identifyPiecesAndBuildFaceMap(scene);

    const pieces = pieceLocator.getPiecesForFace('X');

    expect(pieces).toEqual([]);
  });

  it('identifies correct pieces for each face', () => {
    const scene = createFullMockCubeScene();
    const pieceLocator = identifyPiecesAndBuildFaceMap(scene);

    const faces = ['R', 'L', 'U', 'D', 'F', 'B'];

    faces.forEach((face) => {
      const pieces = pieceLocator.getPiecesForFace(face);

      // Each face should have 9 pieces in a full cube
      expect(pieces.length).toBeGreaterThan(0);
      expect(pieces.length).toBeLessThanOrEqual(9);
    });
  });

  it('identifies right face pieces correctly', () => {
    const scene = createFullMockCubeScene();
    const pieceLocator = identifyPiecesAndBuildFaceMap(scene);

    const rightPieces = pieceLocator.getPiecesForFace('R');

    // All pieces should have positive x position > threshold
    rightPieces.forEach((piece) => {
      expect(piece.position.x).toBeGreaterThan(0.3);
    });
  });

  it('identifies left face pieces correctly', () => {
    const scene = createFullMockCubeScene();
    const pieceLocator = identifyPiecesAndBuildFaceMap(scene);

    const leftPieces = pieceLocator.getPiecesForFace('L');

    // All pieces should have negative x position < -threshold
    leftPieces.forEach((piece) => {
      expect(piece.position.x).toBeLessThan(-0.3);
    });
  });
});

// @vitest-environment happy-dom
import { describe, it, expect, beforeEach } from 'vitest';
import * as THREE from 'three';
import { MoveExecutor } from '../../js/animation/MoveExecutor.js';
import { createMockCubeScene, createMockPieceLocator } from '../fixtures/mockGltfScene.js';

describe('MoveExecutor', () => {
  let executor;
  let mockScene;
  let mockPieceLocator;

  beforeEach(() => {
    const setup = createMockCubeScene();
    mockScene = setup;
    mockPieceLocator = createMockPieceLocator(setup.pieces);
    executor = new MoveExecutor(mockPieceLocator, setup.cubeRoot);
  });

  describe('parseMove', () => {
    it('parses clockwise move', () => {
      const result = executor.parseMove('R');

      expect(result.face).toBe('R');
      expect(result.angle).toBe(-Math.PI / 2);
    });

    it('parses counter-clockwise move', () => {
      const result = executor.parseMove("U'");

      expect(result.face).toBe('U');
      expect(result.angle).toBe(Math.PI / 2);
    });

    it('parses 180-degree move', () => {
      const result = executor.parseMove('F2');

      expect(result.face).toBe('F');
      expect(result.angle).toBe(Math.PI);
    });
  });

  describe('easeInOutCubic', () => {
    it('returns 0 at t=0', () => {
      expect(executor.easeInOutCubic(0)).toBe(0);
    });

    it('returns 1 at t=1', () => {
      expect(executor.easeInOutCubic(1)).toBe(1);
    });

    it('returns 0.5 at t=0.5', () => {
      expect(executor.easeInOutCubic(0.5)).toBe(0.5);
    });

    it('returns values between 0 and 1 for inputs between 0 and 1', () => {
      const testValues = [0.1, 0.25, 0.75, 0.9];

      testValues.forEach(t => {
        const result = executor.easeInOutCubic(t);
        expect(result).toBeGreaterThanOrEqual(0);
        expect(result).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('executeMove', () => {
    it('returns false when no pieces found', async () => {
      const emptyLocator = createMockPieceLocator([]);
      const emptyExecutor = new MoveExecutor(emptyLocator, mockScene.cubeRoot);

      const result = await emptyExecutor.executeMove('R', 0);

      expect(result).toBe(false);
    });

    it('returns true when move executes successfully', async () => {
      const result = await executor.executeMove('R', 0);

      expect(result).toBe(true);
    });

    it('executes instantly when duration is 0', async () => {
      const startTime = performance.now();

      await executor.executeMove('R', 0);

      const elapsed = performance.now() - startTime;
      expect(elapsed).toBeLessThan(50); // Should be near-instant
    });
  });

  describe('animatePivotRotation', () => {
    it('resolves immediately when duration is 0', async () => {
      const pivot = new THREE.Group();
      const axis = new THREE.Vector3(1, 0, 0);
      const angle = Math.PI / 2;

      const startTime = performance.now();
      await executor.animatePivotRotation(pivot, axis, angle, 0);
      const elapsed = performance.now() - startTime;

      expect(elapsed).toBeLessThan(50);
    });

    it('applies correct rotation angle', async () => {
      const pivot = new THREE.Group();
      const axis = new THREE.Vector3(1, 0, 0);
      const angle = Math.PI / 2;

      await executor.animatePivotRotation(pivot, axis, angle, 0);

      // Check that rotation was applied
      const expectedQuat = new THREE.Quaternion().setFromAxisAngle(axis, angle);
      expect(pivot.quaternion.x).toBeCloseTo(expectedQuat.x, 5);
      expect(pivot.quaternion.y).toBeCloseTo(expectedQuat.y, 5);
      expect(pivot.quaternion.z).toBeCloseTo(expectedQuat.z, 5);
      expect(pivot.quaternion.w).toBeCloseTo(expectedQuat.w, 5);
    });
  });
});

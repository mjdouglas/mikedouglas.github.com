import { describe, it, expect, beforeEach, vi } from 'vitest';
import { KociembaSolver } from '../../js/solver/KociembaSolver.js';
import { MockCube } from '../fixtures/mockCubejsSolver.js';

describe('KociembaSolver', () => {
  beforeEach(() => {
    MockCube.reset();
    global.window = { Cube: MockCube };
  });

  it('initializes solver on first call to ensureReady()', async () => {
    const solver = new KociembaSolver();

    expect(MockCube.solverInitialized).toBe(false);

    await solver.ensureReady();

    expect(MockCube.solverInitialized).toBe(true);
  });

  it('does not reinitialize on subsequent calls', async () => {
    const solver = new KociembaSolver();

    await solver.ensureReady();
    const initSpy = vi.spyOn(MockCube, 'initSolver');

    await solver.ensureReady();
    await solver.ensureReady();

    expect(initSpy).not.toHaveBeenCalled();
  });

  it('throws error when window.Cube is not available', async () => {
    global.window = {};
    const solver = new KociembaSolver();

    await expect(solver.ensureReady()).rejects.toThrow('cubejs solver failed to load');
  });

  it('solves scramble and returns array of moves', async () => {
    const solver = new KociembaSolver();
    const scramble = ['R', 'U', 'F'];

    const solution = await solver.solve(scramble);

    expect(Array.isArray(solution)).toBe(true);
    expect(solution.length).toBeGreaterThan(0);
    expect(MockCube.instances.length).toBe(1);
    expect(MockCube.instances[0].moves).toBe('R U F');
  });

  it('properly formats solution string', async () => {
    const solver = new KociembaSolver();

    const solution = await solver.solve(['R', 'U']);

    // Mock returns "R U R' U' R' F R F'"
    expect(solution).toEqual(['R', 'U', "R'", "U'", "R'", 'F', 'R', "F'"]);
  });

  it('handles empty scramble', async () => {
    const solver = new KociembaSolver();

    const solution = await solver.solve([]);

    expect(Array.isArray(solution)).toBe(true);
  });
});

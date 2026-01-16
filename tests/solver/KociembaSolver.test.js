import { describe, it, expect, beforeEach, vi } from 'vitest';
import { MockCube } from '../fixtures/mockCubejsSolver.js';

// Mock Worker class for Node.js environment
class MockWorker {
  constructor() {
    this.onmessage = null;
    this.messageHandlers = [];
  }

  postMessage(data) {
    // Simulate async worker response
    setTimeout(() => {
      if (data.type === 'init') {
        MockCube.initSolver();
        if (this.onmessage) {
          this.onmessage({ data: { type: 'ready', id: data.id } });
        }
      } else if (data.type === 'solve') {
        const cube = new MockCube();
        cube.move(data.scrambleMoves.join(' '));
        const solutionString = cube.solve();
        const solution = solutionString.trim().split(/\s+/).filter(Boolean);
        if (this.onmessage) {
          this.onmessage({ data: { type: 'solution', id: data.id, solution } });
        }
      }
    }, 0);
  }

  addEventListener(event, handler) {
    this.messageHandlers.push(handler);
  }

  removeEventListener(event, handler) {
    this.messageHandlers = this.messageHandlers.filter(h => h !== handler);
  }
}

// Mock global Worker
vi.stubGlobal('Worker', MockWorker);

// Mock URL constructor for worker imports
vi.stubGlobal('URL', class extends URL {
  constructor(path, base) {
    if (typeof path === 'string' && path.includes('worker')) {
      super('file:///mock-worker.js');
    } else {
      super(path, base);
    }
  }
});

// Import after mocking
const { KociembaSolver } = await import('../../js/solver/KociembaSolver.js');

describe('KociembaSolver', () => {
  beforeEach(() => {
    MockCube.reset();
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

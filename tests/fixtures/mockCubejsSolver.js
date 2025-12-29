/**
 * Mock implementation of cubejs Cube for testing
 * Mimics the behavior of the real cube.js library without requiring CDN
 */
export class MockCube {
  constructor() {
    this.moves = '';
    MockCube.instances.push(this);
  }

  move(moveString) {
    this.moves = moveString;
  }

  solve() {
    // Return deterministic solution for testing
    return "R U R' U' R' F R F'";
  }

  static initSolver() {
    MockCube.solverInitialized = true;
  }

  static reset() {
    MockCube.solverInitialized = false;
    MockCube.instances = [];
  }
}

MockCube.solverInitialized = false;
MockCube.instances = [];

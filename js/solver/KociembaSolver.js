import Cube from 'cubejs';
import 'cubejs/lib/solve';

/**
 * Wrapper around cubejs' two-phase (Kociemba) solver
 */
export class KociembaSolver {
  constructor() {
    this.initialized = false;
    this.initPromise = null;
  }

  async ensureReady() {
    if (this.initialized) return;
    if (!this.initPromise) {
      // Cube.initSolver() is synchronous but expensive; wrap in a promise for consistent await
      this.initPromise = Promise.resolve().then(() => {
        Cube.initSolver();
        this.initialized = true;
      });
    }
    return this.initPromise;
  }

  async solve(scrambleMoves) {
    await this.ensureReady();
    const scrambleString = scrambleMoves.join(' ');
    const cube = new Cube();
    cube.move(scrambleString);
    const solutionString = cube.solve();
    return solutionString
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }
}

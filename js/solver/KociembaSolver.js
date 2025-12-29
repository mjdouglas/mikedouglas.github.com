/**
 * Wrapper around cubejs' two-phase (Kociemba) solver
 * Depends on global window.Cube from CDN
 */
export class KociembaSolver {
  constructor() {
    this.initialized = false;
    this.initPromise = null;
  }

  async ensureReady() {
    if (this.initialized) return;
    if (!window.Cube) {
      throw new Error('cubejs solver failed to load');
    }
    if (!this.initPromise) {
      // Cube.initSolver() is synchronous but expensive; wrap in a promise for consistent await
      this.initPromise = Promise.resolve().then(() => {
        window.Cube.initSolver();
        this.initialized = true;
      });
    }
    return this.initPromise;
  }

  async solve(scrambleMoves) {
    await this.ensureReady();
    const scrambleString = scrambleMoves.join(' ');
    const cube = new window.Cube();
    cube.move(scrambleString);
    const solutionString = cube.solve();
    return solutionString
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }
}

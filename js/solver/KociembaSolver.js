/**
 * Wrapper around cubejs' two-phase (Kociemba) solver
 * Uses a Web Worker to avoid blocking the main thread during initialization
 */
export class KociembaSolver {
  constructor() {
    this.initialized = false;
    this.initPromise = null;
    this.messageId = 0;
    this.pendingMessages = new Map();

    // Create worker using Vite's worker import syntax
    this.worker = new Worker(new URL('./solver.worker.js', import.meta.url), {
      type: 'module',
    });

    // Handle messages from worker
    this.worker.onmessage = (e) => {
      const { type, id } = e.data;

      if (type === 'ready') {
        this.initialized = true;
        const resolve = this.pendingMessages.get(id);
        if (resolve) {
          resolve();
          this.pendingMessages.delete(id);
        }
      } else if (type === 'solution') {
        console.log(
          'Received solution from worker, id:',
          id,
          'moves:',
          e.data.solution.length,
        );
        const resolve = this.pendingMessages.get(id);
        if (resolve) {
          resolve(e.data.solution);
          this.pendingMessages.delete(id);
        }
      } else if (type === 'error') {
        console.error('Solver worker error:', e.data.error);
        const resolve = this.pendingMessages.get(id);
        if (resolve) {
          // Resolve with empty array on error
          resolve([]);
          this.pendingMessages.delete(id);
        }
      }
    };

    // Handle worker errors
    this.worker.onerror = (e) => {
      console.error('Solver worker crashed:', e.message);
    };
  }

  async ensureReady() {
    if (this.initialized) return;
    if (!this.initPromise) {
      const id = this.messageId++;
      this.initPromise = new Promise((resolve) => {
        this.pendingMessages.set(id, resolve);
        this.worker.postMessage({ type: 'init', id });
      });
    }
    return this.initPromise;
  }

  async solve(scrambleMoves) {
    await this.ensureReady();

    const id = this.messageId++;
    console.log(
      'Sending solve request to worker, id:',
      id,
      'moves:',
      scrambleMoves.length,
    );
    return new Promise((resolve) => {
      this.pendingMessages.set(id, resolve);
      this.worker.postMessage({ type: 'solve', id, scrambleMoves });
    });
  }
}

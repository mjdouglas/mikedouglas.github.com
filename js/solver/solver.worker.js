// Web Worker for Rubik's cube solver
// Runs cubejs initialization and solving off the main thread

import Cube from 'cubejs';
import 'cubejs/lib/solve';

let initialized = false;

self.onmessage = (e) => {
  const { type, id } = e.data;

  if (type === 'init') {
    // Initialize the solver (builds lookup tables - expensive operation)
    const startTime = performance.now();
    Cube.initSolver();
    const elapsed = performance.now() - startTime;
    console.log(`Solver initialization took ${elapsed.toFixed(0)}ms`);
    initialized = true;
    self.postMessage({ type: 'ready', id });
  } else if (type === 'solve') {
    if (!initialized) {
      self.postMessage({ type: 'error', id, error: 'Solver not initialized' });
      return;
    }

    try {
      const { scrambleMoves } = e.data;
      console.log('Worker received solve request, id:', id, 'moves:', scrambleMoves.length);
      const scrambleString = scrambleMoves.join(' ');
      const cube = new Cube();
      cube.move(scrambleString);
      console.log('Worker solving...');
      const solutionString = cube.solve();
      console.log('Worker solved, solution length:', solutionString.length);
      const solution = solutionString
        .trim()
        .split(/\s+/)
        .filter(Boolean);

      self.postMessage({ type: 'solution', id, solution });
    } catch (err) {
      console.error('Solver error:', err);
      self.postMessage({ type: 'error', id, error: err.message });
    }
  }
};

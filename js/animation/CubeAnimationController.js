import { generateScramble } from '../solver/generateScramble.js';
import { KociembaSolver } from '../solver/KociembaSolver.js';
import { MoveExecutor } from './MoveExecutor.js';
import { identifyPiecesAndBuildFaceMap } from '../scene/identifyPieces.js';

/**
 * Main animation controller - orchestrates scramble/solve loop
 */
export class CubeAnimationController {
  constructor(gltfModel, solver = null) {
    this.pieceLocator = identifyPiecesAndBuildFaceMap(gltfModel);
    this.executor = new MoveExecutor(this.pieceLocator, gltfModel);
    this.solver = solver || new KociembaSolver();  // Use provided or create new
    this.isRunning = false;
    this.firstCycle = true;

    // Entropy tracking (0 = solved, moves away from solved = higher entropy)
    this.movesFromSolved = 0;
    this.onEntropyChange = null; // Callback: (movesFromSolved, phase) => void
  }

  /**
   * Set callback for entropy state changes
   * @param {Function} callback - Called with (movesFromSolved, phase)
   *   phase: 'scrambling' | 'solving' | 'paused'
   */
  setEntropyCallback(callback) {
    this.onEntropyChange = callback;
  }

  /**
   * Emit entropy change event
   */
  emitEntropyChange(phase) {
    if (this.onEntropyChange) {
      this.onEntropyChange(this.movesFromSolved, phase);
    }
  }

  async startContinuousLoop(initialScramble = null) {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('Starting continuous solve/scramble loop...');

    while (this.isRunning) {
      try {
        let executedScramble;

        // 1. Use initial scramble on first cycle, or generate new one
        if (this.firstCycle && initialScramble) {
          console.log('Using pre-applied scramble:', initialScramble.join(' '));
          executedScramble = initialScramble;
          // Set initial entropy for pre-applied scramble
          this.movesFromSolved = initialScramble.length;
          this.emitEntropyChange('scrambling');
        } else {
          // Generate scramble
          const scramble = generateScramble(25);
          console.log('Scrambling:', scramble.join(' '));

          // 2. Execute scramble (instant for first cycle, fast animation otherwise)
          const scrambleDuration = this.firstCycle ? 0 : 100;
          executedScramble = [];
          for (const move of scramble) {
            const success = await this.executor.executeMove(move, scrambleDuration);
            if (success) {
              executedScramble.push(move);
              // Increment entropy with each scramble move
              this.movesFromSolved++;
              this.emitEntropyChange('scrambling');
            }
          }

          if (!this.firstCycle) {
            // 3. Brief pause after scramble
            this.emitEntropyChange('paused');
            await this.sleep(1000);
          }
        }

        // 4. Solve using cube.js' Kociemba implementation
        console.log('Solving cube with Kociemba...');
        const scrambleForSolver = executedScramble;
        const solution = await this.solver.solve(scrambleForSolver);
        console.log('Solution:', solution.join(' '), `(${solution.length} moves)`);

        // 5. Execute solution (normal: 500ms per move)
        // Estimate moves remaining based on solution length
        let solveMoveIndex = 0;
        for (const move of solution) {
          await this.executor.executeMove(move, 500);
          solveMoveIndex++;
          // Decrease entropy as we solve (estimate remaining disorder)
          this.movesFromSolved = Math.max(0, solution.length - solveMoveIndex);
          this.emitEntropyChange('solving');
        }

        // 6. Pause before next cycle (cube is solved, entropy = 0)
        this.movesFromSolved = 0;
        this.emitEntropyChange('paused');
        await this.sleep(2000);

        this.firstCycle = false;

      } catch (error) {
        console.error('Error in animation loop:', error);
        await this.sleep(5000); // Wait before retry
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  stop() {
    this.isRunning = false;
  }
}

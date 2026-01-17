import { identifyPiecesAndBuildFaceMap } from '../scene/identifyPieces.js';
import { generateScramble } from '../solver/generateScramble.js';
import { KociembaSolver } from '../solver/KociembaSolver.js';
import { MoveExecutor } from './MoveExecutor.js';

/**
 * Main animation controller - orchestrates scramble/solve loop
 */
export class CubeAnimationController {
  constructor(gltfModel, solver = null, callbacks = {}) {
    this.pieceLocator = identifyPiecesAndBuildFaceMap(gltfModel);
    this.executor = new MoveExecutor(this.pieceLocator, gltfModel);
    this.solver = solver || new KociembaSolver(); // Use provided or create new
    this.isRunning = false;
    this.firstCycle = true;
    this.onSolved = callbacks.onSolved || (() => {});
    this.onScrambling = callbacks.onScrambling || (() => {});
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
        } else {
          // Generate scramble
          const scramble = generateScramble(25);
          console.log('Scrambling:', scramble.join(' '));

          // 2. Execute scramble (instant for first cycle, fast animation otherwise)
          const scrambleDuration = this.firstCycle ? 0 : 100;
          executedScramble = [];
          for (const move of scramble) {
            const success = await this.executor.executeMove(
              move,
              scrambleDuration,
            );
            if (success) {
              executedScramble.push(move);
            }
          }

          if (!this.firstCycle) {
            // 3. Brief pause after scramble
            await this.sleep(1000);
          }
        }

        // 4. Solve using cube.js' Kociemba implementation
        console.log('Solving cube with Kociemba...');
        const scrambleForSolver = executedScramble;
        const solution = await this.solver.solve(scrambleForSolver);
        console.log(
          'Solution:',
          solution.join(' '),
          `(${solution.length} moves)`,
        );

        // 5. Execute solution (normal: 500ms per move)
        for (const move of solution) {
          await this.executor.executeMove(move, 500);
        }

        // 6. Cube is now solved - trigger callback
        this.onSolved();

        // 7. Pause before next cycle
        await this.sleep(2000);

        // 8. About to scramble - trigger callback
        this.onScrambling();

        this.firstCycle = false;
      } catch (error) {
        console.error('Error in animation loop:', error);
        await this.sleep(5000); // Wait before retry
      }
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  stop() {
    this.isRunning = false;
  }
}

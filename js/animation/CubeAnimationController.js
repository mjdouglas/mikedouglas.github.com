import { generateScramble } from '../solver/generateScramble.js';
import { KociembaSolver } from '../solver/KociembaSolver.js';
import { MoveExecutor } from './MoveExecutor.js';
import { identifyPiecesAndBuildFaceMap } from '../scene/identifyPieces.js';

/**
 * Main animation controller - orchestrates scramble/solve loop
 */
export class CubeAnimationController {
  constructor(gltfModel) {
    this.pieceLocator = identifyPiecesAndBuildFaceMap(gltfModel);
    this.executor = new MoveExecutor(this.pieceLocator, gltfModel);
    this.solver = new KociembaSolver();
    this.isRunning = false;
    this.firstCycle = true;
  }

  async startContinuousLoop() {
    if (this.isRunning) return;
    this.isRunning = true;

    console.log('Starting continuous solve/scramble loop...');

    while (this.isRunning) {
      try {
        // 1. Generate scramble
        const scramble = generateScramble(25);
        console.log('Scrambling:', scramble.join(' '));

        // 2. Execute scramble (instant for first cycle, fast animation otherwise)
        const scrambleDuration = this.firstCycle ? 0 : 100;
        const executedScramble = [];
        for (const move of scramble) {
          const success = await this.executor.executeMove(move, scrambleDuration);
          if (success) {
            executedScramble.push(move);
          }
        }

        if (!this.firstCycle) {
          // 3. Brief pause after scramble
          await this.sleep(1000);
        }

        // 4. Solve using cube.js' Kociemba implementation
        console.log('Solving cube with Kociemba...');
        if (executedScramble.length !== scramble.length) {
          console.warn(
            `Executed ${executedScramble.length} of ${scramble.length} scramble moves; solving actual executed sequence`
          );
        }
        const scrambleForSolver = executedScramble.length ? executedScramble : scramble;
        const solution = await this.solver.solve(scrambleForSolver);
        console.log('Solution:', solution.join(' '), `(${solution.length} moves)`);

        // 5. Execute solution (normal: 500ms per move)
        for (const move of solution) {
          await this.executor.executeMove(move, 500);
        }

        // 6. Pause before next cycle
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

import { describe, expect, it } from 'vitest';
import { generateScramble } from '../../js/solver/generateScramble.js';

describe('generateScramble', () => {
  it('generates scramble of correct length', () => {
    const scramble = generateScramble(25);
    expect(scramble).toHaveLength(25);
  });

  it('only uses valid faces', () => {
    const scramble = generateScramble(50);
    const validFaces = ['R', 'L', 'U', 'D', 'F', 'B'];

    scramble.forEach((move) => {
      const face = move[0];
      expect(validFaces).toContain(face);
    });
  });

  it('only uses valid modifiers', () => {
    const scramble = generateScramble(50);
    const validModifiers = ['', "'", '2'];

    scramble.forEach((move) => {
      const modifier = move.slice(1);
      expect(validModifiers).toContain(modifier);
    });
  });

  it('avoids consecutive same-face moves', () => {
    const scramble = generateScramble(100);

    for (let i = 1; i < scramble.length; i++) {
      const currentFace = scramble[i][0];
      const previousFace = scramble[i - 1][0];
      expect(currentFace).not.toBe(previousFace);
    }
  });

  it('avoids consecutive opposite-face moves', () => {
    const scramble = generateScramble(100);
    const oppositeFace = {
      R: 'L',
      L: 'R',
      U: 'D',
      D: 'U',
      F: 'B',
      B: 'F',
    };

    for (let i = 1; i < scramble.length; i++) {
      const currentFace = scramble[i][0];
      const previousFace = scramble[i - 1][0];
      expect(currentFace).not.toBe(oppositeFace[previousFace]);
    }
  });

  it('produces different scrambles on multiple calls', () => {
    const scramble1 = generateScramble(10).join(' ');
    const scramble2 = generateScramble(10).join(' ');

    // Very unlikely to be identical
    expect(scramble1).not.toBe(scramble2);
  });
});

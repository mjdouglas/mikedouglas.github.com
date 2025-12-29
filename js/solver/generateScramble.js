/**
 * Generates a random Rubik's Cube scramble sequence
 * @param {number} length - Number of moves in scramble
 * @returns {string[]} Array of move strings (e.g., ["R", "U'", "F2"])
 */
export function generateScramble(length = 25) {
  const faces = ['R', 'L', 'U', 'D', 'F', 'B'];
  const modifiers = ['', "'", '2'];
  const scramble = [];
  let lastFace = null;

  const oppositeFace = {
    'R': 'L', 'L': 'R',
    'U': 'D', 'D': 'U',
    'F': 'B', 'B': 'F'
  };

  while (scramble.length < length) {
    const face = faces[Math.floor(Math.random() * faces.length)];

    // Avoid consecutive moves on same or opposite faces
    if (face === lastFace || face === oppositeFace[lastFace]) {
      continue;
    }

    const mod = modifiers[Math.floor(Math.random() * modifiers.length)];
    scramble.push(face + mod);
    lastFace = face;
  }

  return scramble;
}

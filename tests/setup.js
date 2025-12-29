import { vi } from 'vitest';

// Mock requestAnimationFrame for Node.js tests
if (typeof requestAnimationFrame === 'undefined') {
  global.requestAnimationFrame = vi.fn((cb) => {
    setTimeout(cb, 16);
    return 1;
  });
}

// Mock performance.now() for timing tests
if (typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now()
  };
}

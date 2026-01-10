import * as THREE from 'three';

/**
 * Controls dynamic lighting based on cube entropy state.
 *
 * Entropy states:
 * - High entropy (scrambled): Warm, flickering, unstable lights
 * - Low entropy (solved): Cool, stable, calm studio lighting
 */
export class EntropyLightingController {
  constructor(lights, options = {}) {
    // Store light references
    this.ambientLight = lights.ambient;
    this.directionalLights = lights.directional || [];
    this.pointLight = lights.point;

    // Store original light properties for interpolation
    this.originalState = this.captureState();

    // Entropy state (0 = solved/ordered, 1 = scrambled/chaotic)
    this.entropy = 1.0;
    this.targetEntropy = 1.0;

    // Animation settings
    this.transitionSpeed = options.transitionSpeed || 2.0; // entropy units per second
    this.flickerIntensity = options.flickerIntensity || 0.15;
    this.flickerSpeed = options.flickerSpeed || 8.0;

    // Color temperatures (in Kelvin, converted to RGB)
    this.warmColor = new THREE.Color().setHSL(0.08, 0.9, 0.6);  // Warm orange
    this.coolColor = new THREE.Color().setHSL(0.6, 0.3, 0.95);  // Cool white-blue
    this.neutralColor = new THREE.Color(0xffffff);

    // Time tracking for flicker
    this.time = 0;
    this.flickerOffsets = this.directionalLights.map(() => Math.random() * Math.PI * 2);

    // Solved state lighting (calmer, more even)
    this.solvedState = {
      ambientIntensity: 0.5,
      directionalIntensities: [0.8, 0.6, 0.9],
      pointIntensity: 0.4,
      exposure: 1.0
    };

    // Scrambled state lighting (more dramatic, contrasty)
    this.scrambledState = {
      ambientIntensity: 0.25,
      directionalIntensities: [1.4, 0.3, 1.5],
      pointIntensity: 0.8,
      exposure: 1.1
    };
  }

  /**
   * Capture current light state for reference
   */
  captureState() {
    return {
      ambientIntensity: this.ambientLight?.intensity || 0.35,
      ambientColor: this.ambientLight?.color.clone() || new THREE.Color(0xffffff),
      directionalIntensities: this.directionalLights.map(l => l.intensity),
      directionalColors: this.directionalLights.map(l => l.color.clone()),
      pointIntensity: this.pointLight?.intensity || 0.65,
      pointColor: this.pointLight?.color.clone() || new THREE.Color(0xffffff)
    };
  }

  /**
   * Set entropy level (0 = solved, 1 = scrambled)
   * @param {number} entropy - Entropy value between 0 and 1
   * @param {boolean} instant - If true, apply immediately without transition
   */
  setEntropy(entropy, instant = false) {
    this.targetEntropy = Math.max(0, Math.min(1, entropy));
    if (instant) {
      this.entropy = this.targetEntropy;
    }
  }

  /**
   * Set entropy based on number of moves from solved state
   * @param {number} movesFromSolved - Number of moves away from solved
   * @param {number} maxMoves - Maximum moves to consider (default 25)
   */
  setEntropyFromMoves(movesFromSolved, maxMoves = 25) {
    // Use a curve that rises quickly then plateaus
    const normalized = Math.min(movesFromSolved / maxMoves, 1);
    const curved = 1 - Math.pow(1 - normalized, 2); // Quadratic ease-out
    this.setEntropy(curved);
  }

  /**
   * Update lighting state - call this every frame
   * @param {number} deltaTime - Time since last frame in seconds
   * @param {THREE.WebGLRenderer} renderer - Optional renderer for exposure control
   */
  update(deltaTime, renderer = null) {
    this.time += deltaTime;

    // Smoothly interpolate entropy toward target
    if (this.entropy !== this.targetEntropy) {
      const diff = this.targetEntropy - this.entropy;
      const step = this.transitionSpeed * deltaTime;
      if (Math.abs(diff) < step) {
        this.entropy = this.targetEntropy;
      } else {
        this.entropy += Math.sign(diff) * step;
      }
    }

    // Calculate flicker amount (more flicker at high entropy)
    const flickerAmount = this.entropy * this.flickerIntensity;

    // Interpolate between solved and scrambled states
    const t = this.entropy;

    // Update ambient light
    if (this.ambientLight) {
      const baseIntensity = THREE.MathUtils.lerp(
        this.solvedState.ambientIntensity,
        this.scrambledState.ambientIntensity,
        t
      );
      // Ambient flickers less
      const flicker = Math.sin(this.time * this.flickerSpeed * 0.5) * flickerAmount * 0.3;
      this.ambientLight.intensity = baseIntensity + flicker;

      // Color shift
      this.ambientLight.color.lerpColors(this.coolColor, this.warmColor, t * 0.3);
    }

    // Update directional lights
    this.directionalLights.forEach((light, i) => {
      const solvedIntensity = this.solvedState.directionalIntensities[i] || 0.8;
      const scrambledIntensity = this.scrambledState.directionalIntensities[i] || 1.2;

      const baseIntensity = THREE.MathUtils.lerp(solvedIntensity, scrambledIntensity, t);

      // Each light flickers at slightly different phase
      const phase = this.flickerOffsets[i];
      const flicker1 = Math.sin(this.time * this.flickerSpeed + phase) * flickerAmount;
      const flicker2 = Math.sin(this.time * this.flickerSpeed * 1.7 + phase * 2) * flickerAmount * 0.5;
      const flicker3 = Math.sin(this.time * this.flickerSpeed * 0.3 + phase * 0.5) * flickerAmount * 0.3;

      light.intensity = Math.max(0.1, baseIntensity + flicker1 + flicker2 + flicker3);

      // Subtle color temperature shift
      const colorT = t * 0.4 + flicker1 * 0.1;
      light.color.lerpColors(this.neutralColor, this.warmColor, Math.max(0, Math.min(1, colorT)));
    });

    // Update point light
    if (this.pointLight) {
      const baseIntensity = THREE.MathUtils.lerp(
        this.solvedState.pointIntensity,
        this.scrambledState.pointIntensity,
        t
      );

      // Point light has more dramatic flicker
      const flicker = Math.sin(this.time * this.flickerSpeed * 1.3) * flickerAmount * 1.2;
      const flicker2 = Math.sin(this.time * this.flickerSpeed * 2.1) * flickerAmount * 0.4;

      this.pointLight.intensity = Math.max(0.1, baseIntensity + flicker + flicker2);

      // Warm color shift for point light
      this.pointLight.color.lerpColors(this.coolColor, this.warmColor, t * 0.5);
    }

    // Update renderer exposure if provided
    if (renderer) {
      const exposure = THREE.MathUtils.lerp(
        this.solvedState.exposure,
        this.scrambledState.exposure,
        t
      );
      renderer.toneMappingExposure = exposure;
    }
  }

  /**
   * Get current entropy value
   */
  getEntropy() {
    return this.entropy;
  }

  /**
   * Check if currently transitioning
   */
  isTransitioning() {
    return Math.abs(this.entropy - this.targetEntropy) > 0.001;
  }
}

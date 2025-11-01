/**
 * Shared configuration for typographic feature detection thresholds.
 * Adjust these values to tune detection sensitivity and performance.
 *
 * @remarks
 * Each section documents the rationale for its thresholds.
 */
export const FeatureDetectionConfig = {
  /**
   * Counter detection parameters.
   * - scanBands: Number of horizontal scanlines between baseline and xHeight.
   *   More bands increase robustness but may impact performance.
   * - nudgeSteps: Array of relative nudges (as a fraction of glyph width) to test seed points.
   * - minInteriorHits: Minimum number of scanlines that must detect a counter for a positive result.
   */
  counter: {
    scanBands: 5,
    nudgeSteps: [0, -0.01, 0.01, -0.02, 0.02],
    minInteriorHits: 2,
  },
  /**
   * Stem detection parameters.
   * - bands: Number of vertical scanlines between baseline and xHeight.
   * - thicknessRatio: Minimum thickness (as a fraction of unitsPerEm) to count as a stem.
   * - minThickBands: Minimum number of bands with thick regions to confirm a stem.
   * - eps: Epsilon for floating-point comparisons.
   */
  stem: {
    bands: 5,
    thicknessRatio: 0.03,
    minThickBands: 2,
    eps: 0.01,
  },
  /**
   * Bowl detection parameters.
   * - steps: Number of vertical scanlines across the glyph width.
   * - minInteriorHits: Minimum number of interior intersections to count as a bowl.
   * - minBands: Minimum number of bands with sufficient intersections to confirm a bowl.
   */
  bowl: {
    steps: 5,
    minInteriorHits: 4,
    minBands: 2,
  },
  /**
   * Global/shared parameters.
   * - defaultEps: Default epsilon for geometric comparisons.
   * - intersectionEpsilon: Threshold for duplicate intersection detection (prevents double-counting).
   * - curveClassificationEpsilon: Threshold for curve direction classification.
   * - precisionThreshold: Small threshold for near-zero comparisons.
   */
  global: {
    defaultEps: 0.01,
    intersectionEpsilon: 1e-5,
    curveClassificationEpsilon: 1e-6,
    precisionThreshold: 1e-6,
  },
} as const;

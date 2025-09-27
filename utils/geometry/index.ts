/**
 * Geometry Utilities
 *
 * Core geometry calculations and utilities for typography analysis,
 * glyph shape processing, and visualization.
 */

// Core types and interfaces
export type Point2D = { x: number; y: number };
export type { point2d } from './geometry';
export type SvgShape = ReturnType<typeof import('svg-intersections').shape>;
export type { DrawColors } from './drawing';

// Core geometry functions
export {
  rayHits,
  windingNumber,
  isInside,
  safeIntersect,
  getOvershoot,
  shapeForV2,
  isDrawable,
  dFor,
} from './geometryCore';

// Feature detection and analysis
export {
  counterSeed,
  traceRegion,
  getCounter,
  getBowl,
  getTittle,
  getEye,
  strokeThickness,
  hasCounter,
  hasStem,
  hasBowl,
  hasArm,
  hasTail,
  hasLoop,
  hasApex,
  hasVertex,
  hasSerif,
  hasFinial,
  hasEar,
  hasSpur,
  hasCrotch,
  hasBar,
  hasEye,
  segmentsFor,
  precomputeScanlines,
  batchScanlines,
  filterDegenerateBeziers,
  type FeatureShape,
  type FeatureResult,
} from './geometryHeuristics';

// Drawing and visualization utilities
export {
  drawMetricLine,
  getDotPattern,
  drawGlyphBounds,
  drawPathDetails,
  drawAxisValues,
  drawCursorLabel,
  drawAnatomyOverlay,
} from './drawing';

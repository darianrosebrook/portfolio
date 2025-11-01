/**
 * Geometry Utilities
 *
 * Core geometry calculations and utilities for typography analysis,
 * glyph shape processing, and visualization.
 */

// Core types and interfaces
export type Point2D = { x: number; y: number };
export type { DrawColors } from './drawing';
export type { point2d } from './geometry';
export type SvgShape = ReturnType<typeof import('svg-intersections').shape>;

// Core geometry functions
export {
  dFor,
  getOvershoot,
  isDrawable,
  isInside,
  rayHits,
  safeIntersect,
  shapeForV2,
  windingNumber,
} from './geometryCore';

// Curve direction and precision helpers
export {
  allPointsAbove,
  allPointsBelow,
  bezierGradient,
  classifyCurveDirection,
  curveCrossingDirection,
  filterDuplicateIntersections,
} from './curveHelpers';

// Feature detection and analysis
export {
  batchScanlines,
  counterSeed,
  filterDegenerateBeziers,
  getBowl,
  getCounter,
  getEye,
  getTittle,
  hasApex,
  hasArm,
  hasBar,
  hasBowl,
  hasCounter,
  hasCrotch,
  hasEar,
  hasEye,
  hasFinial,
  hasLoop,
  hasSerif,
  hasSpur,
  hasStem,
  hasTail,
  hasVertex,
  precomputeScanlines,
  segmentsFor,
  strokeThickness,
  traceRegion,
  type FeatureResult,
  type FeatureShape,
} from './geometryHeuristics';

// Drawing and visualization utilities
export {
  drawAnatomyOverlay,
  drawAxisValues,
  drawCursorLabel,
  drawGlyphBounds,
  drawMetricLine,
  drawPathDetails,
  getDotPattern,
} from './drawing';

// Path clipping and masked geometry utilities
export {
  canvasYToFontY,
  clipGlyphPathHorizontal,
  createCanvasClipMask,
  fontYToCanvasY,
  getFeatureClipBoundary,
  type ClipBoundary,
} from './pathClipping';

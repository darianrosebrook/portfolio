// Legacy exports (for backward compatibility)
export * from './arm';
export * from './apex';
export * from './bar';
export * from './bowl';
export * from './counter';
export * from './crotch';
export * from './ear';
export * from './eye';
export * from './finial';
export * from './loop';
export * from './serif';
export * from './spur';
export * from './stem';
export * from './tail';
export * from './vertex';

// New unified detection system exports
// Note: We selectively re-export to avoid conflicts with legacy FeatureShape/FeatureResult
export {
  type FeatureID,
  type FeatureInstance,
  type FeatureShape as UnifiedFeatureShape,
  type GeometryCache,
  type DetectionContext,
  type FeatureHint,
  type FeatureDetector,
  type Metrics,
  type Point2D,
  type BBox,
  type ContourClassification,
  type SegmentWithMeta,
  type ScalePrimitives,
  FEATURE_DISPLAY_NAMES,
  FEATURE_ID_TO_DISPLAY,
  ALL_FEATURE_IDS,
  isFeatureID,
  toFeatureID,
  toDisplayName,
} from './types';

export {
  buildGeometryCache,
  flattenToSegments,
  classifyContours,
  invalidateGeometryCache,
  clearAllGeometryCache,
  getBaseContours,
  getMarkContours,
  getHoleContours,
} from './geometryCache';

export {
  DETECTOR_REGISTRY,
  detectGlyphFeatures,
  detectFeature,
  hasFeature,
  getRegisteredFeatures,
  isFeatureSupported,
  detectAllFeatures,
  filterDetectedFeatures,
  getBestInstances,
} from './detectorRegistry';

export {
  GLYPH_FEATURE_HINTS,
  getFeatureHints,
  getDefaultFeatures,
  getAllFeatures,
  isFeatureHinted,
} from './glyphFeatureHints';

export {
  type CurvatureResult,
  computeBezierCurvature,
  computeQuadraticCurvature,
  findTerminalSegments,
  analyzeTerminalCurvature,
  classifyTerminal,
} from './curvatureAnalysis';

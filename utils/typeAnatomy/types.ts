/**
 * Core types for the unified feature detection system.
 *
 * Architectural Principles:
 * 1. Single Detection Primitive: detect(featureId, geo) -> FeatureInstance[]
 * 2. UI Hints, Not Truth: Static mappings are for UI gating, not expected anatomy
 * 3. Geometry Design Space: All shapes in UPM units; renderer applies transforms
 * 4. Contour Classification: base/mark/hole classified once; detectors consume
 * 5. Plugin-Based Detectors: Registry allows incremental implementation
 */

import type { Point2D } from '@/utils/geometry/geometry';
import type { Font, Glyph } from 'fontkit';

// Re-export Point2D for convenience
export type { Point2D };

/**
 * Feature identifier (lowercase, kebab-style for consistency).
 * These are the atomic typographic anatomy features we can detect.
 */
export type FeatureID =
  | 'apex'
  | 'aperture'
  | 'arc'
  | 'arm'
  | 'bar'
  | 'beak'
  | 'bowl'
  | 'bracket'
  | 'counter'
  | 'crossbar'
  | 'cross-stroke'
  | 'crotch'
  | 'ear'
  | 'eye'
  | 'finial'
  | 'foot'
  | 'hook'
  | 'leg'
  | 'link'
  | 'loop'
  | 'neck'
  | 'serif'
  | 'shoulder'
  | 'spine'
  | 'spur'
  | 'stem'
  | 'tail'
  | 'terminal'
  | 'tittle'
  | 'vertex';

/**
 * Shape types for rendering feature highlights.
 * All coordinates are in glyph design space (UPM units).
 * Renderer is responsible for applying view transforms.
 */
export type FeatureShape =
  | { type: 'circle'; cx: number; cy: number; r: number }
  | { type: 'polyline'; points: Point2D[] }
  | { type: 'path'; d: string }
  | { type: 'point'; x: number; y: number; label?: string }
  | { type: 'line'; x1: number; y1: number; x2: number; y2: number }
  | { type: 'rect'; x: number; y: number; width: number; height: number };

/**
 * Result of a single feature detection.
 * Each detector may return zero, one, or multiple instances.
 */
export interface FeatureInstance {
  /** Feature type identifier */
  id: FeatureID;
  /** Geometric shape for rendering (in glyph design space) */
  shape: FeatureShape;
  /** Confidence score 0..1, allows ranking/filtering */
  confidence: number;
  /** Named anchor points for additional rendering (apex tip, bar endpoints, etc.) */
  anchors?: Record<string, Point2D>;
  /** Optional debug data for development */
  debug?: unknown;
}

/**
 * Bounding box in 2D space.
 */
export interface BBox {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
}

/**
 * Classification of a single contour within a glyph.
 * Used to distinguish base shapes from marks and holes.
 */
export interface ContourClassification {
  /** Index of the contour in the path commands */
  index: number;
  /** Type of contour */
  type: 'base' | 'mark' | 'hole';
  /** Bounding box of the contour */
  bbox: BBox;
  /** Signed area (positive = clockwise, negative = counter-clockwise) */
  area: number;
  /** Winding number for inside/outside determination */
  winding: number;
  /** Start index in path commands array */
  startIndex: number;
  /** End index in path commands array */
  endIndex: number;
}

/**
 * Segment with metadata for geometric analysis.
 * Extends raw path segment with tangent/normal/direction info.
 */
export interface SegmentWithMeta {
  type: string;
  params: Point2D[];
  _tangent: Point2D | null;
  _normal: Point2D | null;
  _segmentDir: number;
}

/**
 * SvgShape type from svg-intersections library.
 * Used for ray casting and intersection queries.
 */
export type SvgShape = ReturnType<typeof import('svg-intersections').shape>;

/**
 * Font metrics needed for feature detection.
 */
export interface Metrics {
  /** Baseline position (typically 0 in font units) */
  baseline: number;
  /** X-height in font units */
  xHeight: number;
  /** Cap height in font units */
  capHeight: number;
  /** Ascender height in font units */
  ascent: number;
  /** Descender depth in font units (typically negative) */
  descent: number;
}

/**
 * Context for detection operations.
 * Contains font-level flags for conditional detection logic.
 */
export interface DetectionContext {
  /** Whether the font is a serif typeface */
  isSerif: boolean;
  /** Whether the font is italic/oblique */
  isItalic: boolean;
  /** Italic angle in degrees (0 for upright) */
  italicAngle: number;
  /** Whether the font is monospaced */
  isMono: boolean;
  /** Font weight (100-900) */
  weight: number;
  /** Units per em (typically 1000 or 2048) */
  unitsPerEm: number;
}

/**
 * Scale-aware primitives for consistent thresholding.
 * Computed once per glyph and used by all detectors.
 */
export interface ScalePrimitives {
  /** Base epsilon for tolerance comparisons */
  eps: number;
  /** Glyph bounding box width */
  bboxW: number;
  /** Glyph bounding box height */
  bboxH: number;
  /** Estimated stem width (median of thick spans at mid-height) */
  stemWidth: number;
  /** Overshoot distance for ray casting */
  overshoot: number;
}

/**
 * Geometry cache computed once per glyph+variation.
 * Contains all pre-computed geometric data needed for detection.
 */
export interface GeometryCache {
  /** The fontkit glyph object */
  glyph: Glyph;
  /** The fontkit font object */
  font: Font;
  /** Font metrics */
  metrics: Metrics;
  /** svg-intersections shape for ray casting */
  svgShape: SvgShape;
  /** Flattened path segments with metadata */
  segments: SegmentWithMeta[];
  /** Classified contours (base/mark/hole) */
  contours: ContourClassification[];
  /** Italic angle in degrees */
  italicAngle: number;
  /** Cache key for variation settings */
  variationKey: string;
  /** Detection context with font-level flags */
  context: DetectionContext;
  /** Scale-aware primitives for consistent thresholding */
  scale: ScalePrimitives;
}

/**
 * Function signature for a feature detector.
 * Returns zero or more instances with shapes.
 */
export type FeatureDetector = (geo: GeometryCache) => FeatureInstance[];

/**
 * UI hint for gating feature visibility per glyph.
 * This is NOT truth about expected anatomy - it's UI suggestions.
 */
export interface FeatureHint {
  /** Feature identifier */
  id: FeatureID;
  /** Whether to show this feature by default in UI */
  defaultOn?: boolean;
  /** Optional font-sensitive gate function */
  gate?: (ctx: DetectionContext) => boolean;
}

/**
 * Result from legacy detection API (for backward compatibility).
 */
export interface LegacyFeatureResult {
  found: boolean;
  shape?: FeatureShape;
}

/**
 * Maps display names to feature IDs.
 * Used for backward compatibility with existing UI.
 */
export const FEATURE_DISPLAY_NAMES: Record<string, FeatureID> = {
  Apex: 'apex',
  Aperture: 'aperture',
  Arc: 'arc',
  Arm: 'arm',
  Bar: 'bar',
  Beak: 'beak',
  Bowl: 'bowl',
  Bracket: 'bracket',
  Counter: 'counter',
  Crossbar: 'crossbar',
  'Cross stroke': 'cross-stroke',
  Crotch: 'crotch',
  Ear: 'ear',
  Eye: 'eye',
  Finial: 'finial',
  Foot: 'foot',
  Hook: 'hook',
  Leg: 'leg',
  Link: 'link',
  Loop: 'loop',
  Neck: 'neck',
  Serif: 'serif',
  Shoulder: 'shoulder',
  Spine: 'spine',
  Spur: 'spur',
  Stem: 'stem',
  Tail: 'tail',
  Terminal: 'terminal',
  Tittle: 'tittle',
  Vertex: 'vertex',
};

/**
 * Maps feature IDs to display names.
 */
export const FEATURE_ID_TO_DISPLAY: Record<FeatureID, string> = Object.entries(
  FEATURE_DISPLAY_NAMES
).reduce(
  (acc, [display, id]) => {
    acc[id] = display;
    return acc;
  },
  {} as Record<FeatureID, string>
);

/**
 * All available feature IDs.
 */
export const ALL_FEATURE_IDS: FeatureID[] = Object.values(
  FEATURE_DISPLAY_NAMES
);

/**
 * Helper to check if a string is a valid FeatureID.
 */
export function isFeatureID(value: string): value is FeatureID {
  return ALL_FEATURE_IDS.includes(value as FeatureID);
}

/**
 * Helper to convert display name to FeatureID.
 */
export function toFeatureID(displayName: string): FeatureID | undefined {
  return FEATURE_DISPLAY_NAMES[displayName];
}

/**
 * Helper to convert FeatureID to display name.
 */
export function toDisplayName(id: FeatureID): string {
  return FEATURE_ID_TO_DISPLAY[id] || id;
}

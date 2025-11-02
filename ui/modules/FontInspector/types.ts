/**
 * Scene graph types for FontInspector SVG rendering.
 *
 * Defines the data structure that represents a glyph scene,
 * which SVG components render as pure views.
 */

import type { FeatureShape } from '@/utils/typeAnatomy';

/**
 * Glyph metrics in font units.
 */
export interface GlyphMetrics {
  /** Baseline position (typically 0 in font units) */
  baseline: number;
  /** Cap height in font units */
  capHeight: number;
  /** X-height in font units (optional for uppercase-only fonts) */
  xHeight?: number;
  /** Ascender height in font units */
  ascender: number;
  /** Descender depth in font units (typically negative) */
  descender: number;
  /** Advance width in font units */
  advanceWidth: number;
}

/**
 * Glyph contour definition.
 */
export interface GlyphContour {
  /** SVG path data string */
  d: string;
  /** Fill rule for rendering */
  winding: 'nonzero' | 'evenodd';
}

/**
 * Feature highlight definition.
 */
export interface FeatureHighlight {
  /** Feature name */
  name: string;
  /** SVG path data for highlighted segments */
  pathData?: string;
  /** Clip path definition (if using masked geometry) */
  clipPath?: {
    /** Y boundary in font units */
    y: number;
    /** Keep region above boundary */
    keepAbove?: boolean;
    /** Keep region below boundary */
    keepBelow?: boolean;
  };
  /** Shape-based feature (circle, polyline, path) */
  shape?: FeatureShape;
  /** Location marker (x, y in font units) */
  location?: { x: number; y: number };
}

/**
 * Complete glyph scene graph.
 *
 * This is the canonical representation of a glyph for rendering.
 * SVG components are pure views of this scene.
 */
export interface GlyphScene {
  /** Font metrics */
  metrics: GlyphMetrics;
  /** Glyph contours (may be multiple for compound glyphs) */
  contours: GlyphContour[];
  /** Feature highlights and overlays */
  features: FeatureHighlight[];
}

/**
 * Builds a GlyphScene from a fontkit glyph and font instance.
 *
 * This function performs the parsing/conversion from fontkit format
 * to our scene graph format. SVG components then render this scene.
 */
export function buildGlyphScene(params: {
  glyph: import('fontkit').Glyph;
  font: import('fontkit').Font;
  /** Selected anatomy features to highlight */
  selectedFeatures?: Set<string>;
}): GlyphScene {
  const {
    glyph,
    font,
    selectedFeatures: _selectedFeatures = new Set(),
  } = params;

  // Extract metrics
  const metrics: GlyphMetrics = {
    baseline: 0,
    capHeight: font.capHeight || 0,
    xHeight: font.xHeight,
    ascender: font.ascent || 0,
    descender: font.descent || 0,
    advanceWidth: glyph.advanceWidth || 0,
  };

  // Extract contours
  const contours: GlyphContour[] = [];
  if (glyph.path) {
    const pathData = glyph.path.toSVG();
    if (pathData && pathData !== 'M0 0') {
      contours.push({
        d: pathData,
        winding: 'nonzero', // Default; could be determined from glyph analysis
      });
    }
  }

  // Extract features (this would be populated by feature detection)
  const features: FeatureHighlight[] = [];
  // Features are added by feature detection logic

  return {
    metrics,
    contours,
    features,
  };
}

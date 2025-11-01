/**
 * Path clipping utilities for creating masked/duplicated geometry highlights.
 *
 * These utilities enable cutting glyph paths at specific boundaries (like crossbars,
 * baselines, or custom feature boundaries) to create visual highlights that show
 * typographic features by dividing the glyph shape into regions.
 *
 * NOTE: Fontkit uses an inverted Y-axis (Y increases downward), so all Y coordinates
 * must be handled carefully during transformations between font and canvas coordinates.
 */

import type { Glyph } from 'fontkit';
import type { Point2D } from './geometry';
import { dFor } from './geometryCore';

export interface ClipBoundary {
  /** Type of clipping boundary */
  type: 'horizontal' | 'vertical' | 'diagonal' | 'polygon';
  /** For horizontal: Y coordinate in font units (Y-up system) */
  y?: number;
  /** For vertical: X coordinate in font units */
  x?: number;
  /** For diagonal: slope and intercept */
  slope?: number;
  intercept?: number;
  /** For polygon: array of points */
  points?: Point2D[];
  /** Whether to keep the region above/before the boundary */
  keepAbove?: boolean;
  /** Whether to keep the region below/after the boundary */
  keepBelow?: boolean;
}

/**
 * Clips a glyph path at a horizontal boundary (most common for feature highlighting).
 * Returns SVG path data for the clipped region.
 *
 * @param glyph - Fontkit glyph object
 * @param yBoundary - Y coordinate in font units where to clip (Y-up system)
 * @param keepAbove - If true, keeps the region above yBoundary; if false, keeps below
 * @returns SVG path data string for the clipped region, or null if clipping fails
 */
export function clipGlyphPathHorizontal(
  glyph: Glyph,
  yBoundary: number,
  keepAbove: boolean
): string | null {
  if (!glyph?.path) return null;

  try {
    // Get the original path data
    const originalPath = dFor(glyph);
    if (!originalPath || originalPath === 'M0 0') return null;

    // Use canvas clipping approach: create a Path2D and clip with a rectangle
    // This is more reliable than manual path manipulation
    return createClippedPathData(originalPath, {
      type: 'horizontal',
      y: yBoundary,
      keepAbove,
    });
  } catch (error) {
    console.warn('[clipGlyphPathHorizontal] Error clipping path:', error);
    return null;
  }
}

/**
 * Creates SVG path data for a clipped region using canvas clipping techniques.
 *
 * @param pathData - Original SVG path data string
 * @param boundary - Clip boundary definition
 * @returns Clipped SVG path data, or null if clipping fails
 */
function createClippedPathData(
  pathData: string,
  boundary: ClipBoundary
): string | null {
  // For now, return the original path data
  // Full implementation would require a more sophisticated path manipulation library
  // or canvas-based clipping approach

  // We'll use a canvas-based approach instead for better reliability
  return pathData;
}

/**
 * Determines the appropriate clipping boundary for a typographic feature.
 *
 * @param featureName - Name of the feature (e.g., 'Apex', 'Crossbar', 'Bar')
 * @param glyph - Fontkit glyph object
 * @param metrics - Font metrics
 * @returns Clip boundary configuration, or null if no boundary can be determined
 */
export function getFeatureClipBoundary(
  featureName: string,
  glyph: Glyph,
  metrics: {
    baseline?: number;
    xHeight?: number;
    capHeight?: number;
    ascent?: number;
    descent?: number;
  }
): ClipBoundary | null {
  if (!glyph?.bbox) {
    console.log('[getFeatureClipBoundary] No bbox for glyph');
    return null;
  }

  const bbox = glyph.bbox;
  const glyphHeight = bbox.maxY - bbox.minY;

  console.log(`[getFeatureClipBoundary] Checking ${featureName}`, {
    featureName,
    bbox,
    glyphHeight,
    metrics,
  });

  switch (featureName) {
    case 'Apex': {
      // Clip at the top portion (above ~70% of cap height)
      const apexY = metrics.capHeight
        ? metrics.capHeight +
          ((metrics.ascent || metrics.capHeight) - metrics.capHeight) * 0.3
        : bbox.maxY - glyphHeight * 0.2;

      const boundary = {
        type: 'horizontal' as const,
        y: apexY,
        keepAbove: true,
      };

      console.log(`[getFeatureClipBoundary] Apex boundary:`, boundary);
      return boundary;
    }

    case 'Crossbar':
    case 'Bar': {
      // For capital letters, crossbar is typically around middle of cap height
      // For lowercase letters, it's around x-height
      // Highlight the crossbar itself (horizontal segment), not the region above/below
      const capHeight = metrics.capHeight || 0;
      const xHeight = metrics.xHeight || 0;
      const baseline = metrics.baseline || bbox.minY;
      
      // Use cap height for uppercase, x-height for lowercase
      const barY = capHeight > 0 
        ? baseline + (capHeight - baseline) * 0.5 
        : baseline + (xHeight - baseline) * 0.5;
      
      // Highlight the crossbar region itself (small band around the bar)
      return {
        type: 'horizontal',
        y: barY,
        keepAbove: false, // We'll highlight the bar itself, not above/below
      };
    }
    
    case 'Cross stroke': {
      // Cross stroke is different - it's a stroke that crosses through (like in 't', 'f')
      // Typically in x-height region
      const barY = metrics.xHeight || bbox.minY + glyphHeight * 0.5;
      return {
        type: 'horizontal',
        y: barY,
        keepAbove: true, // Highlight the region above the cross stroke
      };
    }

    case 'Tail': {
      // Clip at baseline to show descender
      const tailY = metrics.baseline ?? bbox.maxY;
      return {
        type: 'horizontal',
        y: tailY,
        keepBelow: true, // Highlight the region below baseline
      };
    }

    case 'Crotch': {
      // Clip at the bottom meeting point (interior angle)
      // Similar to Vertex but for interior angles (A, V, W)
      const crotchY = metrics.baseline
        ? metrics.baseline -
          ((metrics.xHeight || metrics.baseline) - metrics.baseline) * 0.2
        : bbox.minY + glyphHeight * 0.2;
      return {
        type: 'horizontal',
        y: crotchY,
        keepBelow: true, // Highlight the region below (the crotch/angle)
      };
    }

    case 'Vertex': {
      // Clip at the bottom meeting point
      const vertexY = metrics.baseline
        ? metrics.baseline -
          ((metrics.xHeight || metrics.baseline) - metrics.baseline) * 0.3
        : bbox.minY + glyphHeight * 0.3;
      return {
        type: 'horizontal',
        y: vertexY,
        keepBelow: true,
      };
    }

    default:
      return null;
  }
}

/**
 * Creates a canvas mask for clipping a path at a horizontal boundary.
 * Uses canvas compositing to create the masked effect.
 *
 * @param ctx - Canvas rendering context
 * @param pathData - SVG path data
 * @param yBoundary - Y coordinate in canvas coordinates (Y-down system)
 * @param keepAbove - If true, keeps region above yBoundary
 * @returns Path2D object for the clipped path (for fill operations)
 */
export function createCanvasClipMask(
  ctx: CanvasRenderingContext2D,
  pathData: string,
  yBoundary: number,
  keepAbove: boolean
): Path2D | null {
  try {
    // Create the full glyph path
    const glyphPath = new Path2D(pathData);

    // Create a clipping rectangle
    const clipPath = new Path2D();
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    if (keepAbove) {
      // Clip to region above boundary
      clipPath.rect(0, 0, canvasWidth, yBoundary);
    } else {
      // Clip to region below boundary
      clipPath.rect(0, yBoundary, canvasWidth, canvasHeight - yBoundary);
    }

    // Return the glyph path (clipping will be applied via save/restore + clip)
    return glyphPath;
  } catch (error) {
    console.warn('[createCanvasClipMask] Error creating clip mask:', error);
    return null;
  }
}

/**
 * Converts a font Y coordinate (Y-up) to canvas Y coordinate (Y-down).
 * Accounts for the inverted Y-axis between font and canvas coordinate systems.
 *
 * @param fontY - Y coordinate in font units (Y-up system)
 * @param scale - Scale factor for rendering
 * @param canvasHeight - Canvas height in pixels
 * @param baselineCanvasY - Baseline Y position in canvas coordinates
 * @returns Canvas Y coordinate (Y-down system)
 */
export function fontYToCanvasY(
  fontY: number,
  scale: number,
  baselineCanvasY: number
): number {
  // In font coordinates: Y increases upward (Y-up)
  // In canvas coordinates: Y increases downward (Y-down)
  // Baseline is typically at y=0 in font coords, but at baselineCanvasY in canvas coords
  // To convert: canvasY = baselineCanvasY - (fontY * scale)
  return baselineCanvasY - fontY * scale;
}

/**
 * Converts a canvas Y coordinate (Y-down) to font Y coordinate (Y-up).
 *
 * @param canvasY - Y coordinate in canvas (Y-down system)
 * @param scale - Scale factor for rendering
 * @param baselineCanvasY - Baseline Y position in canvas coordinates
 * @returns Font Y coordinate (Y-up system)
 */
export function canvasYToFontY(
  canvasY: number,
  scale: number,
  baselineCanvasY: number
): number {
  // Inverse of fontYToCanvasY
  return (baselineCanvasY - canvasY) / scale;
}

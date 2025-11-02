/**
 * Transform utilities for converting between font coordinates and screen coordinates.
 *
 * Font coordinates: Y-up, origin at baseline
 * Screen coordinates: Y-down, origin at top-left
 *
 * Uses a single matrix transform to avoid stacking transforms and reduce float error.
 */

/**
 * Represents a viewport transform that converts between font and screen coordinates.
 *
 * The transform uses a single matrix:
 * [scale,    0,      xOffset]
 * [0,        -scale, baseline]
 * [0,        0,      1      ]
 *
 * This inverts the Y-axis and scales/translates appropriately.
 */
export interface ViewportTransform {
  /** Scale factor (pixels per font unit) */
  scale: number;
  /** X offset in screen coordinates */
  x: number;
  /** Y offset in screen coordinates (baseline position) */
  y: number;
  /** Precomputed DOMMatrix for the transform (null during SSR) */
  matrix: DOMMatrixReadOnly | null;

  /**
   * Converts a point from font coordinates to screen coordinates
   */
  toScreen(pt: { x: number; y: number }): { x: number; y: number };

  /**
   * Converts a point from screen coordinates to font coordinates
   */
  toFont(pt: { x: number; y: number }): { x: number; y: number };

  /**
   * Gets the SVG transform string for use in `<g>` elements
   */
  toSVGTransform(): string;
}

/**
 * Creates a ViewportTransform from viewport metrics.
 *
 * @param scale - Scale factor (pixels per font unit)
 * @param xOffset - X offset in screen coordinates (typically centers the glyph)
 * @param baseline - Baseline Y position in screen coordinates
 * @returns ViewportTransform instance
 */
export function createViewportTransform(
  scale: number,
  xOffset: number,
  baseline: number
): ViewportTransform {
  // Guard for SSR - DOMMatrix is not available on server
  if (typeof window === 'undefined' || typeof DOMMatrix === 'undefined') {
    // Return a minimal transform for SSR
    const toScreen = (pt: { x: number; y: number }) => ({
      x: pt.x * scale + xOffset,
      y: -pt.y * scale + baseline,
    });
    const toFont = (pt: { x: number; y: number }) => ({
      x: (pt.x - xOffset) / scale,
      y: -(pt.y - baseline) / scale,
    });
    const toSVGTransform = () =>
      `matrix(${scale} 0 0 ${-scale} ${xOffset} ${baseline})`;

    return {
      scale,
      x: xOffset,
      y: baseline,
      matrix: null as any, // Will be set on client
      toScreen,
      toFont,
      toSVGTransform,
    };
  }

  // Create the transform matrix
  // Matrix: [scale, 0, xOffset]
  //         [0, -scale, baseline]
  //         [0, 0, 1]
  const matrix = new DOMMatrix([
    scale,
    0,
    0,
    -scale, // Negative to invert Y-axis
    xOffset,
    baseline,
  ]);

  const toScreen = (pt: { x: number; y: number }): { x: number; y: number } => {
    const transformed = matrix.transformPoint(new DOMPoint(pt.x, pt.y));
    return { x: transformed.x, y: transformed.y };
  };

  const toFont = (pt: { x: number; y: number }): { x: number; y: number } => {
    // Invert the matrix to convert back
    const inverse = matrix.inverse();
    const transformed = inverse.transformPoint(new DOMPoint(pt.x, pt.y));
    return { x: transformed.x, y: transformed.y };
  };

  const toSVGTransform = (): string => {
    // SVG matrix format: matrix(a, b, c, d, e, f)
    // Where [a c e]   [scale  0      xOffset]
    //       [b d f] = [0      -scale baseline]
    //       [0 0 1]   [0      0      1      ]
    return `matrix(${scale} 0 0 ${-scale} ${xOffset} ${baseline})`;
  };

  return {
    scale,
    x: xOffset,
    y: baseline,
    matrix,
    toScreen,
    toFont,
    toSVGTransform,
  };
}

/**
 * Creates a ViewportTransform from font metrics and container dimensions.
 *
 * This is a convenience function that calculates the appropriate scale and offsets
 * based on the font metrics and available space.
 *
 * @param params - Viewport calculation parameters
 * @returns ViewportTransform instance
 */
export function createViewportTransformFromMetrics(params: {
  /** Container width in pixels */
  containerWidth: number;
  /** Container height in pixels */
  containerHeight: number;
  /** Advance width of the glyph in font units */
  advanceWidth: number;
  /** Font ascent in font units */
  ascent: number;
  /** Font descent in font units (typically negative) */
  descent: number;
  /** Horizontal padding to reserve */
  horizontalPadding?: number;
  /** Top padding to reserve */
  topPadding?: number;
  /** Bottom padding to reserve */
  bottomPadding?: number;
}): ViewportTransform {
  const {
    containerWidth,
    containerHeight,
    advanceWidth,
    ascent,
    descent,
    horizontalPadding = 128,
    topPadding = 128,
    bottomPadding = 64,
  } = params;

  const availableWidth = containerWidth - horizontalPadding * 2;
  const availableHeight = containerHeight - topPadding - bottomPadding;

  const fontHeight = ascent - descent;

  // Calculate scale to fit both width and height
  const scaleX = availableWidth / (advanceWidth * 1.1 || fontHeight * 0.6);
  const scaleY = availableHeight / fontHeight;
  const scale = Math.min(scaleX, scaleY);

  // Calculate x offset to center the glyph
  const xOffset = Math.round((containerWidth - advanceWidth * scale) / 2);

  // Calculate baseline position (from bottom of container)
  const baseline =
    containerHeight - (Math.abs(descent) * scale + bottomPadding);

  return createViewportTransform(scale, xOffset, baseline);
}

/**
 * Validates that a transform is valid (no NaN, no Infinity)
 */
export function validateTransform(transform: ViewportTransform): boolean {
  return (
    Number.isFinite(transform.scale) &&
    Number.isFinite(transform.x) &&
    Number.isFinite(transform.y) &&
    transform.scale > 0 &&
    transform.scale < 1e6 // Reasonable upper bound
  );
}

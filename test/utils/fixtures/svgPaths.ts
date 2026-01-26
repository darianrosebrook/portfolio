/**
 * SVG path constants for typographic feature detection tests.
 * Contains both geometric primitives and letter-like shapes.
 *
 * IMPORTANT: These paths use only M, L, Z commands (and uppercase A for arcs)
 * to ensure compatibility with svg-intersections library.
 * Lowercase arc commands (a) are not supported.
 */

// ============================================================================
// GEOMETRIC PRIMITIVES (using polygons to approximate circles)
// ============================================================================

/**
 * Approximated circle (32-sided polygon, r=300) centered at origin.
 * Solid shape with no holes.
 */
export const CIRCLE = {
  d: generatePolygon(0, 0, 300, 32),
  bbox: { minX: -300, minY: -300, maxX: 300, maxY: 300 },
};

/**
 * Small circle (r=50) centered at origin (16-sided polygon).
 * Useful for tittle detection tests.
 */
export const SMALL_CIRCLE = {
  d: generatePolygon(0, 0, 50, 16),
  bbox: { minX: -50, minY: -50, maxX: 50, maxY: 50 },
};

/**
 * Donut shape (outer r=300, inner r=120).
 * Has enclosed counter region - represents a bowl.
 */
export const DONUT = {
  d: `${generatePolygon(0, 0, 300, 32)} ${generatePolygon(0, 0, 120, 32, true)}`,
  bbox: { minX: -300, minY: -300, maxX: 300, maxY: 300 },
};

/**
 * Rectangle (400w x 600h) centered at origin.
 * Simple solid shape with no features.
 */
export const RECTANGLE = {
  d: 'M -200 -300 L 200 -300 L 200 300 L -200 300 Z',
  bbox: { minX: -200, minY: -300, maxX: 200, maxY: 300 },
};

/**
 * Thin vertical rectangle (stem-like).
 * Width 60, height 600.
 */
export const VERTICAL_STEM = {
  d: 'M -30 -300 L 30 -300 L 30 300 L -30 300 Z',
  bbox: { minX: -30, minY: -300, maxX: 30, maxY: 300 },
};

/**
 * Thin horizontal rectangle (bar-like).
 * Width 400, height 60.
 */
export const HORIZONTAL_BAR = {
  d: 'M -200 -30 L 200 -30 L 200 30 L -200 30 Z',
  bbox: { minX: -200, minY: -30, maxX: 200, maxY: 30 },
};

// ============================================================================
// LETTER-LIKE SHAPES
// ============================================================================

/**
 * Uppercase I shape (stem with serifs).
 * Has stem at center with serifs at top and bottom.
 */
export const LETTER_I_SERIF = {
  d: `
    M -100 -300 L 100 -300 L 100 -250 L 30 -250
    L 30 250 L 100 250 L 100 300 L -100 300
    L -100 250 L -30 250 L -30 -250 L -100 -250 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -100, minY: -300, maxX: 100, maxY: 300 },
};

/**
 * Uppercase I sans-serif (simple stem).
 * No serifs, just a vertical stem.
 */
export const LETTER_I_SANS = {
  d: 'M -40 -300 L 40 -300 L 40 300 L -40 300 Z',
  bbox: { minX: -40, minY: -300, maxX: 40, maxY: 300 },
};

/**
 * Lowercase i with tittle (dot above stem).
 * Stem from 0 to 500, small rectangle tittle above x-height.
 */
export const LETTER_I_LOWERCASE = {
  d: `
    M -30 0 L 30 0 L 30 500 L -30 500 Z
    M -25 620 L 25 620 L 25 680 L -25 680 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -30, minY: 0, maxX: 30, maxY: 680 },
};

/**
 * Uppercase O shape (donut positioned at typical O location).
 * Outer polygon, inner counter polygon.
 */
export const LETTER_O = {
  d: `${generateEllipse(200, 0, 200, 350, 24)} ${generateEllipse(200, 0, 100, 175, 16, true)}`,
  bbox: { minX: 0, minY: -350, maxX: 400, maxY: 350 },
};

/**
 * Uppercase A shape with apex and crotch.
 * Triangular with horizontal bar and interior counter.
 */
export const LETTER_A = {
  d: `
    M 0 -350 L 200 350 L 150 350 L 125 200 L -125 200
    L -150 350 L -200 350 Z
    M -75 100 L 75 100 L 0 -150 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -200, minY: -350, maxX: 200, maxY: 350 },
};

/**
 * Uppercase V shape with vertex at bottom.
 * Two diagonal strokes meeting at a point.
 */
export const LETTER_V = {
  d: `
    M -200 -350 L -150 -350 L 0 300 L 150 -350 L 200 -350
    L 25 350 L -25 350 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -200, minY: -350, maxX: 200, maxY: 350 },
};

/**
 * Lowercase e shape approximation with eye (enclosed counter with right opening).
 * Has bowl portion with aperture opening to the right.
 */
export const LETTER_E_LOWERCASE = {
  d: `
    M 200 0 L 200 -50 L -200 -50 L -250 -100 L -250 100 L -200 150 L 200 150 L 200 100 L -150 100 L -150 -50 L 200 -50 L 200 0 Z
    M -100 -25 L 150 -25 L 150 75 L -100 75 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -250, minY: -100, maxX: 200, maxY: 150 },
};

/**
 * Lowercase g shape with loop below baseline and link.
 * Has upper bowl, link connecting to lower loop.
 */
export const LETTER_G_LOWERCASE = {
  d: `
    ${generatePolygon(0, 250, 150, 16)}
    ${generatePolygon(0, 250, 75, 12, true)}
    M -25 100 L 25 100 L 25 -100 L -25 -100 Z
    ${generatePolygon(0, -200, 150, 16)}
    ${generatePolygon(0, -200, 75, 12, true)}
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -150, minY: -350, maxX: 150, maxY: 400 },
};

/**
 * Uppercase E with arms and bars.
 * Has horizontal projections at top, middle, and bottom.
 */
export const LETTER_E_UPPERCASE = {
  d: `
    M -150 -350 L 150 -350 L 150 -300 L -100 -300 L -100 -50
    L 100 -50 L 100 50 L -100 50 L -100 300 L 150 300 L 150 350
    L -150 350 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -150, minY: -350, maxX: 150, maxY: 350 },
};

/**
 * Uppercase T with arm at top.
 * Vertical stem with horizontal arm.
 */
export const LETTER_T = {
  d: `
    M -150 -350 L 150 -350 L 150 -300 L 30 -300 L 30 350
    L -30 350 L -30 -300 L -150 -300 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -150, minY: -350, maxX: 150, maxY: 350 },
};

/**
 * Lowercase r with ear.
 * Has stem with small projection at top right.
 */
export const LETTER_R_LOWERCASE = {
  d: `
    M -30 0 L 30 0 L 30 300 L 100 350 L 150 350 L 150 400 L 100 400 L 30 350 L 30 500 L -30 500 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -30, minY: 0, maxX: 150, maxY: 500 },
};

/**
 * Lowercase y with tail descending below baseline.
 * Has diagonal strokes meeting and descending stroke.
 */
export const LETTER_Y_LOWERCASE = {
  d: `
    M -150 0 L -100 0 L 0 150 L 100 0 L 150 0 L 30 200
    L 30 350 L 50 380 L 50 420 L -50 450 L -100 450 L -100 420 L -30 400 L -30 200 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -150, minY: 0, maxX: 150, maxY: 450 },
};

// ============================================================================
// DEGENERATE / ERROR PATHS
// ============================================================================

/**
 * Empty path (moveTo only).
 * Should fail most feature detections gracefully.
 */
export const EMPTY_PATH = {
  d: 'M 0 0',
  bbox: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
};

/**
 * Collapsed path (zero-area).
 * All points at same location.
 */
export const COLLAPSED_PATH = {
  d: 'M 0 0 L 0 0 L 0 0 Z',
  bbox: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
};

/**
 * Single line (no area).
 */
export const LINE_PATH = {
  d: 'M 0 0 L 100 100',
  bbox: { minX: 0, minY: 0, maxX: 100, maxY: 100 },
};

/**
 * Very small path (sub-pixel).
 */
export const TINY_PATH = {
  d: 'M 0 0 L 0.001 0 L 0.001 0.001 L 0 0.001 Z',
  bbox: { minX: 0, minY: 0, maxX: 0.001, maxY: 0.001 },
};

// ============================================================================
// SPECIAL TEST SHAPES
// ============================================================================

/**
 * Shape with multiple enclosed counters.
 * Figure-8 like shape for testing multiple counter detection.
 */
export const FIGURE_EIGHT = {
  d: `
    ${generatePolygon(0, -175, 150, 16)}
    ${generatePolygon(0, -175, 75, 12, true)}
    ${generatePolygon(0, 175, 150, 16)}
    ${generatePolygon(0, 175, 75, 12, true)}
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -150, minY: -325, maxX: 150, maxY: 325 },
};

/**
 * Hook shape (curved terminal descending).
 * Like bottom of lowercase f or j.
 */
export const HOOK_SHAPE = {
  d: `
    M -30 0 L 30 0 L 30 250 L 50 300 L 100 350 L 150 350 L 150 400 L 80 400 L 30 350 L -30 300 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -30, minY: 0, maxX: 150, maxY: 400 },
};

/**
 * Shoulder shape (arch connecting verticals).
 * Like the top of lowercase h, m, n.
 */
export const SHOULDER_SHAPE = {
  d: `
    M -30 0 L 30 0 L 30 200 L 50 250 L 100 250 L 120 200 L 120 0 L 180 0
    L 180 500 L 120 500 L 120 300 L 100 300 L 50 300 L 30 350 L 30 500 L -30 500 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -30, minY: 0, maxX: 180, maxY: 500 },
};

/**
 * Spine shape (S-curve approximation).
 * Central curved stroke like in letter S.
 */
export const SPINE_SHAPE = {
  d: `
    M 100 -300 L 150 -300 L 175 -250 L 150 -150 L 50 -50 L -50 50 L -100 150 L -150 250 L -150 300
    L -100 300 L -75 250 L -50 150 L 50 50 L 150 -50 L 175 -150 L 150 -250 L 100 -300 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -150, minY: -300, maxX: 175, maxY: 300 },
};

/**
 * Arc shape (curved stroke segment approximation).
 * Open curve shape.
 */
export const ARC_SHAPE = {
  d: `
    M -200 50 L -180 -100 L -100 -180 L 0 -200 L 100 -180 L 180 -100 L 200 50
    L 150 50 L 140 -50 L 80 -120 L 0 -150 L -80 -120 L -140 -50 L -150 50 Z
  `.replace(/\s+/g, ' ').trim(),
  bbox: { minX: -200, minY: -200, maxX: 200, maxY: 50 },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Generates an SVG path for a regular polygon approximating a circle.
 * @param cx - Center X
 * @param cy - Center Y
 * @param r - Radius
 * @param sides - Number of sides (more = smoother)
 * @param reverse - If true, wind counter-clockwise (for holes)
 */
function generatePolygon(
  cx: number,
  cy: number,
  r: number,
  sides: number,
  reverse = false
): string {
  const points: string[] = [];
  const angleStep = (2 * Math.PI) / sides;
  const direction = reverse ? -1 : 1;

  for (let i = 0; i < sides; i++) {
    const angle = direction * i * angleStep - Math.PI / 2; // Start from top
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join(' ') + ' Z';
}

/**
 * Generates an SVG path for an ellipse approximation.
 * @param cx - Center X
 * @param cy - Center Y
 * @param rx - X radius
 * @param ry - Y radius
 * @param sides - Number of sides
 * @param reverse - If true, wind counter-clockwise (for holes)
 */
function generateEllipse(
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  sides: number,
  reverse = false
): string {
  const points: string[] = [];
  const angleStep = (2 * Math.PI) / sides;
  const direction = reverse ? -1 : 1;

  for (let i = 0; i < sides; i++) {
    const angle = direction * i * angleStep - Math.PI / 2; // Start from top
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    points.push(`${i === 0 ? 'M' : 'L'} ${x.toFixed(2)} ${y.toFixed(2)}`);
  }

  return points.join(' ') + ' Z';
}

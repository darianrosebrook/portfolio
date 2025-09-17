import type { Glyph, Font } from 'fontkit';
import type { AnatomyFeature } from '../ui/modules/FontInspector/FontInspector';
import type { Metrics as GlyphMetrics } from '@/utils/typeAnatomy';
import {
  getBowl,
  getTittle,
  getEye,
  type FeatureResult,
} from '@/utils/geometry/geometryHeuristics';
export interface DrawColors {
  anchorFill: string;
  anchorStroke: string;
  metricStroke: string;
  metricFill: string;
  checkerFill: string;
  checkerStroke: string;
  boundsStroke: string;
  boundsFill: string;
  lsbStroke: string;
  lsbFill: string;
  rsbStroke: string;
  rsbFill: string;
  pathStroke: string;
  pathFill: string;
  handleStroke: string;
  handleFill: string;
  cursorStroke: string;
  cursorFill: string;
  labelFill: string;
  labelStroke: string;
}

export function drawMetricLine(
  ctx: CanvasRenderingContext2D,
  width: number,
  y: number,
  label: string,
  labelPosition: string,
  colors: DrawColors
) {
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(width, y);
  ctx.strokeStyle = colors.metricStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  ctx.fillStyle = colors.metricFill;
  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  if (labelPosition === 'top') {
    ctx.fillText(label, 16, y - 5);
  } else {
    ctx.fillText(label, 16, y + 15);
  }
}

let _dotPatternCache: CanvasPattern | null = null;
export function getDotPattern(
  ctx: CanvasRenderingContext2D,
  fillColor: string,
  spacing = 8,
  dotRadius = 1
): CanvasPattern | null {
  if (_dotPatternCache) return _dotPatternCache;

  const buf = document.createElement('canvas');
  buf.width = buf.height = spacing;
  const g = buf.getContext('2d')!;

  g.clearRect(0, 0, spacing, spacing);

  g.fillStyle = fillColor;
  g.beginPath();
  g.arc(spacing / 2, spacing / 2, dotRadius, 0, Math.PI * 2);
  g.fill();

  _dotPatternCache = ctx.createPattern(buf, 'repeat');
  return _dotPatternCache;
}

export function drawGlyphBounds(
  ctx: CanvasRenderingContext2D,
  xMin: number,
  xMax: number,
  ascY: number,
  descY: number,
  scale: number,
  glyph: Glyph,
  colors: DrawColors
) {
  const pattern = getDotPattern(ctx, colors.checkerStroke);

  const adv = glyph.advanceWidth;
  const lsb = glyph.bbox.minX;
  const rsb = adv - (glyph.bbox.maxX - glyph.bbox.minX) - lsb;

  ctx.strokeStyle = colors.boundsStroke;
  ctx.fillStyle = colors.boundsFill;
  ctx.lineWidth = 1;

  const lsbX = xMin - lsb * -scale;
  ctx.beginPath();
  ctx.moveTo(xMin, descY + 4);
  ctx.lineTo(xMin, descY + 12);
  ctx.moveTo(lsbX, descY + 4);
  ctx.lineTo(lsbX, descY + 12);
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = colors.lsbFill;
  ctx.strokeStyle = colors.lsbStroke;
  ctx.lineWidth = 1;
  ctx.fillStyle = colors.labelFill;
  ctx.fillText(
    `Left Side Bearing ${lsb.toFixed(2)}`,
    xMin + (lsb * scale) / 2,
    descY + 28
  );

  // RSB marker
  const rsbX = xMax - rsb * scale;
  ctx.beginPath();
  ctx.moveTo(xMax, descY + 4);
  ctx.lineTo(xMax, descY + 12);
  ctx.moveTo(rsbX, descY + 4);
  ctx.lineTo(rsbX, descY + 12);
  ctx.stroke();
  ctx.fillStyle = colors.rsbFill;
  ctx.strokeStyle = colors.rsbStroke;
  ctx.lineWidth = 1;
  ctx.fillStyle = colors.labelFill;
  ctx.fillText(
    `Right Side Bearing ${rsb.toFixed(2)}`,
    rsbX + (rsb * scale) / 2,
    descY + 28
  );

  if (pattern) {
    ctx.save();
    ctx.fillStyle = pattern;
    ctx.fillRect(0, ascY, xMin, descY - ascY);
    ctx.fillRect(xMax, ascY, ctx.canvas.width - xMax, descY - ascY);
    ctx.fillStyle = colors.lsbFill;
    ctx.fillRect(lsbX - lsb * scale, ascY, lsb * scale, descY - ascY);
    ctx.fillStyle = colors.rsbFill;
    ctx.fillRect(rsbX, ascY, rsb * scale, descY - ascY);

    ctx.stroke();
    ctx.restore();
  }
}

export function drawPathDetails(
  ctx: CanvasRenderingContext2D,
  glyph: Glyph,
  scale: number,
  colors: DrawColors
) {
  const anchors: Array<[number, number, boolean]> = [];
  const handles: Array<[number, number]> = [];
  ctx.save();
  ctx.beginPath();

  // keep track of the last anchor
  let lastAnchor = null;
  ctx.strokeStyle = colors.handleStroke;
  ctx.lineWidth = 1;
  for (let i = 0; i < glyph.path.commands.length; i++) {
    const { command, args } = glyph.path.commands[i];
    switch (command) {
      case 'moveTo': {
        const x = args[0] * scale;
        const y = -args[1] * scale;
        lastAnchor = { x, y };
        anchors.push([x, y, false]);
        ctx.moveTo(x, y);
        break;
      }

      case 'lineTo': {
        const x = args[0] * scale;
        const y = -args[1] * scale;
        lastAnchor = { x, y };
        anchors.push([x, y, false]);
        break;
      }

      case 'quadraticCurveTo': {
        // raw Q: (P1 = [cxRaw,cyRaw], P2 = [xRaw,yRaw])
        const [cxRaw, cyRaw, xRaw, yRaw] = args;
        const cx = cxRaw * scale,
          cy = -cyRaw * scale;
        const x = xRaw * scale,
          y = -yRaw * scale;

        // remember P0
        if (!lastAnchor) break;
        const { x: x0, y: y0 } = lastAnchor;
        // convert Q→C:
        const x1 = x0 + (2 / 3) * (cx - x0);
        const y1 = y0 + (2 / 3) * (cy - y0);
        const x2 = x + (2 / 3) * (cx - x);
        const y2 = y + (2 / 3) * (cy - y);

        // draw the actual curve
        ctx.bezierCurveTo(x1, y1, x2, y2, x, y);

        // handle-spoke from P0 → C1
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();

        // handle-spoke from P2 → C2
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        // update lastAnchor
        lastAnchor = { x, y };
        anchors.push([x, y, false]);
        handles.push([x1, y1], [x2, y2]);
        break;
      }

      case 'bezierCurveTo': {
        // raw C: (C1=[c1xRaw,c1yRaw], C2=[c2xRaw,c2yRaw], P2=[xRaw,yRaw])
        const [c1xRaw, c1yRaw, c2xRaw, c2yRaw, xRaw, yRaw] = args;
        const c1x = c1xRaw * scale,
          c1y = -c1yRaw * scale;
        const c2x = c2xRaw * scale,
          c2y = -c2yRaw * scale;
        const x = xRaw * scale,
          y = -yRaw * scale;

        // draw the curve
        ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);

        // P0 → C1
        if (!lastAnchor) break;
        const { x: x0, y: y0 } = lastAnchor;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(c1x, c1y);
        ctx.stroke();

        // P2 → C2
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(c2x, c2y);
        ctx.stroke();

        lastAnchor = { x, y };
        anchors.push([x, y, false]);
        handles.push([c1x, c1y], [c2x, c2y]);
        break;
      }

      case 'closePath': {
        if (anchors.length) anchors[anchors.length - 1][2] = true;
        ctx.closePath();
        break;
      }
    }
  }

  // path details outline
  ctx.strokeStyle = colors.handleStroke;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // anchors
  ctx.fillStyle = colors.anchorFill;
  ctx.strokeStyle = colors.anchorStroke;
  anchors.forEach(([ax, ay, start]) => {
    ctx.beginPath();
    ctx.ellipse(ax, ay, 2.5, 2.5, 0, 0, Math.PI * 2);
    if (start) {
      ctx.fillStyle = colors.anchorStroke;
      ctx.font = '12px sans-serif';
      ctx.fillText('Start', ax + 4, ay + 4);
      ctx.fill();
      ctx.fillStyle = colors.anchorFill;
    } else {
      ctx.fill();
      ctx.stroke();
    }
  });

  // handles
  ctx.fillStyle = colors.handleFill;
  ctx.strokeStyle = colors.handleStroke;
  handles.forEach(([hx, hy]) => {
    ctx.beginPath();
    ctx.rect(hx - 1.5, hy - 1.5, 3, 3);
    ctx.fill();
    ctx.stroke();
  });

  ctx.restore();
}

export function drawAxisValues(
  ctx: CanvasRenderingContext2D,
  width: number,
  baseline: number,
  wght: number,
  opsz: number,
  colors: DrawColors
) {
  const topleft = { x: 8, y: 32 };
  const widthGrid = (width - 64) / 3;
  ctx.save();
  ctx.fillStyle = colors.labelFill;
  ctx.font = '14px sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText(`Weight ${wght.toFixed(2)}`, topleft.x, topleft.y);
  ctx.fillText(
    `Optical size ${opsz.toFixed(2)}`,
    topleft.x + widthGrid,
    topleft.y
  );
  ctx.restore();
}

export function drawCursorLabel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  wght: number,
  colors: DrawColors
) {
  ctx.save();
  ctx.fillStyle = colors.cursorFill;
  ctx.strokeStyle = colors.cursorStroke;
  ctx.lineWidth = 1.5;
  ctx.textAlign = 'center';
  ctx.fillText(`Drag to adjust weight`, x, y + 22);
  ctx.restore();
}

export function drawAnatomyOverlay(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  glyph: Glyph,
  scale: number,
  colors: DrawColors,
  metrics: {
    [key: string]: number;
  },
  selected: Map<string, AnatomyFeature>,
  font?: Font,
  fontUnits?: GlyphMetrics
) {
  if (!selected || selected.size === 0) {
    return;
  }

  ctx.save();
  const commands = glyph.path?.commands;
  if (commands && commands.length > 0) {
    if (selected.has('Apex')) {
      const [ax, ay] = findExtremePointOnPath(
        commands,
        scale,
        /* top = */ true
      );
      drawMarker(ctx, ax, ay, 'Apex', colors.anchorFill);
    }
    if (selected.has('Tail')) {
      const [tx, ty] = findExtremePointOnPath(
        commands,
        scale,
        /* top = */ false
      );
      drawMarker(ctx, tx, ty, 'Tail', colors.anchorFill);
    }
  } else {
    if (selected.has('Apex') || selected.has('Tail')) {
      console.warn('Glyph has no path commands; cannot draw Apex or Tail.');
    }
  }

  // Draw geometry heuristic overlays when requested
  if (font && fontUnits) {
    const drawFeatureRegion = (res: FeatureResult, label: string) => {
      if (!res.found) return;
      if (res.shape?.type === 'polyline' && Array.isArray(res.shape.points)) {
        const pts = res.shape.points;
        if (pts.length < 2) return;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = colors.anchorFill;
        ctx.lineWidth = 1.5;
        // Transform glyph units → canvas (scale, invert Y)
        ctx.moveTo(pts[0].x * scale, -pts[0].y * scale);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x * scale, -pts[i].y * scale);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      } else if (res.shape?.type === 'circle') {
        const { cx, cy, r } = res.shape;
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = colors.anchorFill;
        ctx.lineWidth = 1.5;
        ctx.arc(
          cx * scale,
          -cy * scale,
          Math.max(1, r * scale),
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
      }
    };

    if (selected.has('Bowl')) {
      drawFeatureRegion(getBowl(glyph, fontUnits), 'Bowl');
    }
    if (selected.has('Tittle')) {
      drawFeatureRegion(getTittle(glyph, fontUnits, font), 'Tittle');
    }
    if (selected.has('Eye')) {
      drawFeatureRegion(getEye(glyph, fontUnits), 'Eye');
    }
  }

  ctx.restore();
}

function findExtremePointOnPath(
  commands: { command: string; args: number[] }[],
  scale: number,
  top: boolean
): [number, number] {
  let extremeY = top ? Infinity : -Infinity;
  let extremePoint: [number, number] = [0, 0];

  const checkPoint = (x: number, y: number) => {
    const scaledX = x * scale;
    const scaledY = -y * scale;

    const isMoreExtreme = top ? scaledY < extremeY : scaledY > extremeY;

    if (isMoreExtreme) {
      extremeY = scaledY;
      extremePoint = [scaledX, scaledY];
    }
  };

  // Iterate through the path commands
  for (const { command, args } of commands) {
    switch (command) {
      case 'moveTo':
      case 'lineTo':
        checkPoint(args[0], args[1]);
        break;
      case 'quadraticCurveTo':
        checkPoint(args[2], args[3]);
        break;
      case 'bezierCurveTo':
        checkPoint(args[4], args[5]);
        break;
      case 'closePath':
        break;
    }
  }

  if (extremeY === Infinity || extremeY === -Infinity) {
    console.warn(
      'Could not find extreme point for glyph path. Returning origin.'
    );
    return [0, 0];
  }

  return extremePoint;
}

function drawMarker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  label: string,
  color: string
) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(x, y, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.font = '12px sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + 8, y);
  ctx.restore();
}
// Feature mapping system for font anatomy
// Maps typographic features to the glyphs that typically exhibit them

export type AnatomyFeatureType =
  | 'Apex' | 'Tail' | 'Arm' | 'Tittle' | 'Bowl' | 'Counter' | 'Eye'
  | 'Serif' | 'Finial' | 'Spur' | 'Crotch' | 'Bar' | 'Loop' | 'Ear';

// Common glyphs organized by the features they typically exhibit
const GLYPH_FEATURE_MAP: Record<AnatomyFeatureType, string[]> = {
  // Angular glyphs with pointed tops (A, V, W, etc.)
  Apex: ['A', 'V', 'W', 'Y', 'Λ', 'Δ', '∇'],

  // Descending strokes below baseline (g, j, p, q, y, etc.)
  Tail: ['g', 'j', 'p', 'q', 'y', 'Q', 'J', 'β', 'γ', 'ζ', 'ξ', 'φ', 'ψ', 'ω'],

  // Horizontal or angled free strokes (T, E, F, L, etc.)
  Arm: ['T', 'E', 'F', 'L', 'Z', '7', 'Γ', 'Π', 'Σ'],

  // Small dots above letters (i, j, and some others)
  Tittle: ['i', 'j', 'ı', 'ȷ'],

  // Fully enclosed curved counters (o, e, c, etc.)
  Bowl: ['o', 'e', 'c', 'C', 'O', 'Q', 'a', 'b', 'd', 'g', 'p', 'q', 'ɑ', 'ɔ', 'ə', 'ɛ', 'ɡ', 'ʊ'],

  // Enclosed negative spaces (o, e, a, etc.)
  Counter: ['o', 'e', 'a', 'b', 'd', 'g', 'p', 'q', 'O', 'Q', 'B', 'D', 'P', 'R', 'a', 'ɑ', 'ɔ', 'ə', 'ɛ', 'ɡ'],

  // Open counters in e-like glyphs (e, ə, ɛ)
  Eye: ['e', 'ə', 'ɛ', 'œ'],

  // Terminal projections (I, T, E, etc.)
  Serif: ['I', 'T', 'E', 'F', 'L', 'H', 'B', 'D', 'P', 'R', 'N', 'M', 'K', 'i', 'l', 't', 'f', 'r'],

  // Square terminal endings (I, T, H, etc.)
  Finial: ['I', 'T', 'H', 'E', 'F', 'L', 'l', 't', 'f'],

  // Small projections (G, S, r, etc.)
  Spur: ['G', 'S', 'r', 'C', 'c', 'z', '3', '5', '6', '9'],

  // Interior angles between limbs (A, V, W, K, X)
  Crotch: ['A', 'V', 'W', 'K', 'X', 'Y', '4', 'Λ', 'Δ'],

  // Horizontal crossbars (A, H, t, etc.)
  Bar: ['A', 'H', 't', 'f', 'T', 'F', 'E', 'L', 'Z', '7', 'Γ'],

  // Closed/partial loops below baseline (g, y, etc.)
  Loop: ['g', 'y', 'j', 'β', 'γ', 'ζ', 'ξ', 'φ', 'ψ', 'ω'],

  // Small projections at top-right (g, r, etc.)
  Ear: ['g', 'r', 'C', 'G', 'j', 'β', 'γ', 'ζ']
};

// Reverse lookup: which features are available for a given glyph
const glyphToFeaturesCache = new Map<string, AnatomyFeatureType[]>();

/**
 * Get all anatomy features that a specific glyph typically exhibits
 * @param glyphName - The name/codepoint of the glyph (e.g., 'a', 'A', 'g')
 * @returns Array of feature types this glyph typically has
 */
export function getFeaturesForGlyph(glyphName: string): AnatomyFeatureType[] {
  if (glyphToFeaturesCache.has(glyphName)) {
    return glyphToFeaturesCache.get(glyphName)!;
  }

  const features: AnatomyFeatureType[] = [];

  // Check each feature type to see if this glyph is in its list
  for (const [feature, glyphs] of Object.entries(GLYPH_FEATURE_MAP)) {
    if (glyphs.includes(glyphName)) {
      features.push(feature as AnatomyFeatureType);
    }
  }

  glyphToFeaturesCache.set(glyphName, features);
  return features;
}

/**
 * Get all glyphs that typically exhibit a specific anatomy feature
 * @param feature - The anatomy feature type
 * @returns Array of glyph names that typically have this feature
 */
export function getGlyphsForFeature(feature: AnatomyFeatureType): string[] {
  return GLYPH_FEATURE_MAP[feature] || [];
}

/**
 * Check if a glyph typically has a specific anatomy feature
 * @param glyphName - The name/codepoint of the glyph
 * @param feature - The anatomy feature to check for
 * @returns True if the glyph typically has this feature
 */
export function glyphHasFeature(glyphName: string, feature: AnatomyFeatureType): boolean {
  const features = getFeaturesForGlyph(glyphName);
  return features.includes(feature);
}

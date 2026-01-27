import type { AnatomyFeature } from '@/ui/modules/FontInspector/types';
import type { Glyph } from '@/ui/modules/FontInspector/fontkit-types';
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
  highlightBackground: string;
  /** Background color for the glyph canvas area */
  glyphBackground: string;
  /** Fill color for feature highlights (danger/red tone) */
  featureHighlightFill: string;
  /** Stroke color for feature highlights */
  featureHighlightStroke: string;
  /** Secondary background color used when feature detection is active */
  featureBackground: string;
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

  ctx.fillStyle = colors.lsbFill;
  ctx.strokeStyle = colors.lsbStroke;
  // lsbX is where the glyph actually starts (leftmost point)
  // xMin is where the advance width starts (glyph origin)
  // LSB region is the space between lsbX and xMin
  const lsbX = xMin + lsb * scale;
  ctx.beginPath();
  ctx.moveTo(xMin, descY + 4);
  ctx.lineTo(xMin, descY + 12);
  ctx.moveTo(lsbX, descY + 4);
  ctx.lineTo(lsbX, descY + 12);
  ctx.stroke();
  ctx.textAlign = 'center';
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
    // Fill LSB region first (before checker pattern to ensure it's visible)
    ctx.fillStyle = colors.lsbFill;
    // LSB region: from lsbX (glyph start) to xMin (advance width start)
    if (lsbX < xMin) {
      // Normal case: glyph extends to the left of advance width start
      ctx.fillRect(lsbX, ascY, xMin - lsbX, descY - ascY);
    } else if (lsbX > xMin) {
      // Rare case: glyph starts to the right of advance width start
      ctx.fillRect(xMin, ascY, lsbX - xMin, descY - ascY);
    }

    // Fill RSB region
    ctx.fillStyle = colors.rsbFill;
    ctx.fillRect(rsbX, ascY, rsb * scale, descY - ascY);

    // Fill checker pattern for areas outside advance width
    ctx.fillStyle = pattern;
    // Left side (from canvas edge to glyph start, or to xMin if glyph starts after xMin)
    const leftCheckerStart = Math.min(lsbX, xMin);
    if (leftCheckerStart > 0) {
      ctx.fillRect(0, ascY, leftCheckerStart, descY - ascY);
    }
    // Right side (from advance width end to canvas edge)
    ctx.fillRect(xMax, ascY, ctx.canvas.width - xMax, descY - ascY);

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
  let lastAnchor: { x: number; y: number } | null = null;
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
  _baseline: number,
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
  _wght: number,
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

/**
 * Draws anatomy feature overlays on the glyph canvas.
 * @param ctx - Canvas context
 * @param w - Canvas width
 * @param h - Canvas height
 * @param glyph - Fontkit glyph
 * @param scale - Scale factor
 * @param colors - DrawColors
 * @param metrics - Metrics object
 * @param selected - Map of selected AnatomyFeature
 * @param analysis - (Optional) geometry analysis result (Float64Array)
 */
export function drawAnatomyOverlay(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  glyph: Glyph,
  scale: number,
  colors: DrawColors,
  _metrics: {
    [key: string]: number;
  },
  selected: Map<string, AnatomyFeature>,
  _analysis?: Float64Array
) {
  // 'analysis' is intentionally unused for now; will be used for overlays in the future.
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

  // TODO: Use analysis data for feature overlays in the future

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

// ===================================================================
// Feature Shape Rendering - Unified detector output rendering
// ===================================================================

import type {
  FeatureInstance,
  FeatureShape,
  Point2D,
} from '@/utils/typeAnatomy/types';

/**
 * Transform parameters for converting glyph space to canvas space.
 */
export interface TransformParams {
  /** Scale factor (font units to pixels) */
  scale: number;
  /** X offset for centering */
  xOffset: number;
  /** Baseline Y position in canvas coordinates */
  baseline: number;
}

/**
 * Transforms a point from glyph design space to canvas space.
 * Glyph space: Y increases upward, origin at baseline left
 * Canvas space: Y increases downward, origin at top-left
 */
export function transformPoint(
  point: Point2D,
  params: TransformParams
): Point2D {
  return {
    x: point.x * params.scale + params.xOffset,
    y: params.baseline - point.y * params.scale,
  };
}

/**
 * Transforms SVG path data from glyph design space to canvas space.
 * Handles M, L, Q, C, and Z commands.
 */
function transformPathData(d: string, params: TransformParams): string {
  // Parse and transform each coordinate in the path
  // Path commands: M x y, L x y, Q cx cy x y, C c1x c1y c2x c2y x y, Z
  const { scale, xOffset, baseline } = params;

  // Transform a single coordinate pair
  const tx = (x: number) => x * scale + xOffset;
  const ty = (y: number) => baseline - y * scale;

  // Regex to match path commands and their arguments
  const commandRegex = /([MLQCZ])\s*([-\d.\s,]*)/gi;
  const parts: string[] = [];

  let match;
  while ((match = commandRegex.exec(d)) !== null) {
    const cmd = match[1].toUpperCase();
    const argsStr = match[2].trim();

    if (cmd === 'Z') {
      parts.push('Z');
      continue;
    }

    // Parse numeric arguments
    const args = argsStr
      .split(/[\s,]+/)
      .filter((s) => s.length > 0)
      .map(parseFloat);

    switch (cmd) {
      case 'M':
      case 'L':
        if (args.length >= 2) {
          parts.push(`${cmd} ${tx(args[0])} ${ty(args[1])}`);
        }
        break;
      case 'Q':
        if (args.length >= 4) {
          parts.push(
            `Q ${tx(args[0])} ${ty(args[1])} ${tx(args[2])} ${ty(args[3])}`
          );
        }
        break;
      case 'C':
        if (args.length >= 6) {
          parts.push(
            `C ${tx(args[0])} ${ty(args[1])} ${tx(args[2])} ${ty(args[3])} ${tx(args[4])} ${ty(args[5])}`
          );
        }
        break;
    }
  }

  return parts.join(' ');
}

/**
 * Transforms a shape from glyph design space to canvas space.
 */
export function transformShape(
  shape: FeatureShape,
  params: TransformParams
): FeatureShape {
  switch (shape.type) {
    case 'circle': {
      const center = transformPoint({ x: shape.cx, y: shape.cy }, params);
      return {
        type: 'circle',
        cx: center.x,
        cy: center.y,
        r: shape.r * params.scale,
      };
    }

    case 'point': {
      const pt = transformPoint({ x: shape.x, y: shape.y }, params);
      return {
        type: 'point',
        x: pt.x,
        y: pt.y,
        label: shape.label,
      };
    }

    case 'line': {
      const p1 = transformPoint({ x: shape.x1, y: shape.y1 }, params);
      const p2 = transformPoint({ x: shape.x2, y: shape.y2 }, params);
      return {
        type: 'line',
        x1: p1.x,
        y1: p1.y,
        x2: p2.x,
        y2: p2.y,
      };
    }

    case 'rect': {
      const topLeft = transformPoint(
        { x: shape.x, y: shape.y + shape.height },
        params
      );
      return {
        type: 'rect',
        x: topLeft.x,
        y: topLeft.y,
        width: shape.width * params.scale,
        height: shape.height * params.scale,
      };
    }

    case 'polyline': {
      return {
        type: 'polyline',
        points: shape.points.map((p) => transformPoint(p, params)),
      };
    }

    case 'path': {
      // Transform SVG path data from glyph space to canvas space
      // This involves scaling and flipping Y coordinates
      const transformedD = transformPathData(shape.d, params);
      return {
        type: 'path',
        d: transformedD,
      };
    }

    default:
      return shape;
  }
}

/**
 * Draws a circle shape.
 */
function drawCircleShape(
  ctx: CanvasRenderingContext2D,
  shape: Extract<FeatureShape, { type: 'circle' }>,
  colors: DrawColors
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(shape.cx, shape.cy, shape.r, 0, Math.PI * 2);
  ctx.fillStyle = colors.featureHighlightFill || colors.highlightBackground;
  ctx.globalAlpha = 0.6;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = colors.featureHighlightStroke || colors.boundsStroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws a point shape with optional label.
 */
function drawPointShape(
  ctx: CanvasRenderingContext2D,
  shape: Extract<FeatureShape, { type: 'point' }>,
  colors: DrawColors
): void {
  ctx.save();
  ctx.beginPath();
  ctx.arc(shape.x, shape.y, 6, 0, Math.PI * 2);
  ctx.fillStyle = colors.featureHighlightFill || colors.highlightBackground;
  ctx.globalAlpha = 0.6;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = colors.featureHighlightStroke || colors.boundsStroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  if (shape.label) {
    ctx.font = '11px sans-serif';
    ctx.fillStyle = colors.labelFill;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(shape.label, shape.x + 10, shape.y);
  }
  ctx.restore();
}

/**
 * Draws a line shape as a filled rectangle with thickness.
 * This creates a closed shape that can be properly filled.
 */
function drawLineShape(
  ctx: CanvasRenderingContext2D,
  shape: Extract<FeatureShape, { type: 'line' }>,
  colors: DrawColors,
  thickness: number = 8
): void {
  ctx.save();

  // Calculate the line direction and perpendicular
  const dx = shape.x2 - shape.x1;
  const dy = shape.y2 - shape.y1;
  const length = Math.sqrt(dx * dx + dy * dy);

  if (length === 0) {
    ctx.restore();
    return;
  }

  // Normalized perpendicular vector
  const perpX = (-dy / length) * (thickness / 2);
  const perpY = (dx / length) * (thickness / 2);

  // Draw filled rectangle representing the line with thickness
  ctx.beginPath();
  ctx.moveTo(shape.x1 + perpX, shape.y1 + perpY);
  ctx.lineTo(shape.x2 + perpX, shape.y2 + perpY);
  ctx.lineTo(shape.x2 - perpX, shape.y2 - perpY);
  ctx.lineTo(shape.x1 - perpX, shape.y1 - perpY);
  ctx.closePath();

  // Fill with feature highlight color
  ctx.fillStyle = colors.featureHighlightFill || colors.highlightBackground;
  ctx.globalAlpha = 0.6;
  ctx.fill();
  ctx.globalAlpha = 1;

  // Stroke the outline
  ctx.strokeStyle = colors.featureHighlightStroke || colors.boundsStroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  // Draw endpoints as circles
  ctx.beginPath();
  ctx.arc(shape.x1, shape.y1, 4, 0, Math.PI * 2);
  ctx.fillStyle = colors.featureHighlightStroke || colors.boundsStroke;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(shape.x2, shape.y2, 4, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Draws a rectangle shape.
 */
function drawRectShape(
  ctx: CanvasRenderingContext2D,
  shape: Extract<FeatureShape, { type: 'rect' }>,
  colors: DrawColors
): void {
  ctx.save();
  ctx.fillStyle = colors.featureHighlightFill || colors.highlightBackground;
  ctx.globalAlpha = 0.6;
  ctx.fillRect(shape.x, shape.y, shape.width, shape.height);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = colors.featureHighlightStroke || colors.boundsStroke;
  ctx.lineWidth = 2;
  ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
  ctx.restore();
}

/**
 * Draws a glyph feature using canvas clipping to show the actual glyph geometry
 * within the feature bounds. This provides pixel-perfect precision by using the
 * glyph's actual path curves rather than simple rectangles.
 *
 * Uses 'evenodd' fill rule to properly handle glyphs with holes (like 'D', 'O', 'e').
 * This ensures only the solid stroke portions are filled, not the counter spaces.
 *
 * @param ctx - Canvas context (already translated to glyph origin)
 * @param glyph - Fontkit glyph object
 * @param scale - Scale factor from font units to pixels
 * @param clipRect - Rectangle bounds in canvas space to clip to
 * @param colors - Color scheme for rendering
 */
export function drawClippedGlyphFeature(
  ctx: CanvasRenderingContext2D,
  glyph: Glyph,
  scale: number,
  clipRect: { x: number; y: number; width: number; height: number },
  colors: DrawColors
): void {
  if (!glyph?.path?.commands) return;

  ctx.save();

  // Create clip region from feature bounds
  ctx.beginPath();
  ctx.rect(clipRect.x, clipRect.y, clipRect.width, clipRect.height);
  ctx.clip();

  // Draw glyph path - only portion within clip shows
  ctx.beginPath();
  for (const cmd of glyph.path.commands) {
    const args = cmd.args.map((a: number, i: number) =>
      i % 2 === 0 ? a * scale : -a * scale
    );
    (ctx[cmd.command as keyof CanvasPath] as (...args: number[]) => void)(
      ...args
    );
  }

  // Fill with highlight color using evenodd rule
  // This properly handles holes in glyphs (like the counter in 'D', 'O', etc.)
  ctx.fillStyle = colors.highlightBackground;
  ctx.globalAlpha = 0.5;
  ctx.fill('evenodd');

  // Stroke the visible glyph outline within the clip
  ctx.globalAlpha = 1;
  ctx.strokeStyle = colors.boundsStroke;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.restore();

  // Draw bounds outline (not clipped) - dashed to show feature region
  ctx.save();
  ctx.strokeStyle = colors.boundsStroke;
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.setLineDash([4, 4]);
  ctx.strokeRect(clipRect.x, clipRect.y, clipRect.width, clipRect.height);
  ctx.restore();
}

/**
 * Draws a polyline shape.
 */
function drawPolylineShape(
  ctx: CanvasRenderingContext2D,
  shape: Extract<FeatureShape, { type: 'polyline' }>,
  colors: DrawColors
): void {
  if (shape.points.length < 2) return;

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(shape.points[0].x, shape.points[0].y);

  for (let i = 1; i < shape.points.length; i++) {
    ctx.lineTo(shape.points[i].x, shape.points[i].y);
  }

  // Close the path
  ctx.closePath();

  ctx.fillStyle = colors.featureHighlightFill || colors.highlightBackground;
  ctx.globalAlpha = 0.6;
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = colors.featureHighlightStroke || colors.boundsStroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws an SVG path shape.
 */
function drawPathShape(
  ctx: CanvasRenderingContext2D,
  shape: Extract<FeatureShape, { type: 'path' }>,
  colors: DrawColors
): void {
  ctx.save();
  const path = new Path2D(shape.d);
  ctx.fillStyle = colors.featureHighlightFill || colors.highlightBackground;
  ctx.globalAlpha = 0.6;
  ctx.fill(path);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = colors.featureHighlightStroke || colors.boundsStroke;
  ctx.lineWidth = 2;
  ctx.stroke(path);
  ctx.restore();
}

/**
 * Unified shape dispatcher - draws any FeatureShape type.
 *
 * @param ctx - Canvas context
 * @param shape - The shape to draw (already in canvas coordinates)
 * @param colors - Color scheme
 */
export function drawShape(
  ctx: CanvasRenderingContext2D,
  shape: FeatureShape,
  colors: DrawColors
): void {
  switch (shape.type) {
    case 'circle':
      drawCircleShape(ctx, shape, colors);
      break;
    case 'point':
      drawPointShape(ctx, shape, colors);
      break;
    case 'line':
      drawLineShape(ctx, shape, colors);
      break;
    case 'rect':
      drawRectShape(ctx, shape, colors);
      break;
    case 'polyline':
      drawPolylineShape(ctx, shape, colors);
      break;
    case 'path':
      drawPathShape(ctx, shape, colors);
      break;
  }
}

/**
 * Options for drawing feature instances.
 */
export interface DrawFeatureOptions {
  /** Glyph for clipped rendering (optional) */
  glyph?: Glyph;
  /** Whether to use clipped glyph geometry for rect shapes */
  useClipping?: boolean;
}

/**
 * Draws a feature instance with coordinate transformation.
 *
 * @param ctx - Canvas context
 * @param instance - Feature instance from detector
 * @param params - Transform parameters (scale, xOffset, baseline)
 * @param colors - Color scheme
 * @param options - Optional drawing options (glyph for clipping, etc.)
 */
export function drawFeatureInstance(
  ctx: CanvasRenderingContext2D,
  instance: FeatureInstance,
  params: TransformParams,
  colors: DrawColors,
  options?: DrawFeatureOptions
): void {
  const transformed = transformShape(instance.shape, params);

  // For rect shapes, optionally use glyph clipping for precise geometry
  if (
    transformed.type === 'rect' &&
    options?.useClipping &&
    options?.glyph
  ) {
    const clipRect = {
      x: transformed.x,
      y: transformed.y,
      width: transformed.width,
      height: transformed.height,
    };
    drawClippedGlyphFeature(ctx, options.glyph, params.scale, clipRect, colors);
  } else {
    drawShape(ctx, transformed, colors);
  }
}

/**
 * Draws all feature instances from a detection result.
 *
 * @param ctx - Canvas context
 * @param instances - Map of feature ID to instances
 * @param params - Transform parameters
 * @param colors - Color scheme
 * @param options - Optional drawing options (glyph for clipping, etc.)
 */
export function drawFeatureInstances(
  ctx: CanvasRenderingContext2D,
  instances: Map<string, FeatureInstance[]>,
  params: TransformParams,
  colors: DrawColors,
  options?: DrawFeatureOptions
): void {
  ctx.save();

  for (const [_featureId, featureInstances] of instances) {
    // Skip empty arrays for efficiency
    if (featureInstances.length === 0) continue;
    
    for (const instance of featureInstances) {
      drawFeatureInstance(ctx, instance, params, colors, options);
    }
  }

  ctx.restore();
}

/**
 * Draws the glyph with a secondary background color to indicate
 * that feature detection is active. The highlighted features will
 * then be drawn on top with the primary highlight color.
 *
 * @param ctx - Canvas context (already translated to glyph origin)
 * @param glyph - Fontkit glyph object
 * @param scale - Scale factor
 * @param colors - Color scheme
 */
export function drawGlyphWithFeatureBackground(
  ctx: CanvasRenderingContext2D,
  glyph: Glyph,
  scale: number,
  colors: DrawColors
): void {
  if (!glyph?.path?.commands) return;

  ctx.save();
  ctx.beginPath();

  for (const cmd of glyph.path.commands) {
    const args = cmd.args.map((a: number, i: number) =>
      i % 2 === 0 ? a * scale : -a * scale
    );
    (ctx[cmd.command as keyof CanvasPath] as (...args: number[]) => void)(
      ...args
    );
  }
  ctx.closePath();

  // Fill with the secondary/feature background color
  ctx.fillStyle = colors.featureBackground;
  ctx.fill();

  ctx.restore();
}

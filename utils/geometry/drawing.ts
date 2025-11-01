import { AnatomyFeature } from '@/ui/modules/FontInspector/FontInspector';
import type { FeatureShape, Metrics } from '@/utils/typeAnatomy';
import { detectFeature } from '@/utils/typeAnatomy/detector';
import type { FeatureHighlight } from '@/utils/typeAnatomy/featureHighlight';
import { extractFeatureSegments } from '@/utils/typeAnatomy/featureHighlight';
import type { Font, Glyph } from 'fontkit';
import { dFor } from './geometryCore';
import {
  fontYToCanvasY,
  getFeatureClipBoundary,
  type ClipBoundary,
} from './pathClipping';
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
  const lsbX = xMin - lsb * -scale;
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
 * @param metrics - Metrics object (font metrics in canvas coordinates)
 * @param selected - Map of selected AnatomyFeature
 * @param font - Optional font instance (required for some features like Stem)
 * @param showDetails - Whether to show detailed highlights
 */
// Debug flag - set to true to enable verbose logging
const DEBUG_ANATOMY = true;

export function drawAnatomyOverlay(
  ctx: CanvasRenderingContext2D,
  _w: number,
  _h: number,
  glyph: Glyph,
  scale: number,
  colors: DrawColors,
  metrics: {
    [key: string]: number;
  },
  selected: Map<string, AnatomyFeature>,
  font?: Font,
  showDetails = false
) {
  if (DEBUG_ANATOMY) {
    console.log('🟢 [drawAnatomyOverlay] FUNCTION CALLED', {
      selectedSize: selected?.size || 0,
      showDetails,
      glyphName: glyph?.name,
    });
    console.log('[drawAnatomyOverlay] FUNCTION CALLED', {
      hasGlyph: !!glyph,
      glyphName: glyph?.name,
      glyphCode: glyph?.codePoints?.[0] ?? glyph?.id,
      selectedSize: selected?.size || 0,
      selectedEntries: selected
        ? Array.from(selected.entries()).map(([name, feature]) => ({
            name,
            selected: feature.selected,
            disabled: feature.disabled,
          }))
        : [],
      showDetails,
      hasFont: !!font,
    });
  }

  if (!selected || selected.size === 0) {
    return;
  }

  ctx.save();

  // Convert canvas metrics to font units for detection
  // Note: We need fontInstance to get accurate metrics, but if not provided,
  // we'll estimate from canvas metrics
  let fontMetrics: Metrics;

  if (font) {
    // Use font instance metrics directly (most accurate)
    fontMetrics = {
      baseline: 0, // Baseline is typically at 0 in font coordinates
      xHeight: font.xHeight || 0,
      capHeight: font.capHeight || 0,
      ascent: font.ascent || 0,
      descent: font.descent || 0,
    };
  } else {
    // Fallback: estimate from canvas metrics (less accurate)
    fontMetrics = {
      baseline: 0,
      xHeight: (metrics.Baseline - metrics['X-height']) / scale,
      capHeight: (metrics.Baseline - metrics['Cap height']) / scale,
      ascent: (metrics.Baseline - metrics.Ascender) / scale,
      descent: metrics.Descender / scale,
    };
  }

  // Get glyph info for coordinate matching (only used when DEBUG_ANATOMY is true)
  const glyphBounds = glyph.path?.bbox;
  const glyphCommands = glyph.path?.commands || [];

  if (DEBUG_ANATOMY) {
    console.log('[drawAnatomyOverlay] Start', {
      showDetails,
      selectedCount: selected.size,
      scale,
      glyphBounds: glyphBounds
        ? {
            minX: glyphBounds.minX,
            minY: glyphBounds.minY,
            maxX: glyphBounds.maxX,
            maxY: glyphBounds.maxY,
          }
        : null,
      fontMetrics,
      highlightColor: colors.highlightBackground,
      glyphName: glyph.name,
      glyphCode: glyph.codePoints?.[0] ?? glyph.id,
      pathCommands: glyphCommands
        .slice(0, 10)
        .map((cmd: { command: string; args: number[] }) => ({
          command: cmd.command,
          args: cmd.args,
        })),
      totalCommands: glyphCommands.length,
    });
  }

  // Log glyph path commands for debugging coordinate matching
  if (DEBUG_ANATOMY) {
    console.log('[drawAnatomyOverlay] Start', {
      showDetails,
      selectedCount: selected.size,
      scale,
      glyphBounds: glyphBounds
        ? {
            minX: glyphBounds.minX,
            minY: glyphBounds.minY,
            maxX: glyphBounds.maxX,
            maxY: glyphBounds.maxY,
          }
        : null,
      fontMetrics,
      highlightColor: colors.highlightBackground,
      glyphName: glyph.name,
      glyphCode: glyph.codePoints?.[0] ?? glyph.id,
      pathCommands: glyphCommands
        .slice(0, 10)
        .map((cmd: { command: string; args: number[] }) => ({
          command: cmd.command,
          args: cmd.args,
        })),
      totalCommands: glyphCommands.length,
    });
  }

  // Metric features are drawn as lines, not anatomy overlays
  const metricFeatures = new Set([
    'Baseline',
    'Cap height',
    'X-height',
    'Ascender',
    'Descender',
  ]);

  // Detect and draw each selected feature
  for (const [featureName, feature] of selected.entries()) {
    if (!feature.selected || feature.disabled) {
      continue;
    }

    // Skip metric features - they're drawn as lines, not overlays
    if (metricFeatures.has(featureName)) {
      continue;
    }

    if (DEBUG_ANATOMY) {
      console.log(
        `[drawAnatomyOverlay] Processing anatomy feature: ${featureName}`
      );
      console.log(
        `[drawAnatomyOverlay] ${featureName} showDetails value:`,
        showDetails
      );
    }

    try {
      const result = detectFeature(featureName, glyph, fontMetrics, font);

      if (!result.found) {
        continue;
      }

      // When showDetails is on, draw highlighted path segments using masked geometry
      console.log(
        `🔍 [drawAnatomyOverlay] ${featureName} showDetails check AFTER detectFeature:`,
        {
          showDetails,
          showDetailsType: typeof showDetails,
          featureName,
          willTryMasked: showDetails,
          DEBUG_ANATOMY,
        }
      );

      if (showDetails) {
        console.log(
          `✅ [drawAnatomyOverlay] ${featureName} showDetails is TRUE, attempting masked geometry`
        );

        // Try to use masked geometry highlighting first (better visual accuracy)
        if (DEBUG_ANATOMY) {
          console.log(
            `[drawAnatomyOverlay] ${featureName} calling getFeatureClipBoundary`
          );
        }

        const clipBoundary = getFeatureClipBoundary(
          featureName,
          glyph,
          fontMetrics
        );

        console.log(
          `🔍 [drawAnatomyOverlay] ${featureName} clip boundary result:`,
          clipBoundary,
          'fontMetrics:',
          fontMetrics
        );

        // Always log for Apex to debug
        if (featureName === 'Apex') {
          console.log(`🎯 [drawAnatomyOverlay] APEX DEBUG:`, {
            showDetails,
            clipBoundary,
            hasGlyph: !!glyph,
            hasMetrics: !!fontMetrics,
            highlightColor: colors.highlightBackground,
          });
        }

        // Calculate baseline canvas Y position from metrics
        // The metrics object contains canvas coordinates for Baseline
        const baselineCanvasY = metrics.Baseline || 0;

        // Calculate xOffset to match SymbolCanvas calculation exactly
        // This centers the glyph horizontally in the canvas
        const xOffset = Math.round((_w - glyph.advanceWidth * scale) / 2);

        if (clipBoundary) {
          if (DEBUG_ANATOMY) {
            console.log(
              `[drawAnatomyOverlay] ${featureName} attempting masked geometry highlight`,
              {
                clipBoundary,
                baselineCanvasY,
                xOffset,
                scale,
                highlightColor: colors.highlightBackground,
              }
            );
          }

          // Use masked geometry highlighting (duplicated and clipped glyph)
          const maskedSuccess = drawMaskedGeometryHighlight(
            ctx,
            glyph,
            scale,
            colors.highlightBackground,
            clipBoundary,
            baselineCanvasY,
            xOffset
          );

          if (maskedSuccess) {
            // Successfully used masked geometry, skip segment-based highlighting
            if (DEBUG_ANATOMY) {
              console.log(
                `[drawAnatomyOverlay] ${featureName} ✅ successfully used masked geometry highlighting`
              );
            }
            continue;
          } else {
            if (DEBUG_ANATOMY) {
              console.log(
                `[drawAnatomyOverlay] ${featureName} ❌ masked geometry failed, falling back to segments`
              );
            }
          }
        } else {
          if (DEBUG_ANATOMY) {
            console.log(
              `[drawAnatomyOverlay] ${featureName} ⚠️ no clip boundary available, using segment highlighting`
            );
          }
        }

        // Fallback to segment-based highlighting if masked geometry fails
        // Log coordinate comparison only when debugging
        if (DEBUG_ANATOMY && featureName === 'Apex') {
          const allPoints: Array<{ x: number; y: number; command: string }> =
            [];
          glyphCommands.forEach((cmd: { command: string; args: number[] }) => {
            if (cmd.command === 'moveTo' || cmd.command === 'lineTo') {
              allPoints.push({
                x: cmd.args[0],
                y: cmd.args[1],
                command: cmd.command,
              });
            } else if (cmd.command === 'quadraticCurveTo') {
              allPoints.push({
                x: cmd.args[2],
                y: cmd.args[3],
                command: cmd.command,
              });
            } else if (cmd.command === 'bezierCurveTo') {
              allPoints.push({
                x: cmd.args[4],
                y: cmd.args[5],
                command: cmd.command,
              });
            }
          });
          const topPoints = allPoints.filter(
            (p) =>
              Math.abs(p.y - fontMetrics.ascent) <
              (fontMetrics.ascent - fontMetrics.capHeight) * 0.3
          );
          console.log(`[drawAnatomyOverlay] Apex - Top points in glyph path:`, {
            topPoints,
            fontMetrics,
            glyphBounds: glyphBounds
              ? {
                  minY: glyphBounds.minY,
                  maxY: glyphBounds.maxY,
                }
              : null,
          });
        }

        const highlight = extractFeatureSegments(
          featureName,
          glyph,
          fontMetrics,
          font
        );

        if (highlight) {
          if (
            DEBUG_ANATOMY &&
            featureName === 'Apex' &&
            highlight.segments.length > 0
          ) {
            highlight.segments.forEach((seg, idx) => {
              console.log(`[drawAnatomyOverlay] Apex segment ${idx}:`, {
                type: seg.type,
                points: seg.points,
                scaledPoints: seg.points.map((p) => ({
                  x: p.x * scale,
                  y: -p.y * scale,
                })),
              });
            });
          }

          drawFeatureHighlight(
            ctx,
            highlight,
            scale,
            colors.highlightBackground
          );
        }
      }

      // Draw shape-based features (like Counter)
      if (result.shape) {
        drawFeatureShape(ctx, result.shape, scale, colors, featureName);
      }

      // Draw location-based features (markers) - only if not showing details
      if (!showDetails) {
        if (result.location) {
          const x = result.location.x * scale;
          const y = -result.location.y * scale; // Invert Y for canvas coordinates
          drawMarker(ctx, x, y, featureName, colors.anchorFill);
        } else if (result.found && !result.shape) {
          // For boolean-only features, find approximate location
          const location = findFeatureLocation(glyph, featureName, scale);
          if (location) {
            drawMarker(
              ctx,
              location[0],
              location[1],
              featureName,
              colors.anchorFill
            );
          }
        }
      }
    } catch (error) {
      console.warn(`[drawAnatomyOverlay] Error drawing ${featureName}:`, error);
    }
  }

  ctx.restore();
}

/**
 * Draws highlighted feature regions using masked/duplicated geometry.
 * Creates a duplicate of the glyph shape, clipped at feature boundaries,
 * and fills it with the highlight color (similar to the image example).
 *
 * This provides a more accurate visual representation than stroke-based highlighting.
 * The glyph is duplicated, cut at the feature boundary, and filled with highlight color.
 */
function drawMaskedGeometryHighlight(
  ctx: CanvasRenderingContext2D,
  glyph: Glyph,
  scale: number,
  highlightColor: string,
  clipBoundary: ClipBoundary,
  baselineCanvasY: number,
  xOffset: number = 0
): boolean {
  if (!glyph?.path) return false;

  try {
    // Get the SVG path data for the glyph
    const pathData = dFor(glyph);
    if (!pathData || pathData === 'M0 0') return false;

    // Convert clip boundary to canvas coordinates
    let clipYCanvas: number;
    if (clipBoundary.type === 'horizontal' && clipBoundary.y !== undefined) {
      // Convert font Y (Y-up) to canvas Y (Y-down)
      clipYCanvas = fontYToCanvasY(clipBoundary.y, scale, baselineCanvasY);
    } else {
      // Can't clip without a Y boundary
      return false;
    }

    // Save current state (this may include transforms from parent context)
    ctx.save();

    // Set up clipping region in canvas coordinates
    const canvasWidth = ctx.canvas.width;
    const canvasHeight = ctx.canvas.height;

    if (clipBoundary.keepAbove) {
      // Clip to region above boundary (top portion)
      ctx.beginPath();
      ctx.rect(
        -canvasWidth,
        -canvasHeight,
        canvasWidth * 3,
        clipYCanvas + canvasHeight
      );
      ctx.clip();
    } else if (clipBoundary.keepBelow) {
      // Clip to region below boundary (bottom portion)
      ctx.beginPath();
      ctx.rect(-canvasWidth, clipYCanvas, canvasWidth * 3, canvasHeight * 2);
      ctx.clip();
    } else {
      // Default to above
      ctx.beginPath();
      ctx.rect(
        -canvasWidth,
        -canvasHeight,
        canvasWidth * 3,
        clipYCanvas + canvasHeight
      );
      ctx.clip();
    }

    if (DEBUG_ANATOMY) {
      console.log('[drawMaskedGeometryHighlight] Clipping setup', {
        clipBoundary,
        clipYCanvas,
        canvasWidth,
        canvasHeight,
        keepAbove: clipBoundary.keepAbove,
        keepBelow: clipBoundary.keepBelow,
      });
    }

    // Set up transform for the glyph path
    // Note: We need to account for the parent context's transform
    // The xOffset and baselineCanvasY are already in canvas coordinates
    ctx.save();

    // Translate to glyph position (accounting for parent transform)
    ctx.translate(xOffset, baselineCanvasY);

    // Scale and flip Y-axis (font Y-up -> canvas Y-down)
    ctx.scale(scale, -scale);

    // Create and draw the glyph path
    const glyphPath = new Path2D(pathData);

    // Fill with highlight color (accent color) - fully opaque for visibility
    ctx.fillStyle = highlightColor;
    ctx.globalAlpha = 1.0;
    ctx.fill(glyphPath);

    ctx.restore(); // Restore transform
    ctx.restore(); // Restore clipping

    if (DEBUG_ANATOMY) {
      console.log('[drawMaskedGeometryHighlight] Drew masked highlight', {
        featureName: clipBoundary.type,
        clipBoundary,
        clipYCanvas,
        baselineCanvasY,
        xOffset,
        highlightColor,
        pathData: pathData.substring(0, 50),
      });
    }

    return true;
  } catch (error) {
    console.warn(
      '[drawMaskedGeometryHighlight] Error drawing masked highlight:',
      error
    );
    return false;
  }
}

/**
 * Draws highlighted feature regions based on extracted path segments.
 * Creates filled shapes that wrap around the feature segments.
 *
 * @deprecated Consider using drawMaskedGeometryHighlight for better visual accuracy
 */
function drawFeatureHighlight(
  ctx: CanvasRenderingContext2D,
  highlight: FeatureHighlight,
  scale: number,
  highlightColor: string
) {
  if (!highlight.segments || highlight.segments.length === 0) {
    return;
  }

  ctx.save();
  ctx.fillStyle = highlightColor;
  ctx.strokeStyle = highlightColor;
  ctx.globalAlpha = 0.4; // Semi-transparent highlight
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Draw each segment
  for (let i = 0; i < highlight.segments.length; i++) {
    const segment = highlight.segments[i];
    if (segment.points.length === 0) {
      continue;
    }

    const scaledPoints = segment.points.map((p) => ({
      x: p.x * scale,
      y: -p.y * scale, // Invert Y for canvas coordinates
    }));

    ctx.beginPath();

    switch (segment.type) {
      case 'line':
        if (scaledPoints.length >= 2) {
          ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
          ctx.lineTo(scaledPoints[1].x, scaledPoints[1].y);
        }
        break;

      case 'bezier':
        if (scaledPoints.length >= 4) {
          ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
          ctx.bezierCurveTo(
            scaledPoints[1].x,
            scaledPoints[1].y,
            scaledPoints[2].x,
            scaledPoints[2].y,
            scaledPoints[3].x,
            scaledPoints[3].y
          );
        }
        break;

      case 'quadratic':
        if (scaledPoints.length >= 3) {
          ctx.moveTo(scaledPoints[0].x, scaledPoints[0].y);
          ctx.quadraticCurveTo(
            scaledPoints[1].x,
            scaledPoints[1].y,
            scaledPoints[2].x,
            scaledPoints[2].y
          );
        }
        break;
    }

    // For open paths, stroke with a wider line to create highlight effect
    ctx.stroke();
    if (DEBUG_ANATOMY) {
      console.log(`[drawFeatureHighlight] Stroked segment ${i}`, {
        canvasState: {
          fillStyle: ctx.fillStyle,
          strokeStyle: ctx.strokeStyle,
          lineWidth: ctx.lineWidth,
          globalAlpha: ctx.globalAlpha,
        },
      });
    }
  }

  if (DEBUG_ANATOMY) {
    console.log('[drawFeatureHighlight] Finished drawing all segments');
  }
  ctx.restore();
}

/**
 * Draws a feature shape (polyline, circle, or path) on the canvas.
 */
function drawFeatureShape(
  ctx: CanvasRenderingContext2D,
  shape: FeatureShape,
  scale: number,
  colors: DrawColors,
  _featureName: string
) {
  ctx.save();
  ctx.strokeStyle = colors.anchorStroke;
  ctx.fillStyle = colors.anchorFill;
  ctx.lineWidth = 2;

  switch (shape.type) {
    case 'polyline':
      if (shape.points && shape.points.length > 0) {
        ctx.beginPath();
        const first = shape.points[0];
        ctx.moveTo(first.x * scale, -first.y * scale);
        for (let i = 1; i < shape.points.length; i++) {
          const pt = shape.points[i];
          ctx.lineTo(pt.x * scale, -pt.y * scale);
        }
        ctx.closePath();
        ctx.stroke();
        ctx.globalAlpha = 0.2;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }
      break;

    case 'circle':
      ctx.beginPath();
      ctx.arc(
        shape.cx * scale,
        -shape.cy * scale,
        shape.r * scale,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1.0;
      break;

    case 'path':
      // Parse and draw SVG path
      const path2d = new Path2D(shape.d);
      ctx.stroke(path2d);
      ctx.globalAlpha = 0.2;
      ctx.fill(path2d);
      ctx.globalAlpha = 1.0;
      break;
  }

  ctx.restore();
}

/**
 * Finds an approximate location for a feature based on its type.
 * Falls back to extreme points on the path for features without specific location detection.
 */
function findFeatureLocation(
  glyph: Glyph,
  featureName: string,
  scale: number
): [number, number] | null {
  const commands = glyph.path?.commands;
  if (!commands || commands.length === 0) {
    return null;
  }

  // Feature-specific location finding
  const featureLocationMap: Record<string, boolean> = {
    Apex: true,
    Tail: false,
    Vertex: false,
    Ear: false,
    Spur: false,
  };

  const isTop = featureLocationMap[featureName] ?? false;
  return findExtremePointOnPath(commands, scale, isTop);
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

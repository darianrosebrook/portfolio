import type { Glyph } from 'fontkit';
import type { AnatomyFeature } from '../components/FontInspector/FontInspector';
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

  glyph.path.commands.forEach(({ command, args }) => {
    switch (command) {
      case 'moveTo': {
        const x = args[0] * scale,
          y = -args[1] * scale;
        anchors.push([x, y, false]);
        ctx.moveTo(x, y);
        break;
      }
      case 'lineTo': {
        const x = args[0] * scale,
          y = -args[1] * scale;
        anchors.push([x, y, false]);
        ctx.lineTo(x, y);
        break;
      }
      case 'quadraticCurveTo': {
        const [cx, cy, x, y] = args.map((a, idx) =>
          idx % 2 ? -a * scale : a * scale
        );
        anchors.push([x, y, false]);
        handles.push([cx, cy]);
        ctx.lineTo(cx, cy);
        ctx.lineTo(x, y);
        break;
      }
      case 'bezierCurveTo': {
        const [c1x, c1y, c2x, c2y, x, y] = args.map((a, idx) =>
          idx % 2 ? -a * scale : a * scale
        );
        anchors.push([x, y, false]);
        handles.push([c1x, c1y], [c2x, c2y]);
        ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x, y);
        break;
      }
      case 'closePath':
        if (anchors.length) anchors[anchors.length - 1][2] = true;
        ctx.closePath();
        break;
    }
  });

  // outline
  ctx.strokeStyle = colors.pathStroke;
  ctx.lineWidth = 1;
  ctx.stroke();

  // anchors
  ctx.fillStyle = colors.anchorFill;
  ctx.strokeStyle = colors.anchorStroke;
  anchors.forEach(([ax, ay, start]) => {
    ctx.beginPath();
    ctx.ellipse(ax, ay, 1.5, 1.5, 0, 0, Math.PI * 2);
    if (start) ctx.fill();
    else {
      ctx.fill();
      ctx.stroke();
    }
  });

  // handles
  ctx.fillStyle = colors.handleFill;
  ctx.strokeStyle = colors.handleStroke;
  handles.forEach(([hx, hy]) => {
    ctx.beginPath();
    ctx.ellipse(hx, hy, 2.5, 2.5, 0, 0, Math.PI * 2);
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
  selected: Map<string, AnatomyFeature>
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

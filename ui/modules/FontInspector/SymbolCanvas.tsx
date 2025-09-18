import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useInspector, AxisValues } from './FontInspector';
import styles from './FontInspector.module.scss';
import {
  drawAnatomyOverlay,
  drawAxisValues,
  drawCursorLabel,
  drawGlyphBounds,
  drawMetricLine,
  drawPathDetails,
} from '@/utils/geometry/drawing';

export const SymbolCanvas: React.FC = () => {
  const {
    fontInstance,
    glyph,
    axisValues,
    showDetails,
    setAxisValues,
    colors,
    selectedAnatomy,
  } = useInspector();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelRatio = useRef(1);
  const drawScheduled = useRef(false);

  const dragStartX = useRef(0);
  const dragStartAxis = useRef<AxisValues>(axisValues);
  const canvasTopPadding = 128;
  const canvasBottomPadding = 64;
  const canvasHorizontalPadding = 128;

  const [cursor, setCursor] = useState<{
    x: number;
    y: number;
    active: boolean;
    dragging: boolean;
    dragStartX: number;
    dragStartAxis: AxisValues;
  }>({
    x: 0,
    y: 0,
    active: false,
    dragging: false,
    dragStartX: 0,
    dragStartAxis: axisValues,
  });
  const drawGlyph = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      if (!fontInstance || !glyph || !glyph.path) {
        return;
      }
      const units = fontInstance.unitsPerEm;

      const glyphBoundsW = w - canvasHorizontalPadding; // Usable width
      const glyphBoundsH = h - canvasTopPadding - canvasBottomPadding; // Usable height

      const fontHeight = fontInstance.ascent - fontInstance.descent || units;
      const scale = Math.min(
        glyphBoundsW / (glyph.advanceWidth * 1.1 || units * 0.6),
        glyphBoundsH / fontHeight
      );

      const baseline =
        h - (Math.abs(fontInstance.descent) * scale + canvasBottomPadding);

      const metrics = {
        Baseline: baseline,
        'Cap height': baseline - fontInstance.capHeight * scale,
        'X-height': baseline - fontInstance.xHeight * scale,
        Ascender: baseline - fontInstance.ascent * scale,
        Descender: baseline - fontInstance.descent * scale,
      };

      const xOffset = Math.round((w - glyph.advanceWidth * scale) / 2);

      ctx.save();

      if (showDetails) {
        drawGlyphBounds(
          ctx,
          xOffset,
          xOffset + glyph.advanceWidth * scale,
          metrics['Ascender'],
          metrics['Descender'],
          scale,
          glyph,
          colors
        );
      }

      drawAxisValues(
        ctx,
        w,
        baseline,
        axisValues.wght,
        axisValues.opsz,
        colors
      );

      const selectedFeatures = Array.from(selectedAnatomy.values());
      selectedFeatures.forEach((feature) => {
        drawMetricLine(
          ctx,
          w,
          metrics[feature.label as keyof typeof metrics],
          feature.label,
          feature.labelPosition,
          colors
        );
      });

      if (cursor.active)
        drawCursorLabel(ctx, cursor.x, cursor.y, axisValues.wght, colors);

      ctx.restore();

      ctx.save();
      ctx.translate(xOffset, baseline);

      ctx.beginPath();
      for (const cmd of glyph.path.commands) {
        const args = cmd.args.map((a, i) =>
          i % 2 === 0 ? a * scale : -a * scale
        );
        (ctx[cmd.command as keyof CanvasPath] as (...args: number[]) => void)(
          ...args
        );
      }
      ctx.closePath();

      if (showDetails) {
        ctx.fillStyle = colors.boundsFill;
        ctx.fill();
        ctx.strokeStyle = colors.boundsStroke;
        ctx.lineWidth = 1;
        ctx.stroke();
        drawPathDetails(ctx, glyph, scale, colors);
      } else {
        ctx.fillStyle = colors.pathFill;
        ctx.fill();
      }

      drawAnatomyOverlay(
        ctx,
        w,
        h,
        glyph,
        scale,
        colors,
        metrics,
        selectedAnatomy
      );

      ctx.restore();
    },

    [
      fontInstance,
      glyph,
      colors,
      axisValues,
      cursor,
      selectedAnatomy,
      showDetails,
    ]
  );

  /*** Scheduler ***/

  /*** Main draw ***/
  const draw = useCallback(() => {
    drawScheduled.current = false;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width / pixelRatio.current;
    const h = canvas.height / pixelRatio.current;

    ctx.resetTransform();
    ctx.scale(pixelRatio.current, pixelRatio.current);
    ctx.clearRect(0, 0, w, h);

    if (fontInstance && glyph) {
      drawGlyph(ctx, w, h);
    } else {
      console.warn('No font or glyph');
    }
  }, [glyph, fontInstance, drawGlyph]);

  const scheduleDraw = useCallback(() => {
    if (!drawScheduled.current) {
      drawScheduled.current = true;
      requestAnimationFrame(draw);
    }
  }, [draw]);
  useEffect(() => {
    scheduleDraw();
  }, [
    glyph,
    showDetails,
    axisValues,
    cursor.active,
    cursor.dragging,
    selectedAnatomy,
    colors,
    scheduleDraw,
  ]);
  /*** Resize ***/
  useLayoutEffect(() => {
    const onResize = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      pixelRatio.current = window.devicePixelRatio || 1;
      const parent = canvas.parentElement!;
      const w = parent.clientWidth;
      const h = parent.clientHeight;
      canvas.width = w * pixelRatio.current;
      canvas.height = h * pixelRatio.current;
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      scheduleDraw();
    };
    window.addEventListener('resize', onResize, { passive: true });
    onResize();
    return () => window.removeEventListener('resize', onResize);
  }, [scheduleDraw]);

  /*** Redraw on state-changes ***/
  useEffect(() => {
    scheduleDraw();
  }, [glyph, showDetails, axisValues, cursor, scheduleDraw, colors]);
  useEffect(() => {
    if (typeof window === 'undefined') return;

    pixelRatio.current = window.devicePixelRatio || 1;

    const handleResize = () => {
      const canvas = canvasRef.current!;
      pixelRatio.current = window.devicePixelRatio || 1;
      const parent = canvas.parentElement!;
      canvas.width = parent.clientWidth * pixelRatio.current;
      canvas.height = parent.clientHeight * pixelRatio.current;
      canvas.style.width = `${parent.clientWidth}px`;
      canvas.style.height = `${parent.clientHeight}px`;
      scheduleDraw();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [scheduleDraw]);

  /*** Pointer Events ***/

  const onDown = useCallback(
    (ev: PointerEvent) => {
      const c = canvasRef.current!;
      c.setPointerCapture(ev.pointerId);
      setCursor((s) => ({ ...s, dragging: true }));
      dragStartX.current = ev.offsetX;
      dragStartAxis.current = axisValues;
      scheduleDraw();
    },
    [axisValues, scheduleDraw]
  );

  const onMove = useCallback(
    (ev: PointerEvent) => {
      setCursor((s) => ({ ...s, x: ev.offsetX, y: ev.offsetY }));

      if (cursor.dragging) {
        const wPx = canvasRef.current!.width / pixelRatio.current / 2;
        const dx = (ev.offsetX - dragStartX.current) / wPx;
        let newW = dragStartAxis.current.wght + dx * 800;
        if (ev.shiftKey) newW = Math.round(newW / 100) * 100;
        newW = Math.max(100, Math.min(900, newW));

        setAxisValues({ wght: newW });
      }

      scheduleDraw();
    },
    [cursor.dragging, scheduleDraw, setAxisValues]
  );

  // pointerup
  const onUp = useCallback(() => {
    setCursor((s) => ({ ...s, dragging: false }));
    scheduleDraw();
  }, [scheduleDraw]);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const onOver = () => {
      setCursor((c) => ({ ...c, active: true }));
      scheduleDraw();
    };
    const onOut = () => {
      setCursor((c) => ({ ...c, active: false, dragging: false }));
      scheduleDraw();
    };
    canvas.addEventListener('pointerover', onOver);
    canvas.addEventListener('pointerout', onOut);
    canvas.addEventListener('pointerdown', onDown);
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerup', onUp);
    canvas.addEventListener('pointercancel', onOut);

    return () => {
      canvas.removeEventListener('pointerover', onOver);
      canvas.removeEventListener('pointerout', onOut);
      canvas.removeEventListener('pointerdown', onDown);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerup', onUp);
      canvas.removeEventListener('pointercancel', onOut);
    };
  }, [axisValues, setAxisValues, scheduleDraw, onDown, onMove, onUp]);

  return (
    <canvas
      className={styles.canvas}
      ref={canvasRef}
      style={{ width: '100%', height: '50vh' }}
    />
  );
};

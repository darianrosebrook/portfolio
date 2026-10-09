import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { useInspector, AxisValues } from './FontInspector';
import './FontInspector.css';
import { glyphViewport, useViewportSize } from './viewport';
import {
  drawAnatomyOverlay,
  drawAxisValues,
  drawCursorLabel,
  drawGlyphBounds,
  drawMetricLine,
  drawPathDetails,
  drawFeatureInstances,
  type TransformParams,
  type DrawFeatureOptions,
} from '@/utils/geometry/drawing';

export const SymbolCanvas: React.FC = () => {
  const {
    fontInstance,
    glyph,
    axisValues,
    supportedAxes,
    showDetails,
    setAxisValues,
    colors,
    selectedAnatomy,
    detectedFeatures,
  } = useInspector();

  const viewportRef = useRef<HTMLDivElement>(null);
  const viewportSize = useViewportSize(viewportRef);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelRatio = useRef(1);
  const drawFrame = useRef<number | null>(null);
  const latestDraw = useRef<() => void>(() => {});

  const dragStartX = useRef(0);
  const dragStartAxis = useRef<AxisValues>(axisValues);

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
      const viewport = glyphViewport(w, h, fontInstance, glyph);
      if (!viewport) return;
      const { scale, baseline, xOffset } = viewport;

      const metrics = {
        Baseline: baseline,
        'Cap height': baseline - fontInstance.capHeight * scale,
        'X-height': baseline - fontInstance.xHeight * scale,
        Ascender: baseline - fontInstance.ascent * scale,
        Descender: baseline - fontInstance.descent * scale,
      };

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
        colors,
        axisValues,
        supportedAxes
      );

      const selectedFeatures = Array.from(selectedAnatomy.values());
      selectedFeatures.forEach((feature) => {
        if (feature.disabled || !(feature.label in metrics)) return;
        drawMetricLine(
          ctx,
          w,
          metrics[feature.label as keyof typeof metrics],
          feature.label,
          feature.labelPosition,
          colors
        );
      });

      if (cursor.active && supportedAxes.wght)
        drawCursorLabel(ctx, cursor.x, cursor.y, axisValues.wght, colors);

      ctx.restore();

      ctx.save();
      ctx.translate(xOffset, baseline);

      // Check if we have detected features to display
      const hasActiveFeatures = showDetails && detectedFeatures.size > 0;

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
        // When features are detected, use a secondary background for the glyph
        // so the feature highlights stand out
        if (hasActiveFeatures) {
          ctx.fillStyle = colors.featureBackground;
        } else {
          ctx.fillStyle = colors.boundsFill;
        }
        ctx.fill('nonzero');
        ctx.strokeStyle = colors.boundsStroke;
        ctx.lineWidth = 1;
        ctx.stroke();
        drawPathDetails(ctx, glyph, scale, colors);
      } else {
        ctx.fillStyle = colors.pathFill;
        ctx.fill('nonzero');
      }

      if (!showDetails)
        drawAnatomyOverlay(
          ctx,
          w,
          h,
          glyph,
          scale,
          colors,
          metrics,
          selectedAnatomy,
          detectedFeatures
        );

      // Draw detected feature instances from the new unified detection system
      if (hasActiveFeatures) {
        const transformParams: TransformParams = {
          scale,
          xOffset: 0, // Already translated to xOffset
          baseline: 0, // Already translated to baseline
        };

        // Convert Map<FeatureID, FeatureInstance[]> to Map<string, FeatureInstance[]>
        const instancesMap = new Map<
          string,
          typeof detectedFeatures extends Map<unknown, infer V> ? V : never
        >();
        for (const [featureId, instances] of detectedFeatures) {
          instancesMap.set(featureId, instances);
        }

        // Use clipped glyph geometry for precise feature highlighting
        const drawOptions: DrawFeatureOptions = {
          glyph,
          useClipping: true,
        };

        drawFeatureInstances(
          ctx,
          instancesMap,
          transformParams,
          colors,
          drawOptions
        );
      }

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
      detectedFeatures,
      supportedAxes,
    ]
  );

  /*** Scheduler ***/

  /*** Main draw ***/
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const w = canvas.width / pixelRatio.current;
    const h = canvas.height / pixelRatio.current;

    ctx.resetTransform();
    ctx.scale(pixelRatio.current, pixelRatio.current);
    ctx.clearRect(0, 0, w, h);

    // Draw secondary background when features are detected
    if (showDetails && detectedFeatures.size > 0 && colors.glyphBackground) {
      ctx.fillStyle = colors.glyphBackground;
      ctx.fillRect(0, 0, w, h);
    }

    if (fontInstance && glyph) {
      drawGlyph(ctx, w, h);
    }
  }, [
    glyph,
    fontInstance,
    drawGlyph,
    showDetails,
    detectedFeatures,
    colors.glyphBackground,
  ]);

  useLayoutEffect(() => {
    latestDraw.current = draw;
  }, [draw]);
  const scheduleDraw = useCallback(() => {
    if (drawFrame.current === null) {
      drawFrame.current = requestAnimationFrame(() => {
        drawFrame.current = null;
        latestDraw.current();
      });
    }
  }, []);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    pixelRatio.current = viewportSize.pixelRatio;
    canvas.width = Math.round(viewportSize.width * viewportSize.pixelRatio);
    canvas.height = Math.round(viewportSize.height * viewportSize.pixelRatio);
    scheduleDraw();
  }, [viewportSize, scheduleDraw]);
  useEffect(() => {
    scheduleDraw();
  }, [draw, scheduleDraw]);
  useEffect(
    () => () => {
      if (drawFrame.current !== null) cancelAnimationFrame(drawFrame.current);
      drawFrame.current = null;
    },
    []
  );

  /*** Pointer Events ***/

  const onDown = useCallback(
    (ev: PointerEvent) => {
      if (!supportedAxes.wght) return;
      const c = canvasRef.current!;
      c.setPointerCapture(ev.pointerId);
      setCursor((s) => ({ ...s, dragging: true }));
      dragStartX.current = ev.offsetX;
      dragStartAxis.current = axisValues;
      scheduleDraw();
    },
    [axisValues, scheduleDraw, supportedAxes]
  );

  const onMove = useCallback(
    (ev: PointerEvent) => {
      setCursor((s) => ({ ...s, x: ev.offsetX, y: ev.offsetY }));

      const weightAxis = supportedAxes.wght;
      if (cursor.dragging && weightAxis) {
        const wPx = canvasRef.current!.width / pixelRatio.current / 2;
        if (wPx <= 0) return;
        const dx = (ev.offsetX - dragStartX.current) / wPx;
        let newW =
          dragStartAxis.current.wght + dx * (weightAxis.max - weightAxis.min);
        if (ev.shiftKey) newW = Math.round(newW / 100) * 100;
        newW = Math.max(weightAxis.min, Math.min(weightAxis.max, newW));

        setAxisValues({ wght: newW });
      }

      scheduleDraw();
    },
    [cursor.dragging, scheduleDraw, setAxisValues, supportedAxes]
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
    <div ref={viewportRef} style={{ width: '100%', height: '50vh' }}>
      <canvas
        className="canvas"
        ref={canvasRef}
        data-testid="symbol-canvas"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
};

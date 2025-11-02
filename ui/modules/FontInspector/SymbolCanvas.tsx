/**
 * @deprecated This canvas-based implementation has been replaced by SymbolCanvasSVG.
 * The SVG version provides better performance, accessibility, and maintainability.
 * This file is kept temporarily for reference but should not be used in new code.
 *
 * Migration: Import SymbolCanvasSVG instead:
 *   import { SymbolCanvasSVG as SymbolCanvas } from './SymbolCanvasSVG';
 */

import {
  drawAnatomyOverlay,
  drawAxisValues,
  drawCursorLabel,
  drawGlyphBounds,
  drawMetricLine,
  drawPathDetails,
} from '@/utils/geometry/drawing';
import type { DetectionResult } from '@/utils/typeAnatomy/detector';
import { detectFeatures } from '@/utils/typeAnatomy/detector';
import type { Metrics } from '@/utils/typeAnatomy/index';
import type { Glyph } from 'fontkit';
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import type { FeatureZone } from './FeatureCoachmark';
import { FeatureCoachmark } from './FeatureCoachmark';
import { AxisValues, useInspector } from './FontInspector';
import styles from './FontInspector.module.scss';

// Helper to create feature zones from detection results
function createFeatureZones(
  detectionResults: Map<string, DetectionResult>,
  glyph: Glyph,
  scale: number,
  xOffset: number,
  baseline: number,
  metrics: Metrics,
  anatomyFeatures: Array<{ feature: string; label: string }>
): FeatureZone[] {
  const zones: FeatureZone[] = [];

  for (const [featureName, result] of detectionResults.entries()) {
    if (!result.found) continue;

    const featureConfig = anatomyFeatures.find(
      (f) => f.feature === featureName
    );
    if (!featureConfig) continue;

    // Try to get location from detection result
    let x = 0;
    let y = 0;
    let width = 40;
    let height = 40;

    if (result.location) {
      x = result.location.x;
      y = result.location.y;
      width = 30;
      height = 30;
    } else if (result.shape) {
      // For shape-based features, use bounding box
      if (result.shape.type === 'circle') {
        x = result.shape.cx;
        y = result.shape.cy;
        width = result.shape.r * 2;
        height = result.shape.r * 2;
      } else if (result.shape.type === 'polyline') {
        // Use bounding box of polyline points
        const points = result.shape.points;
        if (points.length > 0) {
          const xs = points.map((p) => p.x);
          const ys = points.map((p) => p.y);
          const minX = Math.min(...xs);
          const maxX = Math.max(...xs);
          const minY = Math.min(...ys);
          const maxY = Math.max(...ys);
          x = (minX + maxX) / 2;
          y = (minY + maxY) / 2;
          width = maxX - minX || 40;
          height = maxY - minY || 40;
        }
      }
    } else {
      // Fallback: estimate location based on feature type
      const bbox = glyph.bbox;
      if (featureName.includes('Apex') || featureName.includes('top')) {
        x = (bbox.minX + bbox.maxX) / 2;
        y = bbox.maxY;
      } else if (featureName.includes('Foot') || featureName.includes('base')) {
        x = (bbox.minX + bbox.maxX) / 2;
        y = bbox.minY;
      } else {
        x = (bbox.minX + bbox.maxX) / 2;
        y = (bbox.minY + bbox.maxY) / 2;
      }
    }

    zones.push({
      featureName,
      label: featureConfig.label,
      x,
      y,
      width,
      height,
      description: `The ${featureName.toLowerCase()} is a typographic feature of this glyph.`,
    });
  }

  return zones;
}

export const SymbolCanvas: React.FC = () => {
  const {
    fontInstance,
    glyph,
    axisValues,
    showDetails,
    setAxisValues,
    colors,
    selectedAnatomy,
    autoDetectFeatures,
    anatomyFeatures,
    detectedFeatures,
  } = useInspector();

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelRatio = useRef(1);
  const drawScheduled = useRef(false);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const [featureZones, setFeatureZones] = useState<FeatureZone[]>([]);
  const [lastDetectionKey, setLastDetectionKey] = useState<string>('');

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

  // Store canvas metrics for coachmark positioning
  const canvasMetricsRef = useRef<{
    scale: number;
    xOffset: number;
    baseline: number;
  }>({ scale: 1, xOffset: 0, baseline: 0 });

  // Detect features and create zones (only once per glyph change)
  useEffect(() => {
    if (!fontInstance || !glyph || detectedFeatures.size === 0) {
      setFeatureZones([]);
      return;
    }

    const detectionKey = `${glyph.id}-${fontInstance.familyName}`;
    if (detectionKey === lastDetectionKey) return;

    setLastDetectionKey(detectionKey);

    // Detect all features once
    const fontMetrics: Metrics = {
      baseline: 0,
      xHeight: fontInstance.xHeight || 0,
      capHeight: fontInstance.capHeight || 0,
      ascent: fontInstance.ascent || 0,
      descent: fontInstance.descent || 0,
    };

    const allFeatureNames = Array.from(detectedFeatures);
    const detectionResults = detectFeatures(
      allFeatureNames,
      glyph,
      fontMetrics,
      fontInstance
    );

    // Create zones - will be positioned when canvas is drawn
    const zones = createFeatureZones(
      detectionResults,
      glyph,
      canvasMetricsRef.current.scale,
      canvasMetricsRef.current.xOffset,
      canvasMetricsRef.current.baseline,
      fontMetrics,
      anatomyFeatures
    );

    setFeatureZones(zones);
  }, [
    glyph,
    fontInstance,
    detectedFeatures,
    anatomyFeatures,
    lastDetectionKey,
  ]);

  // Update canvas rect for positioning
  useEffect(() => {
    const updateRect = () => {
      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect());
      }
    };
    updateRect();
    window.addEventListener('resize', updateRect);
    window.addEventListener('scroll', updateRect, true);
    return () => {
      window.removeEventListener('resize', updateRect);
      window.removeEventListener('scroll', updateRect, true);
    };
  }, [glyph, fontInstance]);
  const drawGlyph = useCallback(
    (ctx: CanvasRenderingContext2D, w: number, h: number) => {
      if (!fontInstance || !glyph || !glyph.path) {
        return;
      }

      // Auto-detect features when drawing (font-aware detection)
      if (typeof autoDetectFeatures === 'function') {
        autoDetectFeatures();
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

      // Store metrics for coachmark positioning
      const xOffset = Math.round((w - glyph.advanceWidth * scale) / 2);
      canvasMetricsRef.current = { scale, xOffset, baseline };

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

      ctx.restore();

      // Draw anatomy overlay AFTER restoring context so it works in untransformed canvas space
      drawAnatomyOverlay(
        ctx,
        w,
        h,
        glyph,
        scale,
        colors,
        metrics,
        selectedAnatomy,
        fontInstance,
        showDetails
      );
    },

    [
      fontInstance,
      glyph,
      colors,
      axisValues,
      cursor,
      selectedAnatomy,
      showDetails,
      autoDetectFeatures,
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
      console.warn('No font or glyph', {
        hasFontInstance: !!fontInstance,
        hasGlyph: !!glyph,
        fontInstance: fontInstance ? { name: fontInstance.familyName } : null,
        glyph: glyph ? { name: glyph.name, id: glyph.id } : null,
      });
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
    <div style={{ position: 'relative', width: '100%', height: '50vh' }}>
      <canvas
        className={styles.canvas}
        ref={canvasRef}
        style={{ width: '100%', height: '100%' }}
      />
      {canvasRect && featureZones.length > 0 && (
        <FeatureCoachmark
          zones={featureZones}
          canvasRect={canvasRect}
          canvasScale={canvasMetricsRef.current.scale}
          xOffset={canvasMetricsRef.current.xOffset}
          baseline={canvasMetricsRef.current.baseline}
        />
      )}
    </div>
  );
};

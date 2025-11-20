/**
 * SVG-based SymbolCanvas component with full feature set.
 *
 * Implements:
 * - Proper layer structure with z-ordering
 * - Single matrix transform for accuracy
 * - Non-scaling strokes for metrics/handles
 * - Fill rules for correct rendering
 * - Accessibility (ARIA labels, keyboard navigation)
 * - Performance optimizations (conditional mounting, <use> elements)
 */

'use client';

import { dFor } from '@/utils/geometry/geometryCore';
import { getFeatureClipBoundary } from '@/utils/geometry/pathClipping';
import {
  safePathOperation,
  validatePathCommands,
} from '@/utils/geometry/pathValidation';
import { SVGDefs } from '@/utils/geometry/svgDefs';
import { featureHighlightToPath } from '@/utils/geometry/svgPathBuilder';
import { createViewportTransform } from '@/utils/geometry/transforms';
import type { FeatureShape, Metrics } from '@/utils/typeAnatomy';
import { detectFeature } from '@/utils/typeAnatomy/detector';
import { extractFeatureSegments } from '@/utils/typeAnatomy/featureHighlight';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import type { FeatureZone } from './FeatureCoachmark';
import { FeatureCoachmark } from './FeatureCoachmark';
import type { AxisValues } from './FontInspector';
import { useInspector } from './FontInspector';
import styles from './FontInspector.module.scss';
import { SVGGlyphBounds } from './SVGGlyphBounds';
import { SVGPathDetails } from './SVGPathDetails';

interface SVGCanvasMetrics {
  scale: number;
  xOffset: number;
  baseline: number;
  width: number;
  height: number;
}

export const SymbolCanvasSVG: React.FC = () => {
  const {
    fontInstance,
    glyph,
    axisValues,
    showDetails,
    setAxisValues,
    setShowDetails,
    colors,
    selectedAnatomy,
    autoDetectFeatures,
  } = useInspector();

  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [metrics, setMetrics] = useState<SVGCanvasMetrics>({
    scale: 1,
    xOffset: 0,
    baseline: 0,
    width: 0,
    height: 0,
  });
  const [featureZones, setFeatureZones] = useState<FeatureZone[]>([]);
  const [svgRect, setSvgRect] = useState<DOMRect | null>(null);
  const [cursor, setCursor] = useState<{
    x: number;
    y: number;
    active: boolean;
  }>({ x: 0, y: 0, active: false });
  const [showDebug, setShowDebug] = useState(false);
  const [pathErrors, setPathErrors] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const canvasTopPadding = 128;
  const canvasBottomPadding = 64;
  const canvasHorizontalPadding = 128;

  // Calculate metrics when font/glyph changes
  useEffect(() => {
    if (!fontInstance || !glyph || !containerRef.current) return;

    const container = containerRef.current;

    // Ensure container has dimensions before calculating
    if (container.clientWidth === 0 || container.clientHeight === 0) {
      // Wait for next frame if container hasn't sized yet
      requestAnimationFrame(() => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) return;
        calculateMetrics();
      });
      return;
    }

    calculateMetrics();

    function calculateMetrics() {
      if (!containerRef.current || !fontInstance || !glyph) return;

      const container = containerRef.current;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;

      const glyphBoundsW = containerWidth - canvasHorizontalPadding * 2;
      const glyphBoundsH =
        containerHeight - canvasTopPadding - canvasBottomPadding;

      const units = fontInstance.unitsPerEm;
      const fontHeight = fontInstance.ascent - fontInstance.descent || units;
      const scale = Math.min(
        glyphBoundsW / (glyph.advanceWidth * 1.1 || units * 0.6),
        glyphBoundsH / fontHeight
      );

      const baseline =
        containerHeight -
        (Math.abs(fontInstance.descent) * scale + canvasBottomPadding);
      const xOffset = Math.round(
        (containerWidth - glyph.advanceWidth * scale) / 2
      );

      setMetrics({
        scale,
        xOffset,
        baseline,
        width: containerWidth,
        height: containerHeight,
      });

      // Update SVG rect for coachmark positioning
      if (svgRef.current) {
        setSvgRect(svgRef.current.getBoundingClientRect());
      }
    }
  }, [fontInstance, glyph]);

  // Update SVG rect on resize/scroll
  useEffect(() => {
    const updateRect = () => {
      if (svgRef.current) {
        setSvgRect(svgRef.current.getBoundingClientRect());
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

  // Auto-detect features (if enabled)
  // Note: autoDetectFeatures is a boolean flag, not a function
  // Feature detection is handled elsewhere in the component

  // Create viewport transform
  const viewportTransform = useMemo(() => {
    if (!metrics.scale) return null;
    return createViewportTransform(
      metrics.scale,
      metrics.xOffset,
      metrics.baseline
    );
  }, [metrics.scale, metrics.xOffset, metrics.baseline]);

  // Calculate canvas metrics for drawing
  const canvasMetrics = useMemo(() => {
    if (!fontInstance) return null;
    return {
      Baseline: metrics.baseline,
      'Cap height': metrics.baseline - fontInstance.capHeight * metrics.scale,
      'X-height': metrics.baseline - fontInstance.xHeight * metrics.scale,
      Ascender: metrics.baseline - fontInstance.ascent * metrics.scale,
      Descender: metrics.baseline - fontInstance.descent * metrics.scale,
    };
  }, [fontInstance, metrics]);

  // Font metrics for feature detection
  const fontMetrics: Metrics | null = useMemo(() => {
    if (!fontInstance) return null;
    return {
      baseline: 0,
      xHeight: fontInstance.xHeight || 0,
      capHeight: fontInstance.capHeight || 0,
      ascent: fontInstance.ascent || 0,
      descent: fontInstance.descent || 0,
    };
  }, [fontInstance]);

  // Glyph path data (use original SVG path, not converted commands)
  const glyphPathData = useMemo(() => {
    if (!glyph?.path) return null;

    return safePathOperation(() => {
      const svgPath = dFor(glyph);
      if (!svgPath || svgPath === 'M0 0') return null;

      // Validate path commands if available
      if (glyph.path?.commands) {
        const validation = validatePathCommands(glyph.path.commands);
        if (!validation.isValid) {
          console.warn(
            `[SymbolCanvasSVG] Path validation errors for glyph ${glyph.name}:`,
            validation.errors
          );
          if (validation.warnings.length > 0) {
            console.warn('Warnings:', validation.warnings);
          }
          // Store errors for UI display
          setPathErrors(validation.errors);
        } else {
          setPathErrors([]);
        }
      }

      return svgPath;
    }, glyph.id || glyph.name);
  }, [glyph]);

  // Generate SVG elements for each selected feature
  const featureElements = useMemo(() => {
    if (
      !glyph ||
      !fontMetrics ||
      !fontInstance ||
      !canvasMetrics ||
      !viewportTransform
    )
      return [];

    const metricFeatures = new Set([
      'Baseline',
      'Cap height',
      'X-height',
      'Ascender',
      'Descender',
    ]);

    const elements: React.ReactElement[] = [];
    const zones: FeatureZone[] = [];

    for (const [featureName, feature] of selectedAnatomy.entries()) {
      if (!feature.selected || feature.disabled) continue;

      try {
        const result = detectFeature(
          featureName,
          glyph,
          fontMetrics,
          fontInstance
        );

        // Metric lines (Baseline, Cap height, etc.)
        if (metricFeatures.has(featureName)) {
          const y = canvasMetrics[featureName as keyof typeof canvasMetrics];
          if (y !== undefined) {
            elements.push(
              <g
                key={`metric-${featureName}`}
                id={`metric-${featureName}`}
                className={styles.metricLine}
                aria-label={feature.label}
                aria-hidden={!feature.selected}
                vectorEffect="non-scaling-stroke"
                shapeRendering="crispEdges"
              >
                <line
                  x1={0}
                  y1={y}
                  x2={metrics.width}
                  y2={y}
                  stroke={colors.metricStroke}
                  strokeWidth={1}
                />
                <text
                  x={16}
                  y={feature.labelPosition === 'top' ? y - 5 : y + 15}
                  fill={colors.metricFill}
                  fontSize={12}
                  fontFamily="sans-serif"
                >
                  {feature.label}
                </text>
              </g>
            );
          }
          continue;
        }

        // Anatomy feature highlights
        if (showDetails) {
          // Try masked geometry highlight first (clipped glyph path)
          const clipBoundary = getFeatureClipBoundary(
            featureName,
            glyph,
            fontMetrics
          );

          if (clipBoundary && glyphPathData && clipBoundary.y !== undefined) {
            const clipPathId = `clip-${featureName.replace(/\s+/g, '-')}`;
            const clipY = metrics.baseline - clipBoundary.y * metrics.scale;

            elements.push(
              <defs key={`defs-${featureName}`}>
                <clipPath id={clipPathId}>
                  <rect
                    x="-1000"
                    y={clipBoundary.keepAbove ? -1000 : clipY}
                    width="2000"
                    height={clipBoundary.keepAbove ? clipY + 1000 : 1000}
                  />
                </clipPath>
              </defs>
            );

            elements.push(
              <path
                key={`highlight-${featureName}`}
                d={glyphPathData}
                transform={viewportTransform.toSVGTransform()}
                fill={colors.highlightBackground}
                clipPath={`url(#${clipPathId})`}
                opacity={1.0}
                aria-label={`${feature.label} highlight`}
                aria-hidden={!feature.selected}
              />
            );
          } else {
            // Fallback to segment-based highlighting
            const highlight = extractFeatureSegments(
              featureName,
              glyph,
              fontMetrics,
              fontInstance
            );

            if (highlight && highlight.segments.length > 0) {
              // featureHighlightToPath outputs in font coordinates (no scale/Y inversion)
              // The transform handles all coordinate conversion
              const pathData = featureHighlightToPath(highlight, 1); // Scale of 1 = font coords
              if (pathData) {
                elements.push(
                  <path
                    key={`highlight-${featureName}`}
                    d={pathData}
                    transform={viewportTransform.toSVGTransform()}
                    fill="none"
                    stroke={colors.highlightBackground}
                    strokeWidth={6 * metrics.scale}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    opacity={0.4}
                    aria-label={`${feature.label} highlight`}
                    aria-hidden={!feature.selected}
                  />
                );
              }
            }
          }

          // Draw shape-based features
          if (result.shape) {
            elements.push(
              <FeatureShape
                key={`shape-${featureName}`}
                shape={result.shape}
                scale={metrics.scale}
                colors={colors}
              />
            );
          }
        } else {
          // Simple markers when not showing details
          if (result.location) {
            const screenPos = viewportTransform.toScreen({
              x: result.location.x,
              y: result.location.y,
            });
            elements.push(
              <circle
                key={`marker-${featureName}`}
                cx={screenPos.x}
                cy={screenPos.y}
                r={4}
                fill={colors.anchorFill}
                stroke={colors.anchorStroke}
                strokeWidth={1}
                aria-label={feature.label}
                aria-hidden={!feature.selected}
              />
            );

            zones.push({
              featureName,
              label: feature.label,
              x: result.location.x,
              y: result.location.y,
              width: 30,
              height: 30,
              description: `The ${featureName.toLowerCase()} is a typographic feature of this glyph.`,
            });
          }
        }
      } catch (error) {
        console.warn(
          `[SymbolCanvasSVG] Error rendering ${featureName}:`,
          error
        );
      }
    }

    setFeatureZones(zones);
    return elements;
  }, [
    glyph,
    fontMetrics,
    fontInstance,
    selectedAnatomy,
    showDetails,
    colors,
    metrics,
    canvasMetrics,
    glyphPathData,
    viewportTransform,
  ]);

  // Handle pointer events for axis dragging
  const dragStartX = useRef(0);
  const dragStartAxis = useRef<AxisValues>(axisValues);
  const [isDragging, setIsDragging] = useState(false);

  const handlePointerDown = useCallback(
    (ev: React.PointerEvent<SVGSVGElement>) => {
      ev.currentTarget.setPointerCapture(ev.pointerId);
      setIsDragging(true);
      dragStartX.current = ev.clientX;
      dragStartAxis.current = axisValues;
      setCursor({ x: ev.clientX, y: ev.clientY, active: true });
    },
    [axisValues]
  );

  const handlePointerMove = useCallback(
    (ev: React.PointerEvent<SVGSVGElement>) => {
      setCursor({ x: ev.clientX, y: ev.clientY, active: true });

      if (!isDragging) return;

      const containerWidth = metrics.width / 2;
      const dx = (ev.clientX - dragStartX.current) / containerWidth;
      let newW = dragStartAxis.current.wght + dx * 800;
      if (ev.shiftKey) newW = Math.round(newW / 100) * 100;
      newW = Math.max(100, Math.min(900, newW));

      setAxisValues({ wght: newW });
    },
    [isDragging, metrics.width, setAxisValues]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
    setCursor({ x: 0, y: 0, active: false });
  }, []);

  const handlePointerLeave = useCallback(() => {
    setCursor({ x: 0, y: 0, active: false });
  }, []);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (ev: React.KeyboardEvent<SVGSVGElement>) => {
      // Only handle shortcuts when SVG is focused
      if (ev.target !== ev.currentTarget && ev.target !== svgRef.current) {
        return;
      }

      // Prevent default for our shortcuts
      const isModifier = ev.ctrlKey || ev.metaKey || ev.altKey || ev.shiftKey;

      switch (ev.key) {
        case 'd':
        case 'D':
          if (!isModifier) {
            ev.preventDefault();
            setShowDetails(!showDetails);
          }
          break;

        case '?':
          if (!isModifier) {
            ev.preventDefault();
            // Show help - could display a tooltip or modal
            console.log(
              'Keyboard shortcuts:\n' +
                '  d - Toggle details view\n' +
                '  ? - Show this help\n' +
                '  Ctrl/Cmd + + - Zoom in\n' +
                '  Ctrl/Cmd + - - Zoom out\n' +
                '  Ctrl/Cmd + Arrow keys - Pan'
            );
          }
          break;

        case '`':
        case '~':
          if (!isModifier) {
            ev.preventDefault();
            setShowDebug((prev) => !prev);
          }
          break;

        case '+':
        case '=':
          if (ev.ctrlKey || ev.metaKey) {
            ev.preventDefault();
            // Zoom in (could be implemented with viewBox)
            // For now, just log
            console.log('Zoom in (not yet implemented)');
          }
          break;

        case '-':
        case '_':
          if (ev.ctrlKey || ev.metaKey) {
            ev.preventDefault();
            // Zoom out (could be implemented with viewBox)
            console.log('Zoom out (not yet implemented)');
          }
          break;

        case 'ArrowLeft':
        case 'ArrowRight':
        case 'ArrowUp':
        case 'ArrowDown':
          if (ev.ctrlKey || ev.metaKey) {
            ev.preventDefault();
            // Pan (could be implemented with viewBox)
            console.log('Pan (not yet implemented)');
          }
          break;
      }
    },
    [showDetails, setShowDetails]
  );

  // Export functions
  const handleCopySVG = useCallback(async () => {
    if (!svgRef.current) return;

    try {
      const svgClone = svgRef.current.cloneNode(true) as SVGSVGElement;
      // Remove interactive elements and debug overlays
      const debugLayer = svgClone.querySelector('#debug');
      if (debugLayer) debugLayer.remove();
      const errorLayer = svgClone.querySelector('#errors');
      if (errorLayer) errorLayer.remove();

      const serializer = new XMLSerializer();
      const svgString = serializer.serializeToString(svgClone);

      await navigator.clipboard.writeText(svgString);
      console.log('SVG copied to clipboard');
    } catch (error) {
      console.error('Failed to copy SVG:', error);
    }
  }, []);

  const handleExportPNG = useCallback(
    async (scale: 1 | 2 | 4 = 1) => {
      if (!svgRef.current || !containerRef.current) return;

      setExporting(true);
      try {
        const svg = svgRef.current;
        const svgClone = svg.cloneNode(true) as SVGSVGElement;

        // Remove interactive elements and debug overlays
        const debugLayer = svgClone.querySelector('#debug');
        if (debugLayer) debugLayer.remove();
        const errorLayer = svgClone.querySelector('#errors');
        if (errorLayer) errorLayer.remove();

        // Set explicit dimensions
        const originalWidth = svg.width.baseVal.value || metrics.width;
        const originalHeight = svg.height.baseVal.value || metrics.height;
        const exportWidth = originalWidth * scale;
        const exportHeight = originalHeight * scale;

        svgClone.setAttribute('width', exportWidth.toString());
        svgClone.setAttribute('height', exportHeight.toString());
        svgClone.setAttribute(
          'viewBox',
          `0 0 ${originalWidth} ${originalHeight}`
        );

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgClone);
        const svgBlob = new Blob([svgString], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);

        // Create canvas and render SVG
        const canvas = document.createElement('canvas');
        canvas.width = exportWidth;
        canvas.height = exportHeight;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Failed to get canvas context');
        }

        const img = new Image();
        await new Promise<void>((resolve, reject) => {
          img.onload = () => {
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, exportWidth, exportHeight);
            ctx.drawImage(img, 0, 0, exportWidth, exportHeight);
            URL.revokeObjectURL(svgUrl);
            resolve();
          };
          img.onerror = reject;
          img.src = svgUrl;
        });

        // Download PNG
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error('Failed to create PNG blob');
          }
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `glyph-${glyph?.name || 'unknown'}-${scale}x.png`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }, 'image/png');
      } catch (error) {
        console.error('Failed to export PNG:', error);
      } finally {
        setExporting(false);
      }
    },
    [svgRef, containerRef, metrics, glyph]
  );

  if (!fontInstance || !glyph || !viewportTransform) {
    return (
      <div
        ref={containerRef}
        style={{ position: 'relative', width: '100%', height: '50vh' }}
      >
        <svg
          ref={svgRef}
          className={styles.canvas}
          style={{ width: '100%', height: '100%' }}
          role="img"
          aria-label="Font inspector canvas"
        >
          {/* Debug info when loading */}
          {!fontInstance && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              fill="currentColor"
              fontSize={14}
            >
              Loading font...
            </text>
          )}
          {!glyph && fontInstance && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              fill="currentColor"
              fontSize={14}
            >
              No glyph selected
            </text>
          )}
          {!viewportTransform && glyph && fontInstance && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              fill="currentColor"
              fontSize={14}
            >
              Calculating metrics...
            </text>
          )}
        </svg>
      </div>
    );
  }

  // Generate glyph title and description for accessibility
  const glyphChar = glyph.codePoints?.[0]
    ? String.fromCodePoint(glyph.codePoints[0])
    : glyph.name;
  const glyphUnicode = glyph.codePoints?.[0]
    ? `U+${glyph.codePoints[0].toString(16).toUpperCase().padStart(4, '0')}`
    : '';

  return (
    <div
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height: '50vh' }}
    >
      <svg
        ref={svgRef}
        className={`${styles.canvas} ${styles.interactiveSvg}`}
        width={metrics.width}
        height={metrics.height}
        style={{ width: '100%', height: '100%' }}
        role="img"
        aria-labelledby="glyphTitle glyphDesc"
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onKeyDown={handleKeyDown}
      >
        {/* Accessibility labels */}
        <title id="glyphTitle">
          Glyph &quot;{glyphChar}&quot; {glyphUnicode}
        </title>
        <desc id="glyphDesc">
          Font inspector showing glyph {glyph.name} with baseline, cap height,
          and control points. Use keyboard to toggle features.
        </desc>

        {/* SVG Definitions */}
        <SVGDefs idPrefix="fi" />

        {/* Layer 1: Background (checker pattern) */}
        <g id="bg" aria-hidden="true">
          {/* Background is handled by SVGGlyphBounds */}
        </g>

        {/* Layer 2: Side bearings */}
        <g id="side-bearings" aria-hidden="true">
          {showDetails && (
            <SVGGlyphBounds
              glyph={glyph}
              transform={viewportTransform}
              containerWidth={metrics.width}
              containerHeight={metrics.height}
              colors={colors}
              idPrefix="fi"
            />
          )}
        </g>

        {/* Layer 3: Glyph contours */}
        <g
          id="glyph"
          fillRule="nonzero"
          aria-label="Glyph outline"
          aria-hidden={false}
        >
          {glyphPathData && (
            <path
              d={glyphPathData}
              transform={viewportTransform.toSVGTransform()}
              fill={showDetails ? colors.boundsFill : colors.pathFill}
              stroke={showDetails ? colors.boundsStroke : 'none'}
              strokeWidth={showDetails ? 1 / metrics.scale : 0}
            />
          )}
        </g>

        {/* Layer 4: Metrics */}
        <g
          id="metrics"
          vectorEffect="non-scaling-stroke"
          shapeRendering="crispEdges"
          aria-label="Font metrics"
        >
          {featureElements.filter((el) =>
            el.key?.toString().startsWith('metric-')
          )}
        </g>

        {/* Layer 5: Highlights */}
        <g
          id="highlights"
          aria-label="Feature highlights"
          aria-hidden={!showDetails}
        >
          {featureElements.filter(
            (el) =>
              el.key?.toString().startsWith('highlight-') ||
              el.key?.toString().startsWith('shape-')
          )}
        </g>

        {/* Layer 6: Details (anchors/handles) - conditionally mounted */}
        {showDetails && (
          <g
            id="details"
            aria-label="Path details"
            vectorEffect="non-scaling-stroke"
          >
            <SVGPathDetails
              glyph={glyph}
              transform={viewportTransform}
              colors={{
                anchorFill: colors.anchorFill,
                anchorStroke: colors.anchorStroke,
                handleFill: colors.handleFill,
                handleStroke: colors.handleStroke,
              }}
              idPrefix="fi"
              showPath={false}
            />
          </g>
        )}

        {/* Layer 7: Cursor/tooltip */}
        <g id="cursor" pointerEvents="none" aria-hidden="true">
          {/* Cursor label */}
          {cursor.active && isDragging && (
            <text
              x={cursor.x}
              y={cursor.y + 22}
              fill={colors.cursorFill}
              fontSize={12}
              fontFamily="sans-serif"
              textAnchor="middle"
            >
              Drag to adjust weight
            </text>
          )}
        </g>

        {/* Debug overlay */}
        {showDebug && (
          <g id="debug" aria-hidden="true">
            <rect
              x={8}
              y={60}
              width={300}
              height={200}
              fill="rgba(0, 0, 0, 0.8)"
              stroke="white"
              strokeWidth={1}
            />
            <text
              x={12}
              y={80}
              fill="white"
              fontSize={12}
              fontFamily="monospace"
            >
              <tspan x={12} dy={0}>
                Debug Info
              </tspan>
              <tspan x={12} dy={16}>
                Scale: {metrics.scale.toFixed(2)}
              </tspan>
              <tspan x={12} dy={16}>
                X Offset: {metrics.xOffset.toFixed(1)}
              </tspan>
              <tspan x={12} dy={16}>
                Baseline: {metrics.baseline.toFixed(1)}
              </tspan>
              <tspan x={12} dy={16}>
                Transform: matrix({viewportTransform.scale.toFixed(3)}, 0, 0,{' '}
                {-viewportTransform.scale.toFixed(3)},{' '}
                {viewportTransform.x.toFixed(1)},{' '}
                {viewportTransform.y.toFixed(1)})
              </tspan>
              <tspan x={12} dy={16}>
                Glyph: {glyph.name}
              </tspan>
              <tspan x={12} dy={16}>
                Commands: {glyph.path?.commands?.length || 0}
              </tspan>
            </text>
          </g>
        )}

        {/* Error display */}
        {pathErrors.length > 0 && (
          <g id="errors" aria-label="Path validation errors">
            <rect
              x={8}
              y={metrics.height - 100}
              width={400}
              height={Math.min(pathErrors.length * 20 + 40, 200)}
              fill="rgba(200, 0, 0, 0.9)"
              stroke="red"
              strokeWidth={2}
              rx={4}
            />
            <text
              x={12}
              y={metrics.height - 80}
              fill="white"
              fontSize={11}
              fontFamily="sans-serif"
              fontWeight="bold"
            >
              Path Validation Errors:
            </text>
            {pathErrors.slice(0, 8).map((error, idx) => (
              <text
                key={idx}
                x={12}
                y={metrics.height - 60 + idx * 16}
                fill="white"
                fontSize={10}
                fontFamily="monospace"
              >
                {error}
              </text>
            ))}
          </g>
        )}

        {/* Axis values text */}
        <text
          x={8}
          y={32}
          fill={colors.labelFill}
          fontSize={14}
          fontFamily="sans-serif"
          aria-label="Axis values"
        >
          Weight {axisValues.wght.toFixed(2)} | Optical size{' '}
          {axisValues.opsz.toFixed(2)}
        </text>
      </svg>

      {/* Export controls */}
      <div className={styles.exportControls}>
        <button
          type="button"
          onClick={handleCopySVG}
          className={styles.exportButton}
          aria-label="Copy SVG to clipboard"
          title="Copy SVG to clipboard"
        >
          Copy SVG
        </button>
        <button
          type="button"
          onClick={() => handleExportPNG(1)}
          className={styles.exportButton}
          disabled={exporting}
          aria-label="Export PNG at 1x scale"
          title="Export PNG at 1x scale"
        >
          Export PNG 1x
        </button>
        <button
          type="button"
          onClick={() => handleExportPNG(2)}
          className={styles.exportButton}
          disabled={exporting}
          aria-label="Export PNG at 2x scale"
          title="Export PNG at 2x scale"
        >
          Export PNG 2x
        </button>
        <button
          type="button"
          onClick={() => handleExportPNG(4)}
          className={styles.exportButton}
          disabled={exporting}
          aria-label="Export PNG at 4x scale"
          title="Export PNG at 4x scale"
        >
          Export PNG 4x
        </button>
      </div>

      {/* Feature coachmarks overlay */}
      {svgRect && featureZones.length > 0 && (
        <FeatureCoachmark
          zones={featureZones}
          canvasRect={svgRect}
          canvasScale={metrics.scale}
          xOffset={metrics.xOffset}
          baseline={metrics.baseline}
        />
      )}
    </div>
  );
};

/**
 * Renders a feature shape (circle, polyline, or path) as SVG elements.
 */
function FeatureShape({
  shape,
  scale,
  colors,
}: {
  shape: FeatureShape;
  scale: number;
  colors: { anchorFill: string; anchorStroke: string };
}) {
  switch (shape.type) {
    case 'circle':
      return (
        <circle
          cx={shape.cx * scale}
          cy={-shape.cy * scale}
          r={shape.r * scale}
          fill={colors.anchorFill}
          fillOpacity={0.2}
          stroke={colors.anchorStroke}
          strokeWidth={2}
        />
      );

    case 'polyline':
      if (!shape.points || shape.points.length === 0) return null;
      const points = shape.points
        .map((p) => `${p.x * scale},${-p.y * scale}`)
        .join(' ');
      return (
        <polyline
          points={points}
          fill={colors.anchorFill}
          fillOpacity={0.2}
          stroke={colors.anchorStroke}
          strokeWidth={2}
        />
      );

    case 'path':
      return (
        <path
          d={shape.d}
          fill={colors.anchorFill}
          fillOpacity={0.2}
          stroke={colors.anchorStroke}
          strokeWidth={2}
        />
      );

    default:
      return null;
  }
}

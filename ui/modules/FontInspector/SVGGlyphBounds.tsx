/**
 * SVG glyph bounds component for rendering side bearings, LSB/RSB markers, and background patterns.
 *
 * Handles:
 * - Negative LSB/RSB (inverted rectangles)
 * - Checkered pattern background using SVG pattern
 * - LSB/RSB markers with labels
 * - Labels outside viewport (overflow="visible")
 */

'use client';

import { getSVGDefIds } from '@/utils/geometry/svgDefs';
import type { ViewportTransform } from '@/utils/geometry/transforms';
import type { Glyph } from 'fontkit';
import { useMemo } from 'react';

export interface GlyphBoundsData {
  /** Left side bearing in font units (can be negative) */
  lsb: number;
  /** Right side bearing in font units (can be negative) */
  rsb: number;
  /** Advance width in font units */
  advanceWidth: number;
  /** Bounding box min X in font units */
  bboxMinX: number;
  /** Bounding box max X in font units */
  bboxMaxX: number;
}

/**
 * Calculates glyph bounds data from a glyph.
 */
export function calculateGlyphBounds(glyph: Glyph): GlyphBoundsData {
  const advanceWidth = glyph.advanceWidth;
  const lsb = glyph.bbox.minX;
  const bboxWidth = glyph.bbox.maxX - glyph.bbox.minX;
  const rsb = advanceWidth - bboxWidth - lsb;

  return {
    lsb,
    rsb,
    advanceWidth,
    bboxMinX: glyph.bbox.minX,
    bboxMaxX: glyph.bbox.maxX,
  };
}

export interface SVGGlyphBoundsProps {
  /** Glyph to calculate bounds for */
  glyph: Glyph;
  /** Viewport transform for coordinate conversion */
  transform: ViewportTransform;
  /** Container dimensions */
  containerWidth: number;
  /** Container height */
  containerHeight: number;
  /** Colors for rendering */
  colors: {
    checkerFill: string;
    checkerStroke: string;
    boundsStroke: string;
    boundsFill: string;
    lsbStroke: string;
    lsbFill: string;
    rsbStroke: string;
    rsbFill: string;
    labelFill: string;
  };
  /** ID prefix for pattern references */
  idPrefix?: string;
}

/**
 * Renders glyph bounds (side bearings, LSB/RSB markers, checkered background) as SVG elements.
 */
export function SVGGlyphBounds({
  glyph,
  transform,
  containerWidth,
  containerHeight: _containerHeight,
  colors,
  idPrefix = 'fi',
}: SVGGlyphBoundsProps) {
  const bounds = useMemo(() => calculateGlyphBounds(glyph), [glyph]);
  const defIds = getSVGDefIds(idPrefix);

  const { lsb, rsb, advanceWidth: _advanceWidth, bboxMinX, bboxMaxX } = bounds;

  // Calculate screen coordinates using transform
  const bboxMinScreen = transform.toScreen({ x: bboxMinX, y: 0 });
  const bboxMaxScreen = transform.toScreen({ x: bboxMaxX, y: 0 });

  // Calculate LSB/RSB positions in screen coordinates
  const lsbXScreen = bboxMinScreen.x - lsb * transform.scale;
  const rsbXScreen = bboxMaxScreen.x + rsb * transform.scale;

  // Calculate ascent/descent Y positions
  const ascY = transform.toScreen({ x: 0, y: 800 }).y; // Typical ascent
  const descY = transform.toScreen({ x: 0, y: -200 }).y; // Typical descent

  // Calculate marker positions (below descender)
  const markerY1 = descY + 4;
  const markerY2 = descY + 12;
  const labelY = descY + 28;

  return (
    <g id="glyph-bounds" overflow="visible">
      {/* Checkered background - left margin */}
      <rect
        x={0}
        y={ascY}
        width={bboxMinScreen.x}
        height={descY - ascY}
        fill={`url(#${defIds.checker})`}
      />

      {/* Checkered background - right margin */}
      <rect
        x={bboxMaxScreen.x}
        y={ascY}
        width={containerWidth - bboxMaxScreen.x}
        height={descY - ascY}
        fill={`url(#${defIds.checker})`}
      />

      {/* LSB fill (handle negative LSB) */}
      {lsb !== 0 && (
        <rect
          x={lsb > 0 ? lsbXScreen - lsb * transform.scale : lsbXScreen}
          y={ascY}
          width={Math.abs(lsb) * transform.scale}
          height={descY - ascY}
          fill={colors.lsbFill}
          fillOpacity={0.3}
        />
      )}

      {/* RSB fill (handle negative RSB) */}
      {rsb !== 0 && (
        <rect
          x={rsb > 0 ? rsbXScreen : rsbXScreen + rsb * transform.scale}
          y={ascY}
          width={Math.abs(rsb) * transform.scale}
          height={descY - ascY}
          fill={colors.rsbFill}
          fillOpacity={0.3}
        />
      )}

      {/* LSB markers */}
      <g id="lsb-markers">
        {/* Left edge marker */}
        <line
          x1={bboxMinScreen.x}
          y1={markerY1}
          x2={bboxMinScreen.x}
          y2={markerY2}
          stroke={colors.lsbStroke}
          strokeWidth={1}
        />
        {/* LSB position marker */}
        <line
          x1={lsbXScreen}
          y1={markerY1}
          x2={lsbXScreen}
          y2={markerY2}
          stroke={colors.lsbStroke}
          strokeWidth={1}
        />
        {/* LSB label */}
        <text
          x={bboxMinScreen.x + (lsb * transform.scale) / 2}
          y={labelY}
          fill={colors.labelFill}
          fontSize={12}
          fontFamily="sans-serif"
          textAnchor="middle"
          overflow="visible"
        >
          Left Side Bearing {lsb.toFixed(2)}
        </text>
      </g>

      {/* RSB markers */}
      <g id="rsb-markers">
        {/* Right edge marker */}
        <line
          x1={bboxMaxScreen.x}
          y1={markerY1}
          x2={bboxMaxScreen.x}
          y2={markerY2}
          stroke={colors.rsbStroke}
          strokeWidth={1}
        />
        {/* RSB position marker */}
        <line
          x1={rsbXScreen}
          y1={markerY1}
          x2={rsbXScreen}
          y2={markerY2}
          stroke={colors.rsbStroke}
          strokeWidth={1}
        />
        {/* RSB label */}
        <text
          x={rsbXScreen + (rsb * transform.scale) / 2}
          y={labelY}
          fill={colors.labelFill}
          fontSize={12}
          fontFamily="sans-serif"
          textAnchor="middle"
          overflow="visible"
        >
          Right Side Bearing {rsb.toFixed(2)}
        </text>
      </g>
    </g>
  );
}

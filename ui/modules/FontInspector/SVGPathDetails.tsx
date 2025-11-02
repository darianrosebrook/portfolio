/**
 * SVG path details component for rendering anchors, handles, and control lines.
 *
 * Parses glyph path commands to extract:
 * - Anchors (from moveTo, lineTo, curve endpoints)
 * - Handles (from quadraticCurveTo, bezierCurveTo control points)
 *
 * Uses `<use>` elements referencing symbols from `<defs>` to reduce DOM nodes.
 * Adds invisible fat strokes for hit-testing tiny markers.
 */

'use client';

import { getSVGDefIds } from '@/utils/geometry/svgDefs';
import type { ViewportTransform } from '@/utils/geometry/transforms';
import type { Glyph } from 'fontkit';
import { useMemo } from 'react';

export interface Anchor {
  /** X coordinate in font units */
  x: number;
  /** Y coordinate in font units */
  y: number;
  /** True if this is a subpath start point */
  isStart: boolean;
  /** Original command index (for debugging) */
  commandIndex: number;
}

export interface Handle {
  /** X coordinate in font units */
  x: number;
  /** Y coordinate in font units */
  y: number;
  /** Anchor point this handle connects to */
  anchorX: number;
  /** Anchor point this handle connects to */
  anchorY: number;
  /** Original command index (for debugging) */
  commandIndex: number;
}

export interface PathDetailsData {
  anchors: Anchor[];
  handles: Handle[];
}

/**
 * Parses glyph path commands to extract anchors and handles.
 * Preserves original command indices for debugging.
 */
export function parsePathDetails(glyph: Glyph): PathDetailsData | null {
  if (!glyph?.path?.commands) return null;

  const anchors: Anchor[] = [];
  const handles: Handle[] = [];
  let lastAnchor: { x: number; y: number } | null = null;
  let subpathStart: { x: number; y: number } | null = null;

  for (let i = 0; i < glyph.path.commands.length; i++) {
    const { command, args } = glyph.path.commands[i];

    switch (command) {
      case 'moveTo': {
        if (args.length >= 2) {
          const x = args[0];
          const y = args[1];
          lastAnchor = { x, y };
          subpathStart = { x, y };
          anchors.push({
            x,
            y,
            isStart: true,
            commandIndex: i,
          });
        }
        break;
      }

      case 'lineTo': {
        if (args.length >= 2 && lastAnchor) {
          const x = args[0];
          const y = args[1];
          lastAnchor = { x, y };
          anchors.push({
            x,
            y,
            isStart: false,
            commandIndex: i,
          });
        }
        break;
      }

      case 'quadraticCurveTo': {
        // Q: control point [cx, cy], end point [x, y]
        if (args.length >= 4 && lastAnchor) {
          const [cx, cy, x, y] = args;
          const { x: x0, y: y0 } = lastAnchor;

          // Convert quadratic to cubic for consistent rendering
          // Q→C conversion: C1 = P0 + 2/3*(Cq - P0), C2 = P2 + 2/3*(Cq - P2)
          const c1x = x0 + (2 / 3) * (cx - x0);
          const c1y = y0 + (2 / 3) * (cy - y0);
          const c2x = x + (2 / 3) * (cx - x);
          const c2y = y + (2 / 3) * (cy - y);

          // Add handles
          handles.push({
            x: c1x,
            y: c1y,
            anchorX: x0,
            anchorY: y0,
            commandIndex: i,
          });
          handles.push({
            x: c2x,
            y: c2y,
            anchorX: x,
            anchorY: y,
            commandIndex: i,
          });

          // Update last anchor
          lastAnchor = { x, y };
          anchors.push({
            x,
            y,
            isStart: false,
            commandIndex: i,
          });
        }
        break;
      }

      case 'bezierCurveTo': {
        // C: control point 1 [c1x, c1y], control point 2 [c2x, c2y], end point [x, y]
        if (args.length >= 6 && lastAnchor) {
          const [c1x, c1y, c2x, c2y, x, y] = args;
          const { x: x0, y: y0 } = lastAnchor;

          // Add handles
          handles.push({
            x: c1x,
            y: c1y,
            anchorX: x0,
            anchorY: y0,
            commandIndex: i,
          });
          handles.push({
            x: c2x,
            y: c2y,
            anchorX: x,
            anchorY: y,
            commandIndex: i,
          });

          // Update last anchor
          lastAnchor = { x, y };
          anchors.push({
            x,
            y,
            isStart: false,
            commandIndex: i,
          });
        }
        break;
      }

      case 'closePath': {
        // Mark last anchor as closed if it's not already at start
        if (anchors.length > 0 && subpathStart && lastAnchor) {
          const lastAnchorEntry = anchors[anchors.length - 1];
          // Check if we're already at the start point
          const dx = Math.abs(lastAnchorEntry.x - subpathStart.x);
          const dy = Math.abs(lastAnchorEntry.y - subpathStart.y);
          if (dx > 1e-6 || dy > 1e-6) {
            // Not at start, so this closePath creates a connection back
            // The start anchor is already marked as isStart
          }
        }
        break;
      }
    }
  }

  return { anchors, handles };
}

export interface SVGPathDetailsProps {
  /** Glyph to extract path details from */
  glyph: Glyph;
  /** Viewport transform for coordinate conversion */
  transform: ViewportTransform;
  /** Colors for rendering */
  colors: {
    anchorFill: string;
    anchorStroke: string;
    handleFill: string;
    handleStroke: string;
  };
  /** ID prefix for symbol references */
  idPrefix?: string;
  /** Whether to show the path outline */
  showPath?: boolean;
}

/**
 * Renders path details (anchors, handles, control lines) as SVG elements.
 * Uses `<use>` elements to reduce DOM nodes.
 */
export function SVGPathDetails({
  glyph,
  transform,
  colors,
  idPrefix = 'fi',
  showPath = false,
}: SVGPathDetailsProps) {
  const details = useMemo(() => parsePathDetails(glyph), [glyph]);
  const defIds = getSVGDefIds(idPrefix);

  if (!details) return null;

  const { anchors, handles } = details;

  return (
    <g id="path-details" vectorEffect="non-scaling-stroke">
      {/* Path outline (if requested) */}
      {showPath && glyph.path && (
        <path
          d={glyph.path.toSVG()}
          transform={transform.toSVGTransform()}
          fill="none"
          stroke={colors.handleStroke}
          strokeWidth={1.5 / transform.scale}
        />
      )}

      {/* Handle lines (from anchor to control point) */}
      {handles.map((handle, idx) => {
        const anchorScreen = transform.toScreen({
          x: handle.anchorX,
          y: handle.anchorY,
        });
        const handleScreen = transform.toScreen({ x: handle.x, y: handle.y });

        return (
          <g key={`handle-line-${idx}`}>
            {/* Visible line */}
            <line
              x1={anchorScreen.x}
              y1={anchorScreen.y}
              x2={handleScreen.x}
              y2={handleScreen.y}
              stroke={colors.handleStroke}
              strokeWidth={1 / transform.scale}
            />
            {/* Invisible fat stroke for hit-testing */}
            <line
              x1={anchorScreen.x}
              y1={anchorScreen.y}
              x2={handleScreen.x}
              y2={handleScreen.y}
              stroke="transparent"
              strokeWidth={12 / transform.scale}
              pointerEvents="stroke"
            />
          </g>
        );
      })}

      {/* Anchors */}
      {anchors.map((anchor, idx) => {
        const screenPos = transform.toScreen({ x: anchor.x, y: anchor.y });

        return (
          <g key={`anchor-${idx}`}>
            {/* Visible anchor */}
            <use
              href={`#${defIds.anchor}`}
              x={screenPos.x}
              y={screenPos.y}
              fill={anchor.isStart ? colors.anchorStroke : colors.anchorFill}
              stroke={colors.anchorStroke}
            />
            {/* Invisible fat circle for hit-testing */}
            <circle
              cx={screenPos.x}
              cy={screenPos.y}
              r={6 / transform.scale}
              fill="transparent"
              stroke="transparent"
              strokeWidth={12 / transform.scale}
              pointerEvents="stroke"
            />
            {/* Start label */}
            {anchor.isStart && (
              <text
                x={screenPos.x + 4 / transform.scale}
                y={screenPos.y + 4 / transform.scale}
                fill={colors.anchorStroke}
                fontSize={12 / transform.scale}
                fontFamily="sans-serif"
                pointerEvents="none"
              >
                Start
              </text>
            )}
          </g>
        );
      })}

      {/* Handles */}
      {handles.map((handle, idx) => {
        const screenPos = transform.toScreen({ x: handle.x, y: handle.y });

        return (
          <g key={`handle-${idx}`}>
            {/* Visible handle */}
            <use
              href={`#${defIds.handle}`}
              x={screenPos.x}
              y={screenPos.y}
              fill={colors.handleFill}
              stroke={colors.handleStroke}
            />
            {/* Invisible fat rect for hit-testing */}
            <rect
              x={screenPos.x - 6 / transform.scale}
              y={screenPos.y - 6 / transform.scale}
              width={12 / transform.scale}
              height={12 / transform.scale}
              fill="transparent"
              stroke="transparent"
              strokeWidth={12 / transform.scale}
              pointerEvents="stroke"
            />
          </g>
        );
      })}
    </g>
  );
}

/**
 * SVG definitions, patterns, symbols, and markers for FontInspector.
 *
 * Provides reusable SVG elements that reduce DOM nodes through `<use>` references.
 * All IDs are prefixed to support multiple instances.
 */

export interface SVGDefsProps {
  /** Prefix for all generated IDs to support multiple instances */
  idPrefix?: string;
}

/**
 * SVG definitions component containing patterns, symbols, and markers.
 *
 * Patterns:
 * - Checker pattern: Rectangular checkerboard for background fills
 *
 * Symbols:
 * - Anchor: Circle marker for path anchors
 * - Handle: Square marker for bezier control points
 *
 * Markers:
 * - Arrow: Direction indicator for paths
 */
export function SVGDefs({ idPrefix = 'fi' }: SVGDefsProps) {
  const ids = {
    checker: `${idPrefix}-checker`,
    anchor: `${idPrefix}-anchor`,
    handle: `${idPrefix}-handle`,
    arrow: `${idPrefix}-arrow`,
  };

  return (
    <defs>
      {/* Checker pattern for background fills */}
      <pattern
        id={ids.checker}
        width="8"
        height="8"
        patternUnits="userSpaceOnUse"
      >
        <rect
          width="8"
          height="8"
          fill="var(--semantic-color-background-primary)"
        />
        <rect
          width="4"
          height="4"
          fill="var(--semantic-color-background-image-overlay)"
        />
        <rect
          x="4"
          y="4"
          width="4"
          height="4"
          fill="var(--semantic-color-background-image-overlay)"
        />
      </pattern>

      {/* Anchor symbol - circle marker for path anchors */}
      <symbol id={ids.anchor} viewBox="-2.5 -2.5 5 5" overflow="visible">
        <circle
          r="2.5"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </symbol>

      {/* Handle symbol - square marker for bezier control points */}
      <symbol id={ids.handle} viewBox="-2 -2 4 4" overflow="visible">
        <rect
          x="-2"
          y="-2"
          width="4"
          height="4"
          fill="currentColor"
          stroke="currentColor"
          strokeWidth="0.5"
        />
      </symbol>

      {/* Arrow marker for direction indicators */}
      <marker
        id={ids.arrow}
        markerWidth="6"
        markerHeight="6"
        refX="5"
        refY="3"
        orient="auto"
        markerUnits="strokeWidth"
      >
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
  );
}

/**
 * Type-safe ID references for use with `<use>` elements
 */
export type SVGDefIds = {
  checker: string;
  anchor: string;
  handle: string;
  arrow: string;
};

/**
 * Get ID references for a given prefix
 */
export function getSVGDefIds(idPrefix: string = 'fi'): SVGDefIds {
  return {
    checker: `${idPrefix}-checker`,
    anchor: `${idPrefix}-anchor`,
    handle: `${idPrefix}-handle`,
    arrow: `${idPrefix}-arrow`,
  };
}

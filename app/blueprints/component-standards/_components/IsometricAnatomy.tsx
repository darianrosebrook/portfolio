'use client';

import * as React from 'react';
import type { AnatomyPart } from '../_lib/generateAnatomy';
import styles from './IsometricAnatomy.module.scss';

interface IsometricAnatomyProps {
  parts: AnatomyPart[];
  componentName: string;
}

// Isometric projection constants (30° axonometric).
const ISO_ANGLE_RAD = Math.PI / 6; // 30°
const COS30 = Math.cos(ISO_ANGLE_RAD); // ~0.866
const SIN30 = Math.sin(ISO_ANGLE_RAD); // 0.5

// Geometry tuning.
const BASE_WIDTH = 200; // top face front edge width for root
const WIDTH_TAPER = 14; // pixels narrower per deeper layer
const MIN_WIDTH = 110;
const DEPTH = 80; // top face depth (Y axis in iso)
const THICKNESS = 18; // extrusion thickness
const LAYER_GAP = 38; // vertical gap between layers (stacked, before explode)
const SVG_PAD_X = 170; // horizontal padding for prop pins
const SVG_PAD_Y = 24;

interface LayerGeometry {
  // Top face: 4 corners (parallelogram).
  topFront: { x: number; y: number }; // front-center bottom of top face
  topPoints: string; // SVG points
  // Side faces.
  leftPoints: string;
  rightPoints: string;
  // Anchor for prop pin connector.
  pinAnchor: { x: number; y: number };
  // Y-translate offset per layer for the explode animation.
  explodeOffset: number;
}

function layerGeometry(
  index: number,
  total: number,
  centerX: number,
  baseY: number
): LayerGeometry {
  const width = Math.max(MIN_WIDTH, BASE_WIDTH - index * WIDTH_TAPER);
  const halfW = width / 2;
  const depth = DEPTH;
  // Project depth into iso space.
  const dx = depth * COS30;
  const dy = depth * SIN30;

  const layerY = baseY + index * LAYER_GAP;

  // Top face corners (clockwise from front-left):
  //   FL --- FR
  //   /       \
  //  BL ----- BR
  // In iso, "back" goes up-right.
  const fl = { x: centerX - halfW, y: layerY };
  const fr = { x: centerX + halfW, y: layerY };
  const br = { x: fr.x + dx, y: fr.y - dy };
  const bl = { x: fl.x + dx, y: fl.y - dy };

  const topPoints = `${fl.x},${fl.y} ${fr.x},${fr.y} ${br.x},${br.y} ${bl.x},${bl.y}`;

  // Front face (extruded down from FL-FR by THICKNESS).
  // But here we use "left" and "right" faces — front-facing wall and right-facing wall.
  // For an iso block from above, left face is FL→BL on top, dropping straight down.
  const flBottom = { x: fl.x, y: fl.y + THICKNESS };
  const frBottom = { x: fr.x, y: fr.y + THICKNESS };
  const brBottom = { x: br.x, y: br.y + THICKNESS };

  // Left face = front-left wall: FL, FR, FR-bottom, FL-bottom.
  const leftPoints = `${fl.x},${fl.y} ${fr.x},${fr.y} ${frBottom.x},${frBottom.y} ${flBottom.x},${flBottom.y}`;
  // Right face = right-side wall: FR, BR, BR-bottom, FR-bottom.
  const rightPoints = `${fr.x},${fr.y} ${br.x},${br.y} ${brBottom.x},${brBottom.y} ${frBottom.x},${frBottom.y}`;

  // Pin anchor: midpoint of the front-bottom edge.
  const pinAnchor = {
    x: (flBottom.x + frBottom.x) / 2,
    y: (flBottom.y + frBottom.y) / 2,
  };

  // Explode: layers translate outward from center.
  // Center index doesn't move; outer layers move further.
  const middle = (total - 1) / 2;
  const distance = index - middle;
  // Each unit of distance = 18px of additional spread.
  const explodeOffset = distance * 18;

  return {
    topFront: fl,
    topPoints,
    leftPoints,
    rightPoints,
    pinAnchor,
    explodeOffset,
  };
}

export function IsometricAnatomy({
  parts,
  componentName,
}: IsometricAnatomyProps) {
  if (!parts.length) {
    return null;
  }

  const total = parts.length;
  // SVG dimensions.
  const widestLayer = BASE_WIDTH; // root, before taper
  const isoDx = DEPTH * COS30;
  const layoutWidth = widestLayer + isoDx;
  const layoutHeight =
    SVG_PAD_Y * 2 +
    (total - 1) * LAYER_GAP +
    THICKNESS +
    DEPTH * SIN30 +
    40;

  const svgWidth = layoutWidth + SVG_PAD_X * 2;
  const svgHeight = layoutHeight;

  const centerX = svgWidth / 2 - isoDx / 2;
  const baseY = SVG_PAD_Y + DEPTH * SIN30;

  const layers = parts.map((part, i) => ({
    part,
    geom: layerGeometry(i, total, centerX, baseY),
  }));

  // Pin label column: right side of the SVG.
  const pinLabelX = svgWidth - SVG_PAD_X + 40;
  const PIN_PILL_HEIGHT = 28;

  return (
    <div
      className={styles.isometric}
      aria-hidden="true"
      data-component={componentName}
    >
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        xmlns="http://www.w3.org/2000/svg"
        className={styles.svg}
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Prop pins layer (rendered first so layers can overlay them at rest) */}
        <g className={styles.pins}>
          {layers.map(({ part, geom }, i) => {
            const labelY = baseY + i * LAYER_GAP + geom.explodeOffset;
            return (
              <g key={`pin-${part.name}`} className={styles.pin}>
                <line
                  x1={geom.pinAnchor.x}
                  y1={geom.pinAnchor.y + geom.explodeOffset}
                  x2={pinLabelX - 8}
                  y2={labelY + PIN_PILL_HEIGHT / 2}
                  stroke="var(--semantic-color-foreground-primary, #111827)"
                  strokeDasharray="6 4"
                  strokeWidth="1"
                />
                <rect
                  x={pinLabelX}
                  y={labelY}
                  width="140"
                  height={PIN_PILL_HEIGHT}
                  rx={PIN_PILL_HEIGHT / 2}
                  fill="var(--semantic-color-background-primary, #ffffff)"
                  stroke="var(--semantic-color-border-primary, #d1d5db)"
                  strokeWidth="1"
                />
                <text
                  x={pinLabelX + 16}
                  y={labelY + PIN_PILL_HEIGHT / 2 + 4}
                  fontSize="13"
                  fontFamily="var(--core-typography-font-family-sans, Inter, sans-serif)"
                  fill="var(--semantic-color-foreground-primary, #111827)"
                >
                  {part.name}
                </text>
              </g>
            );
          })}
        </g>

        {/* Layers (drawn bottom-up so upper layers sit on top) */}
        <g className={styles.stack}>
          {layers.map(({ part, geom }, i) => (
            <g
              key={`layer-${part.name}`}
              className={styles.layer}
              style={
                {
                  '--explode-y': `${geom.explodeOffset}px`,
                } as React.CSSProperties
              }
            >
              {/* Right face (darker shading) */}
              <polygon
                points={geom.rightPoints}
                fill="var(--semantic-color-background-tertiary, #e5e7eb)"
                stroke="var(--semantic-color-border-primary, #d1d5db)"
                strokeLinejoin="round"
              />
              {/* Front face (mid shading) */}
              <polygon
                points={geom.leftPoints}
                fill="var(--semantic-color-background-secondary, #f3f4f6)"
                stroke="var(--semantic-color-border-primary, #d1d5db)"
                strokeLinejoin="round"
              />
              {/* Top face */}
              <polygon
                points={geom.topPoints}
                fill="var(--semantic-color-background-primary, #ffffff)"
                stroke="var(--semantic-color-border-primary, #d1d5db)"
                strokeLinejoin="round"
              />
              {/* Index marker on top face center */}
              <text
                x={geom.topFront.x + (BASE_WIDTH - i * WIDTH_TAPER) / 2}
                y={geom.topFront.y - DEPTH * SIN30 * 0.4}
                textAnchor="middle"
                fontSize="11"
                fontFamily="var(--core-typography-font-family-sans, Inter, sans-serif)"
                fill="var(--semantic-color-foreground-secondary, #6b7280)"
                className={styles.layerLabel}
              >
                {i + 1}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}

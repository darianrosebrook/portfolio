/**
 * Pointer layer hook for FontInspector SVG interaction.
 *
 * Centralizes pointer event handling with:
 * - Screen ↔ font coordinate transforms
 * - Hover target tracking (command index, segment t)
 * - Drag state management with capture/release
 */

import type { ViewportTransform } from '@/utils/geometry/transforms';
import { useCallback, useRef, useState } from 'react';

export interface HoverTarget {
  /** Command index in the glyph path */
  commandIndex?: number;
  /** Segment parameter t (0-1) for curves */
  segmentT?: number;
  /** Type of element being hovered */
  type: 'anchor' | 'handle' | 'path' | 'none';
}

export interface PointerLayerState {
  /** Current hover target */
  hoverTarget: HoverTarget;
  /** Whether pointer is currently dragging */
  isDragging: boolean;
  /** Current pointer position in screen coordinates */
  screenPos: { x: number; y: number };
  /** Current pointer position in font coordinates */
  fontPos: { x: number; y: number };
}

export interface UsePointerLayerOptions {
  /** Viewport transform for coordinate conversion */
  transform: ViewportTransform | null;
  /** Callback when hover target changes */
  onHoverChange?: (target: HoverTarget) => void;
  /** Callback when drag starts */
  onDragStart?: (pos: { x: number; y: number }) => void;
  /** Callback during drag */
  onDrag?: (
    pos: { x: number; y: number },
    delta: { x: number; y: number }
  ) => void;
  /** Callback when drag ends */
  onDragEnd?: () => void;
}

/**
 * Hook for managing pointer interactions on SVG elements.
 *
 * Provides:
 * - Screen ↔ font coordinate transforms
 * - Hover target tracking
 * - Drag state management
 * - Event handlers for SVG elements
 */
export function usePointerLayer(options: UsePointerLayerOptions) {
  const { transform, onHoverChange, onDragStart, onDrag, onDragEnd } = options;

  const [state, setState] = useState<PointerLayerState>({
    hoverTarget: { type: 'none' },
    isDragging: false,
    screenPos: { x: 0, y: 0 },
    fontPos: { x: 0, y: 0 },
  });

  const dragStartPos = useRef<{ x: number; y: number } | null>(null);
  const pointerId = useRef<number | null>(null);

  const handlePointerDown = useCallback(
    (ev: React.PointerEvent<SVGElement>) => {
      if (!transform) return;

      ev.currentTarget.setPointerCapture(ev.pointerId);
      pointerId.current = ev.pointerId;

      const screenPos = { x: ev.clientX, y: ev.clientY };
      const fontPos = transform.toFont(screenPos);

      dragStartPos.current = screenPos;

      setState((prev) => ({
        ...prev,
        isDragging: true,
        screenPos,
        fontPos,
      }));

      onDragStart?.(screenPos);
    },
    [transform, onDragStart]
  );

  const handlePointerMove = useCallback(
    (ev: React.PointerEvent<SVGElement>) => {
      if (!transform) return;

      const screenPos = { x: ev.clientX, y: ev.clientY };
      const fontPos = transform.toFont(screenPos);

      setState((prev) => ({
        ...prev,
        screenPos,
        fontPos,
      }));

      if (state.isDragging && dragStartPos.current) {
        const delta = {
          x: screenPos.x - dragStartPos.current.x,
          y: screenPos.y - dragStartPos.current.y,
        };
        onDrag?.(screenPos, delta);
      } else {
        // Update hover target (could be enhanced to detect actual SVG elements)
        // For now, just track position
        const newTarget: HoverTarget = { type: 'none' };
        if (onHoverChange && newTarget.type !== state.hoverTarget.type) {
          onHoverChange(newTarget);
        }
        setState((prev) => ({
          ...prev,
          hoverTarget: newTarget,
        }));
      }
    },
    [transform, state.isDragging, onDrag, onHoverChange, state.hoverTarget.type]
  );

  const handlePointerUp = useCallback(() => {
    if (pointerId.current !== null) {
      // Release capture would be handled by React
      pointerId.current = null;
    }

    dragStartPos.current = null;

    setState((prev) => ({
      ...prev,
      isDragging: false,
    }));

    onDragEnd?.();
  }, [onDragEnd]);

  const handlePointerCancel = useCallback(() => {
    handlePointerUp();
  }, [handlePointerUp]);

  const handlePointerLeave = useCallback(() => {
    setState((prev) => ({
      ...prev,
      hoverTarget: { type: 'none' },
    }));
    onHoverChange?.({ type: 'none' });
  }, [onHoverChange]);

  return {
    state,
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerCancel,
      onPointerLeave: handlePointerLeave,
    },
    /** Convert screen coordinates to font coordinates */
    toFont: useCallback(
      (pos: { x: number; y: number }) => {
        return transform?.toFont(pos) ?? { x: 0, y: 0 };
      },
      [transform]
    ),
    /** Convert font coordinates to screen coordinates */
    toScreen: useCallback(
      (pos: { x: number; y: number }) => {
        return transform?.toScreen(pos) ?? { x: 0, y: 0 };
      },
      [transform]
    ),
  };
}

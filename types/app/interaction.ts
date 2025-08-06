// Centralized types for interaction context (mouse, scroll, window, reduced motion)

export interface MouseState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isPressed: boolean;
  isDragging: boolean;
  hasMouseMoved?: boolean;
  hoveredTarget?: string;
}

export interface ScrollState {
  direction: 'up' | 'down' | 'left' | 'right' | null;
  x: number;
  y: number;
}

export interface WindowSize {
  width: number;
  height: number;
}

export interface InteractionContextValue {
  mouse: MouseState;
  scroll: ScrollState;
  window: WindowSize;
  prefersReducedMotion: boolean;
  setPrefersReducedMotion?: (value: boolean) => void;
  setHoveredTarget?: (target: string | undefined) => void;
}

// Legacy exports for backward compatibility
export type mousestate = MouseState;
export type scrollstate = ScrollState;
export type windowsize = WindowSize;
export type interactioncontextvalue = InteractionContextValue;

// Centralized types for interaction context (mouse, scroll, window, reduced motion)

export interface MouseState {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isPressed: boolean;
  isDragging: boolean;
  hasMouseMoved?: boolean;
}

export interface ScrollState {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'left' | 'right' | null;
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
}

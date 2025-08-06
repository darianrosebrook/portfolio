// Centralized types for interaction context (mouse, scroll, window, reduced motion)

export interface mousestate {
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  isPressed: boolean;
  isDragging: boolean;
  hasMouseMoved?: boolean;
  hoveredTarget?: string;
}

export interface scrollstate {
  direction: 'up' | 'down' | 'left' | 'right' | null;
  x: number;
  y: number;
}

export interface windowsize {
  width: number;
  height: number;
}

export interface interactioncontextvalue {
  mouse: mousestate;
  scroll: scrollstate;
  window: windowsize;
  prefersReducedMotion: boolean;
  setPrefersReducedMotion?: (value: boolean) => void;
  setHoveredTarget?: (target: string | undefined) => void;
}

/**
 * Popover Component Types
 * 
 * Defines TypeScript interfaces for Popover component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * Popover design tokens interface
 */
export interface PopoverTokens {
  // Container tokens
  'container-display': TokenValue;

  // Trigger tokens
  'trigger-background': TokenValue;
  'trigger-border': TokenValue;
  'trigger-cursor': TokenValue;
  'trigger-active-borderRadius': TokenValue;
  'trigger-active-outlineColor': TokenValue;
  'trigger-active-outlineWidth': TokenValue;
  'trigger-active-outlineOffset': TokenValue;
  'trigger-active-transitionDuration': TokenValue;
  'trigger-active-transitionEasing': TokenValue;

  // Content tokens
  'content-zIndex': TokenValue;
  'content-display': TokenValue;
  'content-flexDirection': TokenValue;
  'content-gap': TokenValue;
  'content-minWidth': TokenValue;
  'content-maxWidth': TokenValue;
  'content-padding': TokenValue;
  'content-background': TokenValue;
  'content-borderRadius': TokenValue;
  'content-boxShadow': TokenValue;

  // Animation tokens
  'animation-duration-enter': TokenValue;
  'animation-duration-exit': TokenValue;
  'animation-easing-enter': TokenValue;
  'animation-easing-exit': TokenValue;
  'animation-scale-exit': TokenValue;
  'animation-translateY-enter': TokenValue;

  // Positioning tokens
  'positioning-offset': TokenValue;
  'positioning-edgeMargin': TokenValue;
  'positioning-windowMargin': TokenValue;
}

/**
 * Popover theming options
 */
export interface PopoverTheme {
  /** Custom token overrides */
  tokens?: Partial<PopoverTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Position interface for popover positioning
 */
export interface PopoverPosition {
  top: number;
  left: number;
}

/**
 * Base Popover props
 */
export interface PopoverProps {
  /** Child components (Trigger and Content) */
  children: React.ReactNode;
  /** Offset distance from trigger element */
  offset?: number;
  /** Custom theming */
  theme?: PopoverTheme;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Popover Trigger props
 */
export interface PopoverTriggerProps {
  /** Trigger content */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Element type to render as */
  as?: React.ElementType;
}

/**
 * Popover Content props
 */
export interface PopoverContentProps {
  /** Content to display in popover */
  children: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Popover Context type
 */
export interface PopoverContextType {
  /** Unique popover identifier */
  popoverId: string;
  /** Reference to trigger element */
  triggerRef: React.MutableRefObject<HTMLElement | null>;
  /** Reference to content element */
  contentRef: React.MutableRefObject<HTMLDivElement | null>;
  /** Current position */
  position: PopoverPosition;
  /** Function to update position */
  updatePosition: () => void;
  /** Open/closed state */
  isOpen: boolean;
  /** Function to set open state */
  setIsOpen: (isOpen: boolean) => void;
  /** Offset distance */
  offset: number;
}

/**
 * Default Popover token values
 */
export const DEFAULT_POPOVER_TOKENS: PopoverTokens = {
  // Container tokens
  'container-display': 'inline-block',

  // Trigger tokens
  'trigger-background': 'none',
  'trigger-border': 'none',
  'trigger-cursor': 'pointer',
  'trigger-active-borderRadius': '1920px',
  'trigger-active-outlineColor': '#d9292b',
  'trigger-active-outlineWidth': '2px',
  'trigger-active-outlineOffset': '2px',
  'trigger-active-transitionDuration': '0.2s',
  'trigger-active-transitionEasing': 'ease-out',

  // Content tokens
  'content-zIndex': '1000',
  'content-display': 'flex',
  'content-flexDirection': 'column',
  'content-gap': '16px',
  'content-minWidth': '256px',
  'content-maxWidth': 'calc(100vw - 32px)',
  'content-padding': '20px',
  'content-background': '#efefef',
  'content-borderRadius': '8px',
  'content-boxShadow': '0 10px 25px rgba(0, 0, 0, 0.15)',

  // Animation tokens
  'animation-duration-enter': '0.3s',
  'animation-duration-exit': '0.2s',
  'animation-easing-enter': 'back.out(1.7)',
  'animation-easing-exit': 'power2.in',
  'animation-scale-exit': '0.8',
  'animation-translateY-enter': '-10px',

  // Positioning tokens
  'positioning-offset': '8px',
  'positioning-edgeMargin': '10px',
  'positioning-windowMargin': '16px',
};

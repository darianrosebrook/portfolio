/**
 * Tooltip Component Types
 *
 * Defines TypeScript interfaces for Tooltip component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * Tooltip placement options
 */
export type TooltipPlacement =
  | 'top'
  | 'top-start'
  | 'top-end'
  | 'bottom'
  | 'bottom-start'
  | 'bottom-end'
  | 'left'
  | 'left-start'
  | 'left-end'
  | 'right'
  | 'right-start'
  | 'right-end';

/**
 * Tooltip trigger options
 */
export type TooltipTrigger = 'hover' | 'click' | 'focus' | 'manual';

/**
 * Tooltip size variants
 */
export type TooltipSize = 'small' | 'medium' | 'large';

/**
 * Tooltip visual variants
 */
export type TooltipVariant = 'default' | 'dark' | 'light' | 'error' | 'warning' | 'success' | 'info';

/**
 * Tooltip design tokens interface
 */
export interface TooltipTokens {
  // Background colors for variants
  'color-background-default': TokenValue;
  'color-background-dark': TokenValue;
  'color-background-light': TokenValue;
  'color-background-error': TokenValue;
  'color-background-warning': TokenValue;
  'color-background-success': TokenValue;
  'color-background-info': TokenValue;

  // Text colors for variants
  'color-foreground-default': TokenValue;
  'color-foreground-dark': TokenValue;
  'color-foreground-light': TokenValue;
  'color-foreground-error': TokenValue;
  'color-foreground-warning': TokenValue;
  'color-foreground-success': TokenValue;
  'color-foreground-info': TokenValue;

  // Border colors for variants
  'color-border-default': TokenValue;
  'color-border-dark': TokenValue;
  'color-border-light': TokenValue;
  'color-border-error': TokenValue;
  'color-border-warning': TokenValue;
  'color-border-success': TokenValue;
  'color-border-info': TokenValue;

  // Arrow colors for variants
  'color-arrow-default': TokenValue;
  'color-arrow-dark': TokenValue;
  'color-arrow-light': TokenValue;
  'color-arrow-error': TokenValue;
  'color-arrow-warning': TokenValue;
  'color-arrow-success': TokenValue;
  'color-arrow-info': TokenValue;

  // Size tokens for each variant
  'size-small-maxWidth': TokenValue;
  'size-small-padding': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-small-lineHeight': TokenValue;
  'size-small-arrowSize': TokenValue;
  'size-medium-maxWidth': TokenValue;
  'size-medium-padding': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-medium-lineHeight': TokenValue;
  'size-medium-arrowSize': TokenValue;
  'size-large-maxWidth': TokenValue;
  'size-large-padding': TokenValue;
  'size-large-fontSize': TokenValue;
  'size-large-lineHeight': TokenValue;
  'size-large-arrowSize': TokenValue;

  // Layout tokens
  'border-width': TokenValue;
  'border-radius': TokenValue;
  'shadow': TokenValue;
  'offset': TokenValue;

  // Typography tokens
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-letterSpacing': TokenValue;

  // Animation tokens
  'animation-duration': TokenValue;
  'animation-easing': TokenValue;
  'animation-delay': TokenValue;

  // Z-index tokens
  'zIndex': TokenValue;
}

/**
 * Tooltip theming options
 */
export interface TooltipTheme {
  /** Custom token overrides */
  tokens?: Partial<TooltipTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base Tooltip props
 */
export interface TooltipProps {
  /** Tooltip content */
  content: React.ReactNode;
  /** Element that triggers the tooltip */
  children: React.ReactElement;
  /** Placement of tooltip relative to trigger */
  placement?: TooltipPlacement;
  /** How tooltip is triggered */
  trigger?: TooltipTrigger | TooltipTrigger[];
  /** Visual size variant */
  size?: TooltipSize;
  /** Visual style variant */
  variant?: TooltipVariant;
  /** Custom theming */
  theme?: TooltipTheme;
  /** Additional CSS class names */
  className?: string;
  /** Tooltip container class name */
  tooltipClassName?: string;
  /** Whether tooltip is open (for manual trigger) */
  isOpen?: boolean;
  /** Whether to show arrow */
  showArrow?: boolean;
  /** Delay before showing tooltip (ms) */
  showDelay?: number;
  /** Delay before hiding tooltip (ms) */
  hideDelay?: number;
  /** Whether tooltip stays open on hover */
  interactive?: boolean;
  /** Whether to disable the tooltip */
  disabled?: boolean;
  /** Whether to follow cursor */
  followCursor?: boolean;
  /** Custom offset from trigger element */
  offset?: number;
  /** Portal container element */
  portalContainer?: HTMLElement;
  /** Maximum width override */
  maxWidth?: string | number;
  /** Whether to flip placement when out of bounds */
  flip?: boolean;
  /** Boundary element for collision detection */
  boundary?: HTMLElement | 'viewport';
  /** Callback when tooltip opens */
  onOpen?: () => void;
  /** Callback when tooltip closes */
  onClose?: () => void;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** Custom test ID */
  'data-testid'?: string;
}

/**
 * Tooltip trigger wrapper props
 */
export interface TooltipTriggerProps {
  children: React.ReactElement;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  'aria-describedby'?: string;
}

/**
 * Tooltip content props
 */
export interface TooltipContentProps {
  children: React.ReactNode;
  placement: TooltipPlacement;
  size: TooltipSize;
  variant: TooltipVariant;
  showArrow: boolean;
  className?: string;
  style?: CSSProperties;
  theme?: TooltipTheme;
  'aria-label'?: string;
  'data-testid'?: string;
}

/**
 * Tooltip arrow props
 */
export interface TooltipArrowProps {
  placement: TooltipPlacement;
  variant: TooltipVariant;
  size: TooltipSize;
  className?: string;
}

/**
 * Tooltip position calculation result
 */
export interface TooltipPosition {
  top: number;
  left: number;
  placement: TooltipPlacement;
  arrowTop?: number;
  arrowLeft?: number;
}

/**
 * Default Tooltip token values
 */
export const DEFAULT_TOOLTIP_TOKENS: TooltipTokens = {
  // Background colors
  'color-background-default': '#374151',
  'color-background-dark': '#111827',
  'color-background-light': '#ffffff',
  'color-background-error': '#dc2626',
  'color-background-warning': '#d97706',
  'color-background-success': '#059669',
  'color-background-info': '#2563eb',

  // Text colors
  'color-foreground-default': '#ffffff',
  'color-foreground-dark': '#ffffff',
  'color-foreground-light': '#374151',
  'color-foreground-error': '#ffffff',
  'color-foreground-warning': '#ffffff',
  'color-foreground-success': '#ffffff',
  'color-foreground-info': '#ffffff',

  // Border colors
  'color-border-default': '#374151',
  'color-border-dark': '#111827',
  'color-border-light': '#e5e7eb',
  'color-border-error': '#dc2626',
  'color-border-warning': '#d97706',
  'color-border-success': '#059669',
  'color-border-info': '#2563eb',

  // Arrow colors
  'color-arrow-default': '#374151',
  'color-arrow-dark': '#111827',
  'color-arrow-light': '#ffffff',
  'color-arrow-error': '#dc2626',
  'color-arrow-warning': '#d97706',
  'color-arrow-success': '#059669',
  'color-arrow-info': '#2563eb',

  // Size tokens
  'size-small-maxWidth': '200px',
  'size-small-padding': '6px 8px',
  'size-small-fontSize': '12px',
  'size-small-lineHeight': '1.4',
  'size-small-arrowSize': '4px',
  'size-medium-maxWidth': '300px',
  'size-medium-padding': '8px 12px',
  'size-medium-fontSize': '14px',
  'size-medium-lineHeight': '1.4',
  'size-medium-arrowSize': '5px',
  'size-large-maxWidth': '400px',
  'size-large-padding': '12px 16px',
  'size-large-fontSize': '16px',
  'size-large-lineHeight': '1.5',
  'size-large-arrowSize': '6px',

  // Layout tokens
  'border-width': '1px',
  'border-radius': '6px',
  'shadow': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  'offset': '8px',

  // Typography tokens
  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '400',
  'typography-letterSpacing': '0',

  // Animation tokens
  'animation-duration': '0.2s',
  'animation-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'animation-delay': '0s',

  // Z-index tokens
  'zIndex': '1050',
};

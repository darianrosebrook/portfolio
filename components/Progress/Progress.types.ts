/**
 * Progress Component Types
 *
 * Defines TypeScript interfaces for Progress component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * Progress size variants
 */
export type ProgressSize = 'small' | 'medium' | 'large';

/**
 * Progress visual variants
 */
export type ProgressVariant =
  | 'default'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

/**
 * Progress shape variants
 */
export type ProgressShape = 'linear' | 'circular';

/**
 * Progress design tokens interface
 */
export interface ProgressTokens {
  // Track (background) colors
  'color-track-default': TokenValue;
  'color-track-success': TokenValue;
  'color-track-warning': TokenValue;
  'color-track-danger': TokenValue;
  'color-track-info': TokenValue;

  // Fill (progress) colors
  'color-fill-default': TokenValue;
  'color-fill-success': TokenValue;
  'color-fill-warning': TokenValue;
  'color-fill-danger': TokenValue;
  'color-fill-info': TokenValue;

  // Text colors
  'color-text-default': TokenValue;
  'color-text-contrast': TokenValue;
  'color-text-muted': TokenValue;

  // Linear progress size tokens
  'size-linear-small-height': TokenValue;
  'size-linear-small-fontSize': TokenValue;
  'size-linear-medium-height': TokenValue;
  'size-linear-medium-fontSize': TokenValue;
  'size-linear-large-height': TokenValue;
  'size-linear-large-fontSize': TokenValue;

  // Circular progress size tokens
  'size-circular-small-diameter': TokenValue;
  'size-circular-small-strokeWidth': TokenValue;
  'size-circular-small-fontSize': TokenValue;
  'size-circular-medium-diameter': TokenValue;
  'size-circular-medium-strokeWidth': TokenValue;
  'size-circular-medium-fontSize': TokenValue;
  'size-circular-large-diameter': TokenValue;
  'size-circular-large-strokeWidth': TokenValue;
  'size-circular-large-fontSize': TokenValue;

  // Layout tokens
  'border-radius': TokenValue;
  'spacing-gap': TokenValue;

  // Typography tokens
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;
  'typography-letterSpacing': TokenValue;

  // Animation tokens
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;
  'animation-duration': TokenValue;
  'animation-easing': TokenValue;

  // Indeterminate animation tokens
  'indeterminate-animation-duration': TokenValue;
  'indeterminate-animation-easing': TokenValue;
}

/**
 * Progress theming options
 */
export interface ProgressTheme {
  /** Custom token overrides */
  tokens?: Partial<ProgressTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base Progress props
 */
export interface ProgressProps {
  /** Progress value (0-100) */
  value?: number;
  /** Maximum value (default: 100) */
  max?: number;
  /** Visual size variant */
  size?: ProgressSize;
  /** Visual style variant */
  variant?: ProgressVariant;
  /** Shape variant */
  shape?: ProgressShape;
  /** Custom theming */
  theme?: ProgressTheme;
  /** Additional CSS class names */
  className?: string;
  /** Container class name */
  containerClassName?: string;
  /** Whether to show percentage text */
  showValue?: boolean;
  /** Custom label text */
  label?: string;
  /** Whether progress is indeterminate (loading) */
  indeterminate?: boolean;
  /** Whether to animate progress changes */
  animated?: boolean;
  /** Custom format function for value display */
  formatValue?: (value: number, max: number) => string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA described by for accessibility */
  'aria-describedby'?: string;
  /** Custom test ID */
  'data-testid'?: string;
}

/**
 * Linear Progress props
 */
export interface LinearProgressProps extends Omit<ProgressProps, 'shape'> {
  /** Whether to show stripes */
  striped?: boolean;
  /** Whether stripes should be animated */
  stripedAnimated?: boolean;
}

/**
 * Circular Progress props
 */
export interface CircularProgressProps extends Omit<ProgressProps, 'shape'> {
  /** Custom stroke width */
  strokeWidth?: number;
  /** Whether to show the center content */
  showCenter?: boolean;
  /** Custom center content */
  centerContent?: React.ReactNode;
}

/**
 * Progress wrapper props
 */
export interface ProgressWrapperProps {
  children: React.ReactNode;
  className?: string;
  theme?: ProgressTheme;
}

/**
 * Progress label props
 */
export interface ProgressLabelProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Progress value display props
 */
export interface ProgressValueProps {
  value: number;
  max: number;
  formatValue?: (value: number, max: number) => string;
  className?: string;
}

/**
 * Default Progress token values
 */
export const DEFAULT_PROGRESS_TOKENS: ProgressTokens = {
  // Track colors
  'color-track-default': '#e5e7eb',
  'color-track-success': '#dcfce7',
  'color-track-warning': '#fef3c7',
  'color-track-danger': '#fee2e2',
  'color-track-info': '#dbeafe',

  // Fill colors
  'color-fill-default': '#6b7280',
  'color-fill-success': '#22c55e',
  'color-fill-warning': '#f59e0b',
  'color-fill-danger': '#ef4444',
  'color-fill-info': '#3b82f6',

  // Text colors
  'color-text-default': '#374151',
  'color-text-contrast': '#ffffff',
  'color-text-muted': '#6b7280',

  // Linear size tokens
  'size-linear-small-height': '4px',
  'size-linear-small-fontSize': '12px',
  'size-linear-medium-height': '8px',
  'size-linear-medium-fontSize': '14px',
  'size-linear-large-height': '12px',
  'size-linear-large-fontSize': '16px',

  // Circular size tokens
  'size-circular-small-diameter': '32px',
  'size-circular-small-strokeWidth': '3px',
  'size-circular-small-fontSize': '10px',
  'size-circular-medium-diameter': '48px',
  'size-circular-medium-strokeWidth': '4px',
  'size-circular-medium-fontSize': '12px',
  'size-circular-large-diameter': '64px',
  'size-circular-large-strokeWidth': '5px',
  'size-circular-large-fontSize': '14px',

  // Layout tokens
  'border-radius': '1920px',
  'spacing-gap': '8px',

  // Typography tokens
  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '500',
  'typography-lineHeight': '1.2',
  'typography-letterSpacing': '0',

  // Animation tokens
  'transition-duration': '0.3s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'width, stroke-dashoffset',
  'animation-duration': '2s',
  'animation-easing': 'ease-in-out',

  // Indeterminate animation tokens
  'indeterminate-animation-duration': '1.5s',
  'indeterminate-animation-easing': 'ease-in-out',
};

/**
 * Status Component Types
 * 
 * Defines TypeScript interfaces for Status component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * Status type variants
 */
export type StatusType = 'success' | 'error' | 'warning' | 'info' | 'neutral';

/**
 * Status size variants
 */
export type StatusSize = 'small' | 'medium' | 'large';

/**
 * Status visual variants
 */
export type StatusVariant = 'filled' | 'outlined' | 'subtle';

/**
 * Status design tokens interface
 */
export interface StatusTokens {
  // Color tokens for each status type
  'color-background-success': TokenValue;
  'color-background-error': TokenValue;
  'color-background-warning': TokenValue;
  'color-background-info': TokenValue;
  'color-background-neutral': TokenValue;
  'color-foreground-success': TokenValue;
  'color-foreground-error': TokenValue;
  'color-foreground-warning': TokenValue;
  'color-foreground-info': TokenValue;
  'color-foreground-neutral': TokenValue;
  'color-border-success': TokenValue;
  'color-border-error': TokenValue;
  'color-border-warning': TokenValue;
  'color-border-info': TokenValue;
  'color-border-neutral': TokenValue;
  'color-icon-success': TokenValue;
  'color-icon-error': TokenValue;
  'color-icon-warning': TokenValue;
  'color-icon-info': TokenValue;
  'color-icon-neutral': TokenValue;

  // Size tokens for each variant
  'size-small-padding': TokenValue;
  'size-small-gap': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-small-iconSize': TokenValue;
  'size-medium-padding': TokenValue;
  'size-medium-gap': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-medium-iconSize': TokenValue;
  'size-large-padding': TokenValue;
  'size-large-gap': TokenValue;
  'size-large-fontSize': TokenValue;
  'size-large-iconSize': TokenValue;

  // Layout tokens
  'border-width': TokenValue;
  'border-radius': TokenValue;

  // Typography tokens
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;
  'typography-letterSpacing': TokenValue;

  // Animation tokens
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;
}

/**
 * Status theming options
 */
export interface StatusTheme {
  /** Custom token overrides */
  tokens?: Partial<StatusTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base Status props
 */
export interface StatusProps {
  /** Status type/variant */
  status: StatusType;
  /** Visual size variant */
  size?: StatusSize;
  /** Visual style variant */
  variant?: StatusVariant;
  /** Status text content */
  children: React.ReactNode;
  /** Whether to show the icon */
  showIcon?: boolean;
  /** Custom icon element */
  icon?: React.ReactNode;
  /** Custom theming */
  theme?: StatusTheme;
  /** Additional CSS class names */
  className?: string;
  /** Click handler for interactive status */
  onClick?: () => void;
  /** Whether the status is interactive */
  interactive?: boolean;
}

/**
 * Status icon props
 */
export interface StatusIconProps {
  status: StatusType;
  size?: StatusSize;
  className?: string;
}

/**
 * Default Status token values
 */
export const DEFAULT_STATUS_TOKENS: StatusTokens = {
  // Color tokens
  'color-background-success': '#e4f2e0',
  'color-background-error': '#fceaea',
  'color-background-warning': '#ffedcc',
  'color-background-info': '#e0f2fe',
  'color-background-neutral': '#f5f5f5',
  'color-foreground-success': '#336006',
  'color-foreground-error': '#ae0001',
  'color-foreground-warning': '#824500',
  'color-foreground-info': '#0369a1',
  'color-foreground-neutral': '#555555',
  'color-border-success': '#336006',
  'color-border-error': '#ae0001',
  'color-border-warning': '#824500',
  'color-border-info': '#0369a1',
  'color-border-neutral': '#aeaeae',
  'color-icon-success': '#336006',
  'color-icon-error': '#ae0001',
  'color-icon-warning': '#824500',
  'color-icon-info': '#0369a1',
  'color-icon-neutral': '#555555',

  // Size tokens
  'size-small-padding': '4px 8px',
  'size-small-gap': '4px',
  'size-small-fontSize': '12px',
  'size-small-iconSize': '12px',
  'size-medium-padding': '8px 12px',
  'size-medium-gap': '6px',
  'size-medium-fontSize': '14px',
  'size-medium-iconSize': '14px',
  'size-large-padding': '12px 16px',
  'size-large-gap': '8px',
  'size-large-fontSize': '16px',
  'size-large-iconSize': '16px',

  // Layout tokens
  'border-width': '1px',
  'border-radius': '1920px',

  // Typography tokens
  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '500',
  'typography-lineHeight': '1.2',
  'typography-letterSpacing': '0',

  // Animation tokens
  'transition-duration': '0.2s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'background-color, border-color, color, transform',
};

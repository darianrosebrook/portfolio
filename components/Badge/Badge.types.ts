/**
 * Badge Component Types
 * 
 * Defines TypeScript interfaces for Badge component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * Badge size variants
 */
export type BadgeSize = 'small' | 'medium' | 'large';

/**
 * Badge visual variants
 */
export type BadgeVariant = 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Badge shape variants
 */
export type BadgeShape = 'rounded' | 'pill' | 'square';

/**
 * Badge design tokens interface
 */
export interface BadgeTokens {
  // Color tokens for each variant
  'color-background-default': TokenValue;
  'color-background-primary': TokenValue;
  'color-background-secondary': TokenValue;
  'color-background-success': TokenValue;
  'color-background-warning': TokenValue;
  'color-background-danger': TokenValue;
  'color-background-info': TokenValue;
  'color-foreground-default': TokenValue;
  'color-foreground-primary': TokenValue;
  'color-foreground-secondary': TokenValue;
  'color-foreground-success': TokenValue;
  'color-foreground-warning': TokenValue;
  'color-foreground-danger': TokenValue;
  'color-foreground-info': TokenValue;
  'color-border-default': TokenValue;
  'color-border-primary': TokenValue;
  'color-border-secondary': TokenValue;
  'color-border-success': TokenValue;
  'color-border-warning': TokenValue;
  'color-border-danger': TokenValue;
  'color-border-info': TokenValue;

  // Size tokens for each variant
  'size-small-height': TokenValue;
  'size-small-padding': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-small-iconSize': TokenValue;
  'size-small-gap': TokenValue;
  'size-medium-height': TokenValue;
  'size-medium-padding': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-medium-iconSize': TokenValue;
  'size-medium-gap': TokenValue;
  'size-large-height': TokenValue;
  'size-large-padding': TokenValue;
  'size-large-fontSize': TokenValue;
  'size-large-iconSize': TokenValue;
  'size-large-gap': TokenValue;

  // Layout tokens
  'border-width': TokenValue;
  'border-radius-rounded': TokenValue;
  'border-radius-pill': TokenValue;
  'border-radius-square': TokenValue;

  // Typography tokens
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;
  'typography-letterSpacing': TokenValue;
  'typography-textTransform': TokenValue;

  // Animation tokens
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;

  // Interactive tokens
  'hover-transform': TokenValue;
  'hover-boxShadow': TokenValue;
  'active-transform': TokenValue;

  // Dot/Indicator tokens
  'dot-size': TokenValue;
  'dot-offset': TokenValue;
}

/**
 * Badge theming options
 */
export interface BadgeTheme {
  /** Custom token overrides */
  tokens?: Partial<BadgeTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base Badge props
 */
export interface BadgeProps {
  /** Badge content */
  children?: React.ReactNode;
  /** Visual size variant */
  size?: BadgeSize;
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Shape variant */
  shape?: BadgeShape;
  /** Custom theming */
  theme?: BadgeTheme;
  /** Additional CSS class names */
  className?: string;
  /** Whether the badge is interactive (clickable) */
  interactive?: boolean;
  /** Click handler for interactive badges */
  onClick?: () => void;
  /** Whether to show as a dot indicator */
  dot?: boolean;
  /** Icon element to display */
  icon?: React.ReactNode;
  /** Whether to show the icon before or after text */
  iconPosition?: 'start' | 'end';
  /** Maximum number to display (shows "99+" for numbers > max) */
  max?: number;
  /** Whether the badge is dismissible */
  dismissible?: boolean;
  /** Dismiss handler */
  onDismiss?: () => void;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** Custom test ID */
  'data-testid'?: string;
}

/**
 * Badge dot props for indicator-only badges
 */
export interface BadgeDotProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  className?: string;
  theme?: BadgeTheme;
}

/**
 * Badge icon props
 */
export interface BadgeIconProps {
  children: React.ReactNode;
  size?: BadgeSize;
  position?: 'start' | 'end';
  className?: string;
}

/**
 * Badge dismiss button props
 */
export interface BadgeDismissProps {
  onDismiss: () => void;
  size?: BadgeSize;
  className?: string;
  'aria-label'?: string;
}

/**
 * Default Badge token values
 */
export const DEFAULT_BADGE_TOKENS: BadgeTokens = {
  // Color tokens
  'color-background-default': '#f5f5f5',
  'color-background-primary': '#d9292b',
  'color-background-secondary': '#6b7280',
  'color-background-success': '#336006',
  'color-background-warning': '#824500',
  'color-background-danger': '#ae0001',
  'color-background-info': '#0369a1',
  'color-foreground-default': '#374151',
  'color-foreground-primary': '#ffffff',
  'color-foreground-secondary': '#ffffff',
  'color-foreground-success': '#ffffff',
  'color-foreground-warning': '#ffffff',
  'color-foreground-danger': '#ffffff',
  'color-foreground-info': '#ffffff',
  'color-border-default': '#e5e7eb',
  'color-border-primary': '#d9292b',
  'color-border-secondary': '#6b7280',
  'color-border-success': '#336006',
  'color-border-warning': '#824500',
  'color-border-danger': '#ae0001',
  'color-border-info': '#0369a1',

  // Size tokens
  'size-small-height': '20px',
  'size-small-padding': '2px 6px',
  'size-small-fontSize': '11px',
  'size-small-iconSize': '12px',
  'size-small-gap': '4px',
  'size-medium-height': '24px',
  'size-medium-padding': '4px 8px',
  'size-medium-fontSize': '12px',
  'size-medium-iconSize': '14px',
  'size-medium-gap': '4px',
  'size-large-height': '28px',
  'size-large-padding': '6px 12px',
  'size-large-fontSize': '14px',
  'size-large-iconSize': '16px',
  'size-large-gap': '6px',

  // Layout tokens
  'border-width': '1px',
  'border-radius-rounded': '6px',
  'border-radius-pill': '1920px',
  'border-radius-square': '2px',

  // Typography tokens
  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '600',
  'typography-lineHeight': '1',
  'typography-letterSpacing': '0.025em',
  'typography-textTransform': 'none',

  // Animation tokens
  'transition-duration': '0.15s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'background-color, border-color, color, transform, box-shadow',

  // Interactive tokens
  'hover-transform': 'translateY(-1px)',
  'hover-boxShadow': '0 2px 4px rgba(0, 0, 0, 0.1)',
  'active-transform': 'translateY(0)',

  // Dot tokens
  'dot-size': '8px',
  'dot-offset': '-2px',
};

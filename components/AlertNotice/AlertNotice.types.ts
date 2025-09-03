/**
 * AlertNotice Component Types
 *
 * Defines TypeScript interfaces for AlertNotice component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * AlertNotice status variants
 */
export type AlertNoticeStatus = 'info' | 'success' | 'warning' | 'danger';

/**
 * AlertNotice level variants
 */
export type AlertNoticeLevel = 'page' | 'section' | 'inline';

/**
 * AlertNotice design tokens interface
 */
export interface AlertNoticeTokens {
  // Color tokens for each status
  'color-background-primary': TokenValue;
  'color-background-info': TokenValue;
  'color-background-success': TokenValue;
  'color-background-warning': TokenValue;
  'color-background-danger': TokenValue;
  'color-foreground-primary': TokenValue;
  'color-foreground-info': TokenValue;
  'color-foreground-success': TokenValue;
  'color-foreground-warning': TokenValue;
  'color-foreground-danger': TokenValue;
  'color-border-primary': TokenValue;
  'color-border-info': TokenValue;
  'color-border-success': TokenValue;
  'color-border-warning': TokenValue;
  'color-border-danger': TokenValue;

  // Size tokens for each level
  'size-inline-padding': TokenValue;
  'size-inline-radius': TokenValue;
  'size-inline-iconSize': TokenValue;
  'size-section-padding': TokenValue;
  'size-section-radius': TokenValue;
  'size-section-iconSize': TokenValue;
  'size-page-padding': TokenValue;
  'size-page-radius': TokenValue;
  'size-page-iconSize': TokenValue;

  // Layout tokens
  'shadow-default': TokenValue;
  'radius-default': TokenValue;
  'spacing-adjacent': TokenValue;

  // Typography tokens
  'text-font': TokenValue;
  'text-size': TokenValue;
  'text-weight': TokenValue;
  'title-size': TokenValue;
  'title-weight': TokenValue;

  // Icon tokens
  'icon-size': TokenValue;

  // Grid tokens
  'grid-gap-small': TokenValue;
  'grid-gap-medium': TokenValue;
}

/**
 * AlertNotice theming options
 */
export interface AlertNoticeTheme {
  /** Custom token overrides */
  tokens?: Partial<AlertNoticeTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base AlertNotice props
 */
export interface AlertNoticeProps {
  /** Visual status variant */
  status?: AlertNoticeStatus;
  /** Layout level variant */
  level?: AlertNoticeLevel;
  /** Unique identifier for tracking */
  index: number;
  /** Whether the alert can be dismissed */
  dismissible?: boolean;
  /** Dismiss handler */
  onDismiss?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  /** Custom theming */
  theme?: AlertNoticeTheme;
  /** Additional CSS class names */
  className?: string;
}

/**
 * Container component props
 */
export interface AlertNoticeContainerProps
  extends AlertNoticeProps,
    Omit<React.HTMLAttributes<HTMLDivElement>, 'className'> {}

/**
 * Content component props
 */
export interface AlertNoticeContentProps {
  children: React.ReactNode;
}

/**
 * Icon component props
 */
export interface AlertNoticeIconProps {
  status: AlertNoticeStatus;
}

/**
 * Default AlertNotice token values
 */
export const DEFAULT_ALERT_NOTICE_TOKENS: AlertNoticeTokens = {
  // Color tokens
  'color-background-primary': '#fafafa',
  'color-background-info': '#e4f2e0',
  'color-background-success': '#e4f2e0',
  'color-background-warning': '#ffedcc',
  'color-background-danger': '#fceaea',
  'color-foreground-primary': '#141414',
  'color-foreground-info': '#336006',
  'color-foreground-success': '#336006',
  'color-foreground-warning': '#824500',
  'color-foreground-danger': '#ae0001',
  'color-border-primary': '#aeaeae',
  'color-border-info': '#336006',
  'color-border-success': '#336006',
  'color-border-warning': '#824500',
  'color-border-danger': '#ae0001',

  // Size tokens
  'size-inline-padding': '8px',
  'size-inline-radius': '4px',
  'size-inline-iconSize': '16px',
  'size-section-padding': '16px',
  'size-section-radius': '8px',
  'size-section-iconSize': '20px',
  'size-page-padding': '20px',
  'size-page-radius': '0px',
  'size-page-iconSize': '24px',

  // Layout tokens
  'shadow-default': '0 2px 4px rgba(0, 0, 0, 0.1)',
  'radius-default': '8px',
  'spacing-adjacent': '16px',

  // Typography tokens
  'text-font': 'Inter, sans-serif',
  'text-size': '14px',
  'text-weight': '400',
  'title-size': '16px',
  'title-weight': '600',

  // Icon tokens
  'icon-size': '20px',

  // Grid tokens
  'grid-gap-small': '8px',
  'grid-gap-medium': '16px',
};

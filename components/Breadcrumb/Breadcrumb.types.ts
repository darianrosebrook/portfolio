/**
 * Breadcrumb Component Types
 */

import { CSSProperties } from 'react';
import { ComponentTokenConfig, TokenValue } from '@/utils/designTokens';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  disabled?: boolean;
}

export type BreadcrumbSeparator = 'slash' | 'chevron' | 'dot' | 'custom';
export type BreadcrumbSize = 'small' | 'medium' | 'large';

export interface BreadcrumbTokens {
  // Colors
  'color-foreground': TokenValue;
  'color-foreground-muted': TokenValue;
  'color-foreground-current': TokenValue;
  'color-foreground-disabled': TokenValue;
  'color-separator': TokenValue;
  'color-background-hover': TokenValue;
  'color-focus-ring': TokenValue;

  // Typography
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;

  // Size
  'size-small-gap': TokenValue;
  'size-medium-gap': TokenValue;
  'size-large-gap': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-large-fontSize': TokenValue;
  'separator-spacing': TokenValue;

  // Layout
  'border-radius': TokenValue;
  'padding-inline': TokenValue;

  // Transition
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;
}

export interface BreadcrumbTheme {
  tokens?: Partial<BreadcrumbTokens>;
  cssProperties?: CSSProperties;
  tokenConfig?: ComponentTokenConfig;
}

export interface BreadcrumbProps {
  items: BreadcrumbItem[];
  maxItems?: number; // when exceeded, use [first, overflow, previous, current]
  separator?: BreadcrumbSeparator;
  customSeparator?: React.ReactNode; // used when separator === 'custom'
  size?: BreadcrumbSize;
  theme?: BreadcrumbTheme;
  className?: string;
  navAriaLabel?: string;
  onNavigate?: (item: BreadcrumbItem, index: number, event: React.MouseEvent | React.KeyboardEvent) => void;
}

export const DEFAULT_BREADCRUMB_TOKENS: BreadcrumbTokens = {
  'color-foreground': '#374151',
  'color-foreground-muted': '#6b7280',
  'color-foreground-current': '#111827',
  'color-foreground-disabled': '#9ca3af',
  'color-separator': '#9ca3af',
  'color-background-hover': 'rgba(0, 0, 0, 0.04)',
  'color-focus-ring': '#2563eb',

  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '400',
  'typography-lineHeight': '1.5',

  'size-small-gap': '6px',
  'size-medium-gap': '8px',
  'size-large-gap': '10px',
  'size-small-fontSize': '14px',
  'size-medium-fontSize': '16px',
  'size-large-fontSize': '18px',
  'separator-spacing': '8px',

  'border-radius': '6px',
  'padding-inline': '4px',

  'transition-duration': '0.15s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'color, background-color',
};



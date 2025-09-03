/**
 * Anchor Link Component Types
 */

import { CSSProperties, AnchorHTMLAttributes } from 'react';
import { ComponentTokenConfig, TokenValue } from '@/utils/designTokens';

export type AnchorLinkVariant = 'default' | 'primary' | 'secondary' | 'muted' | 'danger';
export type AnchorLinkSize = 'small' | 'medium' | 'large';
export type AnchorLinkUnderline = 'none' | 'hover' | 'always';

export interface AnchorLinkTokens {
  // Colors
  'color-foreground-default': TokenValue;
  'color-foreground-primary': TokenValue;
  'color-foreground-secondary': TokenValue;
  'color-foreground-muted': TokenValue;
  'color-foreground-danger': TokenValue;
  'color-foreground-hover': TokenValue;
  'color-foreground-active': TokenValue;
  'color-foreground-visited': TokenValue;
  'color-foreground-disabled': TokenValue;
  'color-underline': TokenValue;
  'color-focus-ring': TokenValue;

  // Typography
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;
  'typography-textDecoration': TokenValue;

  // Size
  'size-small-fontSize': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-large-fontSize': TokenValue;

  // Underline
  'underline-thickness': TokenValue;
  'underline-offset': TokenValue;

  // Transition
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;

  // Focus
  'focus-outline-width': TokenValue;
  'focus-outline-offset': TokenValue;
}

export interface AnchorLinkTheme {
  tokens?: Partial<AnchorLinkTokens>;
  cssProperties?: CSSProperties;
  tokenConfig?: ComponentTokenConfig;
}

export interface AnchorLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'size'> {
  variant?: AnchorLinkVariant;
  size?: AnchorLinkSize;
  underline?: AnchorLinkUnderline;
  disabled?: boolean;
  external?: boolean; // adds target="_blank" rel="noopener noreferrer"
  theme?: AnchorLinkTheme;
  children: React.ReactNode;
}

export const DEFAULT_ANCHOR_LINK_TOKENS: AnchorLinkTokens = {
  'color-foreground-default': '#2563eb',
  'color-foreground-primary': '#2563eb',
  'color-foreground-secondary': '#6b7280',
  'color-foreground-muted': '#9ca3af',
  'color-foreground-danger': '#dc2626',
  'color-foreground-hover': '#1d4ed8',
  'color-foreground-active': '#1e40af',
  'color-foreground-visited': '#7c3aed',
  'color-foreground-disabled': '#9ca3af',
  'color-underline': 'currentColor',
  'color-focus-ring': '#2563eb',

  'typography-fontFamily': 'inherit',
  'typography-fontWeight': 'inherit',
  'typography-lineHeight': 'inherit',
  'typography-textDecoration': 'underline',

  'size-small-fontSize': '14px',
  'size-medium-fontSize': '16px',
  'size-large-fontSize': '18px',

  'underline-thickness': '1px',
  'underline-offset': '2px',

  'transition-duration': '0.15s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'color, text-decoration-color',

  'focus-outline-width': '2px',
  'focus-outline-offset': '2px',
};

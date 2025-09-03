/**
 * Tag Component Types
 *
 * Defines TypeScript interfaces for Tag component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

export type TagSize = 'small' | 'medium' | 'large';
export type TagVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';
export type TagShape = 'rounded' | 'pill' | 'square';

export interface TagTokens {
  // Background colors
  'color-background-default': TokenValue;
  'color-background-primary': TokenValue;
  'color-background-secondary': TokenValue;
  'color-background-success': TokenValue;
  'color-background-warning': TokenValue;
  'color-background-danger': TokenValue;
  'color-background-info': TokenValue;

  // Foreground colors
  'color-foreground-default': TokenValue;
  'color-foreground-primary': TokenValue;
  'color-foreground-secondary': TokenValue;
  'color-foreground-success': TokenValue;
  'color-foreground-warning': TokenValue;
  'color-foreground-danger': TokenValue;
  'color-foreground-info': TokenValue;

  // Border colors
  'color-border-default': TokenValue;
  'color-border-primary': TokenValue;
  'color-border-secondary': TokenValue;
  'color-border-success': TokenValue;
  'color-border-warning': TokenValue;
  'color-border-danger': TokenValue;
  'color-border-info': TokenValue;

  // Interactive
  'hover-transform': TokenValue;
  'hover-boxShadow': TokenValue;
  'active-transform': TokenValue;

  // Size tokens
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

  // Layout
  'border-width': TokenValue;
  'border-radius-rounded': TokenValue;
  'border-radius-pill': TokenValue;
  'border-radius-square': TokenValue;

  // Typography
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;
  'typography-letterSpacing': TokenValue;
  'typography-textTransform': TokenValue;

  // Transition
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;
}

export interface TagTheme {
  tokens?: Partial<TagTokens>;
  cssProperties?: CSSProperties;
  tokenConfig?: ComponentTokenConfig;
}

export interface TagProps {
  children?: React.ReactNode;
  size?: TagSize;
  variant?: TagVariant;
  shape?: TagShape;
  theme?: TagTheme;
  className?: string;
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  icon?: React.ReactNode;
  iconPosition?: 'start' | 'end';
  dismissible?: boolean;
  onDismiss?: () => void;
  'aria-label'?: string;
  'data-testid'?: string;
}

export interface TagIconProps {
  children: React.ReactNode;
  size?: TagSize;
  position?: 'start' | 'end';
  className?: string;
}

export interface TagDismissProps {
  onDismiss: () => void;
  size?: TagSize;
  className?: string;
  'aria-label'?: string;
}

export const DEFAULT_TAG_TOKENS: TagTokens = {
  // Background
  'color-background-default': '#f5f5f5',
  'color-background-primary': '#d9292b',
  'color-background-secondary': '#6b7280',
  'color-background-success': '#336006',
  'color-background-warning': '#824500',
  'color-background-danger': '#ae0001',
  'color-background-info': '#0369a1',

  // Foreground
  'color-foreground-default': '#374151',
  'color-foreground-primary': '#ffffff',
  'color-foreground-secondary': '#ffffff',
  'color-foreground-success': '#ffffff',
  'color-foreground-warning': '#ffffff',
  'color-foreground-danger': '#ffffff',
  'color-foreground-info': '#ffffff',

  // Border
  'color-border-default': '#e5e7eb',
  'color-border-primary': '#d9292b',
  'color-border-secondary': '#6b7280',
  'color-border-success': '#336006',
  'color-border-warning': '#824500',
  'color-border-danger': '#ae0001',
  'color-border-info': '#0369a1',

  // Interactive
  'hover-transform': 'translateY(-1px)',
  'hover-boxShadow': '0 2px 4px rgb(0 0 0 / 10%)',
  'active-transform': 'translateY(0)',

  // Size
  'size-small-height': '24px',
  'size-small-padding': '2px 6px',
  'size-small-fontSize': '12px',
  'size-small-iconSize': '12px',
  'size-small-gap': '4px',
  'size-medium-height': '28px',
  'size-medium-padding': '4px 8px',
  'size-medium-fontSize': '13px',
  'size-medium-iconSize': '14px',
  'size-medium-gap': '6px',
  'size-large-height': '32px',
  'size-large-padding': '6px 12px',
  'size-large-fontSize': '14px',
  'size-large-iconSize': '16px',
  'size-large-gap': '8px',

  // Layout
  'border-width': '1px',
  'border-radius-rounded': '8px',
  'border-radius-pill': '1920px',
  'border-radius-square': '4px',

  // Typography
  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '500',
  'typography-lineHeight': '1',
  'typography-letterSpacing': '0.01em',
  'typography-textTransform': 'none',

  // Transition
  'transition-duration': '0.15s',
  'transition-easing': 'ease-in-out',
  'transition-properties':
    'background-color, border-color, color, transform, box-shadow',
};

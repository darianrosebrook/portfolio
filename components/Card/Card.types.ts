/**
 * Card Component Types
 */

import { CSSProperties, ReactNode, HTMLAttributes } from 'react';
import { ComponentTokenConfig, TokenValue } from '@/utils/designTokens';

export type CardVariant = 'default' | 'outlined' | 'elevated' | 'filled';
export type CardSize = 'small' | 'medium' | 'large';
export type CardOrientation = 'vertical' | 'horizontal';

export interface CardTokens {
  // Colors
  'color-background': TokenValue;
  'color-background-hover': TokenValue;
  'color-foreground': TokenValue;
  'color-border': TokenValue;
  'color-border-hover': TokenValue;
  'color-shadow': TokenValue;
  'color-shadow-hover': TokenValue;
  'color-focus-ring': TokenValue;

  // Typography
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;

  // Size
  'size-small-padding': TokenValue;
  'size-medium-padding': TokenValue;
  'size-large-padding': TokenValue;
  'size-small-gap': TokenValue;
  'size-medium-gap': TokenValue;
  'size-large-gap': TokenValue;
  'size-small-borderRadius': TokenValue;
  'size-medium-borderRadius': TokenValue;
  'size-large-borderRadius': TokenValue;

  // Layout
  'border-width': TokenValue;
  'image-aspectRatio': TokenValue;
  'image-borderRadius': TokenValue;

  // Transition
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;
}

export interface CardTheme {
  tokens?: Partial<CardTokens>;
  cssProperties?: CSSProperties;
  tokenConfig?: ComponentTokenConfig;
}

export interface CardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'size'> {
  variant?: CardVariant;
  size?: CardSize;
  orientation?: CardOrientation;
  interactive?: boolean; // makes card clickable/hoverable
  disabled?: boolean;
  theme?: CardTheme;
  children: ReactNode;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
}

export interface CardHeaderProps {
  title?: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;
  avatar?: ReactNode;
  children?: ReactNode;
  className?: string;
}

export interface CardMediaProps {
  src?: string;
  alt?: string;
  aspectRatio?: string;
  children?: ReactNode;
  className?: string;
}

export interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export interface CardActionsProps {
  children: ReactNode;
  alignment?: 'left' | 'center' | 'right' | 'space-between';
  className?: string;
}

export interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export const DEFAULT_CARD_TOKENS: CardTokens = {
  'color-background': '#ffffff',
  'color-background-hover': '#f9fafb',
  'color-foreground': '#111827',
  'color-border': '#e5e7eb',
  'color-border-hover': '#d1d5db',
  'color-shadow': '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
  'color-shadow-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  'color-focus-ring': '#2563eb',

  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '400',
  'typography-lineHeight': '1.5',

  'size-small-padding': '12px',
  'size-medium-padding': '16px',
  'size-large-padding': '24px',
  'size-small-gap': '8px',
  'size-medium-gap': '12px',
  'size-large-gap': '16px',
  'size-small-borderRadius': '6px',
  'size-medium-borderRadius': '8px',
  'size-large-borderRadius': '12px',

  'border-width': '1px',
  'image-aspectRatio': '16/9',
  'image-borderRadius': '6px',

  'transition-duration': '0.15s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'background-color, border-color, box-shadow, transform',
};

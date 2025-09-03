/**
 * Drawer Component Types
 */

import { CSSProperties, ReactNode } from 'react';
import { ComponentTokenConfig, TokenValue } from '@/utils/designTokens';

export type DrawerPlacement = 'left' | 'right' | 'top' | 'bottom';
export type DrawerSize = 'small' | 'medium' | 'large' | 'full';
export type DrawerVariant = 'default' | 'bordered' | 'elevated';

export interface DrawerTokens {
  // Colors
  'color-background': TokenValue;
  'color-background-overlay': TokenValue;
  'color-foreground': TokenValue;
  'color-border': TokenValue;
  'color-shadow': TokenValue;
  'color-focus-ring': TokenValue;

  // Typography
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;

  // Size
  'size-small-width': TokenValue;
  'size-medium-width': TokenValue;
  'size-large-width': TokenValue;
  'size-small-height': TokenValue;
  'size-medium-height': TokenValue;
  'size-large-height': TokenValue;
  'size-small-padding': TokenValue;
  'size-medium-padding': TokenValue;
  'size-large-padding': TokenValue;
  'size-small-gap': TokenValue;
  'size-medium-gap': TokenValue;
  'size-large-gap': TokenValue;

  // Layout
  'border-radius': TokenValue;
  'border-width': TokenValue;
  'z-index': TokenValue;
  'overlay-opacity': TokenValue;

  // Animation
  'animation-duration': TokenValue;
  'animation-easing': TokenValue;
  'animation-properties': TokenValue;
}

export interface DrawerTheme {
  tokens?: Partial<DrawerTokens>;
  cssProperties?: CSSProperties;
  tokenConfig?: ComponentTokenConfig;
}

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placement?: DrawerPlacement;
  size?: DrawerSize;
  variant?: DrawerVariant;
  title?: ReactNode;
  children: ReactNode;
  theme?: DrawerTheme;
  className?: string;
  overlayClassName?: string;
  contentClassName?: string;
  headerClassName?: string;
  bodyClassName?: string;
  footerClassName?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
  preventScroll?: boolean;
  trapFocus?: boolean;
  autoFocus?: boolean;
  returnFocusOnClose?: boolean;
  showCloseButton?: boolean;
  closeButtonAriaLabel?: string;
  header?: ReactNode;
  footer?: ReactNode;
  testId?: string;
}

export interface DrawerOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  closeOnOverlayClick?: boolean;
  className?: string;
  style?: CSSProperties;
}

export interface DrawerContentProps {
  placement: DrawerPlacement;
  size: DrawerSize;
  variant: DrawerVariant;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}

export interface DrawerHeaderProps {
  title?: ReactNode;
  onClose?: () => void;
  showCloseButton?: boolean;
  closeButtonAriaLabel?: string;
  children?: ReactNode;
  className?: string;
}

export interface DrawerBodyProps {
  children: ReactNode;
  className?: string;
}

export interface DrawerFooterProps {
  children: ReactNode;
  className?: string;
}

export const DEFAULT_DRAWER_TOKENS: DrawerTokens = {
  'color-background': '#ffffff',
  'color-background-overlay': 'rgba(0, 0, 0, 0.5)',
  'color-foreground': '#111827',
  'color-border': '#e5e7eb',
  'color-shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  'color-focus-ring': '#2563eb',

  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '600',
  'typography-lineHeight': '1.5',

  'size-small-width': '320px',
  'size-medium-width': '480px',
  'size-large-width': '640px',
  'size-small-height': '50vh',
  'size-medium-height': '70vh',
  'size-large-height': '90vh',
  'size-small-padding': '16px',
  'size-medium-padding': '24px',
  'size-large-padding': '32px',
  'size-small-gap': '12px',
  'size-medium-gap': '16px',
  'size-large-gap': '20px',

  'border-radius': '8px',
  'border-width': '1px',
  'z-index': '1000',
  'overlay-opacity': '0.5',

  'animation-duration': '0.3s',
  'animation-easing': 'ease-in-out',
  'animation-properties': 'transform, opacity',
};

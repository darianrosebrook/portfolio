/**
 * Modal Component Types
 *
 * Defines TypeScript interfaces for Modal component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * Modal size variants
 */
export type ModalSize = 'small' | 'medium' | 'large' | 'fullscreen';

/**
 * Modal animation variants
 */
export type ModalAnimation = 'fade' | 'scale' | 'slide-up' | 'slide-down';

/**
 * Modal design tokens interface
 */
export interface ModalTokens {
  // Overlay colors
  'color-overlay-background': TokenValue;
  'color-overlay-backdrop': TokenValue;

  // Modal colors
  'color-background-default': TokenValue;
  'color-foreground-default': TokenValue;
  'color-border-default': TokenValue;

  // Header colors
  'color-header-background': TokenValue;
  'color-header-foreground': TokenValue;
  'color-header-border': TokenValue;

  // Footer colors
  'color-footer-background': TokenValue;
  'color-footer-foreground': TokenValue;
  'color-footer-border': TokenValue;

  // Close button colors
  'color-close-background': TokenValue;
  'color-close-background-hover': TokenValue;
  'color-close-foreground': TokenValue;
  'color-close-foreground-hover': TokenValue;

  // Size tokens for each variant
  'size-small-width': TokenValue;
  'size-small-maxWidth': TokenValue;
  'size-small-maxHeight': TokenValue;
  'size-medium-width': TokenValue;
  'size-medium-maxWidth': TokenValue;
  'size-medium-maxHeight': TokenValue;
  'size-large-width': TokenValue;
  'size-large-maxWidth': TokenValue;
  'size-large-maxHeight': TokenValue;
  'size-fullscreen-width': TokenValue;
  'size-fullscreen-height': TokenValue;

  // Layout tokens
  'border-width': TokenValue;
  'border-radius': TokenValue;
  'shadow': TokenValue;
  'spacing-padding': TokenValue;
  'spacing-gap': TokenValue;
  'spacing-margin': TokenValue;

  // Header tokens
  'header-height': TokenValue;
  'header-padding': TokenValue;

  // Footer tokens
  'footer-height': TokenValue;
  'footer-padding': TokenValue;

  // Close button tokens
  'close-size': TokenValue;
  'close-padding': TokenValue;
  'close-border-radius': TokenValue;

  // Typography tokens
  'typography-fontFamily': TokenValue;
  'typography-title-fontSize': TokenValue;
  'typography-title-fontWeight': TokenValue;
  'typography-title-lineHeight': TokenValue;
  'typography-body-fontSize': TokenValue;
  'typography-body-fontWeight': TokenValue;
  'typography-body-lineHeight': TokenValue;

  // Animation tokens
  'animation-duration': TokenValue;
  'animation-easing': TokenValue;
  'animation-delay': TokenValue;

  // Z-index tokens
  'zIndex-overlay': TokenValue;
  'zIndex-modal': TokenValue;
}

/**
 * Modal theming options
 */
export interface ModalTheme {
  /** Custom token overrides */
  tokens?: Partial<ModalTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base Modal props
 */
export interface ModalProps {
  /** Whether modal is open */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Modal content */
  children: React.ReactNode;
  /** Visual size variant */
  size?: ModalSize;
  /** Animation variant */
  animation?: ModalAnimation;
  /** Custom theming */
  theme?: ModalTheme;
  /** Additional CSS class names */
  className?: string;
  /** Overlay class name */
  overlayClassName?: string;
  /** Modal title */
  title?: string;
  /** Whether to show header */
  showHeader?: boolean;
  /** Whether to show close button */
  showCloseButton?: boolean;
  /** Whether to show footer */
  showFooter?: boolean;
  /** Footer content */
  footer?: React.ReactNode;
  /** Whether clicking overlay closes modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing escape closes modal */
  closeOnEscape?: boolean;
  /** Whether to trap focus within modal */
  trapFocus?: boolean;
  /** Whether to restore focus on close */
  restoreFocus?: boolean;
  /** Whether to prevent body scroll */
  preventBodyScroll?: boolean;
  /** Custom close button content */
  closeButtonContent?: React.ReactNode;
  /** Portal container element */
  portalContainer?: HTMLElement;
  /** Initial focus element selector */
  initialFocus?: string;
  /** Return focus element selector */
  returnFocus?: string;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA labelledby for accessibility */
  'aria-labelledby'?: string;
  /** ARIA describedby for accessibility */
  'aria-describedby'?: string;
  /** Custom test ID */
  'data-testid'?: string;
  /** Callback when modal opens */
  onOpen?: () => void;
  /** Callback after modal opens */
  onAfterOpen?: () => void;
  /** Callback before modal closes */
  onBeforeClose?: () => void;
  /** Callback after modal closes */
  onAfterClose?: () => void;
}

/**
 * Modal overlay props
 */
export interface ModalOverlayProps {
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
  closeOnOverlayClick?: boolean;
  className?: string;
  theme?: ModalTheme;
}

/**
 * Modal container props
 */
export interface ModalContainerProps {
  children: React.ReactNode;
  size?: ModalSize;
  animation?: ModalAnimation;
  className?: string;
  theme?: ModalTheme;
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
}

/**
 * Modal header props
 */
export interface ModalHeaderProps {
  children?: React.ReactNode;
  title?: string;
  showCloseButton?: boolean;
  onClose?: () => void;
  closeButtonContent?: React.ReactNode;
  className?: string;
}

/**
 * Modal body props
 */
export interface ModalBodyProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Modal footer props
 */
export interface ModalFooterProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * Modal close button props
 */
export interface ModalCloseButtonProps {
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
  'aria-label'?: string;
}

/**
 * Default Modal token values
 */
export const DEFAULT_MODAL_TOKENS: ModalTokens = {
  // Overlay colors
  'color-overlay-background': 'rgba(0, 0, 0, 0.5)',
  'color-overlay-backdrop': 'rgba(0, 0, 0, 0.25)',

  // Modal colors
  'color-background-default': '#ffffff',
  'color-foreground-default': '#374151',
  'color-border-default': '#e5e7eb',

  // Header colors
  'color-header-background': '#ffffff',
  'color-header-foreground': '#111827',
  'color-header-border': '#e5e7eb',

  // Footer colors
  'color-footer-background': '#f9fafb',
  'color-footer-foreground': '#374151',
  'color-footer-border': '#e5e7eb',

  // Close button colors
  'color-close-background': 'transparent',
  'color-close-background-hover': '#f3f4f6',
  'color-close-foreground': '#6b7280',
  'color-close-foreground-hover': '#374151',

  // Size tokens
  'size-small-width': '400px',
  'size-small-maxWidth': '90vw',
  'size-small-maxHeight': '90vh',
  'size-medium-width': '600px',
  'size-medium-maxWidth': '90vw',
  'size-medium-maxHeight': '90vh',
  'size-large-width': '800px',
  'size-large-maxWidth': '95vw',
  'size-large-maxHeight': '95vh',
  'size-fullscreen-width': '100vw',
  'size-fullscreen-height': '100vh',

  // Layout tokens
  'border-width': '1px',
  'border-radius': '8px',
  'shadow': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  'spacing-padding': '24px',
  'spacing-gap': '16px',
  'spacing-margin': '16px',

  // Header tokens
  'header-height': '64px',
  'header-padding': '20px 24px',

  // Footer tokens
  'footer-height': 'auto',
  'footer-padding': '16px 24px 24px',

  // Close button tokens
  'close-size': '32px',
  'close-padding': '8px',
  'close-border-radius': '6px',

  // Typography tokens
  'typography-fontFamily': 'Inter, sans-serif',
  'typography-title-fontSize': '20px',
  'typography-title-fontWeight': '600',
  'typography-title-lineHeight': '1.3',
  'typography-body-fontSize': '16px',
  'typography-body-fontWeight': '400',
  'typography-body-lineHeight': '1.5',

  // Animation tokens
  'animation-duration': '0.3s',
  'animation-easing': 'cubic-bezier(0.4, 0, 0.2, 1)',
  'animation-delay': '0s',

  // Z-index tokens
  'zIndex-overlay': '1000',
  'zIndex-modal': '1001',
};

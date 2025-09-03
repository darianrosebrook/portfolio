/**
 * Input Component Types
 * 
 * Defines TypeScript interfaces for Input component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * Input size variants
 */
export type InputSize = 'small' | 'medium' | 'large';

/**
 * Input visual variants
 */
export type InputVariant = 'default' | 'filled' | 'outlined';

/**
 * Input state variants
 */
export type InputState = 'default' | 'error' | 'success' | 'warning';

/**
 * Input design tokens interface
 */
export interface InputTokens {
  // Color tokens for each state
  'color-background-default': TokenValue;
  'color-background-filled': TokenValue;
  'color-background-disabled': TokenValue;
  'color-background-readonly': TokenValue;
  'color-foreground-default': TokenValue;
  'color-foreground-placeholder': TokenValue;
  'color-foreground-disabled': TokenValue;
  'color-border-default': TokenValue;
  'color-border-hover': TokenValue;
  'color-border-focus': TokenValue;
  'color-border-error': TokenValue;
  'color-border-success': TokenValue;
  'color-border-warning': TokenValue;
  'color-border-disabled': TokenValue;

  // Size tokens for each variant
  'size-small-height': TokenValue;
  'size-small-padding': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-medium-height': TokenValue;
  'size-medium-padding': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-large-height': TokenValue;
  'size-large-padding': TokenValue;
  'size-large-fontSize': TokenValue;

  // Layout tokens
  'border-width': TokenValue;
  'border-radius': TokenValue;
  'outline-width': TokenValue;
  'outline-offset': TokenValue;

  // Typography tokens
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;
  'typography-letterSpacing': TokenValue;

  // Animation tokens
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;

  // Focus tokens
  'focus-outlineColor': TokenValue;
  'focus-boxShadow': TokenValue;

  // Spacing tokens
  'spacing-gap': TokenValue;
}

/**
 * Input theming options
 */
export interface InputTheme {
  /** Custom token overrides */
  tokens?: Partial<InputTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base Input props
 */
export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visual size variant */
  size?: InputSize;
  /** Visual style variant */
  variant?: InputVariant;
  /** Visual state for validation */
  state?: InputState;
  /** Label text */
  label?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Success message */
  successMessage?: string;
  /** Warning message */
  warningMessage?: string;
  /** Whether to show the label */
  showLabel?: boolean;
  /** Custom theming */
  theme?: InputTheme;
  /** Additional CSS class names */
  className?: string;
  /** Container class name */
  containerClassName?: string;
}

/**
 * Input wrapper props for the container
 */
export interface InputWrapperProps {
  children: React.ReactNode;
  className?: string;
  theme?: InputTheme;
}

/**
 * Input label props
 */
export interface InputLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Input message props for helper/error/success text
 */
export interface InputMessageProps {
  type: 'helper' | 'error' | 'success' | 'warning';
  children: React.ReactNode;
  className?: string;
}

/**
 * Default Input token values
 */
export const DEFAULT_INPUT_TOKENS: InputTokens = {
  // Color tokens
  'color-background-default': '#ffffff',
  'color-background-filled': '#f5f5f5',
  'color-background-disabled': '#f0f0f0',
  'color-background-readonly': '#fafafa',
  'color-foreground-default': '#141414',
  'color-foreground-placeholder': '#8f8f8f',
  'color-foreground-disabled': '#aeaeae',
  'color-border-default': '#cecece',
  'color-border-hover': '#aeaeae',
  'color-border-focus': '#d9292b',
  'color-border-error': '#ae0001',
  'color-border-success': '#336006',
  'color-border-warning': '#824500',
  'color-border-disabled': '#e0e0e0',

  // Size tokens
  'size-small-height': '32px',
  'size-small-padding': '8px 12px',
  'size-small-fontSize': '14px',
  'size-medium-height': '40px',
  'size-medium-padding': '12px 16px',
  'size-medium-fontSize': '16px',
  'size-large-height': '48px',
  'size-large-padding': '16px 20px',
  'size-large-fontSize': '18px',

  // Layout tokens
  'border-width': '1px',
  'border-radius': '8px',
  'outline-width': '2px',
  'outline-offset': '2px',

  // Typography tokens
  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '400',
  'typography-lineHeight': '1.5',
  'typography-letterSpacing': '0',

  // Animation tokens
  'transition-duration': '0.2s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'border-color, box-shadow, background-color',

  // Focus tokens
  'focus-outlineColor': '#d9292b',
  'focus-boxShadow': '0 0 0 3px rgba(217, 41, 43, 0.1)',

  // Spacing tokens
  'spacing-gap': '8px',
};

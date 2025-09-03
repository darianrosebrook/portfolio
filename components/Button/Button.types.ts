/**
 * Button Component Types
 *
 * Defines TypeScript interfaces for Button component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * Button size variants
 */
export type ButtonSize = 'small' | 'medium' | 'large';

/**
 * Button visual variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'tertiary';

/**
 * Button design tokens interface
 */
export interface ButtonTokens {
  // Color tokens
  'color-background-primary': TokenValue;
  'color-background-secondary': TokenValue;
  'color-background-tertiary': TokenValue;
  'color-background-disabled': TokenValue;
  'color-background-hover': TokenValue;
  'color-foreground-primary': TokenValue;
  'color-foreground-secondary': TokenValue;
  'color-foreground-tertiary': TokenValue;
  'color-foreground-disabled': TokenValue;
  'color-foreground-inverse': TokenValue;
  'color-border-primary': TokenValue;
  'color-border-secondary': TokenValue;
  'color-border-tertiary': TokenValue;
  'color-border-disabled': TokenValue;
  'color-border-hover': TokenValue;

  // Size tokens for each variant
  'size-small-minHeight': TokenValue;
  'size-small-minWidth': TokenValue;
  'size-small-padding': TokenValue;
  'size-small-gap': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-small-iconSize': TokenValue;
  'size-medium-minHeight': TokenValue;
  'size-medium-minWidth': TokenValue;
  'size-medium-padding': TokenValue;
  'size-medium-gap': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-medium-iconSize': TokenValue;
  'size-large-minHeight': TokenValue;
  'size-large-minWidth': TokenValue;
  'size-large-padding': TokenValue;
  'size-large-gap': TokenValue;
  'size-large-fontSize': TokenValue;
  'size-large-iconSize': TokenValue;

  // Layout tokens
  'radius-default': TokenValue;
  'border-width': TokenValue;
  'spacing-adjacent': TokenValue;

  // Typography tokens
  'typography-fontWeight': TokenValue;
  'typography-lineHeight': TokenValue;
  'typography-letterSpacing': TokenValue;

  // Animation tokens
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;

  // Focus tokens
  'focus-outlineWidth': TokenValue;
  'focus-outlineColor': TokenValue;
  'focus-outlineOffset': TokenValue;
}

/**
 * Button theming options
 */
export interface ButtonTheme {
  /** Custom token overrides */
  tokens?: Partial<ButtonTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base button props shared across implementations
 */
export interface ButtonBaseProps {
  /** Visual size variant */
  size?: ButtonSize;
  /** Visual style variant */
  variant?: ButtonVariant;
  /** Loading state */
  loading?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Accessible title/label */
  title?: string;
  /** Custom theming */
  theme?: ButtonTheme;
}

/**
 * Button as HTML button element
 */
export interface ButtonAsButton
  extends ButtonBaseProps,
    Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'className' | 'title'> {
  as?: 'button';
}

/**
 * Button as HTML anchor element
 */
export interface ButtonAsAnchor
  extends ButtonBaseProps,
    Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'className' | 'title'> {
  as: 'a';
  href: string;
}

/**
 * Union of all button prop types
 */
export type ButtonProps = ButtonAsButton | ButtonAsAnchor;

/**
 * Button token source configuration
 */
export interface ButtonTokenSource {
  /** Load tokens from JSON file */
  json?: ComponentTokenConfig;
  /** Load tokens from CSS variables */
  css?: Record<string, string>;
  /** Inline token definitions */
  inline?: Partial<ButtonTokens>;
}

/**
 * Button configuration for design system integration
 */
export interface ButtonConfig {
  /** Default token values */
  defaultTokens?: Partial<ButtonTokens>;
  /** Token sources in order of precedence */
  tokenSources?: ButtonTokenSource[];
  /** Global design system tokens */
  globalTokens?: Record<string, unknown>;
  /** CSS class name prefix */
  classPrefix?: string;
}

/**
 * Type guard to check if props are for button element
 */
export function isButtonElement(props: ButtonProps): props is ButtonAsButton {
  return !props.as || props.as === 'button';
}

/**
 * Type guard to check if props are for anchor element
 */
export function isAnchorElement(props: ButtonProps): props is ButtonAsAnchor {
  return props.as === 'a';
}

/**
 * Default button token values
 */
export const DEFAULT_BUTTON_TOKENS: ButtonTokens = {
  // Color tokens
  'color-background-primary': '#d9292b',
  'color-background-secondary': '#efefef',
  'color-background-tertiary': 'transparent',
  'color-background-disabled': '#cecece',
  'color-background-hover': '#aeaeae',
  'color-foreground-primary': '#141414',
  'color-foreground-secondary': '#d9292b',
  'color-foreground-tertiary': '#717171',
  'color-foreground-disabled': '#aeaeae',
  'color-foreground-inverse': '#fafafa',
  'color-border-primary': '#d9292b',
  'color-border-secondary': '#d9292b',
  'color-border-tertiary': '#cecece',
  'color-border-disabled': '#cecece',
  'color-border-hover': '#555555',

  // Size tokens
  'size-small-minHeight': '32px',
  'size-small-minWidth': '32px',
  'size-small-padding': '8px',
  'size-small-gap': '8px',
  'size-small-fontSize': '12px',
  'size-small-iconSize': '16px',
  'size-medium-minHeight': '40px',
  'size-medium-minWidth': '40px',
  'size-medium-padding': '12px',
  'size-medium-gap': '12px',
  'size-medium-fontSize': '16px',
  'size-medium-iconSize': '20px',
  'size-large-minHeight': '48px',
  'size-large-minWidth': '48px',
  'size-large-padding': '16px',
  'size-large-gap': '16px',
  'size-large-fontSize': '18px',
  'size-large-iconSize': '24px',

  // Layout tokens
  'radius-default': '1920px',
  'border-width': '1px',
  'spacing-adjacent': '12px',

  // Typography tokens
  'typography-fontWeight': '500',
  'typography-lineHeight': '1',
  'typography-letterSpacing': '0',

  // Animation tokens
  'transition-duration': '0.3s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'all',

  // Focus tokens
  'focus-outlineWidth': '2px',
  'focus-outlineColor': '#d9292b',
  'focus-outlineOffset': '8px',
};

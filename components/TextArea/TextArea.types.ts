/**
 * TextArea Component Types
 *
 * Defines TypeScript interfaces for TextArea component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * TextArea size variants
 */
export type TextAreaSize = 'small' | 'medium' | 'large';

/**
 * TextArea visual variants
 */
export type TextAreaVariant = 'default' | 'filled' | 'outlined';

/**
 * TextArea state variants
 */
export type TextAreaState = 'default' | 'error' | 'success' | 'warning';

/**
 * TextArea resize behavior
 */
export type TextAreaResize = 'none' | 'vertical' | 'horizontal' | 'both';

/**
 * TextArea design tokens interface
 */
export interface TextAreaTokens {
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
  'size-small-minHeight': TokenValue;
  'size-small-padding': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-medium-minHeight': TokenValue;
  'size-medium-padding': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-large-minHeight': TokenValue;
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

  // Resize tokens
  'resize-handle-color': TokenValue;
  'resize-handle-size': TokenValue;
}

/**
 * TextArea theming options
 */
export interface TextAreaTheme {
  /** Custom token overrides */
  tokens?: Partial<TextAreaTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base TextArea props
 */
export interface TextAreaProps
  extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'size'> {
  /** Visual size variant */
  size?: TextAreaSize;
  /** Visual style variant */
  variant?: TextAreaVariant;
  /** Visual state for validation */
  state?: TextAreaState;
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
  theme?: TextAreaTheme;
  /** Additional CSS class names */
  className?: string;
  /** Container class name */
  containerClassName?: string;
  /** Resize behavior */
  resize?: TextAreaResize;
  /** Character count display */
  showCharacterCount?: boolean;
  /** Maximum character limit */
  maxLength?: number;
  /** Minimum number of rows */
  minRows?: number;
  /** Maximum number of rows */
  maxRows?: number;
  /** Auto-resize behavior */
  autoResize?: boolean;
}

/**
 * TextArea wrapper props for the container
 */
export interface TextAreaWrapperProps {
  children: React.ReactNode;
  className?: string;
  theme?: TextAreaTheme;
}

/**
 * TextArea label props
 */
export interface TextAreaLabelProps {
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * TextArea message props for helper/error/success text
 */
export interface TextAreaMessageProps {
  type: 'helper' | 'error' | 'success' | 'warning';
  children: React.ReactNode;
  className?: string;
}

/**
 * TextArea character count props
 */
export interface TextAreaCharacterCountProps {
  current: number;
  max?: number;
  className?: string;
}

/**
 * Default TextArea token values
 */
export const DEFAULT_TEXTAREA_TOKENS: TextAreaTokens = {
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
  'size-small-minHeight': '80px',
  'size-small-padding': '8px 12px',
  'size-small-fontSize': '14px',
  'size-medium-minHeight': '120px',
  'size-medium-padding': '12px 16px',
  'size-medium-fontSize': '16px',
  'size-large-minHeight': '160px',
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

  // Resize tokens
  'resize-handle-color': '#cecece',
  'resize-handle-size': '16px',
};

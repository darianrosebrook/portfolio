/**
 * Radio Component Types
 *
 * Defines TypeScript interfaces for Radio component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * Radio size variants
 */
export type RadioSize = 'small' | 'medium' | 'large';

/**
 * Radio visual variants
 */
export type RadioVariant = 'default' | 'success' | 'warning' | 'danger';

/**
 * Radio state variants
 */
export type RadioState = 'default' | 'error' | 'success' | 'warning';

/**
 * Radio design tokens interface
 */
export interface RadioTokens {
  // Circle (radio) colors
  'color-circle-unchecked': TokenValue;
  'color-circle-checked': TokenValue;
  'color-circle-disabled': TokenValue;
  'color-circle-hover': TokenValue;
  'color-circle-focus': TokenValue;

  // Border colors
  'color-border-unchecked': TokenValue;
  'color-border-checked': TokenValue;
  'color-border-disabled': TokenValue;
  'color-border-hover': TokenValue;
  'color-border-focus': TokenValue;
  'color-border-error': TokenValue;
  'color-border-success': TokenValue;
  'color-border-warning': TokenValue;

  // Dot colors
  'color-dot-default': TokenValue;
  'color-dot-disabled': TokenValue;

  // Label colors
  'color-label-default': TokenValue;
  'color-label-disabled': TokenValue;

  // Size tokens for each variant
  'size-small-circleSize': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-small-gap': TokenValue;
  'size-small-dotSize': TokenValue;
  'size-medium-circleSize': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-medium-gap': TokenValue;
  'size-medium-dotSize': TokenValue;
  'size-large-circleSize': TokenValue;
  'size-large-fontSize': TokenValue;
  'size-large-gap': TokenValue;
  'size-large-dotSize': TokenValue;

  // Layout tokens
  'border-width': TokenValue;
  'border-radius': TokenValue;
  'dot-borderRadius': TokenValue;

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
  'focus-outlineWidth': TokenValue;
  'focus-outlineOffset': TokenValue;
  'focus-boxShadow': TokenValue;
}

/**
 * Radio theming options
 */
export interface RadioTheme {
  /** Custom token overrides */
  tokens?: Partial<RadioTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Radio option for RadioGroup
 */
export interface RadioOption {
  /** Option value */
  value: string;
  /** Option label */
  label: React.ReactNode;
  /** Whether this option is disabled */
  disabled?: boolean;
  /** Helper text for this option */
  helperText?: string;
}

/**
 * Base Radio props
 */
export interface RadioProps {
  /** Whether the radio is checked */
  checked?: boolean;
  /** Whether the radio is disabled */
  disabled?: boolean;
  /** Change handler */
  onChange?: (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  /** Label content */
  children?: React.ReactNode;
  /** Radio value */
  value: string;
  /** Radio name (for grouping) */
  name: string;
  /** Visual size variant */
  size?: RadioSize;
  /** Visual style variant */
  variant?: RadioVariant;
  /** Visual state for validation */
  state?: RadioState;
  /** Custom theming */
  theme?: RadioTheme;
  /** Additional CSS class names */
  className?: string;
  /** Container class name */
  containerClassName?: string;
  /** Input element ID */
  id?: string;
  /** Whether the radio is required */
  required?: boolean;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA described by for accessibility */
  'aria-describedby'?: string;
  /** Helper text */
  helperText?: string;
  /** Error message */
  errorMessage?: string;
  /** Success message */
  successMessage?: string;
  /** Warning message */
  warningMessage?: string;
}

/**
 * RadioGroup props for managing multiple radio buttons
 */
export interface RadioGroupProps {
  /** Current selected value */
  value?: string;
  /** Default selected value */
  defaultValue?: string;
  /** Change handler */
  onChange?: (
    value: string,
    event: React.ChangeEvent<HTMLInputElement>
  ) => void;
  /** Radio options */
  options: RadioOption[];
  /** Group name */
  name: string;
  /** Group label */
  label?: string;
  /** Whether any option is required */
  required?: boolean;
  /** Whether the group is disabled */
  disabled?: boolean;
  /** Visual size variant */
  size?: RadioSize;
  /** Visual style variant */
  variant?: RadioVariant;
  /** Visual state for validation */
  state?: RadioState;
  /** Custom theming */
  theme?: RadioTheme;
  /** Additional CSS class names */
  className?: string;
  /** Container class name */
  containerClassName?: string;
  /** Layout orientation */
  orientation?: 'vertical' | 'horizontal';
  /** Error message for the group */
  errorMessage?: string;
  /** Success message for the group */
  successMessage?: string;
  /** Warning message for the group */
  warningMessage?: string;
  /** Helper text for the group */
  helperText?: string;
}

/**
 * Radio wrapper props
 */
export interface RadioWrapperProps {
  children: React.ReactNode;
  className?: string;
  theme?: RadioTheme;
}

/**
 * Radio input props
 */
export interface RadioInputProps {
  id: string;
  checked?: boolean;
  disabled?: boolean;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  value: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

/**
 * Radio label props
 */
export interface RadioLabelProps {
  htmlFor: string;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * Radio message props
 */
export interface RadioMessageProps {
  type: 'helper' | 'error' | 'success' | 'warning';
  children: React.ReactNode;
  className?: string;
}

/**
 * Default Radio token values
 */
export const DEFAULT_RADIO_TOKENS: RadioTokens = {
  // Circle colors
  'color-circle-unchecked': '#ffffff',
  'color-circle-checked': '#ffffff',
  'color-circle-disabled': '#f0f0f0',
  'color-circle-hover': '#f5f5f5',
  'color-circle-focus': '#ffffff',

  // Border colors
  'color-border-unchecked': '#cecece',
  'color-border-checked': '#d9292b',
  'color-border-disabled': '#e0e0e0',
  'color-border-hover': '#aeaeae',
  'color-border-focus': '#d9292b',
  'color-border-error': '#ae0001',
  'color-border-success': '#336006',
  'color-border-warning': '#824500',

  // Dot colors
  'color-dot-default': '#d9292b',
  'color-dot-disabled': '#aeaeae',

  // Label colors
  'color-label-default': '#141414',
  'color-label-disabled': '#aeaeae',

  // Size tokens
  'size-small-circleSize': '16px',
  'size-small-fontSize': '12px',
  'size-small-gap': '6px',
  'size-small-dotSize': '6px',
  'size-medium-circleSize': '20px',
  'size-medium-fontSize': '14px',
  'size-medium-gap': '8px',
  'size-medium-dotSize': '8px',
  'size-large-circleSize': '24px',
  'size-large-fontSize': '16px',
  'size-large-gap': '10px',
  'size-large-dotSize': '10px',

  // Layout tokens
  'border-width': '1px',
  'border-radius': '50%',
  'dot-borderRadius': '50%',

  // Typography tokens
  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '400',
  'typography-lineHeight': '1.5',
  'typography-letterSpacing': '0',

  // Animation tokens
  'transition-duration': '0.2s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'background-color, border-color, transform',

  // Focus tokens
  'focus-outlineColor': '#d9292b',
  'focus-outlineWidth': '2px',
  'focus-outlineOffset': '2px',
  'focus-boxShadow': '0 0 0 3px rgba(217, 41, 43, 0.1)',
};

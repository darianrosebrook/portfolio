/**
 * ToggleSwitch Component Types
 * 
 * Defines TypeScript interfaces for ToggleSwitch component props and design tokens
 */

import { CSSProperties } from 'react';
import { TokenValue, ComponentTokenConfig } from '@/utils/designTokens';

/**
 * ToggleSwitch size variants
 */
export type ToggleSwitchSize = 'small' | 'medium' | 'large';

/**
 * ToggleSwitch visual variants
 */
export type ToggleSwitchVariant = 'default' | 'success' | 'warning' | 'danger';

/**
 * ToggleSwitch design tokens interface
 */
export interface ToggleSwitchTokens {
  // Track (background) colors
  'color-track-unchecked': TokenValue;
  'color-track-checked': TokenValue;
  'color-track-disabled': TokenValue;
  'color-track-hover': TokenValue;
  'color-track-focus': TokenValue;

  // Thumb (handle) colors
  'color-thumb-unchecked': TokenValue;
  'color-thumb-checked': TokenValue;
  'color-thumb-disabled': TokenValue;
  'color-thumb-hover': TokenValue;

  // Border colors
  'color-border-unchecked': TokenValue;
  'color-border-checked': TokenValue;
  'color-border-disabled': TokenValue;
  'color-border-focus': TokenValue;

  // Label colors
  'color-label-default': TokenValue;
  'color-label-disabled': TokenValue;

  // Size tokens for each variant
  'size-small-trackWidth': TokenValue;
  'size-small-trackHeight': TokenValue;
  'size-small-thumbSize': TokenValue;
  'size-small-thumbOffset': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-small-gap': TokenValue;
  'size-medium-trackWidth': TokenValue;
  'size-medium-trackHeight': TokenValue;
  'size-medium-thumbSize': TokenValue;
  'size-medium-thumbOffset': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-medium-gap': TokenValue;
  'size-large-trackWidth': TokenValue;
  'size-large-trackHeight': TokenValue;
  'size-large-thumbSize': TokenValue;
  'size-large-thumbOffset': TokenValue;
  'size-large-fontSize': TokenValue;
  'size-large-gap': TokenValue;

  // Layout tokens
  'border-width': TokenValue;
  'border-radius': TokenValue;
  'thumb-borderRadius': TokenValue;

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
}

/**
 * ToggleSwitch theming options
 */
export interface ToggleSwitchTheme {
  /** Custom token overrides */
  tokens?: Partial<ToggleSwitchTokens>;
  /** Custom CSS properties */
  cssProperties?: CSSProperties;
  /** External token configuration */
  tokenConfig?: ComponentTokenConfig;
}

/**
 * Base ToggleSwitch props
 */
export interface ToggleSwitchProps {
  /** Whether the toggle is checked */
  checked: boolean;
  /** Whether the toggle is disabled */
  disabled?: boolean;
  /** Change handler */
  onChange: (checked: boolean, event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Label content */
  children: React.ReactNode;
  /** Visual size variant */
  size?: ToggleSwitchSize;
  /** Visual style variant */
  variant?: ToggleSwitchVariant;
  /** Custom theming */
  theme?: ToggleSwitchTheme;
  /** Additional CSS class names */
  className?: string;
  /** Input element ID */
  id?: string;
  /** Input name attribute */
  name?: string;
  /** Input value attribute */
  value?: string;
  /** Whether the toggle is required */
  required?: boolean;
  /** ARIA label for accessibility */
  'aria-label'?: string;
  /** ARIA described by for accessibility */
  'aria-describedby'?: string;
}

/**
 * ToggleSwitch label props
 */
export interface ToggleSwitchLabelProps {
  htmlFor: string;
  checked: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  className?: string;
}

/**
 * ToggleSwitch input props
 */
export interface ToggleSwitchInputProps {
  id: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  value?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
  className?: string;
}

/**
 * Default ToggleSwitch token values
 */
export const DEFAULT_TOGGLE_SWITCH_TOKENS: ToggleSwitchTokens = {
  // Track colors
  'color-track-unchecked': '#e5e5e5',
  'color-track-checked': '#d9292b',
  'color-track-disabled': '#f0f0f0',
  'color-track-hover': '#d0d0d0',
  'color-track-focus': '#d9292b',

  // Thumb colors
  'color-thumb-unchecked': '#ffffff',
  'color-thumb-checked': '#ffffff',
  'color-thumb-disabled': '#f5f5f5',
  'color-thumb-hover': '#ffffff',

  // Border colors
  'color-border-unchecked': '#cecece',
  'color-border-checked': '#d9292b',
  'color-border-disabled': '#e0e0e0',
  'color-border-focus': '#d9292b',

  // Label colors
  'color-label-default': '#141414',
  'color-label-disabled': '#aeaeae',

  // Size tokens
  'size-small-trackWidth': '36px',
  'size-small-trackHeight': '20px',
  'size-small-thumbSize': '16px',
  'size-small-thumbOffset': '2px',
  'size-small-fontSize': '12px',
  'size-small-gap': '6px',
  'size-medium-trackWidth': '48px',
  'size-medium-trackHeight': '24px',
  'size-medium-thumbSize': '20px',
  'size-medium-thumbOffset': '2px',
  'size-medium-fontSize': '14px',
  'size-medium-gap': '8px',
  'size-large-trackWidth': '56px',
  'size-large-trackHeight': '28px',
  'size-large-thumbSize': '24px',
  'size-large-thumbOffset': '2px',
  'size-large-fontSize': '16px',
  'size-large-gap': '10px',

  // Layout tokens
  'border-width': '1px',
  'border-radius': '1920px',
  'thumb-borderRadius': '1920px',

  // Typography tokens
  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '400',
  'typography-lineHeight': '1.2',
  'typography-letterSpacing': '0',

  // Animation tokens
  'transition-duration': '0.3s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'all',

  // Focus tokens
  'focus-outlineColor': '#d9292b',
  'focus-outlineWidth': '2px',
  'focus-outlineOffset': '2px',
};

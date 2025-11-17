/**
 * Shared Component Type Definitions
 *
 * Comprehensive type definitions for component props, ensuring
 * consistency and type safety across the component library.
 */

import React from 'react';

// Base component props that all components should extend
export interface BaseComponentProps {
  /** Additional CSS classes */
  className?: string;

  /** Test identifier for testing */
  'data-testid'?: string;

  /** Child elements */
  children?: React.ReactNode;
}

// Interactive component props (for components that can be focused/interacted with)
export interface InteractiveComponentProps extends BaseComponentProps {
  /** Whether the component is disabled */
  disabled?: boolean;

  /** Tab index for keyboard navigation */
  tabIndex?: number;

  /** Focus event handler */
  onFocus?: React.FocusEventHandler;

  /** Blur event handler */
  onBlur?: React.FocusEventHandler;
}

// Form field component props
export interface FormFieldProps extends InteractiveComponentProps {
  /** Whether the field is required */
  required?: boolean;

  /** Whether the field has an error */
  invalid?: boolean;

  /** Whether the field is read-only */
  readOnly?: boolean;

  /** Field name for form submission */
  name?: string;

  /** Field value */
  value?: any;

  /** Value change handler */
  onChange?: (value: any) => void;

  /** Blur handler */
  onBlur?: React.FocusEventHandler;

  /** Focus handler */
  onFocus?: React.FocusEventHandler;
}

// Size variants
export type ComponentSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

// Visual variants
export type ComponentVariant =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'tertiary'
  | 'ghost'
  | 'destructive'
  | 'outline'
  | 'success'
  | 'warning'
  | 'info';

// Intent variants (for status/feedback)
export type ComponentIntent = 'success' | 'warning' | 'error' | 'info';

// Layout orientation
export type Orientation = 'horizontal' | 'vertical';

// Alignment options
export type Alignment = 'start' | 'center' | 'end' | 'stretch';

// Polymorphic component ref type
export type PolymorphicRef<T extends React.ElementType> =
  React.ComponentPropsWithRef<T>['ref'];

// Event handler types
export type ChangeHandler<T = any> = (
  value: T,
  event?: React.ChangeEvent
) => void;
export type ClickHandler = (event: React.MouseEvent) => void;
export type FocusHandler = (event: React.FocusEvent) => void;
export type KeyboardHandler = (event: React.KeyboardEvent) => void;
export type MouseHandler = (event: React.MouseEvent) => void;
export type TouchHandler = (event: React.TouchEvent) => void;

// Generic event handler
export type EventHandler<
  T extends React.SyntheticEvent = React.SyntheticEvent,
> = (event: T) => void;

// Component state types
export interface LoadingState {
  isLoading: boolean;
  loadingText?: string;
}

export interface ErrorState {
  hasError: boolean;
  error?: Error | string;
  errorId?: string;
}

export interface ValidationState {
  isValid: boolean;
  validationMessage?: string;
  validationId?: string;
}

// ARIA attributes helper type
export interface AriaAttributes {
  'aria-label'?: string;
  'aria-labelledby'?: string;
  'aria-describedby'?: string;
  'aria-required'?: boolean;
  'aria-invalid'?: boolean;
  'aria-expanded'?: boolean;
  'aria-pressed'?: boolean;
  'aria-checked'?: boolean | 'mixed';
  'aria-selected'?: boolean;
  'aria-current'?: boolean | 'page' | 'step' | 'location' | 'date' | 'time';
  'aria-disabled'?: boolean;
  'aria-hidden'?: boolean;
  'aria-live'?: 'off' | 'assertive' | 'polite';
  'aria-atomic'?: boolean;
  role?: React.AriaRole;
}

// Form control types
export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
  group?: string;
}

export interface CheckboxOption extends SelectOption {
  checked?: boolean;
  indeterminate?: boolean;
}

export interface RadioOption extends SelectOption {
  selected?: boolean;
}

// Modal/Dialog types
export interface ModalState {
  isOpen: boolean;
  triggerElement?: HTMLElement;
}

export interface DialogProps extends BaseComponentProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  size?: ComponentSize;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  preventScroll?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
}

// Tooltip/Popover positioning
export interface Position {
  top: number;
  left: number;
  transform?: string;
}

export interface PositioningOptions {
  placement?: 'top' | 'bottom' | 'left' | 'right' | 'auto';
  offset?: number;
  flip?: boolean;
  boundary?: Element | 'viewport' | 'scrollParent';
  preventOverflow?: boolean;
}

// Animation types
export interface AnimationConfig {
  duration?: number;
  easing?: string;
  delay?: number;
}

export interface TransitionConfig extends AnimationConfig {
  property?: string | string[];
  from?: Record<string, any>;
  to?: Record<string, any>;
}

// Performance monitoring types
export interface ComponentMetrics {
  renderCount: number;
  lastRenderTime: number;
  totalRenderTime: number;
  averageRenderTime: number;
}

// Utility types for component composition
export type ComponentWithRef<
  T extends React.ElementType,
  P = {},
> = React.ForwardRefExoticComponent<
  React.ComponentPropsWithoutRef<T> & P & React.RefAttributes<any>
>;

export type MergeProps<T, U> = Omit<T, keyof U> & U;

export type DistributiveOmit<T, K extends keyof T> = T extends any
  ? Omit<T, K>
  : never;

// Hook return types
export interface UseToggleReturn {
  isOn: boolean;
  toggle: () => void;
  setOn: () => void;
  setOff: () => void;
}

export interface UseDisclosureReturn {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
  onToggle: () => void;
}

export interface UseControllableStateReturn<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  isControlled: boolean;
}

// Theme and styling types
export interface ThemeColors {
  primary: string;
  secondary: string;
  success: string;
  warning: string;
  error: string;
  info: string;
  background: string;
  surface: string;
  text: {
    primary: string;
    secondary: string;
    disabled: string;
  };
}

export interface ThemeSpacing {
  xs: string;
  sm: string;
  md: string;
  lg: string;
  xl: string;
  xxl: string;
}

export interface ThemeTypography {
  fontFamily: string;
  fontSize: Record<ComponentSize, string>;
  fontWeight: {
    light: number;
    regular: number;
    medium: number;
    semibold: number;
    bold: number;
  };
  lineHeight: {
    tight: number;
    normal: number;
    relaxed: number;
  };
}

export interface Theme {
  colors: ThemeColors;
  spacing: ThemeSpacing;
  typography: ThemeTypography;
  borderRadius: Record<ComponentSize, string>;
  shadows: string[];
  transitions: {
    fast: string;
    normal: string;
    slow: string;
  };
}

// Export commonly used combinations
export type ButtonProps = InteractiveComponentProps & {
  variant?: ComponentVariant;
  size?: ComponentSize;
  loading?: boolean;
  fullWidth?: boolean;
  onClick?: ClickHandler;
};

export type InputProps = FormFieldProps & {
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url' | 'search';
  placeholder?: string;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  autoComplete?: string;
  autoFocus?: boolean;
};

export type SelectProps = FormFieldProps & {
  options: SelectOption[];
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  loading?: boolean;
  maxHeight?: number;
};

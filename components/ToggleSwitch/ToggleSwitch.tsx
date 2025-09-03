'use client';
import React, { useMemo, useId } from 'react';
import styles from './ToggleSwitch.module.scss';
import {
  ToggleSwitchProps,
  ToggleSwitchLabelProps,
  ToggleSwitchInputProps,
  ToggleSwitchTheme,
  DEFAULT_TOGGLE_SWITCH_TOKENS,
} from './ToggleSwitch.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './ToggleSwitch.tokens.json';

/**
 * Custom hook for managing ToggleSwitch design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useToggleSwitchTokens(
  theme?: ToggleSwitchTheme,
  _size = 'medium',
  _variant = 'default'
) {
  return useMemo(() => {
    const tokenSources: TokenSource[] = [];

    // 1. Start with JSON token configuration
    tokenSources.push({
      type: 'json',
      data: defaultTokenConfig,
    });

    // 2. Add external token config if provided
    if (theme?.tokenConfig) {
      tokenSources.push({
        type: 'json',
        data: theme.tokenConfig,
      });
    }

    // 3. Add inline token overrides
    if (theme?.tokens) {
      const inlineTokens: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([key, value]) => {
        inlineTokens[`toggle-${key}`] = value;
      });

      tokenSources.push({
        type: 'inline',
        tokens: inlineTokens,
      });
    }

    // Merge all token sources with fallbacks
    const resolvedTokens = mergeTokenSources(tokenSources, {
      fallbacks: (() => {
        const fallbacks: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_TOGGLE_SWITCH_TOKENS).forEach(([key, value]) => {
          fallbacks[`toggle-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'toggle');

    // Add any direct CSS property overrides
    if (theme?.cssProperties) {
      Object.assign(cssProperties, theme.cssProperties);
    }

    return {
      tokens: resolvedTokens,
      cssProperties,
    };
  }, [theme]);
}

/**
 * ToggleSwitch Input Component
 */
const ToggleSwitchInput: React.FC<ToggleSwitchInputProps> = ({
  id,
  checked,
  disabled = false,
  onChange,
  name,
  value,
  required = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  className = '',
}) => (
  <input
    type="checkbox"
    id={id}
    checked={checked}
    disabled={disabled}
    onChange={onChange}
    name={name}
    value={value}
    required={required}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    className={`${styles.toggleInput} ${checked ? styles.checked : ''} ${className}`}
  />
);

/**
 * ToggleSwitch Label Component
 */
const ToggleSwitchLabel: React.FC<ToggleSwitchLabelProps> = ({
  htmlFor,
  checked,
  disabled = false,
  children,
  className = '',
}) => (
  <label
    htmlFor={htmlFor}
    className={`${styles.toggleLabel} ${checked ? styles.checked : ''} ${
      disabled ? styles.disabled : ''
    } ${className}`}
  >
    {children}
  </label>
);

/**
 * ToggleSwitch Component with Design Token Support
 * 
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Accessibility-first design
 * - Multiple sizes and variants
 * - Smooth animations with token-based timing
 */
const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
  checked,
  disabled = false,
  onChange,
  children,
  size = 'medium',
  variant = 'default',
  theme,
  className = '',
  id,
  name,
  value,
  required = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
}) => {
  // Generate unique ID if not provided
  const toggleId = id || `toggle-${useId()}`;

  // Load and resolve design tokens
  const { cssProperties } = useToggleSwitchTokens(theme, size, variant);

  // Safe validation for props
  const safeChecked = safeTokenValue(
    checked,
    false,
    (val) => typeof val === 'boolean'
  ) as boolean;

  const safeDisabled = safeTokenValue(
    disabled,
    false,
    (val) => typeof val === 'boolean'
  ) as boolean;

  const safeSize = safeTokenValue(
    size,
    'medium',
    (val) => ['small', 'medium', 'large'].includes(val as string)
  ) as string;

  const safeVariant = safeTokenValue(
    variant,
    'default',
    (val) => ['default', 'success', 'warning', 'danger'].includes(val as string)
  ) as string;

  // Handle change events with enhanced callback
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!safeDisabled) {
      onChange(event.target.checked, event);
    }
  };

  // Generate CSS classes with safe defaults
  const containerClasses = [
    styles.toggleSwitch,
    styles[`toggleSwitch--${safeSize}`] || '',
    styles[`toggleSwitch--${safeVariant}`] || '',
    safeChecked ? styles.checked : '',
    safeDisabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={containerClasses} style={cssProperties}>
      <ToggleSwitchInput
        id={toggleId}
        checked={safeChecked}
        disabled={safeDisabled}
        onChange={handleChange}
        name={name}
        value={value}
        required={required}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
      />
      <ToggleSwitchLabel
        htmlFor={toggleId}
        checked={safeChecked}
        disabled={safeDisabled}
      >
        {children}
      </ToggleSwitchLabel>
    </div>
  );
};

// Export sub-components for advanced usage
export { ToggleSwitchInput, ToggleSwitchLabel };
export default ToggleSwitch;
export type { ToggleSwitchProps, ToggleSwitchTheme } from './ToggleSwitch.types';

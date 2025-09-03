import React, { useMemo, useId, useRef, useEffect } from 'react';
import styles from './Checkbox.module.scss';
import {
  CheckboxProps,
  CheckboxWrapperProps,
  CheckboxInputProps,
  CheckboxLabelProps,
  CheckboxMessageProps,
  CheckboxTheme,
  DEFAULT_CHECKBOX_TOKENS,
} from './Checkbox.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './Checkbox.tokens.json';

/**
 * Custom hook for managing Checkbox design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useCheckboxTokens(
  theme?: CheckboxTheme,
  _size = 'medium',
  _variant = 'default',
  _state = 'default'
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
        inlineTokens[`checkbox-${key}`] = value;
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
        Object.entries(DEFAULT_CHECKBOX_TOKENS).forEach(([key, value]) => {
          fallbacks[`checkbox-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'checkbox');

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
 * Checkbox Wrapper Component
 */
const CheckboxWrapper: React.FC<CheckboxWrapperProps> = ({
  children,
  className = '',
  theme,
}) => {
  const { cssProperties } = useCheckboxTokens(theme);

  return (
    <div
      className={`${styles.checkboxWrapper} ${className}`}
      style={cssProperties}
    >
      {children}
    </div>
  );
};

/**
 * Checkbox Input Component
 */
const CheckboxInput: React.FC<CheckboxInputProps> = ({
  id,
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  name,
  value,
  required = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  className = '',
}) => {
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle indeterminate state
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  return (
    <input
      ref={inputRef}
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
      className={`${styles.checkboxInput} ${className}`}
    />
  );
};

/**
 * Checkbox Label Component
 */
const CheckboxLabel: React.FC<CheckboxLabelProps> = ({
  htmlFor,
  disabled = false,
  children,
  className = '',
}) => (
  <label
    htmlFor={htmlFor}
    className={`${styles.checkboxLabel} ${disabled ? styles.disabled : ''} ${className}`}
  >
    {children}
  </label>
);

/**
 * Checkbox Message Component
 */
const CheckboxMessage: React.FC<CheckboxMessageProps> = ({
  type,
  children,
  className = '',
}) => {
  const messageClass =
    styles[`checkboxMessage--${type}`] || styles.checkboxMessage;

  return (
    <div className={`${styles.checkboxMessage} ${messageClass} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Checkmark Icon Component
 */
const CheckmarkIcon: React.FC<{ size?: string; className?: string }> = ({
  size = '12',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M10 3L4.5 8.5L2 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * Indeterminate Icon Component
 */
const IndeterminateIcon: React.FC<{ size?: string; className?: string }> = ({
  size = '12',
  className = '',
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 12"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    <path
      d="M2 6H10"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    />
  </svg>
);

/**
 * Checkbox Component with Design Token Support
 *
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Accessibility-first design
 * - Multiple sizes, variants, and states
 * - Indeterminate state support
 * - Integrated validation messages
 */
const Checkbox: React.FC<CheckboxProps> = ({
  checked = false,
  indeterminate = false,
  disabled = false,
  onChange,
  children,
  size = 'medium',
  variant = 'default',
  state = 'default',
  theme,
  className = '',
  containerClassName = '',
  id,
  name,
  value,
  required = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  helperText,
  errorMessage,
  successMessage,
  warningMessage,
}) => {
  // Generate unique ID if not provided
  const checkboxId = id || `checkbox-${useId()}`;

  // Load and resolve design tokens
  const { cssProperties } = useCheckboxTokens(theme, size, variant, state);

  // Determine the current state based on props and messages
  const currentState = useMemo(() => {
    if (errorMessage) return 'error';
    if (successMessage) return 'success';
    if (warningMessage) return 'warning';
    return state;
  }, [state, errorMessage, successMessage, warningMessage]);

  // Safe validation for props
  const safeChecked = safeTokenValue(
    checked,
    false,
    (val) => typeof val === 'boolean'
  ) as boolean;

  const safeIndeterminate = safeTokenValue(
    indeterminate,
    false,
    (val) => typeof val === 'boolean'
  ) as boolean;

  const safeDisabled = safeTokenValue(
    disabled,
    false,
    (val) => typeof val === 'boolean'
  ) as boolean;

  const safeSize = safeTokenValue(size, 'medium', (val) =>
    ['small', 'medium', 'large'].includes(val as string)
  ) as string;

  const safeVariant = safeTokenValue(variant, 'default', (val) =>
    ['default', 'success', 'warning', 'danger'].includes(val as string)
  ) as string;

  // Handle change events
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!safeDisabled && onChange) {
      onChange(event.target.checked, event);
    }
  };

  // Generate CSS classes
  const containerClasses = [
    styles.checkbox,
    styles[`checkbox--${safeSize}`] || '',
    styles[`checkbox--${safeVariant}`] || '',
    styles[`checkbox--${currentState}`] || '',
    safeChecked ? styles.checked : '',
    safeIndeterminate ? styles.indeterminate : '',
    safeDisabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Determine which message to show (priority: error > warning > success > helper)
  const messageToShow =
    errorMessage || warningMessage || successMessage || helperText;
  const messageType = errorMessage
    ? 'error'
    : warningMessage
      ? 'warning'
      : successMessage
        ? 'success'
        : 'helper';

  // Determine icon size based on checkbox size
  const iconSize =
    safeSize === 'small' ? '10' : safeSize === 'large' ? '14' : '12';

  return (
    <CheckboxWrapper theme={theme} className={containerClassName}>
      <div className={containerClasses} style={cssProperties}>
        <div className={styles.checkboxBox}>
          <CheckboxInput
            id={checkboxId}
            checked={safeChecked}
            indeterminate={safeIndeterminate}
            disabled={safeDisabled}
            onChange={handleChange}
            name={name}
            value={value}
            required={required}
            aria-label={ariaLabel}
            aria-describedby={
              messageToShow ? `${checkboxId}-message` : ariaDescribedBy
            }
          />
          <div className={styles.checkboxIndicator}>
            {safeIndeterminate ? (
              <IndeterminateIcon
                size={iconSize}
                className={styles.checkboxIcon}
              />
            ) : safeChecked ? (
              <CheckmarkIcon size={iconSize} className={styles.checkboxIcon} />
            ) : null}
          </div>
        </div>

        {children && (
          <CheckboxLabel htmlFor={checkboxId} disabled={safeDisabled}>
            {children}
          </CheckboxLabel>
        )}
      </div>

      {messageToShow && (
        <CheckboxMessage type={messageType} className={`${checkboxId}-message`}>
          {messageToShow}
        </CheckboxMessage>
      )}
    </CheckboxWrapper>
  );
};

// Export sub-components for advanced usage
export { CheckboxWrapper, CheckboxInput, CheckboxLabel, CheckboxMessage };
export default Checkbox;
export type { CheckboxProps, CheckboxTheme } from './Checkbox.types';

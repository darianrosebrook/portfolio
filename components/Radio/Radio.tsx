import React, { useMemo, useId, useState } from 'react';
import styles from './Radio.module.scss';
import {
  RadioProps,
  RadioGroupProps,
  RadioWrapperProps,
  RadioInputProps,
  RadioLabelProps,
  RadioMessageProps,
  RadioTheme,
  DEFAULT_RADIO_TOKENS,
} from './Radio.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './Radio.tokens.json';

/**
 * Custom hook for managing Radio design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useRadioTokens(
  theme?: RadioTheme,
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
        inlineTokens[`radio-${key}`] = value;
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
        Object.entries(DEFAULT_RADIO_TOKENS).forEach(([key, value]) => {
          fallbacks[`radio-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'radio');

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
 * Radio Wrapper Component
 */
const RadioWrapper: React.FC<RadioWrapperProps> = ({
  children,
  className = '',
  theme,
}) => {
  const { cssProperties } = useRadioTokens(theme);

  return (
    <div className={`${styles.radioWrapper} ${className}`} style={cssProperties}>
      {children}
    </div>
  );
};

/**
 * Radio Input Component
 */
const RadioInput: React.FC<RadioInputProps> = ({
  id,
  checked = false,
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
    type="radio"
    id={id}
    checked={checked}
    disabled={disabled}
    onChange={onChange}
    name={name}
    value={value}
    required={required}
    aria-label={ariaLabel}
    aria-describedby={ariaDescribedBy}
    className={`${styles.radioInput} ${className}`}
  />
);

/**
 * Radio Label Component
 */
const RadioLabel: React.FC<RadioLabelProps> = ({
  htmlFor,
  disabled = false,
  children,
  className = '',
}) => (
  <label
    htmlFor={htmlFor}
    className={`${styles.radioLabel} ${disabled ? styles.disabled : ''} ${className}`}
  >
    {children}
  </label>
);

/**
 * Radio Message Component
 */
const RadioMessage: React.FC<RadioMessageProps> = ({
  type,
  children,
  className = '',
}) => {
  const messageClass = styles[`radioMessage--${type}`] || styles.radioMessage;

  return (
    <div className={`${styles.radioMessage} ${messageClass} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Radio Component with Design Token Support
 * 
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Accessibility-first design
 * - Multiple sizes, variants, and states
 * - Integrated validation messages
 */
const Radio: React.FC<RadioProps> = ({
  checked = false,
  disabled = false,
  onChange,
  children,
  value,
  name,
  size = 'medium',
  variant = 'default',
  state = 'default',
  theme,
  className = '',
  containerClassName = '',
  id,
  required = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  helperText,
  errorMessage,
  successMessage,
  warningMessage,
}) => {
  // Generate unique ID if not provided
  const radioId = id || `radio-${useId()}`;

  // Load and resolve design tokens
  const { cssProperties } = useRadioTokens(theme, size, variant, state);

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

  // Handle change events
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!safeDisabled && onChange) {
      onChange(value, event);
    }
  };

  // Generate CSS classes
  const containerClasses = [
    styles.radio,
    styles[`radio--${safeSize}`] || '',
    styles[`radio--${safeVariant}`] || '',
    styles[`radio--${currentState}`] || '',
    safeChecked ? styles.checked : '',
    safeDisabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Determine which message to show (priority: error > warning > success > helper)
  const messageToShow = errorMessage || warningMessage || successMessage || helperText;
  const messageType = errorMessage
    ? 'error'
    : warningMessage
      ? 'warning'
      : successMessage
        ? 'success'
        : 'helper';

  return (
    <RadioWrapper theme={theme} className={containerClassName}>
      <div className={containerClasses} style={cssProperties}>
        <div className={styles.radioCircle}>
          <RadioInput
            id={radioId}
            checked={safeChecked}
            disabled={safeDisabled}
            onChange={handleChange}
            name={name}
            value={value}
            required={required}
            aria-label={ariaLabel}
            aria-describedby={messageToShow ? `${radioId}-message` : ariaDescribedBy}
          />
          <div className={styles.radioDot} />
        </div>

        {children && (
          <RadioLabel htmlFor={radioId} disabled={safeDisabled}>
            {children}
          </RadioLabel>
        )}
      </div>

      {messageToShow && (
        <RadioMessage type={messageType} className={`${radioId}-message`}>
          {messageToShow}
        </RadioMessage>
      )}
    </RadioWrapper>
  );
};

/**
 * RadioGroup Component for managing multiple radio buttons
 * 
 * Features:
 * - Controlled and uncontrolled modes
 * - Automatic name generation
 * - Group-level validation messages
 * - Flexible layout options
 * - Consistent theming across all radios
 */
const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  defaultValue,
  onChange,
  options,
  name,
  label,
  required = false,
  disabled = false,
  size = 'medium',
  variant = 'default',
  state = 'default',
  theme,
  className = '',
  containerClassName = '',
  orientation = 'vertical',
  errorMessage,
  successMessage,
  warningMessage,
  helperText,
}) => {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState(defaultValue || '');
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  // Generate unique group ID
  const groupId = `radio-group-${useId()}`;

  // Load and resolve design tokens
  const { cssProperties } = useRadioTokens(theme, size, variant, state);

  // Determine the current state based on props and messages
  const currentState = useMemo(() => {
    if (errorMessage) return 'error';
    if (successMessage) return 'success';
    if (warningMessage) return 'warning';
    return state;
  }, [state, errorMessage, successMessage, warningMessage]);

  // Handle change events
  const handleChange = (optionValue: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!disabled) {
      if (!isControlled) {
        setInternalValue(optionValue);
      }
      if (onChange) {
        onChange(optionValue, event);
      }
    }
  };

  // Generate CSS classes
  const groupClasses = [
    styles.radioGroup,
    styles[`radioGroup--${orientation}`] || '',
    styles[`radioGroup--${currentState}`] || '',
    disabled ? styles.disabled : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Determine which message to show (priority: error > warning > success > helper)
  const messageToShow = errorMessage || warningMessage || successMessage || helperText;
  const messageType = errorMessage
    ? 'error'
    : warningMessage
      ? 'warning'
      : successMessage
        ? 'success'
        : 'helper';

  return (
    <RadioWrapper theme={theme} className={containerClassName}>
      <div className={groupClasses} style={cssProperties}>
        {label && (
          <div className={styles.radioGroupLabel} id={`${groupId}-label`}>
            {label}
            {required && <span className={styles.required} aria-label="required">*</span>}
          </div>
        )}

        <div
          className={styles.radioGroupOptions}
          role="radiogroup"
          aria-labelledby={label ? `${groupId}-label` : undefined}
          aria-describedby={messageToShow ? `${groupId}-message` : undefined}
        >
          {options.map((option, index) => (
            <Radio
              key={option.value}
              value={option.value}
              name={name}
              checked={currentValue === option.value}
              disabled={disabled || option.disabled}
              onChange={handleChange}
              size={size}
              variant={variant}
              state={currentState}
              theme={theme}
              required={required}
              helperText={option.helperText}
              id={`${groupId}-option-${index}`}
            >
              {option.label}
            </Radio>
          ))}
        </div>

        {messageToShow && (
          <RadioMessage type={messageType} className={`${groupId}-message`}>
            {messageToShow}
          </RadioMessage>
        )}
      </div>
    </RadioWrapper>
  );
};

// Export sub-components for advanced usage
export { RadioWrapper, RadioInput, RadioLabel, RadioMessage, RadioGroup };
export default Radio;
export type { RadioProps, RadioGroupProps, RadioTheme } from './Radio.types';

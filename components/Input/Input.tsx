import React, { useMemo, useId, forwardRef } from 'react';
import styles from './Input.module.scss';
import {
  InputProps,
  InputWrapperProps,
  InputLabelProps,
  InputMessageProps,
  InputTheme,
  DEFAULT_INPUT_TOKENS,
} from './Input.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './Input.tokens.json';

/**
 * Custom hook for managing Input design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useInputTokens(
  theme?: InputTheme,
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
        inlineTokens[`input-${key}`] = value;
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
        Object.entries(DEFAULT_INPUT_TOKENS).forEach(([key, value]) => {
          fallbacks[`input-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'input');

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
 * Input Wrapper Component
 */
const InputWrapper: React.FC<InputWrapperProps> = ({
  children,
  className = '',
  theme,
}) => {
  const { cssProperties } = useInputTokens(theme);

  return (
    <div
      className={`${styles.inputWrapper} ${className}`}
      style={cssProperties}
    >
      {children}
    </div>
  );
};

/**
 * Input Label Component
 */
const InputLabel: React.FC<InputLabelProps> = ({
  htmlFor,
  required = false,
  children,
  className = '',
}) => (
  <label htmlFor={htmlFor} className={`${styles.inputLabel} ${className}`}>
    {children}
    {required && (
      <span className={styles.required} aria-label="required">
        *
      </span>
    )}
  </label>
);

/**
 * Input Message Component for helper/error/success text
 */
const InputMessage: React.FC<InputMessageProps> = ({
  type,
  children,
  className = '',
}) => {
  const messageClass = styles[`inputMessage--${type}`] || styles.inputMessage;

  return (
    <div className={`${styles.inputMessage} ${messageClass} ${className}`}>
      {children}
    </div>
  );
};

/**
 * Input Component with Design Token Support
 *
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Accessibility-first design
 * - Multiple sizes, variants, and states
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      size = 'medium',
      variant = 'default',
      state = 'default',
      label,
      helperText,
      errorMessage,
      successMessage,
      warningMessage,
      showLabel = true,
      theme,
      className = '',
      containerClassName = '',
      id,
      required = false,
      disabled = false,
      readOnly = false,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const inputId = id || `input-${useId()}`;

    // Load and resolve design tokens
    const { cssProperties } = useInputTokens(theme, size, variant, state);

    // Determine the current state based on props and messages
    const currentState = useMemo(() => {
      if (errorMessage) return 'error';
      if (successMessage) return 'success';
      if (warningMessage) return 'warning';
      return state;
    }, [state, errorMessage, successMessage, warningMessage]);

    // Generate CSS classes with safe defaults
    const inputClasses = [
      styles.input,
      styles[`input--${size}`] || '',
      styles[`input--${variant}`] || '',
      styles[`input--${currentState}`] || '',
      disabled ? styles['input--disabled'] : '',
      readOnly ? styles['input--readonly'] : '',
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

    // Safe validation for props
    const safeRequired = safeTokenValue(
      required,
      false,
      (val) => typeof val === 'boolean'
    ) as boolean;

    return (
      <InputWrapper theme={theme} className={containerClassName}>
        {label && showLabel && (
          <InputLabel htmlFor={inputId} required={safeRequired}>
            {label}
          </InputLabel>
        )}

        <input
          ref={ref}
          id={inputId}
          className={inputClasses}
          style={cssProperties}
          disabled={disabled}
          readOnly={readOnly}
          required={safeRequired}
          aria-invalid={currentState === 'error'}
          aria-describedby={messageToShow ? `${inputId}-message` : undefined}
          {...props}
        />

        {messageToShow && (
          <InputMessage type={messageType} className={`${inputId}-message`}>
            {messageToShow}
          </InputMessage>
        )}
      </InputWrapper>
    );
  }
);

Input.displayName = 'Input';

// Export sub-components for advanced usage
export { InputWrapper, InputLabel, InputMessage };
export default Input;
export type { InputProps, InputTheme } from './Input.types';

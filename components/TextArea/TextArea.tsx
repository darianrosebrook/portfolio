import React, {
  useMemo,
  useId,
  forwardRef,
  useRef,
  useEffect,
  useCallback,
} from 'react';
import styles from './TextArea.module.scss';
import {
  TextAreaProps,
  TextAreaWrapperProps,
  TextAreaLabelProps,
  TextAreaMessageProps,
  TextAreaCharacterCountProps,
  TextAreaTheme,
  DEFAULT_TEXTAREA_TOKENS,
} from './TextArea.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './TextArea.tokens.json';

/**
 * Custom hook for managing TextArea design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useTextAreaTokens(
  theme?: TextAreaTheme,
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
        inlineTokens[`textarea-${key}`] = value;
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
        Object.entries(DEFAULT_TEXTAREA_TOKENS).forEach(([key, value]) => {
          fallbacks[`textarea-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'textarea');

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
 * TextArea Wrapper Component
 */
const TextAreaWrapper: React.FC<TextAreaWrapperProps> = ({
  children,
  className = '',
  theme,
}) => {
  const { cssProperties } = useTextAreaTokens(theme);

  return (
    <div
      className={`${styles.textareaWrapper} ${className}`}
      style={cssProperties}
    >
      {children}
    </div>
  );
};

/**
 * TextArea Label Component
 */
const TextAreaLabel: React.FC<TextAreaLabelProps> = ({
  htmlFor,
  required = false,
  children,
  className = '',
}) => (
  <label htmlFor={htmlFor} className={`${styles.textareaLabel} ${className}`}>
    {children}
    {required && (
      <span className={styles.required} aria-label="required">
        *
      </span>
    )}
  </label>
);

/**
 * TextArea Message Component for helper/error/success text
 */
const TextAreaMessage: React.FC<TextAreaMessageProps> = ({
  type,
  children,
  className = '',
}) => {
  const messageClass =
    styles[`textareaMessage--${type}`] || styles.textareaMessage;

  return (
    <div className={`${styles.textareaMessage} ${messageClass} ${className}`}>
      {children}
    </div>
  );
};

/**
 * TextArea Character Count Component
 */
const TextAreaCharacterCount: React.FC<TextAreaCharacterCountProps> = ({
  current,
  max,
  className = '',
}) => {
  const isOverLimit = max !== undefined && current > max;
  const countClasses = [
    styles.textareaCharacterCount,
    isOverLimit ? styles.overLimit : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={countClasses}>
      {current}
      {max !== undefined && `/${max}`}
    </div>
  );
};

/**
 * TextArea Component with Design Token Support
 *
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Accessibility-first design
 * - Multiple sizes, variants, and states
 * - Auto-resize functionality
 * - Character count display
 * - Integrated validation messages
 */
const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
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
      resize = 'vertical',
      showCharacterCount = false,
      maxLength,
      minRows,
      maxRows,
      autoResize = false,
      value,
      defaultValue,
      onChange,
      ...props
    },
    ref
  ) => {
    // Generate unique ID if not provided
    const textareaId = id || `textarea-${useId()}`;

    // Internal ref for auto-resize functionality
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const textareaRef =
      (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;

    // Load and resolve design tokens
    const { cssProperties } = useTextAreaTokens(theme, size, variant, state);

    // Determine the current state based on props and messages
    const currentState = useMemo(() => {
      if (errorMessage) return 'error';
      if (successMessage) return 'success';
      if (warningMessage) return 'warning';
      return state;
    }, [state, errorMessage, successMessage, warningMessage]);

    // Safe validation for props
    const safeRequired = safeTokenValue(
      required,
      false,
      (val) => typeof val === 'boolean'
    ) as boolean;

    const safeSize = safeTokenValue(size, 'medium', (val) =>
      ['small', 'medium', 'large'].includes(val as string)
    ) as string;

    const safeVariant = safeTokenValue(variant, 'default', (val) =>
      ['default', 'filled', 'outlined'].includes(val as string)
    ) as string;

    const safeResize = safeTokenValue(resize, 'vertical', (val) =>
      ['none', 'vertical', 'horizontal', 'both'].includes(val as string)
    ) as string;

    // Auto-resize functionality
    const handleAutoResize = useCallback(() => {
      if (autoResize && textareaRef.current) {
        const textarea = textareaRef.current;

        // Reset height to auto to get the correct scrollHeight
        textarea.style.height = 'auto';

        // Calculate new height based on content
        let newHeight = textarea.scrollHeight;

        // Apply min/max row constraints
        if (minRows || maxRows) {
          const lineHeight =
            parseInt(getComputedStyle(textarea).lineHeight, 10) || 20;

          if (minRows) {
            const minHeight = minRows * lineHeight;
            newHeight = Math.max(newHeight, minHeight);
          }

          if (maxRows) {
            const maxHeight = maxRows * lineHeight;
            newHeight = Math.min(newHeight, maxHeight);
          }
        }

        textarea.style.height = `${newHeight}px`;
      }
    }, [autoResize, minRows, maxRows]);

    // Handle change events with auto-resize
    const handleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (onChange) {
        onChange(event);
      }

      // Trigger auto-resize after state update
      setTimeout(handleAutoResize, 0);
    };

    // Set up auto-resize on mount and value changes
    useEffect(() => {
      if (autoResize) {
        handleAutoResize();
      }
    }, [autoResize, value, defaultValue, handleAutoResize]);

    // Generate CSS classes with safe defaults
    const textareaClasses = [
      styles.textarea,
      styles[`textarea--${safeSize}`] || '',
      styles[`textarea--${safeVariant}`] || '',
      styles[`textarea--${currentState}`] || '',
      styles[`textarea--resize-${safeResize}`] || '',
      disabled ? styles['textarea--disabled'] : '',
      readOnly ? styles['textarea--readonly'] : '',
      autoResize ? styles['textarea--autoResize'] : '',
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

    // Calculate character count
    const currentValue = value || defaultValue || '';
    const characterCount =
      typeof currentValue === 'string' ? currentValue.length : 0;

    return (
      <TextAreaWrapper theme={theme} className={containerClassName}>
        {label && showLabel && (
          <TextAreaLabel htmlFor={textareaId} required={safeRequired}>
            {label}
          </TextAreaLabel>
        )}

        <div className={styles.textareaContainer}>
          <textarea
            ref={textareaRef}
            id={textareaId}
            className={textareaClasses}
            style={cssProperties}
            disabled={disabled}
            readOnly={readOnly}
            required={safeRequired}
            maxLength={maxLength}
            rows={minRows}
            value={value}
            defaultValue={defaultValue}
            onChange={handleChange}
            aria-invalid={currentState === 'error'}
            aria-describedby={
              messageToShow ? `${textareaId}-message` : undefined
            }
            {...props}
          />

          {showCharacterCount && (
            <TextAreaCharacterCount
              current={characterCount}
              max={maxLength}
              className={styles.characterCountOverlay}
            />
          )}
        </div>

        {messageToShow && (
          <TextAreaMessage
            type={messageType}
            className={`${textareaId}-message`}
          >
            {messageToShow}
          </TextAreaMessage>
        )}
      </TextAreaWrapper>
    );
  }
);

TextArea.displayName = 'TextArea';

// Export sub-components for advanced usage
export {
  TextAreaWrapper,
  TextAreaLabel,
  TextAreaMessage,
  TextAreaCharacterCount,
};
export default TextArea;
export type { TextAreaProps, TextAreaTheme } from './TextArea.types';

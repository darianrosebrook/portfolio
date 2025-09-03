import React, { useMemo } from 'react';
import styles from './Progress.module.scss';
import {
  ProgressProps,
  LinearProgressProps,
  CircularProgressProps,
  ProgressWrapperProps,
  ProgressLabelProps,
  ProgressValueProps,
  ProgressTheme,
  DEFAULT_PROGRESS_TOKENS,
} from './Progress.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './Progress.tokens.json';

/**
 * Custom hook for managing Progress design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useProgressTokens(
  theme?: ProgressTheme,
  _size = 'medium',
  _variant = 'default',
  _shape = 'linear'
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
        inlineTokens[`progress-${key}`] = value;
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
        Object.entries(DEFAULT_PROGRESS_TOKENS).forEach(([key, value]) => {
          fallbacks[`progress-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'progress');

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
 * Progress Wrapper Component
 */
const ProgressWrapper: React.FC<ProgressWrapperProps> = ({
  children,
  className = '',
  theme,
}) => {
  const { cssProperties } = useProgressTokens(theme);

  return (
    <div
      className={`${styles.progressWrapper} ${className}`}
      style={cssProperties}
    >
      {children}
    </div>
  );
};

/**
 * Progress Label Component
 */
const ProgressLabel: React.FC<ProgressLabelProps> = ({
  children,
  className = '',
}) => <div className={`${styles.progressLabel} ${className}`}>{children}</div>;

/**
 * Progress Value Display Component
 */
const ProgressValue: React.FC<ProgressValueProps> = ({
  value,
  max,
  formatValue,
  className = '',
}) => {
  const displayValue = formatValue
    ? formatValue(value, max)
    : `${Math.round((value / max) * 100)}%`;

  return (
    <div className={`${styles.progressValue} ${className}`}>{displayValue}</div>
  );
};

/**
 * Linear Progress Component
 */
const LinearProgress: React.FC<LinearProgressProps> = ({
  value = 0,
  max = 100,
  size = 'medium',
  variant = 'default',
  theme,
  className = '',
  containerClassName = '',
  showValue = false,
  label,
  indeterminate = false,
  animated = true,
  striped = false,
  stripedAnimated = false,
  formatValue,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'data-testid': testId,
}) => {
  // Load and resolve design tokens
  const { cssProperties } = useProgressTokens(theme, size, variant, 'linear');

  // Safe validation for props
  const safeValue = safeTokenValue(
    value,
    0,
    (val) => typeof val === 'number' && val >= 0
  ) as number;

  const safeMax = safeTokenValue(
    max,
    100,
    (val) => typeof val === 'number' && val > 0
  ) as number;

  const safeSize = safeTokenValue(size, 'medium', (val) =>
    ['small', 'medium', 'large'].includes(val as string)
  ) as string;

  const safeVariant = safeTokenValue(variant, 'default', (val) =>
    ['default', 'success', 'warning', 'danger', 'info'].includes(val as string)
  ) as string;

  // Calculate percentage
  const percentage = indeterminate
    ? 0
    : Math.min((safeValue / safeMax) * 100, 100);

  // Generate CSS classes
  const progressClasses = [
    styles.linearProgress,
    styles[`linearProgress--${safeSize}`] || '',
    styles[`linearProgress--${safeVariant}`] || '',
    indeterminate ? styles['linearProgress--indeterminate'] : '',
    animated ? styles['linearProgress--animated'] : '',
    striped ? styles['linearProgress--striped'] : '',
    stripedAnimated ? styles['linearProgress--stripedAnimated'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ProgressWrapper theme={theme} className={containerClassName}>
      {(label || showValue) && (
        <div className={styles.progressHeader}>
          {label && <ProgressLabel>{label}</ProgressLabel>}
          {showValue && !indeterminate && (
            <ProgressValue
              value={safeValue}
              max={safeMax}
              formatValue={formatValue}
            />
          )}
        </div>
      )}

      <div
        className={progressClasses}
        style={cssProperties}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : safeValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        data-testid={testId}
      >
        <div className={styles.linearProgressTrack}>
          <div
            className={styles.linearProgressFill}
            style={{
              width: indeterminate ? '100%' : `${percentage}%`,
            }}
          />
        </div>
      </div>
    </ProgressWrapper>
  );
};

/**
 * Circular Progress Component
 */
const CircularProgress: React.FC<CircularProgressProps> = ({
  value = 0,
  max = 100,
  size = 'medium',
  variant = 'default',
  theme,
  className = '',
  containerClassName = '',
  showValue = false,
  label,
  indeterminate = false,
  animated = true,
  strokeWidth,
  showCenter = true,
  centerContent,
  formatValue,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'data-testid': testId,
}) => {
  // Load and resolve design tokens
  const { cssProperties, tokens } = useProgressTokens(
    theme,
    size,
    variant,
    'circular'
  );

  // Safe validation for props
  const safeValue = safeTokenValue(
    value,
    0,
    (val) => typeof val === 'number' && val >= 0
  ) as number;

  const safeMax = safeTokenValue(
    max,
    100,
    (val) => typeof val === 'number' && val > 0
  ) as number;

  const safeSize = safeTokenValue(size, 'medium', (val) =>
    ['small', 'medium', 'large'].includes(val as string)
  ) as string;

  const safeVariant = safeTokenValue(variant, 'default', (val) =>
    ['default', 'success', 'warning', 'danger', 'info'].includes(val as string)
  ) as string;

  // Get size-specific values from tokens
  const diameter =
    (tokens[`progress-size-circular-${safeSize}-diameter`] as number) || 48;
  const defaultStrokeWidth =
    (tokens[`progress-size-circular-${safeSize}-strokeWidth`] as number) || 4;
  const actualStrokeWidth = strokeWidth || defaultStrokeWidth;

  // Calculate SVG properties
  const radius = (diameter - actualStrokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = indeterminate
    ? 0
    : Math.min((safeValue / safeMax) * 100, 100);
  const strokeDashoffset = indeterminate
    ? 0
    : circumference - (percentage / 100) * circumference;

  // Generate CSS classes
  const progressClasses = [
    styles.circularProgress,
    styles[`circularProgress--${safeSize}`] || '',
    styles[`circularProgress--${safeVariant}`] || '',
    indeterminate ? styles['circularProgress--indeterminate'] : '',
    animated ? styles['circularProgress--animated'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <ProgressWrapper theme={theme} className={containerClassName}>
      {label && <ProgressLabel>{label}</ProgressLabel>}

      <div
        className={progressClasses}
        style={{
          ...cssProperties,
          width: `${diameter}px`,
          height: `${diameter}px`,
        }}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : safeValue}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        data-testid={testId}
      >
        <svg
          className={styles.circularProgressSvg}
          width={diameter}
          height={diameter}
          viewBox={`0 0 ${diameter} ${diameter}`}
        >
          {/* Background track */}
          <circle
            className={styles.circularProgressTrack}
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            strokeWidth={actualStrokeWidth}
          />

          {/* Progress fill */}
          <circle
            className={styles.circularProgressFill}
            cx={diameter / 2}
            cy={diameter / 2}
            r={radius}
            fill="none"
            strokeWidth={actualStrokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${diameter / 2} ${diameter / 2})`}
          />
        </svg>

        {showCenter && (
          <div className={styles.circularProgressCenter}>
            {centerContent ||
              (showValue && !indeterminate && (
                <ProgressValue
                  value={safeValue}
                  max={safeMax}
                  formatValue={formatValue}
                />
              ))}
          </div>
        )}
      </div>
    </ProgressWrapper>
  );
};

/**
 * Main Progress Component with automatic shape detection
 */
const Progress: React.FC<ProgressProps> = ({ shape = 'linear', ...props }) => {
  if (shape === 'circular') {
    return <CircularProgress {...(props as CircularProgressProps)} />;
  }

  return <LinearProgress {...(props as LinearProgressProps)} />;
};

// Export sub-components for advanced usage
export {
  ProgressWrapper,
  ProgressLabel,
  ProgressValue,
  LinearProgress,
  CircularProgress,
};
export default Progress;
export type {
  ProgressProps,
  LinearProgressProps,
  CircularProgressProps,
  ProgressTheme,
} from './Progress.types';

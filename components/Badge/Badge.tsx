import React, { useMemo } from 'react';
import styles from './Badge.module.scss';
import {
  BadgeProps,
  BadgeDotProps,
  BadgeIconProps,
  BadgeDismissProps,
  BadgeTheme,
  DEFAULT_BADGE_TOKENS,
} from './Badge.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './Badge.tokens.json';

/**
 * Custom hook for managing Badge design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useBadgeTokens(
  theme?: BadgeTheme,
  _size = 'medium',
  _variant = 'default',
  _shape = 'rounded'
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
        inlineTokens[`badge-${key}`] = value;
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
        Object.entries(DEFAULT_BADGE_TOKENS).forEach(([key, value]) => {
          fallbacks[`badge-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'badge');

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
 * Badge Dot Component for indicator-only badges
 */
const BadgeDot: React.FC<BadgeDotProps> = ({
  variant = 'primary',
  size = 'medium',
  className = '',
  theme,
}) => {
  const { cssProperties } = useBadgeTokens(theme, size, variant);

  const dotClasses = [
    styles.badgeDot,
    styles[`badgeDot--${variant}`] || '',
    styles[`badgeDot--${size}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={dotClasses} style={cssProperties} />;
};

/**
 * Badge Icon Component
 */
const BadgeIcon: React.FC<BadgeIconProps> = ({
  children,
  size = 'medium',
  position = 'start',
  className = '',
}) => {
  const iconClasses = [
    styles.badgeIcon,
    styles[`badgeIcon--${size}`] || '',
    styles[`badgeIcon--${position}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <span className={iconClasses}>{children}</span>;
};

/**
 * Badge Dismiss Button Component
 */
const BadgeDismiss: React.FC<BadgeDismissProps> = ({
  onDismiss,
  size = 'medium',
  className = '',
  'aria-label': ariaLabel = 'Remove badge',
}) => {
  const dismissClasses = [
    styles.badgeDismiss,
    styles[`badgeDismiss--${size}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type="button"
      className={dismissClasses}
      onClick={onDismiss}
      aria-label={ariaLabel}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M9 3L3 9M3 3L9 9"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
};

/**
 * Badge Component with Design Token Support
 * 
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Multiple sizes, variants, and shapes
 * - Interactive and dismissible variants
 * - Icon and dot indicator support
 * - Number formatting with max limits
 * - Accessibility-first design
 */
const Badge: React.FC<BadgeProps> = ({
  children,
  size = 'medium',
  variant = 'default',
  shape = 'rounded',
  theme,
  className = '',
  interactive = false,
  onClick,
  dot = false,
  icon,
  iconPosition = 'start',
  max,
  dismissible = false,
  onDismiss,
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  // Load and resolve design tokens
  const { cssProperties } = useBadgeTokens(theme, size, variant, shape);

  // Safe validation for props
  const safeSize = safeTokenValue(
    size,
    'medium',
    (val) => ['small', 'medium', 'large'].includes(val as string)
  ) as string;

  const safeVariant = safeTokenValue(
    variant,
    'default',
    (val) => ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'].includes(val as string)
  ) as string;

  const safeShape = safeTokenValue(
    shape,
    'rounded',
    (val) => ['rounded', 'pill', 'square'].includes(val as string)
  ) as string;

  // Format numeric content with max limit
  const formatContent = (content: React.ReactNode): React.ReactNode => {
    if (typeof content === 'number' && max && content > max) {
      return `${max}+`;
    }
    return content;
  };

  // Handle click events
  const handleClick = () => {
    if (interactive && onClick) {
      onClick();
    }
  };

  // Handle keyboard events for interactive badges
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (interactive && (event.key === 'Enter' || event.key === ' ')) {
      event.preventDefault();
      handleClick();
    }
  };

  // Generate CSS classes
  const badgeClasses = [
    styles.badge,
    styles[`badge--${safeSize}`] || '',
    styles[`badge--${safeVariant}`] || '',
    styles[`badge--${safeShape}`] || '',
    interactive ? styles['badge--interactive'] : '',
    dot ? styles['badge--dot'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // If dot variant, render simplified dot badge
  if (dot) {
    return (
      <BadgeDot
        variant={safeVariant as any}
        size={safeSize as any}
        theme={theme}
        className={className}
      />
    );
  }

  // Determine the element type based on interactivity
  const Element = interactive ? 'button' : 'span';

  return (
    <Element
      className={badgeClasses}
      style={cssProperties}
      onClick={interactive ? handleClick : undefined}
      onKeyDown={interactive ? handleKeyDown : undefined}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {icon && iconPosition === 'start' && (
        <BadgeIcon size={safeSize as any} position="start">
          {icon}
        </BadgeIcon>
      )}

      {children && (
        <span className={styles.badgeContent}>
          {formatContent(children)}
        </span>
      )}

      {icon && iconPosition === 'end' && (
        <BadgeIcon size={safeSize as any} position="end">
          {icon}
        </BadgeIcon>
      )}

      {dismissible && onDismiss && (
        <BadgeDismiss
          onDismiss={onDismiss}
          size={safeSize as any}
          aria-label={`Remove ${children || 'badge'}`}
        />
      )}
    </Element>
  );
};

// Export sub-components for advanced usage
export { BadgeDot, BadgeIcon, BadgeDismiss };
export default Badge;
export type { BadgeProps, BadgeTheme } from './Badge.types';

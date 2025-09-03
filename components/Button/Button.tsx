import React, { useMemo } from 'react';
import styles from './Button.module.scss';
import {
  ButtonProps,
  ButtonTheme,
  DEFAULT_BUTTON_TOKENS,
  isAnchorElement,
} from './Button.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './Button.tokens.json';

/**
 * Custom hook for managing Button design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useButtonTokens(
  theme?: ButtonTheme,
  size = 'medium',
  variant = 'primary'
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
      const inlineTokens: Record<string, unknown> = {};
      Object.entries(theme.tokens).forEach(([key, value]) => {
        inlineTokens[`button-${key}`] = value;
      });

      tokenSources.push({
        type: 'inline',
        tokens: inlineTokens,
      });
    }

    // Merge all token sources with fallbacks
    const resolvedTokens = mergeTokenSources(tokenSources, {
      fallbacks: (() => {
        const fallbacks: Record<string, unknown> = {};
        Object.entries(DEFAULT_BUTTON_TOKENS).forEach(([key, value]) => {
          fallbacks[`button-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'button');

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
 * Button Component with Design Token Support
 *
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Accessibility-first design
 */
const Button: React.FC<ButtonProps> = ({
  as = 'button',
  size = 'medium',
  variant = 'primary',
  loading = false,
  disabled = false,
  className = '',
  title = '',
  theme,
  children,
  ...rest
}) => {
  // Load and resolve design tokens
  const { cssProperties } = useButtonTokens(theme, size, variant);

  // Generate CSS classes
  const baseClassName = styles.button;
  const sizeClassName = styles[size] ?? '';
  const variantClassName = styles[variant] ?? '';
  const isLoading = loading ? (styles.isLoading ?? '') : '';
  const isDisabled = disabled ? (styles.disabled ?? '') : '';

  // Detect icon-only buttons for accessibility
  const hasOnlyIcon = useMemo(() => {
    return (
      React.Children.count(children) === 1 &&
      typeof children === 'object' &&
      children &&
      !('props' in children && children.props.children)
    );
  }, [children]);

  const combinedClassName = [
    baseClassName,
    sizeClassName,
    variantClassName,
    isLoading,
    isDisabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Accessibility props with safe defaults
  const ariaProps = hasOnlyIcon ? { 'aria-label': title || 'Button' } : {};

  // Process children with safe rendering
  const content = React.Children.map(children, (child, index) => {
    if (!child) return null;
    return <span key={index}>{child}</span>;
  });
  // Render anchor element with token support
  if (isAnchorElement({ as, ...rest } as ButtonProps)) {
    const { href, ...anchorRest } = rest;

    // Validate href for security
    const safeHref = safeTokenValue(
      href,
      '#',
      (val) => typeof val === 'string' && val.length > 0
    ) as string;

    return (
      <a
        href={safeHref}
        className={combinedClassName}
        title={title || 'Link'}
        style={cssProperties}
        {...ariaProps}
        {...anchorRest}
      >
        {content}
      </a>
    );
  }

  // Render button element with token support
  return (
    <button
      type="button"
      className={combinedClassName}
      disabled={disabled || loading}
      title={title || 'Button'}
      style={cssProperties}
      {...ariaProps}
      {...rest}
    >
      {content}
    </button>
  );
};

export default Button;

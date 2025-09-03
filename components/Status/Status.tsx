'use client';
import React, { useMemo } from 'react';
import Styles from './Status.module.scss';
import {
  StatusProps,
  StatusIconProps,
  StatusTheme,
  StatusType,
  DEFAULT_STATUS_TOKENS,
} from './Status.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './Status.tokens.json';

/**
 * Custom hook for managing Status design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useStatusTokens(
  theme?: StatusTheme,
  _status: StatusType = 'neutral',
  _size = 'medium',
  _variant = 'filled'
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
        inlineTokens[`status-${key}`] = value;
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
        Object.entries(DEFAULT_STATUS_TOKENS).forEach(([key, value]) => {
          fallbacks[`status-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'status');

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
 * Default status icons
 */
const StatusIcon: React.FC<StatusIconProps> = ({ status, size = 'medium', className = '' }) => {
  const iconSize = size === 'small' ? '12' : size === 'large' ? '16' : '14';
  
  const icons = {
    success: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0ZM10.7071 5.70711L6.70711 9.70711C6.31658 10.0976 5.68342 10.0976 5.29289 9.70711L3.29289 7.70711C2.90237 7.31658 2.90237 6.68342 3.29289 6.29289C3.68342 5.90237 4.31658 5.90237 4.70711 6.29289L6 7.58579L9.29289 4.29289C9.68342 3.90237 10.3166 3.90237 10.7071 4.29289C11.0976 4.68342 11.0976 5.31658 10.7071 5.70711Z"
          fill="currentColor"
        />
      </svg>
    ),
    error: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0ZM9.70711 4.29289C10.0976 4.68342 10.0976 5.31658 9.70711 5.70711L8.41421 7L9.70711 8.29289C10.0976 8.68342 10.0976 9.31658 9.70711 9.70711C9.31658 10.0976 8.68342 10.0976 8.29289 9.70711L7 8.41421L5.70711 9.70711C5.31658 10.0976 4.68342 10.0976 4.29289 9.70711C3.90237 9.31658 3.90237 8.68342 4.29289 8.29289L5.58579 7L4.29289 5.70711C3.90237 5.31658 3.90237 4.68342 4.29289 4.29289C4.68342 3.90237 5.31658 3.90237 5.70711 4.29289L7 5.58579L8.29289 4.29289C8.68342 3.90237 9.31658 3.90237 9.70711 4.29289Z"
          fill="currentColor"
        />
      </svg>
    ),
    warning: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M6.06974 1.35872C6.40266 0.51457 7.59734 0.51457 7.93026 1.35872L12.6413 11.0697C12.9742 11.9139 12.377 12.8333 11.4583 12.8333H2.54167C1.62298 12.8333 1.02581 11.9139 1.35872 11.0697L6.06974 1.35872ZM7 4.66667C6.63181 4.66667 6.33333 4.96514 6.33333 5.33333V7.66667C6.33333 8.03486 6.63181 8.33333 7 8.33333C7.36819 8.33333 7.66667 8.03486 7.66667 7.66667V5.33333C7.66667 4.96514 7.36819 4.66667 7 4.66667ZM7 11C7.36819 11 7.66667 10.7015 7.66667 10.3333C7.66667 9.96514 7.36819 9.66667 7 9.66667C6.63181 9.66667 6.33333 9.96514 6.33333 10.3333C6.33333 10.7015 6.63181 11 7 11Z"
          fill="currentColor"
        />
      </svg>
    ),
    info: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M7 0C3.13401 0 0 3.13401 0 7C0 10.866 3.13401 14 7 14C10.866 14 14 10.866 14 7C14 3.13401 10.866 0 7 0ZM7 3.5C7.38660 3.5 7.7 3.81340 7.7 4.2C7.7 4.58660 7.38660 4.9 7 4.9C6.61340 4.9 6.3 4.58660 6.3 4.2C6.3 3.81340 6.61340 3.5 7 3.5ZM8.4 10.5H5.6C5.26863 10.5 5 10.2314 5 9.9C5 9.56863 5.26863 9.3 5.6 9.3H6.3V7.7H5.6C5.26863 7.7 5 7.43137 5 7.1C5 6.76863 5.26863 6.5 5.6 6.5H7C7.33137 6.5 7.6 6.76863 7.6 7.1V9.3H8.4C8.73137 9.3 9 9.56863 9 9.9C9 10.2314 8.73137 10.5 8.4 10.5Z"
          fill="currentColor"
        />
      </svg>
    ),
    neutral: (
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 14 14"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <path
          d="M6.06974 1.35872C6.40266 0.51457 7.59734 0.51457 7.93026 1.35872L9.1034 4.33323C9.20504 4.59095 9.40905 4.79496 9.66677 4.8966L12.6413 6.06974C13.4854 6.40266 13.4854 7.59734 12.6413 7.93026L9.66677 9.1034C9.40905 9.20504 9.20504 9.40905 9.1034 9.66677L7.93026 12.6413C7.59734 13.4854 6.40266 13.4854 6.06974 12.6413L4.8966 9.66677C4.79496 9.40905 4.59095 9.20504 4.33323 9.1034L1.35872 7.93026C0.51457 7.59734 0.51457 6.40266 1.35872 6.06974L4.33323 4.8966C4.59095 4.79496 4.79496 4.59095 4.8966 4.33323L6.06974 1.35872Z"
          fill="currentColor"
        />
      </svg>
    ),
  };

  return icons[status] || icons.neutral;
};

/**
 * Status Component with Design Token Support
 * 
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Accessibility-first design
 * - Multiple sizes, variants, and status types
 */
const Status: React.FC<StatusProps> = ({
  status,
  size = 'medium',
  variant = 'filled',
  children,
  showIcon = true,
  icon,
  theme,
  className = '',
  onClick,
  interactive = false,
}) => {
  // Load and resolve design tokens
  const { cssProperties } = useStatusTokens(theme, status, size, variant);

  // Safe validation for props
  const safeStatus = safeTokenValue(
    status,
    'neutral',
    (val) => ['success', 'error', 'warning', 'info', 'neutral'].includes(val as string)
  ) as StatusType;

  const safeSize = safeTokenValue(
    size,
    'medium',
    (val) => ['small', 'medium', 'large'].includes(val as string)
  ) as string;

  const safeVariant = safeTokenValue(
    variant,
    'filled',
    (val) => ['filled', 'outlined', 'subtle'].includes(val as string)
  ) as string;

  // Generate CSS classes with safe defaults
  const statusClasses = [
    Styles.status,
    Styles[`status--${safeStatus}`] || '',
    Styles[`status--${safeSize}`] || '',
    Styles[`status--${safeVariant}`] || '',
    interactive || onClick ? Styles['status--interactive'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  // Handle click events
  const handleClick = () => {
    if (onClick && (interactive || onClick)) {
      onClick();
    }
  };

  // Determine the icon to render
  const iconElement = icon || (showIcon ? <StatusIcon status={safeStatus} size={safeSize} /> : null);

  return (
    <div
      className={statusClasses}
      style={cssProperties}
      onClick={handleClick}
      role={interactive || onClick ? 'button' : undefined}
      tabIndex={interactive || onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if ((interactive || onClick) && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      {iconElement}
      <span className={Styles.statusText}>{children}</span>
    </div>
  );
};

export default Status;
export type { StatusProps, StatusTheme } from './Status.types';
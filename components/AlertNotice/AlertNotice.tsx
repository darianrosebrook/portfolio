'use client';
import React, { useMemo } from 'react';
import Button from '../Button';
import Styles from './AlertNotice.module.scss';
import { TimesIcon, LocalIcons } from '@/components/Icon/LocalIcons';
import {
  AlertNoticeProps,
  AlertNoticeContainerProps,
  AlertNoticeContentProps,
  AlertNoticeIconProps,
  AlertNoticeTheme,
  DEFAULT_ALERT_NOTICE_TOKENS,
} from './AlertNotice.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
} from '@/utils/designTokens';

// Import the default token configuration
import defaultTokenConfig from './AlertNotice.tokens.json';

/**
 * Custom hook for managing AlertNotice design tokens
 * Supports multiple token sources with smart defaults and BYODS patterns
 */
function useAlertNoticeTokens(
  theme?: AlertNoticeTheme,
  _status = 'info',
  _level = 'section'
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
        inlineTokens[`alert-${key}`] = value;
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
        Object.entries(DEFAULT_ALERT_NOTICE_TOKENS).forEach(([key, value]) => {
          fallbacks[`alert-${key}`] = value;
        });
        return fallbacks;
      })(),
    });

    // Generate CSS custom properties
    const cssProperties = tokensToCSSProperties(resolvedTokens, 'alert');

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
 * AlertNotice Container Component with Design Token Support
 *
 * Features:
 * - Smart defaults with fallback values
 * - Bring-your-own-design-system (BYODS) support
 * - Multiple token sources (JSON, CSS, inline)
 * - Type-safe token management
 * - Accessibility-first design
 */
const Container = React.forwardRef<HTMLDivElement, AlertNoticeContainerProps>(
  (
    {
      status = 'info',
      level = 'section',
      dismissible = false,
      onDismiss,
      index,
      theme,
      className = '',
      children,
      ...props
    },
    ref
  ) => {
    // Load and resolve design tokens
    const { cssProperties } = useAlertNoticeTokens(theme, status, level);

    // Generate CSS classes with safe defaults
    const baseClassName = Styles.alert ?? '';
    const levelClassName = Styles[`alert__${level}`] ?? '';
    const statusClassName = Styles[`alert__${level}--${status}`] ?? '';

    const combinedClassName = [
      baseClassName,
      levelClassName,
      statusClassName,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Safe validation for required props
    const safeIndex = safeTokenValue(
      index,
      0,
      (val) => typeof val === 'number' && val >= 0
    ) as number;

    return (
      <div
        ref={ref}
        role="alert"
        className={combinedClassName}
        style={cssProperties}
        {...props}
      >
        {children}
        {dismissible && onDismiss && (
          <div className={Styles['__dismiss'] ?? ''}>
            <Button
              variant="tertiary"
              size="small"
              onClick={onDismiss}
              title="Dismiss this alert"
              data-index={safeIndex}
            >
              <TimesIcon aria-hidden={true} />
              <span className="sr-only">Dismiss this alert</span>
            </Button>
          </div>
        )}
      </div>
    );
  }
);
Container.displayName = 'AlertNotice.Container';

/**
 * AlertNotice Title Component
 */
const Title = ({ children }: AlertNoticeContentProps) => (
  <h6 className={Styles['__title'] ?? ''}>{children}</h6>
);
Title.displayName = 'AlertNotice.Title';

/**
 * AlertNotice Body Content Component
 */
const BodyContent = ({ children }: AlertNoticeContentProps) => (
  <div className={Styles['__body'] ?? ''}>{children}</div>
);
BodyContent.displayName = 'AlertNotice.Body';

/**
 * AlertNotice Icon Component with Status-based Icons
 */
const Icon = ({ status }: AlertNoticeIconProps) => {
  const icons = {
    info: 'info-circle' as const,
    success: 'check-circle' as const,
    warning: 'exclamation-triangle' as const,
    danger: 'exclamation-circle' as const,
  };

  // Safe icon selection with fallback
  const iconKey = icons[status] ?? icons.info;
  const IconComponent = LocalIcons[iconKey];

  if (!IconComponent) {
    console.warn(`Icon component not found for status: ${status}`);
    return null;
  }

  return (
    <div className={Styles['__icon'] ?? ''}>
      <IconComponent aria-hidden={true} />
    </div>
  );
};
Icon.displayName = 'AlertNotice.Icon';

export { Container, Title, BodyContent, Icon };
export type { AlertNoticeProps, AlertNoticeTheme } from './AlertNotice.types';

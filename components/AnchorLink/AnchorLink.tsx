import React, { useMemo, forwardRef } from 'react';
import styles from './AnchorLink.module.scss';
import {
  AnchorLinkProps,
  AnchorLinkTheme,
  DEFAULT_ANCHOR_LINK_TOKENS,
} from './AnchorLink.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';
import defaultTokenConfig from './AnchorLink.tokens.json';

function useAnchorLinkTokens(theme?: AnchorLinkTheme) {
  return useMemo(() => {
    const sources: TokenSource[] = [{ type: 'json', data: defaultTokenConfig }];
    if (theme?.tokenConfig)
      sources.push({ type: 'json', data: theme.tokenConfig });
    if (theme?.tokens) {
      const inline: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([k, v]) => {
        inline[`anchor-link-${k}`] = v;
      });
      sources.push({ type: 'inline', tokens: inline });
    }
    const resolved = mergeTokenSources(sources, {
      fallbacks: (() => {
        const fb: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_ANCHOR_LINK_TOKENS).forEach(([k, v]) => {
          fb[`anchor-link-${k}`] = v;
        });
        return fb;
      })(),
    });
    const cssProperties = tokensToCSSProperties(resolved, 'anchor-link');
    if (theme?.cssProperties) Object.assign(cssProperties, theme.cssProperties);
    return { tokens: resolved, cssProperties };
  }, [theme]);
}

const AnchorLink = forwardRef<HTMLAnchorElement, AnchorLinkProps>(
  (
    {
      variant = 'default',
      size = 'medium',
      underline = 'always',
      disabled = false,
      external = false,
      theme,
      className = '',
      children,
      href,
      target,
      rel,
      ...rest
    },
    ref
  ) => {
    const { cssProperties } = useAnchorLinkTokens(theme);

    const safeVariant = safeTokenValue(variant, 'default', (v) =>
      ['default', 'primary', 'secondary', 'muted', 'danger'].includes(
        v as string
      )
    ) as string;
    const safeSize = safeTokenValue(size, 'medium', (v) =>
      ['small', 'medium', 'large'].includes(v as string)
    ) as string;
    const safeUnderline = safeTokenValue(underline, 'always', (v) =>
      ['none', 'hover', 'always'].includes(v as string)
    ) as string;

    const classes = [
      styles.anchorLink,
      styles[`anchorLink--${safeSize}`] || '',
      styles[`anchorLink--${safeVariant}`] || '',
      styles[`anchorLink--underline${safeUnderline.charAt(0).toUpperCase() + safeUnderline.slice(1)}`] || '',
      disabled ? styles['anchorLink--disabled'] : '',
      className,
    ]
      .filter(Boolean)
      .join(' ');

    // Handle external links
    const linkProps = {
      href: disabled ? undefined : href,
      target: external ? '_blank' : target,
      rel: external ? 'noopener noreferrer' : rel,
      ...rest,
    };

    return (
      <a
        ref={ref}
        className={classes}
        style={cssProperties}
        {...linkProps}
      >
        {children}
        {external && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            style={{ marginLeft: '4px', display: 'inline' }}
            aria-hidden="true"
          >
            <path
              d="M3.5 3.5H8.5V8.5M8.5 3.5L3.5 8.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </a>
    );
  }
);

AnchorLink.displayName = 'AnchorLink';

export default AnchorLink;
export type { AnchorLinkProps, AnchorLinkTheme } from './AnchorLink.types';

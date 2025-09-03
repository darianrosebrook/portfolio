import React, { useMemo } from 'react';
import styles from './Tag.module.scss';
import {
  TagProps,
  TagIconProps,
  TagDismissProps,
  TagTheme,
  DEFAULT_TAG_TOKENS,
} from './Tag.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';
import defaultTokenConfig from './Tag.tokens.json';

function useTagTokens(theme?: TagTheme) {
  return useMemo(() => {
    const sources: TokenSource[] = [{ type: 'json', data: defaultTokenConfig }];

    if (theme?.tokenConfig) {
      sources.push({ type: 'json', data: theme.tokenConfig });
    }

    if (theme?.tokens) {
      const inline: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([k, v]) => {
        inline[`tag-${k}`] = v;
      });
      sources.push({ type: 'inline', tokens: inline });
    }

    const resolved = mergeTokenSources(sources, {
      fallbacks: (() => {
        const fb: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_TAG_TOKENS).forEach(([k, v]) => {
          fb[`tag-${k}`] = v;
        });
        return fb;
      })(),
    });

    const cssProperties = tokensToCSSProperties(resolved, 'tag');
    if (theme?.cssProperties) Object.assign(cssProperties, theme.cssProperties);

    return { tokens: resolved, cssProperties };
  }, [theme]);
}

const TagIcon: React.FC<TagIconProps> = ({ children, size = 'medium', position = 'start', className = '' }) => {
  const classes = [styles.tagIcon, styles[`tagIcon--${size}`] || '', className]
    .filter(Boolean)
    .join(' ');
  return <span className={classes}>{children}</span>;
};

const TagDismiss: React.FC<TagDismissProps> = ({
  onDismiss,
  size = 'medium',
  className = '',
  'aria-label': ariaLabel = 'Remove tag',
}) => {
  const classes = [styles.tagDismiss, className].filter(Boolean).join(' ');
  return (
    <button type="button" className={classes} onClick={onDismiss} aria-label={ariaLabel}>
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
};

const Tag: React.FC<TagProps> = ({
  children,
  size = 'medium',
  variant = 'default',
  shape = 'rounded',
  theme,
  className = '',
  interactive = false,
  selected = false,
  onClick,
  icon,
  iconPosition = 'start',
  dismissible = false,
  onDismiss,
  'aria-label': ariaLabel,
  'data-testid': testId,
}) => {
  const { cssProperties } = useTagTokens(theme);

  const safeSize = safeTokenValue(size, 'medium', (v) => ['small', 'medium', 'large'].includes(v as string)) as string;
  const safeVariant = safeTokenValue(
    variant,
    'default',
    (v) => ['default', 'primary', 'secondary', 'success', 'warning', 'danger', 'info'].includes(v as string)
  ) as string;
  const safeShape = safeTokenValue(shape, 'rounded', (v) => ['rounded', 'pill', 'square'].includes(v as string)) as string;

  const classes = [
    styles.tag,
    styles[`tag--${safeSize}`] || '',
    styles[`tag--${safeVariant}`] || '',
    styles[`tag--${safeShape}`] || '',
    interactive ? styles['tag--interactive'] : '',
    selected ? styles['tag--selected'] : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const Element = interactive ? 'button' : 'span';

  return (
    <Element
      className={classes}
      style={cssProperties}
      onClick={interactive ? onClick : undefined}
      aria-label={ariaLabel}
      data-testid={testId}
    >
      {icon && iconPosition === 'start' && <TagIcon size={safeSize as any} position="start">{icon}</TagIcon>}

      {children && <span className={styles.tagContent}>{children}</span>}

      {icon && iconPosition === 'end' && <TagIcon size={safeSize as any} position="end">{icon}</TagIcon>}

      {dismissible && onDismiss && (
        <TagDismiss onDismiss={onDismiss} size={safeSize as any} aria-label={`Remove ${children || 'tag'}`} />
      )}
    </Element>
  );
};

export { TagIcon, TagDismiss };
export default Tag;
export type { TagProps, TagTheme } from './Tag.types';



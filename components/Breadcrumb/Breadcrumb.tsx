import React, { useMemo } from 'react';
import styles from './Breadcrumb.module.scss';
import {
  BreadcrumbProps,
  BreadcrumbItem,
  BreadcrumbTheme,
  BreadcrumbSeparator,
  DEFAULT_BREADCRUMB_TOKENS,
} from './Breadcrumb.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';
import defaultTokenConfig from './Breadcrumb.tokens.json';

function useBreadcrumbTokens(theme?: BreadcrumbTheme, _size: 'small' | 'medium' | 'large' = 'medium') {
  return useMemo(() => {
    const sources: TokenSource[] = [{ type: 'json', data: defaultTokenConfig }];
    if (theme?.tokenConfig) sources.push({ type: 'json', data: theme.tokenConfig });
    if (theme?.tokens) {
      const inline: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([k, v]) => { inline[`breadcrumb-${k}`] = v; });
      sources.push({ type: 'inline', tokens: inline });
    }
    const resolved = mergeTokenSources(sources, {
      fallbacks: (() => {
        const fb: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_BREADCRUMB_TOKENS).forEach(([k, v]) => { fb[`breadcrumb-${k}`] = v; });
        return fb;
      })(),
    });
    const cssProperties = tokensToCSSProperties(resolved, 'breadcrumb');
    if (theme?.cssProperties) Object.assign(cssProperties, theme.cssProperties);
    return { tokens: resolved, cssProperties };
  }, [theme]);
}

function collapseItems(items: BreadcrumbItem[], maxItems: number): BreadcrumbItem[] {
  if (items.length <= maxItems || maxItems < 4) return items;
  // Pattern: [first, overflow, previous, current]
  const first = items[0];
  const previous = items[items.length - 2];
  const current = items[items.length - 1];
  const overflow: BreadcrumbItem = { label: '…', href: undefined };
  return [first, overflow, previous, current];
}

const SeparatorIcon: React.FC<{ separator: BreadcrumbSeparator; custom?: React.ReactNode }> = ({ separator, custom }) => {
  if (separator === 'custom') return <>{custom}</>;
  if (separator === 'chevron') {
    return (
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M4.5 2.5L7.5 6L4.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (separator === 'dot') {
    return <span aria-hidden>•</span>;
  }
  return <span aria-hidden>/</span>;
};

const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  maxItems = 4,
  separator = 'slash',
  customSeparator,
  size = 'medium',
  theme,
  className = '',
  navAriaLabel = 'Breadcrumb',
  onNavigate,
}) => {
  const { cssProperties } = useBreadcrumbTokens(theme, size);

  const safeSize = safeTokenValue(size, 'medium', (v) => ['small', 'medium', 'large'].includes(v as string)) as string;
  const safeSeparator = safeTokenValue(separator, 'slash', (v) => ['slash', 'chevron', 'dot', 'custom'].includes(v as string)) as BreadcrumbSeparator;

  const isOnly = items.length <= 1;
  const displayItems = collapseItems(items, maxItems);

  const handleClick = (item: BreadcrumbItem, index: number) => (e: React.MouseEvent | React.KeyboardEvent) => {
    if (item.disabled) {
      e.preventDefault();
      return;
    }
    onNavigate?.(item, index, e);
  };

  return (
    <nav className={`${styles.breadcrumbNav} ${className}`} aria-label={navAriaLabel} style={cssProperties}>
      <ol className={styles.breadcrumbList}>
        {displayItems.map((item, index) => {
          const isCurrent = index === displayItems.length - 1;
          const isOverflow = item.label === '…' && !item.href;
          return (
            <li key={`${item.label}-${index}`} className={styles.breadcrumbItem}>
              {index > 0 && (
                <span className={styles.breadcrumbSeparator} aria-hidden>
                  <SeparatorIcon separator={safeSeparator} custom={customSeparator} />
                </span>
              )}

              {isCurrent || isOverflow || !item.href ? (
                <span
                  className={`${styles.breadcrumbLink} ${isCurrent ? styles.breadcrumbCurrent : ''} ${item.disabled ? styles['breadcrumbLink--disabled'] : ''}`}
                  aria-current={isCurrent ? 'page' : undefined}
                >
                  {item.label}
                </span>
              ) : (
                <a
                  className={styles.breadcrumbLink}
                  href={item.href}
                  onClick={handleClick(item, index)}
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
export type { BreadcrumbProps, BreadcrumbItem, BreadcrumbTheme } from './Breadcrumb.types';



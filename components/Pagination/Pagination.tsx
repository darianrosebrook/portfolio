import React, { useMemo, useCallback } from 'react';
import styles from './Pagination.module.scss';
import {
  PaginationProps,
  PaginationTheme,
  PaginationItem,
  DEFAULT_PAGINATION_TOKENS,
} from './Pagination.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';
import defaultTokenConfig from './Pagination.tokens.json';

function usePaginationTokens(theme?: PaginationTheme) {
  return useMemo(() => {
    const sources: TokenSource[] = [{ type: 'json', data: defaultTokenConfig }];
    if (theme?.tokenConfig)
      sources.push({ type: 'json', data: theme.tokenConfig });
    if (theme?.tokens) {
      const inline: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([k, v]) => {
        inline[`pagination-${k}`] = v;
      });
      sources.push({ type: 'inline', tokens: inline });
    }
    const resolved = mergeTokenSources(sources, {
      fallbacks: (() => {
        const fb: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_PAGINATION_TOKENS).forEach(([k, v]) => {
          fb[`pagination-${k}`] = v;
        });
        return fb;
      })(),
    });
    const cssProperties = tokensToCSSProperties(resolved, 'pagination');
    if (theme?.cssProperties) Object.assign(cssProperties, theme.cssProperties);
    return { tokens: resolved, cssProperties };
  }, [theme]);
}

function generatePaginationItems(
  currentPage: number,
  totalPages: number,
  maxVisiblePages: number
): PaginationItem[] {
  const items: PaginationItem[] = [];

  if (totalPages <= 1) return items;

  // Always show first page
  items.push({ type: 'page', page: 1, current: currentPage === 1 });

  // Calculate start and end of visible page range
  let startPage = Math.max(2, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);

  // Adjust if we're near the end
  if (endPage - startPage < maxVisiblePages - 3) {
    startPage = Math.max(2, endPage - maxVisiblePages + 3);
  }

  // Add ellipsis before visible range if needed
  if (startPage > 2) {
    items.push({ type: 'ellipsis' });
  }

  // Add visible page numbers
  for (let i = startPage; i <= endPage; i++) {
    items.push({ type: 'page', page: i, current: i === currentPage });
  }

  // Add ellipsis after visible range if needed
  if (endPage < totalPages - 1) {
    items.push({ type: 'ellipsis' });
  }

  // Always show last page if there's more than one page
  if (totalPages > 1) {
    items.push({ type: 'page', page: totalPages, current: currentPage === totalPages });
  }

  return items;
}

const PaginationItemComponent: React.FC<{
  item: PaginationItem;
  variant: string;
  size: string;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}> = ({ item, variant, size, onClick, onKeyDown }) => {
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
    onKeyDown?.(event);
  };

  const renderContent = () => {
    switch (item.type) {
      case 'page':
        return item.page;
      case 'ellipsis':
        return '…';
      case 'first':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.paginationIcon}
          >
            <path
              d="M11.5 12.5L6.5 8L11.5 3.5M4.5 12.5L-0.5 8L4.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'previous':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.paginationIcon}
          >
            <path
              d="M10.5 12.5L5.5 8L10.5 3.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'next':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.paginationIcon}
          >
            <path
              d="M5.5 3.5L10.5 8L5.5 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      case 'last':
        return (
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={styles.paginationIcon}
          >
            <path
              d="M4.5 3.5L-0.5 8L4.5 12.5M11.5 3.5L6.5 8L11.5 12.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        );
      default:
        return null;
    }
  };

  const classes = [
    styles.paginationItem,
    styles[`paginationItem--${size}`] || '',
    styles[`paginationItem--${variant}`] || '',
    item.current ? styles['paginationItem--active'] : '',
    item.disabled ? styles['paginationItem--disabled'] : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      disabled={item.disabled}
      aria-label={
        item.type === 'page'
          ? `Page ${item.page}`
          : item.type === 'ellipsis'
          ? 'More pages'
          : `${item.type} page`
      }
      aria-current={item.current ? 'page' : undefined}
    >
      {renderContent()}
    </button>
  );
};

const PaginationInfo: React.FC<{
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  size: string;
  className?: string;
}> = ({ currentPage, totalPages, totalItems, itemsPerPage, size, className }) => {
  if (!totalItems || !itemsPerPage) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const classes = [
    styles.paginationInfo,
    styles[`paginationInfo--${size}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classes}>
      Showing {startItem}-{endItem} of {totalItems} results
    </div>
  );
};

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  maxVisiblePages = 5,
  showFirstLast = true,
  showPreviousNext = true,
  showPageNumbers = true,
  showItemsInfo = false,
  variant = 'default',
  size = 'medium',
  alignment = 'center',
  disabled = false,
  theme,
  className = '',
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [10, 20, 50, 100],
  renderItem,
}) => {
  const { cssProperties } = usePaginationTokens(theme);

  const safeVariant = safeTokenValue(variant, 'default', (v) =>
    ['default', 'bordered', 'minimal'].includes(v as string)
  ) as string;
  const safeSize = safeTokenValue(size, 'medium', (v) =>
    ['small', 'medium', 'large'].includes(v as string)
  ) as string;
  const safeAlignment = safeTokenValue(alignment, 'center', (v) =>
    ['left', 'center', 'right'].includes(v as string)
  ) as string;

  const handlePageChange = useCallback(
    (page: number) => {
      if (disabled || page < 1 || page > totalPages) return;
      onPageChange?.(page);
    },
    [disabled, totalPages, onPageChange]
  );

  const handleItemsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newItemsPerPage = parseInt(event.target.value, 10);
      onItemsPerPageChange?.(newItemsPerPage);
    },
    [onItemsPerPageChange]
  );

  const paginationItems = useMemo(() => {
    if (!showPageNumbers) return [];
    return generatePaginationItems(currentPage, totalPages, maxVisiblePages);
  }, [currentPage, totalPages, maxVisiblePages, showPageNumbers]);

  const wrapperClasses = [
    styles.paginationWrapper,
    styles[`paginationWrapper--${safeAlignment}`] || '',
    styles[`paginationWrapper--${safeSize}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  if (totalPages <= 1 && !showItemsInfo) return null;

  return (
    <div className={wrapperClasses} style={cssProperties}>
      {showItemsInfo && (
        <PaginationInfo
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          size={safeSize}
        />
      )}

      {showFirstLast && (
        <PaginationItemComponent
          item={{
            type: 'first',
            disabled: disabled || currentPage === 1,
          }}
          variant={safeVariant}
          size={safeSize}
          onClick={() => handlePageChange(1)}
        />
      )}

      {showPreviousNext && (
        <PaginationItemComponent
          item={{
            type: 'previous',
            disabled: disabled || currentPage === 1,
          }}
          variant={safeVariant}
          size={safeSize}
          onClick={() => handlePageChange(currentPage - 1)}
        />
      )}

      {showPageNumbers &&
        paginationItems.map((item, index) => {
          if (renderItem) {
            return renderItem(item, index);
          }

          if (item.type === 'ellipsis') {
            return (
              <span
                key={`ellipsis-${index}`}
                className={`${styles.paginationItem} ${styles[`paginationItem--${safeSize}`] || ''} ${styles[`paginationItem--${safeVariant}`] || ''}`}
                aria-hidden="true"
              >
                {item.type === 'ellipsis' ? '…' : item.page}
              </span>
            );
          }

          return (
            <PaginationItemComponent
              key={`${item.type}-${item.page || index}`}
              item={item}
              variant={safeVariant}
              size={safeSize}
              onClick={() => item.page && handlePageChange(item.page)}
            />
          );
        })}

      {showPreviousNext && (
        <PaginationItemComponent
          item={{
            type: 'next',
            disabled: disabled || currentPage === totalPages,
          }}
          variant={safeVariant}
          size={safeSize}
          onClick={() => handlePageChange(currentPage + 1)}
        />
      )}

      {showFirstLast && (
        <PaginationItemComponent
          item={{
            type: 'last',
            disabled: disabled || currentPage === totalPages,
          }}
          variant={safeVariant}
          size={safeSize}
          onClick={() => handlePageChange(totalPages)}
        />
      )}

      {onItemsPerPageChange && itemsPerPage && (
        <select
          className={`${styles.paginationSelect} ${styles[`paginationSelect--${safeSize}`] || ''}`}
          value={itemsPerPage}
          onChange={handleItemsPerPageChange}
          disabled={disabled}
        >
          {itemsPerPageOptions.map((option) => (
            <option key={option} value={option}>
              {option} per page
            </option>
          ))}
        </select>
      )}
    </div>
  );
};

export default Pagination;
export type { PaginationProps, PaginationTheme, PaginationItem } from './Pagination.types';

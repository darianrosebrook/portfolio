import React, { useMemo, useState, useCallback } from 'react';
import styles from './Table.module.scss';
import {
  TableProps,
  TableTheme,
  TableColumn,
  TableSortDirection,
  DEFAULT_TABLE_TOKENS,
} from './Table.types';
import {
  mergeTokenSources,
  tokensToCSSProperties,
  safeTokenValue,
  TokenSource,
  TokenValue,
} from '@/utils/designTokens';
import defaultTokenConfig from './Table.tokens.json';

function useTableTokens(theme?: TableTheme) {
  return useMemo(() => {
    const sources: TokenSource[] = [{ type: 'json', data: defaultTokenConfig }];
    if (theme?.tokenConfig)
      sources.push({ type: 'json', data: theme.tokenConfig });
    if (theme?.tokens) {
      const inline: Record<string, TokenValue> = {};
      Object.entries(theme.tokens).forEach(([k, v]) => {
        inline[`table-${k}`] = v;
      });
      sources.push({ type: 'inline', tokens: inline });
    }
    const resolved = mergeTokenSources(sources, {
      fallbacks: (() => {
        const fb: Record<string, TokenValue> = {};
        Object.entries(DEFAULT_TABLE_TOKENS).forEach(([k, v]) => {
          fb[`table-${k}`] = v;
        });
        return fb;
      })(),
    });
    const cssProperties = tokensToCSSProperties(resolved, 'table');
    if (theme?.cssProperties) Object.assign(cssProperties, theme.cssProperties);
    return { tokens: resolved, cssProperties };
  }, [theme]);
}

const SortIcon: React.FC<{ direction?: TableSortDirection }> = ({ direction }) => {
  if (direction === 'asc') {
    return (
      <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 3L9 7H3L6 3Z" fill="currentColor" />
      </svg>
    );
  }

  if (direction === 'desc') {
    return (
      <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 9L3 5H9L6 9Z" fill="currentColor" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 3L9 7H3L6 3Z" fill="currentColor" opacity="0.3" />
      <path d="M6 9L3 5H9L6 9Z" fill="currentColor" opacity="0.3" />
    </svg>
  );
};

const TableHeader: React.FC<{
  columns: TableColumn[];
  sortBy?: string;
  sortDirection?: TableSortDirection;
  onSort?: (key: string, direction: TableSortDirection) => void;
  rowSelection?: any;
  sticky?: boolean;
}> = ({ columns, sortBy, sortDirection, onSort, rowSelection, sticky }) => {
  const handleSort = (column: TableColumn) => {
    if (!column.sortable || !onSort) return;

    let newDirection: TableSortDirection = 'asc';
    if (sortBy === column.key) {
      newDirection = sortDirection === 'asc' ? 'desc' : sortDirection === 'desc' ? null : 'asc';
    }
    onSort(column.key, newDirection);
  };

  return (
    <thead className={styles.tableHeader}>
      <tr className={styles.tableHeaderRow}>
        {rowSelection && (
          <th className={styles.tableHeaderCell}>
            {rowSelection.type === 'checkbox' && (
              <input
                type="checkbox"
                className={styles.tableCheckbox}
                onChange={(e) => {
                  // Handle select all logic
                }}
              />
            )}
          </th>
        )}
        {columns.map((column) => {
          const isCurrentSort = sortBy === column.key;
          const currentDirection = isCurrentSort ? sortDirection : null;

          const cellClasses = [
            styles.tableHeaderCell,
            column.sortable ? styles['tableHeaderCell--sortable'] : '',
            column.align ? styles[`tableHeaderCell--${column.align}`] : '',
            sticky ? styles['tableHeaderCell--sticky'] : '',
            column.className || '',
          ]
            .filter(Boolean)
            .join(' ');

          return (
            <th
              key={column.key}
              className={cellClasses}
              style={{ width: column.width }}
              onClick={() => handleSort(column)}
              tabIndex={column.sortable ? 0 : undefined}
              onKeyDown={(e) => {
                if (column.sortable && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  handleSort(column);
                }
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                {column.title}
                {column.sortable && (
                  <span
                    className={`${styles.tableSortIcon} ${
                      isCurrentSort ? styles['tableSortIcon--active'] : ''
                    }`}
                  >
                    <SortIcon direction={currentDirection} />
                  </span>
                )}
              </div>
            </th>
          );
        })}
      </tr>
    </thead>
  );
};

const TableBody: React.FC<{
  columns: TableColumn[];
  dataSource: any[];
  loading?: boolean;
  empty?: React.ReactNode;
  rowKey?: any;
  selectedRowKeys?: (string | number)[];
  rowSelection?: any;
  onRow?: (record: any, index: number) => any;
}> = ({
  columns,
  dataSource,
  loading,
  empty,
  rowKey = 'id',
  selectedRowKeys = [],
  rowSelection,
  onRow,
}) => {
  const getRowKey = useCallback(
    (record: any, index: number) => {
      if (typeof rowKey === 'function') {
        return rowKey(record);
      }
      return record[rowKey] ?? index;
    },
    [rowKey]
  );

  if (loading) {
    return (
      <tbody className={styles.tableBody}>
        <tr>
          <td
            colSpan={columns.length + (rowSelection ? 1 : 0)}
            className={styles.tableLoading}
          >
            Loading...
          </td>
        </tr>
      </tbody>
    );
  }

  if (!dataSource.length) {
    return (
      <tbody className={styles.tableBody}>
        <tr>
          <td
            colSpan={columns.length + (rowSelection ? 1 : 0)}
            className={styles.tableEmpty}
          >
            {empty || 'No data'}
          </td>
        </tr>
      </tbody>
    );
  }

  return (
    <tbody className={styles.tableBody}>
      {dataSource.map((record, index) => {
        const key = getRowKey(record, index);
        const isSelected = selectedRowKeys.includes(key);
        const rowProps = onRow?.(record, index) || {};

        const rowClasses = [
          styles.tableRow,
          isSelected ? styles['tableRow--selected'] : '',
          rowProps.onClick ? styles['tableRow--clickable'] : '',
          rowProps.className || '',
        ]
          .filter(Boolean)
          .join(' ');

        return (
          <tr key={key} {...rowProps} className={rowClasses}>
            {rowSelection && (
              <td className={styles.tableCell}>
                <input
                  type={rowSelection.type || 'checkbox'}
                  className={styles.tableCheckbox}
                  checked={isSelected}
                  onChange={(e) => {
                    const newSelectedKeys = e.target.checked
                      ? [...selectedRowKeys, key]
                      : selectedRowKeys.filter((k) => k !== key);
                    rowSelection.onChange?.(newSelectedKeys, []);
                  }}
                  disabled={rowSelection.getCheckboxProps?.(record)?.disabled}
                />
              </td>
            )}
            {columns.map((column) => {
              const value = column.dataIndex ? record[column.dataIndex] : record;
              const content = column.render
                ? column.render(value, record, index)
                : value;

              const cellClasses = [
                styles.tableCell,
                column.align ? styles[`tableCell--${column.align}`] : '',
                column.className || '',
              ]
                .filter(Boolean)
                .join(' ');

              return (
                <td key={column.key} className={cellClasses}>
                  {content}
                </td>
              );
            })}
          </tr>
        );
      })}
    </tbody>
  );
};

const Table: React.FC<TableProps> = ({
  columns,
  dataSource,
  variant = 'default',
  size = 'medium',
  loading = false,
  empty,
  caption,
  sticky = false,
  sortable = false,
  sortBy,
  sortDirection,
  selectedRowKeys = [],
  rowSelection,
  pagination,
  theme,
  className = '',
  rowKey = 'id',
  onRow,
  onHeaderRow,
  onSort,
  scroll,
  ...rest
}) => {
  const { cssProperties } = useTableTokens(theme);
  const [internalSortBy, setInternalSortBy] = useState<string | undefined>(sortBy);
  const [internalSortDirection, setInternalSortDirection] = useState<TableSortDirection>(sortDirection || null);

  const safeVariant = safeTokenValue(variant, 'default', (v) =>
    ['default', 'striped', 'bordered', 'minimal'].includes(v as string)
  ) as string;
  const safeSize = safeTokenValue(size, 'medium', (v) =>
    ['small', 'medium', 'large'].includes(v as string)
  ) as string;

  const handleSort = useCallback(
    (key: string, direction: TableSortDirection) => {
      if (sortBy === undefined) {
        setInternalSortBy(key);
        setInternalSortDirection(direction);
      }
      onSort?.(key, direction);
    },
    [sortBy, onSort]
  );

  const currentSortBy = sortBy !== undefined ? sortBy : internalSortBy;
  const currentSortDirection = sortDirection !== undefined ? sortDirection : internalSortDirection;

  const tableClasses = [
    styles.table,
    styles[`table--${safeVariant}`] || '',
    styles[`table--${safeSize}`] || '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const wrapperStyle = {
    ...cssProperties,
    ...(scroll?.x && { overflowX: 'auto' as const }),
    ...(scroll?.y && { maxHeight: scroll.y, overflowY: 'auto' as const }),
  };

  return (
    <div className={styles.tableWrapper} style={wrapperStyle}>
      <table className={tableClasses} {...rest}>
        {caption && <caption className={styles.tableCaption}>{caption}</caption>}
        
        <TableHeader
          columns={columns}
          sortBy={currentSortBy}
          sortDirection={currentSortDirection}
          onSort={sortable ? handleSort : undefined}
          rowSelection={rowSelection}
          sticky={sticky}
        />
        
        <TableBody
          columns={columns}
          dataSource={dataSource}
          loading={loading}
          empty={empty}
          rowKey={rowKey}
          selectedRowKeys={selectedRowKeys}
          rowSelection={rowSelection}
          onRow={onRow}
        />
      </table>
    </div>
  );
};

export default Table;
export type { TableProps, TableTheme, TableColumn } from './Table.types';

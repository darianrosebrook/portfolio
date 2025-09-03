/**
 * Table Component Types
 */

import { CSSProperties, ReactNode, HTMLAttributes, ThHTMLAttributes, TdHTMLAttributes } from 'react';
import { ComponentTokenConfig, TokenValue } from '@/utils/designTokens';

export type TableVariant = 'default' | 'striped' | 'bordered' | 'minimal';
export type TableSize = 'small' | 'medium' | 'large';
export type TableSortDirection = 'asc' | 'desc' | null;

export interface TableColumn<T = any> {
  key: string;
  title: ReactNode;
  dataIndex?: keyof T;
  render?: (value: any, record: T, index: number) => ReactNode;
  sortable?: boolean;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
  fixed?: 'left' | 'right';
  className?: string;
}

export interface TableTokens {
  // Colors
  'color-background': TokenValue;
  'color-background-header': TokenValue;
  'color-background-row-even': TokenValue;
  'color-background-row-odd': TokenValue;
  'color-background-row-hover': TokenValue;
  'color-background-row-selected': TokenValue;
  'color-foreground': TokenValue;
  'color-foreground-header': TokenValue;
  'color-foreground-muted': TokenValue;
  'color-border': TokenValue;
  'color-border-header': TokenValue;
  'color-focus-ring': TokenValue;

  // Typography
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-fontWeight-header': TokenValue;
  'typography-lineHeight': TokenValue;

  // Size
  'size-small-padding': TokenValue;
  'size-medium-padding': TokenValue;
  'size-large-padding': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-large-fontSize': TokenValue;

  // Layout
  'border-width': TokenValue;
  'border-radius': TokenValue;

  // Transition
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;
}

export interface TableTheme {
  tokens?: Partial<TableTokens>;
  cssProperties?: CSSProperties;
  tokenConfig?: ComponentTokenConfig;
}

export interface TableProps<T = any> extends Omit<HTMLAttributes<HTMLTableElement>, 'size'> {
  columns: TableColumn<T>[];
  dataSource: T[];
  variant?: TableVariant;
  size?: TableSize;
  loading?: boolean;
  empty?: ReactNode;
  caption?: ReactNode;
  sticky?: boolean; // sticky header
  sortable?: boolean;
  sortBy?: string;
  sortDirection?: TableSortDirection;
  selectedRowKeys?: (string | number)[];
  rowSelection?: {
    type?: 'checkbox' | 'radio';
    selectedRowKeys?: (string | number)[];
    onChange?: (selectedRowKeys: (string | number)[], selectedRows: T[]) => void;
    getCheckboxProps?: (record: T) => { disabled?: boolean };
  };
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
    onChange?: (page: number, pageSize: number) => void;
  };
  theme?: TableTheme;
  rowKey?: keyof T | ((record: T) => string | number);
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
  onHeaderRow?: (columns: TableColumn<T>[], index: number) => HTMLAttributes<HTMLTableRowElement>;
  onSort?: (key: string, direction: TableSortDirection) => void;
  scroll?: { x?: number | string; y?: number | string };
}

export interface TableHeaderProps {
  columns: TableColumn[];
  sortBy?: string;
  sortDirection?: TableSortDirection;
  onSort?: (key: string, direction: TableSortDirection) => void;
  rowSelection?: any;
  className?: string;
}

export interface TableBodyProps<T = any> {
  columns: TableColumn<T>[];
  dataSource: T[];
  loading?: boolean;
  empty?: ReactNode;
  rowKey?: keyof T | ((record: T) => string | number);
  selectedRowKeys?: (string | number)[];
  rowSelection?: any;
  onRow?: (record: T, index: number) => HTMLAttributes<HTMLTableRowElement>;
  className?: string;
}

export interface TableRowProps extends HTMLAttributes<HTMLTableRowElement> {
  selected?: boolean;
  children: ReactNode;
}

export interface TableCellProps extends TdHTMLAttributes<HTMLTableCellElement> {
  align?: 'left' | 'center' | 'right';
  children: ReactNode;
}

export interface TableHeaderCellProps extends ThHTMLAttributes<HTMLTableHeaderCellElement> {
  sortable?: boolean;
  sortDirection?: TableSortDirection;
  onSort?: () => void;
  align?: 'left' | 'center' | 'right';
  children: ReactNode;
}

export const DEFAULT_TABLE_TOKENS: TableTokens = {
  'color-background': '#ffffff',
  'color-background-header': '#f9fafb',
  'color-background-row-even': '#ffffff',
  'color-background-row-odd': '#f9fafb',
  'color-background-row-hover': '#f3f4f6',
  'color-background-row-selected': '#eff6ff',
  'color-foreground': '#111827',
  'color-foreground-header': '#374151',
  'color-foreground-muted': '#6b7280',
  'color-border': '#e5e7eb',
  'color-border-header': '#d1d5db',
  'color-focus-ring': '#2563eb',

  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '400',
  'typography-fontWeight-header': '600',
  'typography-lineHeight': '1.5',

  'size-small-padding': '8px 12px',
  'size-medium-padding': '12px 16px',
  'size-large-padding': '16px 20px',
  'size-small-fontSize': '14px',
  'size-medium-fontSize': '16px',
  'size-large-fontSize': '18px',

  'border-width': '1px',
  'border-radius': '8px',

  'transition-duration': '0.15s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'background-color, border-color',
};

/**
 * Pagination Component Types
 */

import { CSSProperties, ReactNode } from 'react';
import { ComponentTokenConfig, TokenValue } from '@/utils/designTokens';

export interface PaginationItem {
  type: 'page' | 'ellipsis' | 'previous' | 'next' | 'first' | 'last';
  page?: number;
  disabled?: boolean;
  current?: boolean;
}

export type PaginationVariant = 'default' | 'bordered' | 'minimal';
export type PaginationSize = 'small' | 'medium' | 'large';
export type PaginationAlignment = 'left' | 'center' | 'right';

export interface PaginationTokens {
  // Colors
  'color-background': TokenValue;
  'color-background-hover': TokenValue;
  'color-background-active': TokenValue;
  'color-background-disabled': TokenValue;
  'color-foreground': TokenValue;
  'color-foreground-active': TokenValue;
  'color-foreground-disabled': TokenValue;
  'color-border': TokenValue;
  'color-border-hover': TokenValue;
  'color-border-active': TokenValue;
  'color-focus-ring': TokenValue;

  // Typography
  'typography-fontFamily': TokenValue;
  'typography-fontWeight': TokenValue;
  'typography-fontWeight-active': TokenValue;
  'typography-lineHeight': TokenValue;

  // Size
  'size-small-padding': TokenValue;
  'size-medium-padding': TokenValue;
  'size-large-padding': TokenValue;
  'size-small-fontSize': TokenValue;
  'size-medium-fontSize': TokenValue;
  'size-large-fontSize': TokenValue;
  'size-small-gap': TokenValue;
  'size-medium-gap': TokenValue;
  'size-large-gap': TokenValue;
  'size-small-minWidth': TokenValue;
  'size-medium-minWidth': TokenValue;
  'size-large-minWidth': TokenValue;

  // Layout
  'border-radius': TokenValue;
  'border-width': TokenValue;
  'icon-size': TokenValue;

  // Transition
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;
}

export interface PaginationTheme {
  tokens?: Partial<PaginationTokens>;
  cssProperties?: CSSProperties;
  tokenConfig?: ComponentTokenConfig;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  maxVisiblePages?: number; // how many page numbers to show
  showFirstLast?: boolean;
  showPreviousNext?: boolean;
  showPageNumbers?: boolean;
  showItemsInfo?: boolean;
  variant?: PaginationVariant;
  size?: PaginationSize;
  alignment?: PaginationAlignment;
  disabled?: boolean;
  theme?: PaginationTheme;
  className?: string;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
  renderItem?: (item: PaginationItem, index: number) => ReactNode;
}

export interface PaginationItemProps {
  item: PaginationItem;
  variant?: PaginationVariant;
  size?: PaginationSize;
  className?: string;
  onClick?: () => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export interface PaginationInfoProps {
  currentPage: number;
  totalPages: number;
  totalItems?: number;
  itemsPerPage?: number;
  size?: PaginationSize;
  className?: string;
}

export const DEFAULT_PAGINATION_TOKENS: PaginationTokens = {
  'color-background': 'transparent',
  'color-background-hover': '#f3f4f6',
  'color-background-active': '#e5e7eb',
  'color-background-disabled': '#f9fafb',
  'color-foreground': '#374151',
  'color-foreground-active': '#111827',
  'color-foreground-disabled': '#9ca3af',
  'color-border': '#e5e7eb',
  'color-border-hover': '#d1d5db',
  'color-border-active': '#9ca3af',
  'color-focus-ring': '#2563eb',

  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '500',
  'typography-fontWeight-active': '600',
  'typography-lineHeight': '1.5',

  'size-small-padding': '6px 10px',
  'size-medium-padding': '8px 12px',
  'size-large-padding': '10px 16px',
  'size-small-fontSize': '14px',
  'size-medium-fontSize': '16px',
  'size-large-fontSize': '18px',
  'size-small-gap': '4px',
  'size-medium-gap': '6px',
  'size-large-gap': '8px',
  'size-small-minWidth': '32px',
  'size-medium-minWidth': '40px',
  'size-large-minWidth': '48px',

  'border-radius': '6px',
  'border-width': '1px',
  'icon-size': '16px',

  'transition-duration': '0.15s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'color, background-color, border-color',
};

/**
 * Tabs Component Types
 */

import { CSSProperties, ReactNode } from 'react';
import { ComponentTokenConfig, TokenValue } from '@/utils/designTokens';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
  disabled?: boolean;
  badge?: ReactNode;
}

export type TabsVariant = 'default' | 'pills' | 'underline' | 'bordered';
export type TabsSize = 'small' | 'medium' | 'large';
export type TabsOrientation = 'horizontal' | 'vertical';

export interface TabsTokens {
  // Colors
  'color-background': TokenValue;
  'color-background-active': TokenValue;
  'color-background-hover': TokenValue;
  'color-foreground': TokenValue;
  'color-foreground-active': TokenValue;
  'color-foreground-disabled': TokenValue;
  'color-border': TokenValue;
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

  // Layout
  'border-radius': TokenValue;
  'border-width': TokenValue;
  'indicator-height': TokenValue;
  'content-padding': TokenValue;

  // Transition
  'transition-duration': TokenValue;
  'transition-easing': TokenValue;
  'transition-properties': TokenValue;
}

export interface TabsTheme {
  tokens?: Partial<TabsTokens>;
  cssProperties?: CSSProperties;
  tokenConfig?: ComponentTokenConfig;
}

export interface TabsProps {
  items: TabItem[];
  activeTab?: string;
  defaultActiveTab?: string;
  variant?: TabsVariant;
  size?: TabsSize;
  orientation?: TabsOrientation;
  disabled?: boolean;
  theme?: TabsTheme;
  className?: string;
  tabListClassName?: string;
  tabClassName?: string;
  tabPanelClassName?: string;
  onChange?: (activeTab: string) => void;
  onTabClick?: (tab: TabItem, event: React.MouseEvent | React.KeyboardEvent) => void;
}

export interface TabsWrapperProps {
  children: ReactNode;
  className?: string;
  orientation?: TabsOrientation;
  style?: CSSProperties;
}

export interface TabListProps {
  children: ReactNode;
  className?: string;
  variant?: TabsVariant;
  size?: TabsSize;
  orientation?: TabsOrientation;
  role?: string;
}

export interface TabProps {
  id: string;
  label: ReactNode;
  badge?: ReactNode;
  active?: boolean;
  disabled?: boolean;
  className?: string;
  variant?: TabsVariant;
  size?: TabsSize;
  onClick?: (event: React.MouseEvent | React.KeyboardEvent) => void;
  onKeyDown?: (event: React.KeyboardEvent) => void;
}

export interface TabPanelProps {
  id: string;
  tabId: string;
  children: ReactNode;
  active?: boolean;
  className?: string;
}

export const DEFAULT_TABS_TOKENS: TabsTokens = {
  'color-background': 'transparent',
  'color-background-active': '#f3f4f6',
  'color-background-hover': '#f9fafb',
  'color-foreground': '#6b7280',
  'color-foreground-active': '#111827',
  'color-foreground-disabled': '#9ca3af',
  'color-border': '#e5e7eb',
  'color-border-active': '#2563eb',
  'color-focus-ring': '#2563eb',

  'typography-fontFamily': 'Inter, sans-serif',
  'typography-fontWeight': '500',
  'typography-fontWeight-active': '600',
  'typography-lineHeight': '1.5',

  'size-small-padding': '8px 12px',
  'size-medium-padding': '10px 16px',
  'size-large-padding': '12px 20px',
  'size-small-fontSize': '14px',
  'size-medium-fontSize': '16px',
  'size-large-fontSize': '18px',
  'size-small-gap': '4px',
  'size-medium-gap': '6px',
  'size-large-gap': '8px',

  'border-radius': '6px',
  'border-width': '1px',
  'indicator-height': '2px',
  'content-padding': '16px',

  'transition-duration': '0.15s',
  'transition-easing': 'ease-in-out',
  'transition-properties': 'color, background-color, border-color',
};

'use client';
import * as React from 'react';
import { TabsProvider } from './TabsProvider';
import { Tab } from './slots/Tab';
import { TabPanel } from './slots/TabPanel';
import { TabList } from './slots/TabList';
import styles from './Tabs.module.scss';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  activationMode?: 'auto' | 'manual';
  orientation?: 'horizontal' | 'vertical';
  dir?: 'ltr' | 'rtl';
  loop?: boolean;
  unmountInactive?: boolean;
}

const canViewTransition = () =>
  typeof document !== 'undefined' && 'startViewTransition' in document;

const TabsComponent: React.FC<TabsProps> = ({
  className = '',
  children,
  defaultValue = 'tab1',
  value,
  onValueChange,
  activationMode = 'auto',
  orientation = 'horizontal',
  dir = 'ltr',
  loop = true,
  unmountInactive = false,
  ...rest
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  return (
    <TabsProvider
      defaultValue={defaultValue}
      value={value}
      onValueChange={onValueChange}
      activationMode={activationMode}
      unmountInactive={unmountInactive}
    >
      <div
        ref={ref}
        className={[styles.root, className].filter(Boolean).join(' ')}
        data-state="tabs"
        {...rest}
      >
        {children}
      </div>
    </TabsProvider>
  );
};

// Create compound component type
export const Tabs = TabsComponent as typeof TabsComponent & {
  Tab: typeof Tab;
  Panel: typeof TabPanel;
  List: typeof TabList;
};

// Add compound component properties
Tabs.Tab = Tab;
Tabs.Panel = TabPanel;
Tabs.List = TabList;

Tabs.displayName = 'Tabs';

export default Tabs;

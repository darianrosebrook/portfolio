'use client';
import * as React from 'react';
import { TabsProvider, useTabsContextOptional } from './TabsProvider';
import { Tab } from './slots/Tab';
import { TabPanel } from './slots/TabPanel';
import { TabList } from './slots/TabList';
import './Tabs.css';

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

const _canViewTransition = () =>
  typeof document !== 'undefined' && 'startViewTransition' in document;

const TabsComponent: React.FC<TabsProps> = ({
  className = '',
  children,
  defaultValue,
  value,
  onValueChange,
  activationMode = 'auto',
  orientation: _orientation = 'horizontal',
  dir: _dir = 'ltr',
  loop: _loop = true,
  unmountInactive = false,
  ...rest
}) => {
  const ref = React.useRef<HTMLDivElement>(null);

  // If a consumer-supplied <TabsProvider> already wraps us, defer to it
  // instead of creating an inner one. Two providers in the same subtree
  // would shadow the outer values (the inner one's defaults would win),
  // silently overriding controlled prop wiring from the parent.
  const ancestor = useTabsContextOptional();

  const root = (
    <div
      ref={ref}
      data-ds-component="Tabs"
      data-slot="tabs"
      className={className || undefined}
      data-state="tabs"
      {...rest}
    >
      {children}
    </div>
  );

  if (ancestor) {
    // The wrapping provider owns selection state; <Tabs> here is just the
    // root element + slot host. Defer entirely.
    return root;
  }

  return (
    <TabsProvider
      defaultValue={defaultValue ?? 'tab1'}
      value={value}
      onValueChange={onValueChange}
      activationMode={activationMode}
      unmountInactive={unmountInactive}
    >
      {root}
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

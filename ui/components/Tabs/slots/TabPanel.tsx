'use client';
import * as React from 'react';
import { useTabs } from '../TabsProvider';
import type { TabsValue } from '../types';
import '../Tabs.css';

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: TabsValue;
}

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, className = '', children, ...rest }, ref) => {
    const { value: active, unmountInactive } = useTabs();
    const id = React.useId();

    // Generate a value if none provided - use index-based approach
    const panelValue = value ?? `tab-${id}`;
    const isActive = active === panelValue;

    const content = (
      <div
        ref={ref}
        role="tabpanel"
        data-slot="tabs-panel"
        hidden={!isActive}
        className={[
          'panel',
          isActive ? 'panelActive' : 'panelInactive',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        {...rest}
      >
        {children}
      </div>
    );

    return unmountInactive ? (isActive ? content : null) : content;
  }
);

TabPanel.displayName = 'TabPanel';

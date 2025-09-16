'use client';
import * as React from 'react';
import { useTabs } from '../TabsProvider';
import type { TabsValue } from '../types';
import styles from '../Tabs.module.scss';

export interface TabPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  value: TabsValue;
}

export const TabPanel = React.forwardRef<HTMLDivElement, TabPanelProps>(
  ({ value, className = '', children, ...rest }, ref) => {
    const { value: active, unmountInactive } = useTabs();
    const isActive = active === value;

    const content = (
      <div
        ref={ref}
        role="tabpanel"
        hidden={!isActive}
        className={[
          styles.panel,
          isActive ? styles.panelActive : styles.panelInactive,
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

'use client';
import * as React from 'react';
import { useTabs } from '../TabsProvider';
import styles from '../Tabs.module.scss';

export interface TabListProps extends React.HTMLAttributes<HTMLDivElement> {}

export const TabList: React.FC<TabListProps> = ({
  className = '',
  children,
  ...rest
}) => {
  const { tabs, value } = useTabs();
  const activeIndex = tabs.findIndex((t) => t.value === value);
  return (
    <div
      role="tablist"
      className={[styles.list, className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div
        className={styles.indicator}
        style={{
          transform: `translateX(${Math.max(0, activeIndex) * 100}%)`,
        }}
        data-indicator
      />
      {children}
    </div>
  );
};

TabList.displayName = 'TabList';

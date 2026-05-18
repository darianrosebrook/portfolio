'use client';
import * as React from 'react';
import { useTabs } from '../TabsProvider';
import '../Tabs.css';

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
      data-slot="tabs-list"
      className={['list', className].filter(Boolean).join(' ')}
      {...rest}
    >
      <div
        data-slot="tabs-indicator"
        className="indicator"
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

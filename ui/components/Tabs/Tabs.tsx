'use client';
import * as React from 'react';
import styles from './Tabs.module.scss';

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {}

const canViewTransition = () =>
  typeof document !== 'undefined' && 'startViewTransition' in document;

export const Tabs: React.FC<TabsProps> = ({
  className = '',
  children,
  ...rest
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  return (
    <div
      ref={ref}
      className={[styles.root, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
};

Tabs.displayName = 'Tabs';

export default Tabs;

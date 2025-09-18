/**
 * SideNavigation (Composer)
 * Generated via scaffold CLI.
 */
'use client';
import * as React from 'react';
import styles from './SideNavigation.module.scss';

export interface SideNavigationProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const SideNavigation = React.forwardRef<
  HTMLDivElement,
  SideNavigationProps
>(({ className = '', children, ...rest }, ref) => {
  return (
    <div
      ref={ref}
      className={[styles.sidenavigation, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
});
SideNavigation.displayName = 'SideNavigation';

export default SideNavigation;

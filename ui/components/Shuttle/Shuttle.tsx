/**
 * Shuttle (Compound)
 * Generated via scaffold CLI.
 */
'use client';
import * as React from 'react';
import styles from './Shuttle.module.scss';

export interface ShuttleProps extends React.HTMLAttributes<HTMLDivElement> {}

// Shuttle Item Component
export interface ShuttleItemProps
  extends React.HTMLAttributes<HTMLDivElement> {}

export const ShuttleItem = React.forwardRef<HTMLDivElement, ShuttleItemProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={[styles.item, className].filter(Boolean).join(' ')}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

const ShuttleComponent = React.forwardRef<HTMLDivElement, ShuttleProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={[styles.shuttle, className].filter(Boolean).join(' ')}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

// Create compound component type
export const Shuttle = ShuttleComponent as typeof ShuttleComponent & {
  Item: typeof ShuttleItem;
};

// Add compound component properties
Shuttle.Item = ShuttleItem;

Shuttle.displayName = 'Shuttle';
ShuttleItem.displayName = 'Shuttle.Item';

export default Shuttle;

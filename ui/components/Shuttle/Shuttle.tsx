/**
 * Shuttle (Compound)
 * Generated via scaffold CLI.
 */
'use client';
import * as React from 'react';
import './Shuttle.css';

export interface ShuttleProps extends React.HTMLAttributes<HTMLDivElement> {}

// Shuttle Item Component
export interface ShuttleItemProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ShuttleItem = React.forwardRef<HTMLDivElement, ShuttleItemProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={['item', className].filter(Boolean).join(' ')}
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
        data-ds-component="Shuttle"
        className={['shuttle', className].filter(Boolean).join(' ')}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

ShuttleComponent.displayName = 'Shuttle';

// Create compound component type
export const Shuttle = ShuttleComponent as typeof ShuttleComponent & {
  Item: typeof ShuttleItem;
};

// Add compound component properties
Shuttle.Item = ShuttleItem;

ShuttleItem.displayName = 'Shuttle.Item';

export default Shuttle;

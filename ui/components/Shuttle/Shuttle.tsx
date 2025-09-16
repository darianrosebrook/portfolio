/**
 * Shuttle (Compound)
 * Generated via scaffold CLI.
 */
'use client';
import * as React from 'react';
import styles from './Shuttle.module.scss';

export interface ShuttleProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Shuttle = React.forwardRef<HTMLDivElement, ShuttleProps>(
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
Shuttle.displayName = 'Shuttle';

export default Shuttle;

/**
 * ShowMore (Compound)
 * Generated via scaffold CLI.
 */
'use client';
import * as React from 'react';
import styles from './ShowMore.module.scss';

export interface ShowMoreProps extends React.HTMLAttributes<HTMLDivElement> {}

export const ShowMore = React.forwardRef<HTMLDivElement, ShowMoreProps>(
  ({ className = '', children, ...rest }, ref) => {
    return (
      <div
        ref={ref}
        className={[styles.showmore, className].filter(Boolean).join(' ')}
        {...rest}
      >
        {children}
      </div>
    );
  }
);
ShowMore.displayName = 'ShowMore';

export default ShowMore;

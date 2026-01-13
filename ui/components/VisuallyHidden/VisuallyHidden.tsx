'use client';
import * as React from 'react';
import styles from './VisuallyHidden.module.scss';

export interface VisuallyHiddenProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  /** Element type to render */
  as?: keyof React.JSX.IntrinsicElements;
  /** Whether to show content when focused (for skip links) */
  focusable?: boolean;
}

export const VisuallyHidden = React.forwardRef<
  HTMLElement,
  VisuallyHiddenProps
>(
  (
    {
      as: Component = 'span',
      focusable = false,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    return React.createElement(
      Component,
      {
        ref,
        className: [
          styles.visuallyHidden,
          focusable ? styles.focusable : '',
          className,
        ]
          .filter(Boolean)
          .join(' '),
        ...rest,
      },
      children
    );
  }
);

VisuallyHidden.displayName = 'VisuallyHidden';
export default VisuallyHidden;

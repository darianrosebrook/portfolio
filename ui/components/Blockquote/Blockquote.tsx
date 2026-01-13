'use client';
import * as React from 'react';
import styles from './Blockquote.module.scss';

export interface BlockquoteProps
  extends React.HTMLAttributes<HTMLQuoteElement> {
  /** Citation or source of the quote */
  cite?: string;
  /** Visual variant of the blockquote */
  variant?: 'default' | 'bordered' | 'highlighted';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
}

export const Blockquote = React.forwardRef<HTMLQuoteElement, BlockquoteProps>(
  (
    {
      cite,
      variant = 'default',
      size = 'md',
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    return (
      <blockquote
        ref={ref}
        className={[styles.blockquote, styles[variant], styles[size], className]
          .filter(Boolean)
          .join(' ')}
        cite={cite}
        {...rest}
      >
        {children}
      </blockquote>
    );
  }
);

Blockquote.displayName = 'Blockquote';
export default Blockquote;

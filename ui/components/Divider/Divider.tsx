'use client';
import * as React from 'react';
import { createCSSProperties } from '@/utils/css-custom-properties';
import styles from './Divider.module.scss';

export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Visual orientation of the divider */
  orientation?: 'horizontal' | 'vertical';
  /** Semantic role - separator (default) or presentation for purely decorative */
  decorative?: boolean;
  /** Custom thickness/size */
  thickness?: string;
}

export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  (
    {
      orientation = 'horizontal',
      decorative = false,
      thickness,
      className = '',
      style,
      ...rest
    },
    ref
  ) => {
    const customStyle: React.CSSProperties = {
      ...style,
      ...(thickness &&
        createCSSProperties({
          '--divider-thickness': thickness,
        })),
    };

    return (
      <hr
        ref={ref}
        className={[styles.divider, styles[orientation], className]
          .filter(Boolean)
          .join(' ')}
        role={decorative ? 'presentation' : 'separator'}
        aria-orientation={orientation}
        style={customStyle}
        {...rest}
      />
    );
  }
);

Divider.displayName = 'Divider';
export default Divider;

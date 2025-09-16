'use client';
import * as React from 'react';
import styles from './Label.module.scss';

export interface LabelProps
  extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', children, ...rest }, ref) => (
    <label
      ref={ref}
      className={[styles.label, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </label>
  )
);
Label.displayName = 'Label';

export default Label;

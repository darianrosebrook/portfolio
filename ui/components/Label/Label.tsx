'use client';
import * as React from 'react';
import './Label.css';

export interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {}

export const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className = '', children, ...rest }, ref) => (
    <label
      ref={ref}
      data-ds-component="Label"
      data-slot="label"
      className={['label', className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </label>
  )
);
Label.displayName = 'Label';

export default Label;

'use client';
import * as React from 'react';
import './Text.css';

export interface TextProps extends React.HTMLAttributes<HTMLElement> {
  /** Element type to render */
  as?: 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  /** Typography variant */
  variant?:
    | 'display'
    | 'headline'
    | 'title'
    | 'body'
    | 'caption'
    | 'overline'
    | 'code';
  /** Size within variant */
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl';
  /** Font weight */
  weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
  /** Text alignment */
  align?: 'left' | 'center' | 'right' | 'justify';
  /** Text color variant */
  color?:
    | 'default'
    | 'muted'
    | 'subtle'
    | 'accent'
    | 'success'
    | 'warning'
    | 'error';
  /** Whether text should be truncated */
  truncate?: boolean;
  /** Transform text case */
  transform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
}

export const Text = React.forwardRef<HTMLElement, TextProps>(
  (
    {
      as: Component = 'p',
      variant = 'body',
      size = 'md',
      weight = 'normal',
      align = 'left',
      color = 'default',
      truncate = false,
      transform = 'none',
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
        'data-ds-component': 'Text',
        'data-slot': 'text',
        className: [
          variant,
          size,
          `weight-${weight}`,
          `align-${align}`,
          `color-${color}`,
          truncate ? 'truncate' : '',
          transform !== 'none' ? `transform-${transform}` : '',
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

Text.displayName = 'Text';
export default Text;

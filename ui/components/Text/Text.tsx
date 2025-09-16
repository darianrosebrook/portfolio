'use client';
import * as React from 'react';
import styles from './Text.module.scss';

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
        className: [
          styles.text,
          styles[variant],
          styles[size],
          styles[`weight-${weight}`],
          styles[`align-${align}`],
          styles[`color-${color}`],
          truncate ? styles.truncate : '',
          transform !== 'none' ? styles[`transform-${transform}`] : '',
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

'use client';
import * as React from 'react';
import './List.css';

export interface ListProps extends React.HTMLAttributes<HTMLElement> {
  /** List type */
  as?: 'ul' | 'ol' | 'dl';
  /** Visual variant */
  variant?: 'default' | 'unstyled' | 'inline' | 'divided' | 'spaced';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Marker style for ordered/unordered lists */
  marker?:
    | 'default'
    | 'none'
    | 'disc'
    | 'circle'
    | 'square'
    | 'decimal'
    | 'alpha'
    | 'roman';
  /** Spacing between items */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

export const List = React.forwardRef<HTMLElement, ListProps>(
  (
    {
      as: Component = 'ul',
      variant = 'default',
      size = 'md',
      marker = 'default',
      spacing = 'md',
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
        'data-ds-component': 'List',
        className: [
          'list',
          Component,
          variant,
          size,
          marker !== 'default' ? `marker-${marker}` : '',
          spacing !== 'md' ? `spacing-${spacing}` : '',
          className,
        ]
          .filter(Boolean)
          .join(' '),
        'data-slot': 'list',
        ...rest,
      },
      children
    );
  }
);

List.displayName = 'List';
export default List;

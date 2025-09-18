/**
 * Badge - Versatile badge component supporting multiple variants including status indicators
 * Consolidates Badge and Status components
 */
'use client';
import * as React from 'react';
import { Intent, ControlSize } from '@/types/ui';
import styles from './Badge.module.scss';

export type BadgeVariant = 'default' | 'status' | 'counter' | 'tag';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Visual variant of the badge
   */
  variant?: BadgeVariant;
  /**
   * Intent/severity for status badges
   */
  intent?: Intent;
  /**
   * Size of the badge
   */
  size?: ControlSize;
  /**
   * Icon to display (for status badges)
   */
  icon?: React.ReactNode;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant = 'default',
      intent = 'info',
      size = 'md',
      icon,
      className = '',
      children,
      ...rest
    },
    ref
  ) => {
    const badgeClassName = [
      styles.badge,
      styles[variant],
      variant === 'status' && styles[intent],
      styles[size],
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={badgeClassName} {...rest}>
        {icon && <span className={styles.icon}>{icon}</span>}
        {children && <span className={styles.content}>{children}</span>}
      </div>
    );
  }
);
Badge.displayName = 'Badge';

export default Badge;

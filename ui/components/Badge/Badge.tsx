/**
 * Badge - Versatile badge component supporting multiple variants including status indicators
 * Consolidates Badge and Status components
 *
 * For status indicators, use variant="status" with an intent prop.
 * This replaces the deprecated Status component.
 */
'use client';
import * as React from 'react';
import { Intent, ControlSize } from '@/types/ui';
import styles from './Badge.module.scss';

export type BadgeVariant = 'default' | 'status' | 'counter' | 'tag';

// Default star icon for status variant (matches deprecated Status component)
const StatusStarIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M6.06974 1.35872C6.40266 0.51457 7.59734 0.51457 7.93026 1.35872L9.1034 4.33323C9.20504 4.59095 9.40905 4.79496 9.66677 4.8966L12.6413 6.06974C13.4854 6.40266 13.4854 7.59734 12.6413 7.93026L9.66677 9.1034C9.40905 9.20504 9.40905 9.20504 9.1034 9.66677L7.93026 12.6413C7.59734 13.4854 6.40266 13.4854 6.06974 12.6413L4.8966 9.66677C4.79496 9.40905 4.59095 9.20504 4.33323 9.1034L1.35872 7.93026C0.51457 7.59734 0.51457 6.40266 1.35872 6.06974L4.33323 4.8966C4.59095 4.79496 4.79496 4.59095 4.8966 4.33323L6.06974 1.35872Z" />
  </svg>
);

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
   * Icon to display. For status variant, defaults to a star icon if not provided.
   * Pass `null` to hide the icon entirely.
   */
  icon?: React.ReactNode | null;
  /**
   * Whether to show the default status icon (only applies to status variant)
   * @default true
   */
  showStatusIcon?: boolean;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  (
    {
      variant = 'default',
      intent = 'info',
      size = 'md',
      icon,
      showStatusIcon = true,
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

    // Determine which icon to show
    const renderIcon = () => {
      // If icon is explicitly null, show nothing
      if (icon === null) return null;
      // If icon is provided, use it
      if (icon) return <span className={styles.icon}>{icon}</span>;
      // For status variant with showStatusIcon, use default star
      if (variant === 'status' && showStatusIcon) {
        return (
          <span className={styles.icon}>
            <StatusStarIcon />
          </span>
        );
      }
      return null;
    };

    return (
      <div ref={ref} className={badgeClassName} {...rest}>
        {renderIcon()}
        {children && <span className={styles.content}>{children}</span>}
      </div>
    );
  }
);
Badge.displayName = 'Badge';

export default Badge;

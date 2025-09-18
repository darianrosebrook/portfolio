/**
 * Progress - Determinate and indeterminate progress indicators
 * Supports linear and circular variants
 */
'use client';
import React, { forwardRef } from 'react';
import { ControlSize, Intent } from '@/types/ui';
import styles from './Progress.module.scss';

export type ProgressVariant = 'linear' | 'circular';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Progress value (0-100). If undefined, shows indeterminate progress
   */
  value?: number;
  /**
   * Maximum value (default: 100)
   */
  max?: number;
  /**
   * Progress variant
   */
  variant?: ProgressVariant;
  /**
   * Size of the progress indicator
   */
  size?: ControlSize;
  /**
   * Visual intent/color
   */
  intent?: Intent;
  /**
   * Label for accessibility
   */
  label?: string;
  /**
   * Whether to show percentage text
   */
  showValue?: boolean;
  /**
   * Custom value formatter
   */
  formatValue?: (value: number, max: number) => string;
}

const Progress = forwardRef<HTMLDivElement, ProgressProps>(
  (
    {
      value,
      max = 100,
      variant = 'linear',
      size = 'md',
      intent = 'info',
      label,
      showValue = false,
      formatValue,
      className = '',
      ...rest
    },
    ref
  ) => {
    const isIndeterminate = value === undefined;
    const normalizedValue = isIndeterminate
      ? 0
      : Math.min(Math.max(value, 0), max);
    const percentage = isIndeterminate ? 0 : (normalizedValue / max) * 100;

    const progressClassName = [
      styles.progress,
      styles[variant],
      styles[size],
      styles[intent],
      isIndeterminate && styles.indeterminate,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const formattedValue = formatValue
      ? formatValue(normalizedValue, max)
      : `${Math.round(percentage)}%`;

    const ariaProps = {
      role: 'progressbar',
      'aria-label': label,
      'aria-valuenow': isIndeterminate ? undefined : normalizedValue,
      'aria-valuemin': 0,
      'aria-valuemax': max,
      'aria-valuetext': isIndeterminate ? 'Loading...' : formattedValue,
    };

    if (variant === 'circular') {
      const radius = 16;
      const circumference = 2 * Math.PI * radius;
      const strokeDashoffset = isIndeterminate
        ? 0
        : circumference - (percentage / 100) * circumference;

      return (
        <div ref={ref} className={progressClassName} {...ariaProps} {...rest}>
          <svg
            className={styles.circle}
            width="40"
            height="40"
            viewBox="0 0 40 40"
          >
            {/* Background circle */}
            <circle
              className={styles.circleBackground}
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              strokeWidth="3"
            />
            {/* Progress circle */}
            <circle
              className={styles.circleForeground}
              cx="20"
              cy="20"
              r={radius}
              fill="none"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 20 20)"
            />
          </svg>
          {showValue && !isIndeterminate && (
            <span className={styles.value}>{formattedValue}</span>
          )}
        </div>
      );
    }

    // Linear variant
    return (
      <div ref={ref} className={progressClassName} {...ariaProps} {...rest}>
        <div className={styles.track}>
          <div
            className={styles.fill}
            style={{
              width: isIndeterminate ? undefined : `${percentage}%`,
            }}
          />
        </div>
        {showValue && !isIndeterminate && (
          <span className={styles.value}>{formattedValue}</span>
        )}
      </div>
    );
  }
);

Progress.displayName = 'Progress';

export default Progress;

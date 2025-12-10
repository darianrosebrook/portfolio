/**
 * @deprecated Use SwitchField from '@/ui/components/Switch' instead.
 *
 * Migration:
 * ```tsx
 * // Before:
 * <ToggleSwitch checked={value} onChange={handler}>
 *   Label text
 * </ToggleSwitch>
 *
 * // After:
 * <SwitchField
 *   checked={value}
 *   onChange={handler}
 *   label="Label text"
 * />
 * ```
 */
'use client';
import React, { ReactNode, useMemo } from 'react';
import styles from './ToggleSwitch.module.scss';

type NativeInputProps = React.ComponentProps<'input'>;

/** @deprecated Use SwitchField instead */
export type ToggleSwitchProps = Omit<
  NativeInputProps,
  'checked' | 'onChange' | 'type' | 'size'
> & {
  checked: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
  id?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  size?: 'small' | 'medium' | 'large';
  className?: string;
};

const ToggleSwitch = React.forwardRef<HTMLInputElement, ToggleSwitchProps>(
  (
    {
      children,
      checked,
      onChange,
      disabled = false,
      className = '',
      id,
      ariaLabel,
      ariaDescription,
      size = 'medium',
      ...rest
    },
    ref
  ) => {
    const safeId = useMemo(() => {
      if (id) return id;
      if (typeof children === 'string') {
        return `toggleSwitch-${children.replace(/[^\w-]/g, '-')}`;
      }
      return `toggleSwitch-${Math.random().toString(36).substring(2, 9)}`;
    }, [id, children]);

    const sizeClass =
      size === 'small'
        ? styles.small
        : size === 'large'
          ? styles.large
          : styles.medium;

    return (
      <div className={`${styles.toggleSwitch} ${sizeClass} ${className}`}>
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          id={safeId}
          className={`${styles.input} ${checked ? styles.checked : ''}`}
          aria-label={
            ariaLabel || (typeof children === 'string' ? children : undefined)
          }
          aria-checked={checked}
          aria-describedby={
            ariaDescription ? `${safeId}-description` : undefined
          }
          {...rest}
        />
        <label
          className={`${styles.label} ${checked ? styles.checked : ''} ${disabled ? styles.disabled : ''}`}
          htmlFor={safeId}
        >
          {children}
          {ariaDescription && (
            <span id={`${safeId}-description`} className={styles.srOnly}>
              {ariaDescription}
            </span>
          )}
        </label>
      </div>
    );
  }
);

ToggleSwitch.displayName = 'ToggleSwitch';

export default ToggleSwitch;

export const ToggleSwitchGroup = ({
  children,
  className = '',
  orientation = 'vertical',
}: {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}) => {
  const orientationClass =
    orientation === 'horizontal' ? styles.horizontal : styles.vertical;
  return (
    <div
      className={`${styles.toggleSwitchGroup} ${className} ${orientationClass}`}
    >
      {children}
    </div>
  );
};

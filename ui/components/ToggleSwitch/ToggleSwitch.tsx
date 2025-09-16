'use client';
import { ReactNode, useMemo } from 'react';
import styles from './ToggleSwitch.module.scss';

type NativeInputProps = React.ComponentProps<'input'>;

export type ToggleSwitchProps = Omit<
  NativeInputProps,
  'checked' | 'onChange' | 'type' | 'className' | 'size'
> & {
  checked: boolean;
  disabled?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  children: ReactNode;
  className?: string;
  id?: string;
  ariaLabel?: string;
  ariaDescription?: string;
  size?: 'small' | 'medium' | 'large';
};

const ToggleSwitch = ({
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
}: ToggleSwitchProps) => {
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
        type="checkbox"
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        id={safeId}
        className={`${styles.input} ${checked ? styles.checked : ''}`}
        aria-label={
          ariaLabel || (typeof children === 'string' ? children : undefined)
        }
        aria-describedby={ariaDescription ? `${safeId}-description` : undefined}
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
};

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

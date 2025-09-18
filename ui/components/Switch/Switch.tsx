/**
 * Switch - Binary toggle control component
 * Replaces ToggleSwitch with improved API and design token integration
 */
'use client';
import React, { ReactNode, useMemo } from 'react';
import styles from './Switch.module.scss';

type ControlSize = 'sm' | 'md' | 'lg';

type NativeInputProps = React.ComponentProps<'input'>;

export interface SwitchProps
  extends Omit<
    NativeInputProps,
    'checked' | 'onChange' | 'type' | 'className' | 'size'
  > {
  /**
   * Whether the switch is checked
   */
  checked: boolean;
  /**
   * Whether the switch is disabled
   */
  disabled?: boolean;
  /**
   * Change handler
   */
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  /**
   * Label content
   */
  children: ReactNode;
  /**
   * Additional CSS classes
   */
  className?: string;
  /**
   * Unique identifier
   */
  id?: string;
  /**
   * Accessible label
   */
  ariaLabel?: string;
  /**
   * Accessible description
   */
  ariaDescription?: string;
  /**
   * Size of the switch (using design tokens)
   */
  size?: ControlSize;
}

const Switch = ({
  children,
  checked,
  onChange,
  disabled = false,
  className = '',
  id,
  ariaLabel,
  ariaDescription,
  size = 'md',
  ...rest
}: SwitchProps) => {
  const safeId = useMemo(() => {
    if (id) return id;
    if (typeof children === 'string') {
      return `switch-${children.replace(/[^\w-]/g, '-')}`;
    }
    return `switch-${Math.random().toString(36).substring(2, 9)}`;
  }, [id, children]);

  const switchClassName = [
    styles.switch,
    styles[size],
    checked && styles.checked,
    disabled && styles.disabled,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={switchClassName}>
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
          <span id={`${safeId}-description`} className={styles.description}>
            {ariaDescription}
          </span>
        )}
      </label>
    </div>
  );
};

Switch.displayName = 'Switch';

export default Switch;

// Group component for multiple switches
export interface SwitchGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const SwitchGroup = ({
  children,
  className = '',
  orientation = 'vertical',
}: SwitchGroupProps) => {
  const groupClassName = [styles.switchGroup, styles[orientation], className]
    .filter(Boolean)
    .join(' ');

  return <div className={groupClassName}>{children}</div>;
};

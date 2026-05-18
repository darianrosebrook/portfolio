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
import React, { ReactNode, useId, useMemo } from 'react';
import './ToggleSwitch.css';

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
    const generatedId = useId();
    const safeId = useMemo(() => {
      if (id) return id;
      if (typeof children === 'string') {
        return `toggleSwitch-${children.replace(/[^\w-]/g, '-')}`;
      }
      return generatedId;
    }, [id, children, generatedId]);

    const sizeClass =
      size === 'small'
        ? 'small'
        : size === 'large'
          ? 'large'
          : 'medium';

    return (
      <div
        data-ds-component="ToggleSwitch"
        className={`toggleSwitch ${sizeClass} ${className}`}
        data-slot="toggle-switch"
      >
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
          id={safeId}
          className={`input ${checked ? 'checked' : ''}`}
          aria-label={
            ariaLabel || (typeof children === 'string' ? children : undefined)
          }
          aria-checked={checked}
          aria-describedby={
            ariaDescription ? `${safeId}-description` : undefined
          }
          data-slot="toggle-switch-input"
          {...rest}
        />
        <label
          className={`label ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}
          htmlFor={safeId}
          data-slot="toggle-switch-label"
        >
          {children}
          {ariaDescription && (
            <span id={`${safeId}-description`} className="srOnly">
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
    orientation === 'horizontal' ? 'horizontal' : 'vertical';
  return (
    <div
      data-ds-component="ToggleSwitch"
      className={`toggleSwitchGroup ${className} ${orientationClass}`}
    >
      {children}
    </div>
  );
};

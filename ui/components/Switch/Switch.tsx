/**
 * Switch Primitive - Binary toggle control
 *
 * Layer: Primitive
 * Characteristics: Boring, stable, minimal props, design tokens only
 *
 * This is a pure primitive - just the toggle track and thumb.
 * Labels and descriptions belong in SwitchField (compound layer).
 */
'use client';
import React, { useId } from 'react';
import styles from './Switch.module.scss';

export type SwitchSize = 'sm' | 'md' | 'lg';

export interface SwitchProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'size' | 'type' | 'role'
  > {
  /** Size variant using design tokens */
  size?: SwitchSize;
  /** Controlled checked state */
  checked?: boolean;
  /** Default checked state for uncontrolled usage */
  defaultChecked?: boolean;
  /** Whether the switch is disabled */
  disabled?: boolean;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Custom id (auto-generated if not provided) */
  id?: string;
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      size = 'md',
      checked,
      defaultChecked,
      disabled = false,
      onChange,
      className = '',
      id: providedId,
      'aria-label': ariaLabel,
      'aria-labelledby': ariaLabelledBy,
      'aria-describedby': ariaDescribedBy,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    // Determine if checked (controlled vs uncontrolled)
    const isControlled = checked !== undefined;

    const switchClassName = [
      styles.switchPrimitive,
      styles[size],
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <span className={switchClassName} data-slot="switch">
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          id={id}
          className={styles.input}
          checked={isControlled ? checked : undefined}
          defaultChecked={!isControlled ? defaultChecked : undefined}
          disabled={disabled}
          onChange={onChange}
          aria-checked={checked}
          aria-label={ariaLabel}
          aria-labelledby={ariaLabelledBy}
          aria-describedby={ariaDescribedBy}
          {...rest}
        />
        <span className={styles.track} aria-hidden="true">
          <span className={styles.thumb} />
        </span>
      </span>
    );
  }
);

Switch.displayName = 'Switch';

// =============================================================================
// SwitchGroup - For grouping multiple switches
// =============================================================================

export interface SwitchGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'vertical' | 'horizontal';
}

export const SwitchGroup: React.FC<SwitchGroupProps> = ({
  children,
  className = '',
  orientation = 'vertical',
}) => {
  const groupClassName = [
    styles.switchGroup,
    styles[orientation],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={groupClassName} role="group">
      {children}
    </div>
  );
};

SwitchGroup.displayName = 'SwitchGroup';

export default Switch;

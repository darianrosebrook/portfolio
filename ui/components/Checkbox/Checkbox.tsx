/**
 * Checkbox Primitive - Irreducible building block for binary state control
 *
 * Layer: Primitive
 * Characteristics: Boring, stable, minimal props, design tokens only
 *
 * This is a primitive component that provides the basic checkbox functionality
 * without labels, validation, or complex orchestration. Those concerns belong
 * to higher layers (Field composer, forms, etc.)
 */
'use client';
import React, { useId } from 'react';
import styles from './Checkbox.module.scss';

export type CheckboxSize = 'sm' | 'md' | 'lg';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  /** Size variant using design tokens */
  size?: CheckboxSize;
  /** Checked state (controlled) */
  checked?: boolean;
  /** Default checked state (uncontrolled) */
  defaultChecked?: boolean;
  /** Indeterminate state (for partial selections) */
  indeterminate?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Change handler */
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  /** Additional CSS classes */
  className?: string;
  /** Custom id (auto-generated if not provided) */
  id?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      size = 'md',
      checked,
      defaultChecked,
      indeterminate = false,
      disabled = false,
      onChange,
      className = '',
      id: providedId,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    // Handle indeterminate state via ref effect
    const inputRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => inputRef.current!);

    React.useEffect(() => {
      if (inputRef.current) {
        inputRef.current.indeterminate = indeterminate;
      }
    }, [indeterminate]);

    return (
      <div className={`${styles.checkboxWrapper} ${className}`}>
        <input
          ref={inputRef}
          type="checkbox"
          id={id}
          className={`${styles.checkbox} ${styles[`checkbox--${size}`]}`}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          data-size={size}
          data-indeterminate={indeterminate || undefined}
          aria-checked={indeterminate ? 'mixed' : checked}
          {...rest}
        />
        <div className={styles.checkboxIndicator} aria-hidden="true">
          {indeterminate ? (
            <svg
              className={styles.indeterminateIcon}
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M4 8h8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg className={styles.checkIcon} viewBox="0 0 16 16" fill="none">
              <path
                d="M3 8l3 3 7-7"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';

export default Checkbox;

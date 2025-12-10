/**
 * SwitchField Compound - Bundles Switch + Label + Description
 *
 * Layer: Compound
 * Characteristics: Blessed combination with baked-in accessibility
 *
 * This compound bundles the Switch primitive with proper labeling,
 * description support, and ARIA associations.
 */
'use client';
import React, { useId } from 'react';
import { Switch, SwitchSize } from './Switch';
import styles from './Switch.module.scss';

export interface SwitchFieldProps {
  /** Unique identifier - auto-generated if not provided */
  id?: string;
  /** Label text (required for accessibility) */
  label: React.ReactNode;
  /** Optional description/helper text */
  description?: React.ReactNode;
  /** Size variant */
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
  /** Label position relative to switch */
  labelPosition?: 'start' | 'end';
}

export const SwitchField = React.forwardRef<HTMLInputElement, SwitchFieldProps>(
  (
    {
      id: providedId,
      label,
      description,
      size = 'md',
      checked,
      defaultChecked,
      disabled = false,
      onChange,
      className = '',
      labelPosition = 'end',
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || `switch-${generatedId}`;
    const descriptionId = description ? `${id}-description` : undefined;

    const fieldClassName = [
      styles.switchField,
      styles[size],
      disabled && styles.disabled,
      labelPosition === 'start' && styles.labelStart,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div className={fieldClassName} data-slot="switch-field">
        <Switch
          ref={ref}
          id={id}
          size={size}
          checked={checked}
          defaultChecked={defaultChecked}
          disabled={disabled}
          onChange={onChange}
          aria-describedby={descriptionId}
        />
        <div className={styles.labelWrapper}>
          <label htmlFor={id} className={styles.label}>
            {label}
          </label>
          {description && (
            <span id={descriptionId} className={styles.description}>
              {description}
            </span>
          )}
        </div>
      </div>
    );
  }
);

SwitchField.displayName = 'SwitchField';

export default SwitchField;

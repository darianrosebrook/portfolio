/**
 * FormField Component
 *
 * Shared abstraction for form field behavior, providing consistent
 * labeling, error handling, and accessibility patterns across all form components.
 */

'use client';

import React, { useId, useMemo } from 'react';
import { Label } from '../../ui/components/Label';
import styles from './FormField.module.scss';

export interface FormFieldProps {
  /**
   * Label text or React element for the field
   */
  label?: React.ReactNode;

  /**
   * Description text to provide additional context
   */
  description?: React.ReactNode;

  /**
   * Error message to display when validation fails
   */
  error?: React.ReactNode;

  /**
   * Whether the field is required
   */
  required?: boolean;

  /**
   * Whether the field is disabled
   */
  disabled?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Custom ID for the field (auto-generated if not provided)
   */
  id?: string;

  /**
   * The form field component (input, select, textarea, etc.)
   */
  children: React.ReactElement;

  /**
   * Layout orientation
   */
  orientation?: 'vertical' | 'horizontal';

  /**
   * Size variant for consistent spacing
   */
  size?: 'sm' | 'md' | 'lg';
}

export const FormField = React.forwardRef<HTMLDivElement, FormFieldProps>(
  (
    {
      label,
      description,
      error,
      required = false,
      disabled = false,
      className = '',
      id: providedId,
      children,
      orientation = 'vertical',
      size = 'md',
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = providedId || `field-${generatedId}`;
    const labelId = label ? `${fieldId}-label` : undefined;
    const descriptionId = description ? `${fieldId}-description` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;

    // Combine aria-describedby attributes
    const describedBy = useMemo(() => {
      const ids = [];
      if (descriptionId) ids.push(descriptionId);
      if (errorId) ids.push(errorId);
      return ids.length > 0 ? ids.join(' ') : undefined;
    }, [descriptionId, errorId]);

    // Apply form field props to the child component
    const childProps = children.props as any;
    const enhancedChildren = React.cloneElement(children, {
      id: fieldId,
      'aria-labelledby': labelId,
      'aria-describedby': childProps['aria-describedby']
        ? `${childProps['aria-describedby']} ${describedBy || ''}`.trim()
        : describedBy,
      'aria-required': required,
      'aria-invalid': !!error,
      disabled: disabled || childProps.disabled,
      required: required || childProps.required,
    } as any);

    const fieldClasses = [
      styles.field,
      styles[orientation],
      styles[size],
      error && styles.hasError,
      disabled && styles.isDisabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <div ref={ref} className={fieldClasses} {...rest}>
        {label && (
          <Label htmlFor={fieldId} id={labelId} className={styles.label}>
            {label}
          </Label>
        )}

        <div className={styles.inputContainer}>{enhancedChildren}</div>

        {description && (
          <div id={descriptionId} className={styles.description}>
            {description}
          </div>
        )}

        {error && (
          <div
            id={errorId}
            className={styles.error}
            role="alert"
            aria-live="polite"
          >
            {error}
          </div>
        )}
      </div>
    );
  }
);

FormField.displayName = 'FormField';

export default FormField;

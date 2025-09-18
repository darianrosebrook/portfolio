/**
 * {{componentName}} Primitive - {{description}}
 * 
 * Layer: Primitive
 * Characteristics: Boring, stable, minimal props, design tokens only
 * 
 * This is a primitive component that provides basic {{functionality}} functionality
 * without complex orchestration, validation, or layout concerns. Those belong
 * to higher layers (compounds, composers, assemblies).
 */
'use client';
import React, { useId } from 'react';
import styles from './{{componentName}}.module.scss';

export type {{componentName}}Size = 'sm' | 'md' | 'lg';
export type {{componentName}}Variant = 'primary' | 'secondary';

export interface {{componentName}}Props extends Omit<React.{{htmlElement}}HTMLAttributes<HTML{{htmlElement}}Element>, 'size'> {
  /** Size variant using design tokens */
  size?: {{componentName}}Size;
  /** Visual variant */
  variant?: {{componentName}}Variant;
  /** Disabled state */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom id (auto-generated if not provided) */
  id?: string;
  // Add component-specific props here
}

export const {{componentName}} = React.forwardRef<HTML{{htmlElement}}Element, {{componentName}}Props>(
  (
    {
      size = 'md',
      variant = 'primary',
      disabled = false,
      className = '',
      id: providedId,
      children,
      ...rest
    },
    ref
  ) => {
    const generatedId = useId();
    const id = providedId || generatedId;

    const sizeClass = styles[`{{componentNameLower}}--${size}`] || styles['{{componentNameLower}}--md'];
    const variantClass = styles[`{{componentNameLower}}--${variant}`] || styles['{{componentNameLower}}--primary'];

    return (
      <{{htmlElementLower}}
        ref={ref}
        id={id}
        className={`${styles.{{componentNameLower}}} ${sizeClass} ${variantClass} ${className}`}
        disabled={disabled}
        data-size={size}
        data-variant={variant}
        data-disabled={disabled || undefined}
        {...rest}
      >
        {children}
      </{{htmlElementLower}}>
    );
  }
);

{{componentName}}.displayName = '{{componentName}}';

export default {{componentName}};

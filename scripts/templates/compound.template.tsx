/**
 * {{componentName}} Compound - {{description}}
 * 
 * Layer: Compound
 * Characteristics: Bundles primitives, codifies conventions, avoids mega-props
 * 
 * Predictable grouping of primitives that establishes consistent patterns
 * without complex orchestration or state management.
 */
'use client';
import React from 'react';
import styles from './{{componentName}}.module.scss';

export type {{componentName}}Variant = 'default' | 'outlined' | 'filled';
export type {{componentName}}Size = 'sm' | 'md' | 'lg';

export interface {{componentName}}Props {
  /** Content to be displayed */
  children: React.ReactNode;
  /** Visual variant */
  variant?: {{componentName}}Variant;
  /** Size variant */
  size?: {{componentName}}Size;
  /** Additional CSS classes */
  className?: string;
  /** Custom id */
  id?: string;
}

export const {{componentName}} = React.forwardRef<HTMLDivElement, {{componentName}}Props>(
  (
    {
      children,
      variant = 'default',
      size = 'md',
      className = '',
      id,
      ...rest
    },
    ref
  ) => {
    const variantClass = styles[`{{componentNameLower}}--${variant}`] || styles['{{componentNameLower}}--default'];
    const sizeClass = styles[`{{componentNameLower}}--${size}`] || styles['{{componentNameLower}}--md'];

    return (
      <div
        ref={ref}
        id={id}
        className={`${styles.{{componentNameLower}}} ${variantClass} ${sizeClass} ${className}`}
        data-variant={variant}
        data-size={size}
        {...rest}
      >
        {children}
      </div>
    );
  }
);

{{componentName}}.displayName = '{{componentName}}';

// Sub-components for structured composition
export const {{componentName}}Header = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>((props, ref) => {
  const { children, className = '' } = props;
  
  return (
    <div
      ref={ref}
      className={`${styles.header} ${className}`}
    >
      {children}
    </div>
  );
});

{{componentName}}Header.displayName = '{{componentName}}.Header';

export const {{componentName}}Body = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>((props, ref) => {
  const { children, className = '' } = props;
  
  return (
    <div
      ref={ref}
      className={`${styles.body} ${className}`}
    >
      {children}
    </div>
  );
});

{{componentName}}Body.displayName = '{{componentName}}.Body';

export const {{componentName}}Footer = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>((props, ref) => {
  const { children, className = '' } = props;
  
  return (
    <div
      ref={ref}
      className={`${styles.footer} ${className}`}
    >
      {children}
    </div>
  );
});

{{componentName}}Footer.displayName = '{{componentName}}.Footer';

// Attach sub-components
{{componentName}}.Header = {{componentName}}Header;
{{componentName}}.Body = {{componentName}}Body;
{{componentName}}.Footer = {{componentName}}Footer;

export default {{componentName}};

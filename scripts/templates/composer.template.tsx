/**
 * {{componentName}} Composer - {{description}}
 * 
 * Layer: Composer
 * Meta-patterns: Context provider, slotting & substitution, headless logic
 * 
 * Orchestrates {{functionality}} across multiple children using provider pattern
 * and context coordination. Provides slots for flexible composition.
 */
'use client';
import React, { useEffect, useCallback } from 'react';
import { use{{componentName}}Context } from './{{componentName}}Provider';
import styles from './{{componentName}}.module.scss';

export interface {{componentName}}Props {
  /** Content to be orchestrated */
  children: React.ReactNode;
  /** Additional CSS classes */
  className?: string;
  /** Custom keyboard handler */
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

export const {{componentName}} = React.forwardRef<HTMLDivElement, {{componentName}}Props>(
  (props, ref) => {
    const {
      children,
      className = '',
      onKeyDown,
    } = props;

    const {
      // Get orchestration state from context
      isActive,
      id,
      toggle,
      disabled,
      ariaAttributes,
    } = use{{componentName}}Context();

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        // Handle orchestration keyboard events
        switch (e.key) {
          case 'Enter':
          case ' ':
            e.preventDefault();
            toggle();
            break;
          case 'Escape':
            // Handle escape logic
            break;
        }
        onKeyDown?.(e);
      },
      [toggle, onKeyDown]
    );

    return (
      <div
        ref={ref}
        id={id}
        className={`${styles.{{componentNameLower}}} ${className}`}
        data-state={isActive ? 'active' : 'inactive'}
        data-disabled={disabled || undefined}
        onKeyDown={handleKeyDown}
        {...ariaAttributes}
      >
        {children}
      </div>
    );
  }
);

{{componentName}}.displayName = '{{componentName}}';

// Slot components for composition
export const {{componentName}}Trigger = React.forwardRef<
  HTMLButtonElement,
  { children: React.ReactNode; className?: string }
>((props, ref) => {
  const { children, className = '' } = props;
  const { toggle, disabled, ariaAttributes } = use{{componentName}}Context();

  return (
    <button
      ref={ref}
      type="button"
      className={`${styles.trigger} ${className}`}
      onClick={toggle}
      disabled={disabled}
      {...ariaAttributes}
    >
      {children}
    </button>
  );
});

{{componentName}}Trigger.displayName = '{{componentName}}.Trigger';

export const {{componentName}}Content = React.forwardRef<
  HTMLDivElement,
  { children: React.ReactNode; className?: string }
>((props, ref) => {
  const { children, className = '' } = props;
  const { isActive } = use{{componentName}}Context();

  if (!isActive) return null;

  return (
    <div
      ref={ref}
      className={`${styles.content} ${className}`}
      role="region"
    >
      {children}
    </div>
  );
});

{{componentName}}Content.displayName = '{{componentName}}.Content';

// Attach slot components
{{componentName}}.Trigger = {{componentName}}Trigger;
{{componentName}}.Content = {{componentName}}Content;

export default {{componentName}};

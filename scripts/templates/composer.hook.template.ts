/**
 * use{{componentName}} - Headless logic hook for {{componentName}} composer
 * 
 * Handles state management, orchestration logic, and coordination
 * separated from presentation concerns
 */
import { useCallback, useState, useId } from 'react';

export interface Use{{componentName}}Options {
  /** Controlled active state */
  active?: boolean;
  /** Default active state for uncontrolled */
  defaultActive?: boolean;
  /** Callback when active state changes */
  onToggle?: (active: boolean) => void;
  /** Disabled state */
  disabled?: boolean;
  /** Custom id for accessibility */
  id?: string;
}

export interface Use{{componentName}}Return {
  /** Current active state */
  isActive: boolean;
  /** Unique id for accessibility */
  id: string;
  /** Toggle function */
  toggle: () => void;
  /** Set active state directly */
  setActive: (active: boolean) => void;
  /** Whether component is disabled */
  disabled: boolean;
  /** ARIA attributes for accessibility */
  ariaAttributes: {
    'aria-expanded': boolean;
    'aria-disabled'?: boolean;
  };
}

export function use{{componentName}}(options: Use{{componentName}}Options): Use{{componentName}}Return {
  const {
    active,
    defaultActive = false,
    onToggle,
    disabled = false,
    id: providedId,
  } = options;

  const generatedId = useId();
  const id = providedId || `{{componentNameLower}}-${generatedId}`;

  // Handle controlled vs uncontrolled state
  const isControlled = active !== undefined;
  const [internalActive, setInternalActive] = useState(defaultActive);
  const isActive = isControlled ? active : internalActive;

  const setActive = useCallback(
    (newActive: boolean) => {
      if (disabled) return;
      
      if (!isControlled) {
        setInternalActive(newActive);
      }
      onToggle?.(newActive);
    },
    [disabled, isControlled, onToggle]
  );

  const toggle = useCallback(() => {
    setActive(!isActive);
  }, [isActive, setActive]);

  const ariaAttributes = {
    'aria-expanded': isActive,
    ...(disabled && { 'aria-disabled': true }),
  };

  return {
    isActive,
    id,
    toggle,
    setActive,
    disabled,
    ariaAttributes,
  };
}

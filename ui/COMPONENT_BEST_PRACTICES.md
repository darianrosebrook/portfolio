# Component Best Practices Reference

**Last Updated**: 2025-01-17  
**Based on**: Component Audit and Best Practices Implementation

This document provides reference patterns for React hooks, providers, portals, and modern CSS implementation based on our component audit findings.

---

## React Hooks Best Practices

### Hook Dependencies

**Rule**: All useEffect, useCallback, and useMemo dependencies must be complete.

**Anti-pattern**:

```typescript
const updatePosition = useCallback(() => {
  setPosition({ top, left });
  onPositionUpdate?.(position); // Uses stale position
}, [offset, placement]); // Missing position and onPositionUpdate
```

**Correct Pattern**:

```typescript
const updatePosition = useCallback(() => {
  const newPosition = { top, left };
  setPosition(newPosition);
  onPositionUpdate?.(newPosition); // Use fresh value
}, [offset, placement, onPositionUpdate]);
```

### Cleanup Functions

**Rule**: All side effects must have cleanup functions.

**Pattern for Event Listeners**:

```typescript
useEffect(() => {
  const handler = (e: Event) => {
    /* ... */
  };
  document.addEventListener('click', handler);
  return () => document.removeEventListener('click', handler);
}, [dependencies]);
```

**Pattern for ResizeObserver**:

```typescript
useLayoutEffect(() => {
  if (!contentRef.current) return;

  const resizeObserver = new ResizeObserver(() => {
    updatePosition();
  });
  resizeObserver.observe(contentRef.current);

  return () => {
    resizeObserver.disconnect();
  };
}, [updatePosition, contentRef]);
```

**Pattern for GSAP Animations**:

```typescript
useEffect(() => {
  if (!element) return;

  const animation = gsap.to(element, {
    /* ... */
  });

  return () => {
    animation.kill();
  };
}, [element, dependencies]);
```

### Controlled/Uncontrolled Patterns

**Rule**: Support both controlled and uncontrolled usage.

**Pattern**:

```typescript
const isControlled = typeof value !== 'undefined';
const [internalValue, setInternalValue] = useState(defaultValue);
const currentValue = isControlled ? value : internalValue;

const handleChange = useCallback(
  (newValue) => {
    if (!isControlled) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  },
  [isControlled, onChange]
);
```

### useId Usage

**Rule**: Use useId() for consistent ID generation for ARIA relationships.

**Pattern**:

```typescript
const generatedId = useId();
const id = providedId || `component-${generatedId}`;
const labelId = `label-${id}`;
const errorId = `error-${id}`;
```

### Ref Forwarding

**Rule**: All components must forwardRef to the native element.

**Pattern**:

```typescript
const Component = forwardRef<HTMLDivElement, ComponentProps>(
  ({ children, ...props }, ref) => {
    return <div ref={ref} {...props}>{children}</div>;
  }
);

Component.displayName = 'Component';
```

**Pattern for Multiple Refs**:

```typescript
const combinedRef = useCallback(
  (node: HTMLElement) => {
    if (internalRef) {
      internalRef.current = node;
    }
    if (ref) {
      if (typeof ref === 'function') {
        ref(node);
      } else {
        ref.current = node;
      }
    }
  },
  [internalRef, ref]
);
```

---

## Provider/Context Patterns

### Context Creation

**Rule**: Contexts must have null default values and proper type safety.

**Pattern**:

```typescript
interface ContextValue {
  id: string;
  isOpen: boolean;
  toggle: () => void;
}

const ComponentContext = createContext<ContextValue | null>(null);
```

### Provider Composition

**Rule**: Context values must be memoized to avoid unnecessary re-renders.

**Anti-pattern** (Hook in useMemo):

```typescript
// ❌ WRONG - Cannot call hooks inside useMemo
const value = useMemo(() => useSelect(options), [options]);
```

**Correct Pattern** (Hook at top level):

```typescript
// ✅ CORRECT - Hook called at top level
const selectValue = useSelect(options);
const value = useMemo(
  () => selectValue,
  [selectValue.isOpen, selectValue.selectedOptions /* ... */]
);
```

**Alternative Pattern** (If hook returns stable values):

```typescript
// ✅ CORRECT - Hook already returns stable references
const selectValue = useSelect(options);
// useSelect uses useCallback for functions, so no memoization needed
return <Context.Provider value={selectValue}>{children}</Context.Provider>;
```

**Pattern for Simple Context Values**:

```typescript
const contextValue = useMemo(
  () => ({ id, isOpen, toggle }),
  [id, isOpen, toggle]
);
return <Context.Provider value={contextValue}>{children}</Context.Provider>;
```

### Hook Usage with Context

**Rule**: Use custom hooks for context access with error boundaries.

**Pattern**:

```typescript
export const useComponentContext = () => {
  const ctx = useContext(ComponentContext);
  if (!ctx) {
    throw new Error(
      'useComponentContext must be used within ComponentProvider'
    );
  }
  return ctx;
};
```

---

## Portal/Popover Best Practices

### Portal Mount Point

**Rule**: All portals must have SSR safety checks.

**Pattern**:

```typescript
return typeof document !== 'undefined'
  ? createPortal(content, document.body)
  : null;
```

### Focus Management

**Rule**: Portal components must manage focus (initial, return, trap).

**Pattern for Initial and Return Focus**:

```typescript
useEffect(() => {
  if (!isOpen) return;

  const previousFocus = document.activeElement as HTMLElement;

  // Set initial focus
  const focusElement =
    contentRef.current?.querySelector('[autofocus]') ||
    contentRef.current?.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    ) ||
    contentRef.current;

  if (
    focusElement &&
    typeof (focusElement as HTMLElement).focus === 'function'
  ) {
    (focusElement as HTMLElement).focus();
  }

  return () => {
    // Return focus to trigger or previous element
    if (triggerRef.current && document.contains(triggerRef.current)) {
      triggerRef.current.focus();
    } else if (previousFocus && document.contains(previousFocus)) {
      previousFocus.focus();
    }
  };
}, [isOpen, contentRef, triggerRef]);
```

**Pattern for Focus Trap**:

```typescript
useEffect(() => {
  if (!isOpen || !modal) return;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Tab') {
      const focusableElements = contentRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );

      if (!focusableElements || focusableElements.length === 0) return;

      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[
        focusableElements.length - 1
      ] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    }
  };

  document.addEventListener('keydown', handleKeyDown);
  return () => document.removeEventListener('keydown', handleKeyDown);
}, [isOpen, modal, contentRef]);
```

### Event Handling

**Rule**: Outside click and escape key handling must be properly cleaned up.

**Pattern**:

```typescript
useEffect(() => {
  if (!isOpen) return;

  const handleClickOutside = (e: MouseEvent) => {
    const target = e.target as Node;
    if (
      !contentRef.current?.contains(target) &&
      !triggerRef.current?.contains(target)
    ) {
      setIsOpen(false);
    }
  };

  const handleEscape = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && isOpen) {
      setIsOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  document.addEventListener('keydown', handleEscape);

  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
    document.removeEventListener('keydown', handleEscape);
  };
}, [isOpen, contentRef, triggerRef, setIsOpen]);
```

---

## Modern CSS Implementation

### CSS Nesting Migration

**Rule**: Use modern SCSS nesting instead of BEM-style class names.

**Anti-pattern (BEM)**:

```scss
.button {
  .button__icon {
  }
  .button__text {
  }
  &.button--primary {
  }
}
```

**Correct Pattern (Modern Nesting)**:

```scss
.button {
  .icon {
  }
  .text {
  }
  &.primary {
  }
}
```

**TypeScript Usage**:

```typescript
// ❌ BEM
<div className={styles['__title']}>

// ✅ Modern
<div className={styles.title}>
```

### Logical Properties

**Rule**: Use logical properties instead of directional properties.

**Mapping**:

- `left` → `inset-inline-start`
- `right` → `inset-inline-end`
- `top` → `inset-block-start`
- `bottom` → `inset-block-end`
- `margin-left` → `margin-inline-start`
- `margin-right` → `margin-inline-end`
- `margin-top` → `margin-block-start`
- `margin-bottom` → `margin-block-end`
- `padding-left` → `padding-inline-start`
- `padding-right` → `padding-inline-end`
- `padding-top` → `padding-block-start`
- `padding-bottom` → `padding-block-end`
- `border-left` → `border-inline-start`
- `border-right` → `border-inline-end`
- `border-top` → `border-block-start`
- `border-bottom` → `border-block-end`

**Pattern**:

```scss
// ❌ Directional
.status {
  position: absolute;
  right: 0;
  bottom: 0;
}

// ✅ Logical
.status {
  position: absolute;
  inset-inline-end: 0;
  inset-block-end: 0;
}
```

### Container Queries

**Rule**: Use container queries for component-level responsive design.

**Pattern** (Future enhancement):

```scss
.card {
  container-type: inline-size;

  @container (min-width: 400px) {
    .header {
      flex-direction: row;
    }
  }
}
```

### Modern CSS Features

**Rule**: Use `:has()` for component state styling and `:where()` for low specificity.

**Pattern for `:has()`**:

```scss
.card {
  &:has(.badge) {
    padding-block-start: var(--spacing-large);
  }
}
```

**Pattern for `:where()`**:

```scss
:where(.button) {
  /* Low specificity base styles */
}
```

### Animation Performance

**Rule**: Prefer transform and opacity over layout properties.

**Pattern**:

```typescript
// ✅ Good - uses transform/opacity
gsap.to(element, {
  opacity: 1,
  y: 0,
  scale: 1,
  ease: 'power2.out',
});

// ❌ Bad - triggers layout
gsap.to(element, {
  width: '100%',
  height: '100%',
});
```

---

## Common Pitfalls to Avoid

### 1. Calling Hooks Conditionally or Inside Other Hooks

```typescript
// ❌ WRONG
const value = useMemo(() => useSelect(options), [options]);

// ✅ CORRECT
const selectValue = useSelect(options);
```

### 2. Missing Dependencies in useCallback/useMemo

```typescript
// ❌ WRONG - missing dependencies
const handler = useCallback(() => {
  doSomething(value, otherValue);
}, []);

// ✅ CORRECT
const handler = useCallback(() => {
  doSomething(value, otherValue);
}, [value, otherValue]);
```

### 3. Creating New Context Values on Every Render

```typescript
// ❌ WRONG - new object every render
<Context.Provider value={{ id, isOpen, toggle }}>

// ✅ CORRECT - memoized
const contextValue = useMemo(() => ({ id, isOpen, toggle }), [id, isOpen, toggle]);
<Context.Provider value={contextValue}>
```

### 4. Missing Cleanup in useEffect

```typescript
// ❌ WRONG - no cleanup
useEffect(() => {
  document.addEventListener('click', handler);
}, []);

// ✅ CORRECT - with cleanup
useEffect(() => {
  document.addEventListener('click', handler);
  return () => document.removeEventListener('click', handler);
}, []);
```

### 5. Using Directional Properties Instead of Logical

```scss
// ❌ WRONG
margin-left: 1rem;
padding-right: 1rem;

// ✅ CORRECT
margin-inline-start: 1rem;
padding-inline-end: 1rem;
```

---

## Testing Checklist

After implementing fixes, verify:

- [ ] Component renders correctly
- [ ] No console errors
- [ ] No TypeScript errors
- [ ] Accessibility works (ARIA, keyboard navigation)
- [ ] Focus management works (for interactive components)
- [ ] Animations work (for animated components)
- [ ] SSR rendering works (for portal components)
- [ ] Controlled/uncontrolled patterns work
- [ ] CSS styling is correct (visual inspection)

---

## References

- [React Hooks Rules](https://react.dev/reference/rules/rules-of-hooks)
- [CSS Logical Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Logical_Properties)
- [Container Queries](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Container_Queries)
- [ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)

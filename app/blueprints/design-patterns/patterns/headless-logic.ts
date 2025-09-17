// Headless Logic Pattern
// Separate behavior from presentation for maximum flexibility and testability

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

/**
 * Headless logic separates the behavior and state management from the visual presentation.
 * This pattern enables maximum flexibility while maintaining consistent behavior across
 * different visual implementations.
 */

// Example: OTP Input Logic (from example1.md)
export interface UseOtpOptions {
  length: number;
  mode: 'numeric' | 'alphanumeric' | RegExp;
  value?: string;
  defaultValue?: string;
  disabled?: boolean;
  readOnly?: boolean;
  onChange?(code: string): void;
  onComplete?(code: string): void;
}

export function useOtp(opts: UseOtpOptions) {
  const {
    length,
    mode,
    value,
    defaultValue,
    disabled,
    readOnly,
    onChange,
    onComplete,
  } = opts;

  const isControlled = typeof value === 'string';
  const [internal, setInternal] = useState<string[]>(() =>
    defaultValue
      ? defaultValue.slice(0, length).split('')
      : Array.from({ length }, () => '')
  );

  const refs = useRef<HTMLInputElement[]>([]);

  const code = (isControlled ? value! : internal.join(''))
    .padEnd(length, '')
    .slice(0, length);
  const chars = code.split('');

  // Core behavior: character validation and focus management
  const setChar = useCallback(
    (index: number, ch: string) => {
      if (disabled || readOnly) return;
      if (!guardChar(ch, mode)) return;

      const next = chars.slice();
      next[index] = ch;

      const joined = next.join('');
      if (!isControlled) setInternal(next);
      onChange?.(joined);

      // Advance focus
      if (index < length - 1) refs.current[index + 1]?.focus();
      else onComplete?.(joined);
    },
    [
      chars,
      disabled,
      readOnly,
      isControlled,
      length,
      mode,
      onChange,
      onComplete,
    ]
  );

  // Core behavior: paste handling
  const handlePaste = useCallback(
    (index: number, text: string) => {
      if (disabled || readOnly) return;
      const clean = Array.from(text)
        .filter((ch) => guardChar(ch, mode))
        .slice(0, length - index);
      if (clean.length === 0) return;

      const next = chars.slice();
      for (let i = 0; i < clean.length; i++) next[index + i] = clean[i];

      const joined = next.join('');
      if (!isControlled) setInternal(next);
      onChange?.(joined);

      const last = Math.min(index + clean.length - 1, length - 1);
      if (next.every(Boolean)) onComplete?.(joined);
      refs.current[last]?.focus();
    },
    [
      chars,
      disabled,
      readOnly,
      isControlled,
      length,
      mode,
      onChange,
      onComplete,
    ]
  );

  // Stable API for UI components
  return useMemo(
    () => ({
      length,
      chars,
      disabled: !!disabled,
      readOnly: !!readOnly,
      register: (el: HTMLInputElement | null, i: number) => {
        if (el) refs.current[i] = el;
      },
      setChar,
      clearChar: (index: number) => {
        if (disabled || readOnly) return;
        const next = chars.slice();
        next[index] = '';
        const joined = next.join('');
        if (!isControlled) setInternal(next);
        onChange?.(joined);
      },
      handlePaste,
      focus: (i: number) => refs.current[i]?.focus(),
    }),
    [length, chars, disabled, readOnly, setChar, handlePaste]
  );
}

function guardChar(ch: string, mode: 'numeric' | 'alphanumeric' | RegExp) {
  if (mode === 'numeric') return /^[0-9]$/.test(ch);
  if (mode === 'alphanumeric') return /^[a-zA-Z0-9]$/.test(ch);
  return (mode as RegExp).test(ch);
}

/**
 * Key Benefits of Headless Logic:
 *
 * 1. Testability: Logic can be tested in isolation without UI concerns
 * 2. Reusability: Same logic works across different visual implementations
 * 3. Flexibility: UI can be completely customized while maintaining behavior
 * 4. Performance: Logic optimizations don't affect UI rendering
 * 5. Maintainability: Behavior changes happen in one place
 */

// Example: Toolbar Logic (from example3.md)
export interface UseToolbarOptions {
  actions: ActionSpec[];
  overflow?: 'auto' | 'never' | 'always';
  strategy?: 'collapse' | 'wrap';
}

export function useToolbar(opts: UseToolbarOptions) {
  const { actions, overflow = 'auto', strategy = 'collapse' } = opts;

  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);
  const [measures, setMeasures] = useState<Record<string, number>>({});

  // Layout algorithm: priority-based overflow
  const layout = useMemo(() => {
    if (overflow === 'never' || strategy === 'wrap') {
      return {
        items: actions,
        overflowIds: [],
        visibleIds: actions.map((a) => a.id),
      };
    }

    const items = [...actions];
    const total = items.reduce((acc, it) => acc + (measures[it.id] || 0), 0);

    if (total <= containerWidth) {
      return { items, overflowIds: [], visibleIds: items.map((i) => i.id) };
    }

    // Sort by priority (3 collapses first, then 2, then 1)
    const collapseOrder = items
      .map((it, idx) => ({ it, idx, pr: it.priority ?? 2 }))
      .sort((a, b) => b.pr - a.pr || b.idx - a.idx);

    const overflowIds: string[] = [];
    let used = 48; // reserve "More" trigger space

    for (const { it } of collapseOrder.reverse()) {
      const next = used + (it.width || 0);
      if (next <= containerWidth) {
        it.visible = true;
        used = next;
      } else {
        it.visible = false;
        overflowIds.push(it.id);
      }
    }

    return {
      items,
      overflowIds,
      visibleIds: items.filter((i) => i.visible).map((i) => i.id),
    };
  }, [actions, containerWidth, measures, overflow, strategy]);

  return {
    containerRef,
    state: () => ({
      items: layout.items,
      containerWidth,
      overflowIds: layout.overflowIds,
      visibleIds: layout.visibleIds,
    }),
    registerMeasure: (id: string, w: number) => {
      setMeasures((m) => (m[id] === w ? m : { ...m, [id]: w }));
    },
  };
}

interface ActionSpec {
  id: string;
  priority?: 1 | 2 | 3;
  width?: number;
  visible?: boolean;
}

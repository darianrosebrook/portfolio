'use client';
import * as React from 'react';
import { useTabs } from '../TabsProvider';
import type { TabsValue } from '../types';
import styles from '../Tabs.module.scss';

export interface TabProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: TabsValue;
  disabled?: boolean;
}

export const Tab = React.forwardRef<HTMLButtonElement, TabProps>(
  (
    { value, disabled = false, className = '', onClick, onKeyDown, ...rest },
    forwardedRef
  ) => {
    const {
      tabs,
      registerTab,
      unregisterTab,
      selectByValue,
      focusByIndex,
      focusedIndex,
      value: active,
      activationMode,
    } = useTabs();
    const id = React.useId();
    const index = tabs.findIndex((t) => t.value === value);
    const isSelected = active === value;
    const tabIndex = disabled
      ? -1
      : isSelected || index === focusedIndex
        ? 0
        : -1;

    const localRef = React.useRef<HTMLButtonElement | null>(null);
    const ref = (node: HTMLButtonElement | null) => {
      localRef.current = node;
      if (typeof forwardedRef === 'function') forwardedRef(node);
      else if (forwardedRef)
        (
          forwardedRef as React.MutableRefObject<HTMLButtonElement | null>
        ).current = node;
    };

    React.useEffect(() => {
      registerTab({ id, value, disabled });
      return () => unregisterTab(value);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id, value, disabled]);

    // Move DOM focus when focusedIndex points to this tab
    React.useEffect(() => {
      if (!disabled && index === focusedIndex) {
        localRef.current?.focus();
      }
    }, [disabled, index, focusedIndex]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      if (disabled) return;
      selectByValue(value);
      onClick?.(e);
    };

    const nextEnabledIndex = (start: number, dir: 1 | -1) => {
      if (tabs.length === 0) return start;
      let i = start;
      for (let step = 0; step < tabs.length; step++) {
        i = (i + dir + tabs.length) % tabs.length;
        if (!tabs[i]?.disabled) return i;
      }
      return start;
    };

    const domRove = (
      current: HTMLButtonElement,
      dir: 1 | -1
    ): string | null => {
      const list = current.closest('[role="tablist"]');
      const nodes = list
        ? Array.from(list.querySelectorAll<HTMLButtonElement>('[role="tab"]'))
        : [];
      if (nodes.length === 0) return null;
      let i = nodes.indexOf(current);
      for (let step = 0; step < nodes.length; step++) {
        i = (i + dir + nodes.length) % nodes.length;
        const next = nodes[i];
        if (next.getAttribute('aria-disabled') === 'true') continue;
        next.focus();
        if (activationMode === 'auto') next.click();
        return next.getAttribute('data-value');
      }
      return null;
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (disabled) return;
      switch (e.key) {
        case 'ArrowRight':
        case 'ArrowDown': {
          if (tabs.length && index >= 0) {
            const next = nextEnabledIndex(index, 1);
            focusByIndex(next);
            const nextVal = tabs[next]?.value;
            if (nextVal && activationMode === 'auto') selectByValue(nextVal);
          } else {
            const nv = domRove(e.currentTarget, 1);
            if (nv) {
              const ni = tabs.findIndex((t) => t.value === nv);
              if (ni >= 0) focusByIndex(ni);
            }
          }
          e.preventDefault();
          break;
        }
        case 'ArrowLeft':
        case 'ArrowUp': {
          if (tabs.length && index >= 0) {
            const prev = nextEnabledIndex(index, -1);
            focusByIndex(prev);
            const prevVal = tabs[prev]?.value;
            if (prevVal && activationMode === 'auto') selectByValue(prevVal);
          } else {
            const pv = domRove(e.currentTarget, -1);
            if (pv) {
              const pi = tabs.findIndex((t) => t.value === pv);
              if (pi >= 0) focusByIndex(pi);
            }
          }
          e.preventDefault();
          break;
        }
        case 'Home': {
          if (tabs.length) focusByIndex(nextEnabledIndex(-1, 1));
          else domRove(e.currentTarget, -1);
          e.preventDefault();
          break;
        }
        case 'End': {
          if (tabs.length) focusByIndex(nextEnabledIndex(0, -1));
          else domRove(e.currentTarget, 1);
          e.preventDefault();
          break;
        }
        case 'Enter':
        case ' ': {
          selectByValue(value);
          e.preventDefault();
          break;
        }
      }
      onKeyDown?.(e);
    };

    return (
      <button
        ref={ref}
        role="tab"
        data-value={value}
        aria-selected={isSelected}
        aria-disabled={disabled || undefined}
        tabIndex={tabIndex}
        className={[
          styles.tab,
          isSelected ? styles.tabActive : '',
          disabled ? styles.tabDisabled : '',
          className,
        ]
          .filter(Boolean)
          .join(' ')}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {rest.children}
      </button>
    );
  }
);

Tab.displayName = 'Tab';

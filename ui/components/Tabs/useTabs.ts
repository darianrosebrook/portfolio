import * as React from 'react';
import type {
  TabsActivationMode,
  TabsContextValue,
  TabsValue,
  TabRegistration,
} from './types';

export interface UseTabsOptions {
  defaultValue?: TabsValue;
  value?: TabsValue;
  onValueChange?(val: TabsValue): void;
  activationMode?: TabsActivationMode;
  unmountInactive?: boolean;
  idBase?: string;
}

export function useTabs(options: UseTabsOptions = {}): TabsContextValue {
  const {
    defaultValue = null as unknown as TabsValue,
    value,
    onValueChange,
    activationMode = 'manual',
    unmountInactive = false,
    idBase = React.useId(),
  } = options;

  const isControlled = typeof value === 'string';
  const [internalValue, setInternalValue] = React.useState<TabsValue | null>(
    isControlled ? value! : defaultValue
  );
  React.useEffect(() => {
    if (isControlled) setInternalValue(value!);
  }, [isControlled, value]);

  const [tabs, setTabs] = React.useState<TabRegistration[]>([]);
  const [focusedIndex, setFocusedIndex] = React.useState(0);

  const performSelect = React.useCallback(
    (nextVal: TabsValue) => {
      const doUpdate = () => {
        if (!isControlled) setInternalValue(nextVal);
        onValueChange?.(nextVal);
      };
      // View Transitions for content swap
      const d = document as any;
      if (typeof document !== 'undefined' && d?.startViewTransition) {
        d.startViewTransition(() => doUpdate());
      } else {
        doUpdate();
      }
    },
    [isControlled, onValueChange]
  );

  const selectByIndex = React.useCallback(
    (index: number) => {
      const reg = tabs[index];
      if (!reg || reg.disabled) return;
      performSelect(reg.value);
    },
    [tabs, performSelect]
  );

  const selectByValue = React.useCallback(
    (val: TabsValue) => {
      const idx = tabs.findIndex((t) => t.value === val && !t.disabled);
      if (idx >= 0) selectByIndex(idx);
    },
    [tabs, selectByIndex]
  );

  const registerTab = React.useCallback(
    (reg: TabRegistration) => {
      setTabs((prev) => {
        const exists = prev.some((p) => p.value === reg.value);
        if (exists) return prev;
        return [...prev, reg];
      });
      return tabs.length;
    },
    [tabs.length]
  );

  const unregisterTab = React.useCallback((val: TabsValue) => {
    setTabs((prev) => prev.filter((t) => t.value !== val));
  }, []);

  const focusByIndex = React.useCallback(
    (index: number) => {
      if (index < 0 || index >= tabs.length) return;
      setFocusedIndex(index);
      if (activationMode === 'auto') {
        const v = tabs[index]?.value;
        if (v) performSelect(v);
      }
    },
    [tabs.length, tabs, activationMode, performSelect]
  );

  return {
    value: internalValue,
    focusedIndex,
    tabs,
    activationMode,
    unmountInactive,
    idBase,
    registerTab,
    unregisterTab,
    selectByIndex,
    selectByValue,
    focusByIndex,
  };
}

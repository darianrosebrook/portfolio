export type TabsValue = string;
export type TabsActivationMode = 'manual' | 'auto';

export interface TabRegistration {
  id: string;
  value: TabsValue;
  disabled?: boolean;
}

export interface TabsContextValue {
  value: TabsValue | null;
  focusedIndex: number;
  /**
   * Monotonic counter incremented on every focusByIndex call. Slot effects
   * depend on this so they re-fire even when focusedIndex is set to its
   * current value (e.g. programmatic focus on tab[1] followed by ArrowRight
   * wrapping back to focusedIndex=0, which was already 0 at mount).
   */
  focusTick: number;
  tabs: TabRegistration[];
  activationMode: TabsActivationMode;
  unmountInactive: boolean;
  idBase: string;
  registerTab(reg: TabRegistration): number; // returns index
  unregisterTab(value: TabsValue): void;
  selectByIndex(index: number): void;
  selectByValue(value: TabsValue): void;
  focusByIndex(index: number): void;
}

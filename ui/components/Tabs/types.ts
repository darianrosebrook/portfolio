import * as React from 'react';

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

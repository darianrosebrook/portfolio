'use client';
import * as React from 'react';
import type { TabsContextValue } from './types';
import { useTabs as useTabsLogic, UseTabsOptions } from './useTabs';

const TabsContext = React.createContext<TabsContextValue | null>(null);
export function useTabsContext(): TabsContextValue {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error('useTabs must be used within <TabsProvider>');
  return ctx;
}

// Alias for consumers
export function useTabs(): TabsContextValue {
  return useTabsContext();
}

export interface TabsProviderProps extends UseTabsOptions {
  children: React.ReactNode;
}

export function TabsProvider({ children, ...opts }: TabsProviderProps) {
  const api = useTabsLogic(opts);
  const value = React.useMemo(() => api, [api]);
  return <TabsContext.Provider value={value}>{children}</TabsContext.Provider>;
}

/** Context Provider for SideNavigation */
'use client';
import * as React from 'react';
import {
  useSideNavigation,
  type UseSideNavigationOptions,
  type UseSideNavigationReturn,
} from './useSideNavigation';

export type SideNavigationContextValue = UseSideNavigationReturn;

const SideNavigationContext =
  React.createContext<SideNavigationContextValue | null>(null);
export const useSideNavigationContext = () => {
  const ctx = React.useContext(SideNavigationContext);
  if (!ctx)
    throw new Error(
      'useSideNavigationContext must be used within SideNavigationProvider'
    );
  return ctx;
};

export const SideNavigationProvider: React.FC<
  { children: React.ReactNode } & UseSideNavigationOptions
> = ({ children, ...options }) => {
  const value = useSideNavigation(options);
  return (
    <SideNavigationContext.Provider value={value}>
      {children}
    </SideNavigationContext.Provider>
  );
};

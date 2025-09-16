/** Context Provider for SideNavigation */
'use client';
import * as React from 'react';

interface SideNavigationContextValue {}

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

export const SideNavigationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const value = React.useMemo<SideNavigationContextValue>(() => ({}), []);
  return (
    <SideNavigationContext.Provider value={value}>
      {children}
    </SideNavigationContext.Provider>
  );
};

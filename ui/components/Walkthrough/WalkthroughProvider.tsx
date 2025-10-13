/** Context Provider for Walkthrough */
'use client';
import * as React from 'react';
import { useWalkthrough as useWT } from './useWalkthrough';
import type {
  WalkthroughProps,
  WalkthroughStepSpec,
  WalkthroughContextValue,
} from './types';

const WalkthroughContext = React.createContext<WalkthroughContextValue | null>(
  null
);

export const useWalkthrough = () => {
  const ctx = React.useContext(WalkthroughContext);
  if (!ctx) {
    throw new Error(
      'Walkthrough components must be used within <WalkthroughProvider>'
    );
  }
  return ctx;
};

export interface WalkthroughProviderProps extends WalkthroughProps {
  children: React.ReactNode;
  steps?: WalkthroughStepSpec[];
}

export const WalkthroughProvider: React.FC<WalkthroughProviderProps> = ({
  children,
  steps = [],
  ...opts
}) => {
  const api = useWT({ stepsProp: steps, ...opts });

  const value = React.useMemo<WalkthroughContextValue>(() => api, [api]);

  return (
    <WalkthroughContext.Provider value={value}>
      {children}
    </WalkthroughContext.Provider>
  );
};

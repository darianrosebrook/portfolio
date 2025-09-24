/** Context Provider for Accordion */
'use client';
import * as React from 'react';
import {
  useAccordion,
  UseAccordionOptions,
  UseAccordionReturn,
} from './useAccordion';

interface AccordionContextValue extends UseAccordionReturn {
  type: 'single' | 'multiple';
  collapsible: boolean;
}

const AccordionContext = React.createContext<AccordionContextValue | null>(
  null
);

export const useAccordionContext = () => {
  const ctx = React.useContext(AccordionContext);
  if (!ctx)
    throw new Error(
      'useAccordionContext must be used within AccordionProvider'
    );
  return ctx;
};

export interface AccordionProviderProps extends UseAccordionOptions {
  children: React.ReactNode;
}

export const AccordionProvider: React.FC<AccordionProviderProps> = ({
  children,
  type = 'single',
  collapsible = false,
  ...accordionOptions
}) => {
  const accordion = useAccordion({ type, collapsible, ...accordionOptions });

  const value = React.useMemo<AccordionContextValue>(
    () => ({
      ...accordion,
      type,
      collapsible,
    }),
    [accordion, type, collapsible]
  );

  return (
    <AccordionContext.Provider value={value}>
      {children}
    </AccordionContext.Provider>
  );
};

/** Context Provider for Dialog */
'use client';
import * as React from 'react';

interface DialogContextValue {}

const DialogContext = React.createContext<DialogContextValue | null>(null);
export const useDialogContext = () => {
  const ctx = React.useContext(DialogContext);
  if (!ctx)
    throw new Error('useDialogContext must be used within DialogProvider');
  return ctx;
};

export const DialogProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = React.useMemo<DialogContextValue>(() => ({}), []);
  return (
    <DialogContext.Provider value={value}>{children}</DialogContext.Provider>
  );
};

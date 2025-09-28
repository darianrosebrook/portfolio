/** Context Provider for Command */
'use client';
import * as React from 'react';
import { useCommand, UseCommandOptions, UseCommandReturn } from './useCommand';

interface CommandContextValue extends UseCommandReturn {
  inputRef: React.RefObject<HTMLInputElement>;
  listRef: React.RefObject<HTMLDivElement>;
}

const CommandContext = React.createContext<CommandContextValue | null>(null);

export const useCommandContext = () => {
  const ctx = React.useContext(CommandContext);
  if (!ctx)
    throw new Error('useCommandContext must be used within CommandProvider');
  return ctx;
};

export interface CommandProviderProps extends UseCommandOptions {
  children: React.ReactNode;
}

export const CommandProvider: React.FC<CommandProviderProps> = ({
  children,
  ...commandOptions
}) => {
  const command = useCommand(commandOptions);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const value = React.useMemo<CommandContextValue>(
    () => ({
      ...command,
      inputRef: inputRef as React.RefObject<HTMLInputElement>,
      listRef: listRef as React.RefObject<HTMLDivElement>,
    }),
    [command]
  );

  return (
    <CommandContext.Provider value={value}>{children}</CommandContext.Provider>
  );
};

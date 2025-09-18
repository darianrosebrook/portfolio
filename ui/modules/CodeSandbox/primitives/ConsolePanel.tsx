import * as React from 'react';

export type ConsolePanelProps = {
  logs?: { level: 'log' | 'warn' | 'error'; message: string }[];
};

export function ConsolePanel(_props: ConsolePanelProps) {
  return null;
}

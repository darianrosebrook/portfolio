/**
 * {{componentName}}Provider - Context provider for {{componentName}} composer orchestration
 * 
 * Coordinates multiple {{componentName}} components and manages shared state
 */
'use client';
import React, { createContext, useContext } from 'react';
import { use{{componentName}}, type Use{{componentName}}Options, type Use{{componentName}}Return } from './use{{componentName}}';

export interface {{componentName}}ContextValue extends Use{{componentName}}Return {
  // Add any additional context-specific properties here
}

const {{componentName}}Context = createContext<{{componentName}}ContextValue | null>(null);

export function use{{componentName}}Context() {
  const context = useContext({{componentName}}Context);
  if (!context) {
    throw new Error('{{componentName}} components must be used within a {{componentName}}Provider');
  }
  return context;
}

export interface {{componentName}}ProviderProps extends Use{{componentName}}Options {
  children: React.ReactNode;
  /** CSS class for the provider container */
  className?: string;
}

export function {{componentName}}Provider({
  children,
  className,
  ...options
}: {{componentName}}ProviderProps) {
  const {{componentNameLower}}Api = use{{componentName}}(options);

  const contextValue: {{componentName}}ContextValue = {
    ...{{componentNameLower}}Api,
    // Add any additional context values here
  };

  return (
    <{{componentName}}Context.Provider value={contextValue}>
      <div 
        className={className}
        data-{{componentNameLower}}-provider
        role="group"
        aria-label="{{componentName}} group"
      >
        {children}
      </div>
    </{{componentName}}Context.Provider>
  );
}

/**
 * DetailsProvider - Context provider for Details composer orchestration
 *
 * Coordinates multiple Details components in a group, managing
 * accordion behavior and shared state
 */
'use client';
import React, { createContext, useContext, useCallback, useState } from 'react';

export interface DetailsContextValue {
  /** Register a details component with the group */
  registerDetails: (id: string, isOpen: boolean) => void;
  /** Unregister a details component from the group */
  unregisterDetails: (id: string) => void;
  /** Handle toggle for a specific details */
  handleToggle: (id: string, newOpen: boolean) => void;
  /** Whether multiple details can be open simultaneously */
  allowMultiple: boolean;
  /** Currently open details IDs */
  openDetails: Set<string>;
}

const DetailsContext = createContext<DetailsContextValue | null>(null);

export function useDetailsContext() {
  const context = useContext(DetailsContext);
  if (!context) {
    throw new Error('Details components must be used within a DetailsProvider');
  }
  return context;
}

export interface DetailsProviderProps {
  children: React.ReactNode;
  /** Allow multiple details to be open simultaneously (default: false for accordion behavior) */
  allowMultiple?: boolean;
  /** Callback when any details in the group toggles */
  onToggle?: (id: string, isOpen: boolean, openDetails: Set<string>) => void;
  /** CSS class for the group container */
  className?: string;
}

export function DetailsProvider({
  children,
  allowMultiple = false,
  onToggle,
  className,
}: DetailsProviderProps) {
  const [openDetails, setOpenDetails] = useState<Set<string>>(new Set());
  const [registeredDetails] = useState<Set<string>>(new Set());

  const registerDetails = useCallback(
    (id: string, isOpen: boolean) => {
      registeredDetails.add(id);
      if (isOpen) {
        setOpenDetails((prev) => {
          const newSet = new Set(prev);
          if (!allowMultiple) {
            newSet.clear();
          }
          newSet.add(id);
          return newSet;
        });
      }
    },
    [allowMultiple, registeredDetails]
  );

  const unregisterDetails = useCallback(
    (id: string) => {
      registeredDetails.delete(id);
      setOpenDetails((prev) => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    },
    [registeredDetails]
  );

  const handleToggle = useCallback(
    (id: string, newOpen: boolean) => {
      setOpenDetails((prev) => {
        const newSet = new Set(prev);

        if (newOpen) {
          // If not allowing multiple, close all others
          if (!allowMultiple) {
            newSet.clear();
          }
          newSet.add(id);
        } else {
          newSet.delete(id);
        }

        // Call external callback
        onToggle?.(id, newOpen, newSet);

        return newSet;
      });
    },
    [allowMultiple, onToggle]
  );

  const contextValue: DetailsContextValue = {
    registerDetails,
    unregisterDetails,
    handleToggle,
    allowMultiple,
    openDetails,
  };

  return (
    <DetailsContext.Provider value={contextValue}>
      <div
        className={className}
        data-allow-multiple={allowMultiple}
        role="group"
        aria-label="Details group"
      >
        {children}
      </div>
    </DetailsContext.Provider>
  );
}

/** Context Provider for Calendar */
'use client';
import * as React from 'react';

interface CalendarContextValue {}

const CalendarContext = React.createContext<CalendarContextValue | null>(null);
export const useCalendarContext = () => {
  const ctx = React.useContext(CalendarContext);
  if (!ctx)
    throw new Error('useCalendarContext must be used within CalendarProvider');
  return ctx;
};

export const CalendarProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const value = React.useMemo<CalendarContextValue>(() => ({}), []);
  return (
    <CalendarContext.Provider value={value}>
      {children}
    </CalendarContext.Provider>
  );
};

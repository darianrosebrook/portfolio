/**
 * Calendar (Composer)
 * Generated via scaffold CLI.
 */
'use client';
import * as React from 'react';
import styles from './Calendar.module.scss';

export interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Calendar: React.FC<CalendarProps> = ({
  className = '',
  children,
  ...rest
}) => {
  return (
    <div
      className={[styles.calendar, className].filter(Boolean).join(' ')}
      {...rest}
    >
      {children}
    </div>
  );
};
Calendar.displayName = 'Calendar';

export default Calendar;

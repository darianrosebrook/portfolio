/**
 * Calendar (Composer) — SCAFFOLD
 *
 * Minimal scaffold: a labelled landmark region so AT users can navigate to
 * the widget. role="region" is the safe interim choice while the full
 * implementation is pending — it announces the widget without disabling
 * the browser's default keystroke handling. The full APG-compliant
 * calendar (role="grid" with focusable gridcells, date selection,
 * month/year navigation, keyboard model, locale, min/max, disabled dates)
 * is tracked separately and will replace this scaffold along with the
 * proper role wiring (typically role="grid" inside a role="dialog" for
 * date pickers).
 *
 * Why not role="application"? It tells AT to suppress its default
 * navigation shortcuts and forward all keystrokes to the widget. With no
 * keyboard model in this scaffold, that would trap screen reader users
 * with nothing to navigate. Don't ship role="application" until there is
 * a complete keyboard implementation.
 */
'use client';
import * as React from 'react';
import './Calendar.css';

export interface CalendarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accessible name for the calendar widget. Default: 'Calendar' */
  label?: string;
}

export const Calendar: React.FC<CalendarProps> = ({
  className = '',
  label = 'Calendar',
  children,
  ...rest
}) => {
  return (
    <div
      data-ds-component="Calendar"
      className={['calendar', className].filter(Boolean).join(' ')}
      role="region"
      aria-label={label}
      {...rest}
    >
      {children}
    </div>
  );
};
Calendar.displayName = 'Calendar';

export default Calendar;

/**
 * Calendar (Composer) — SCAFFOLD
 *
 * Minimal scaffold that satisfies the a11y contract test (announced as a
 * labelled region) so consumers can mount it without breaking AT. The full
 * APG-compliant calendar (role="grid" with focusable gridcells, date
 * selection, month/year nav, keyboard navigation, locale, min/max,
 * disabled dates) is tracked separately and will replace this scaffold.
 *
 * Open question for the full implementation: role="application" (current,
 * per audit-requested test) vs the APG-recommended pattern of role="grid"
 * inside a role="dialog" for date pickers. role="application" forwards all
 * keystrokes to the widget and is the right choice only for fully custom
 * keyboard models — for date picking, role="grid" composes better with AT
 * defaults. The full impl will revisit.
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
      role="application"
      aria-label={label}
      {...rest}
    >
      {children}
    </div>
  );
};
Calendar.displayName = 'Calendar';

export default Calendar;

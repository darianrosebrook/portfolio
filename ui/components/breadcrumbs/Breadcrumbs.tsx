import { BreadcrumbNavigationLink } from '@/ui/components/PageTransition';
import React from 'react';
import styles from './Breadcrumbs.module.scss';

export type Crumb = {
  /**
   * The label of the crumb
   */
  label: string;
  /**
   * The href of the crumb
   */
  href: string;
};

export interface BreadcrumbsProps extends React.HTMLAttributes<HTMLElement> {
  /**
   * The base crumb
   */
  base: Crumb; // e.g., Home or Foundations
  /**
   * The ordered path from base to current
   */
  crumbs: Crumb[]; // ordered path from base to current
}

/**
 * Breadcrumbs with overflow handling.
 * - base link
 * - overflow as popover when crumbs.length > 3
 * - prev link when crumbs.length > 2
 * - current label (non-link)
 */
export const Breadcrumbs = React.forwardRef<HTMLElement, BreadcrumbsProps>(
  ({ base, crumbs, className = '', ...rest }, ref) => {
    const total = crumbs.length;

    if (total === 0) {
      return (
        <nav
          ref={ref}
          className={`${styles.root} ${className}`}
          aria-label="Breadcrumb"
          {...rest}
        >
          <ul className={styles.list}>
            <li>
              <BreadcrumbNavigationLink href={base.href}>
                {base.label}
              </BreadcrumbNavigationLink>
            </li>
          </ul>
        </nav>
      );
    }

    const current = crumbs[total - 1];
    const prev = total > 1 ? crumbs[total - 2] : undefined;
    const showPrev = total > 2;
    const showOverflow = total > 3;
    const visibleMiddle = showOverflow ? [] : crumbs.slice(0, total - 1);
    const overflowItems = showOverflow ? crumbs.slice(0, total - 2) : [];

    return (
      <nav
        ref={ref}
        className={`${styles.root} ${className}`}
        aria-label="Breadcrumb"
        {...rest}
      >
        <ul className={styles.list}>
          <li>
            <BreadcrumbNavigationLink href={base.href}>
              {base.label}
            </BreadcrumbNavigationLink>
          </li>
          <li className={styles.separator}>/</li>

          {showOverflow ? (
            <li className={styles.overflow}>
              <details className={styles.overflow}>
                <summary aria-label="More">
                  <span>…</span>
                </summary>
                <div className={styles.popover} role="menu">
                  <ul>
                    {overflowItems.map((c) => (
                      <li key={c.href}>
                        <BreadcrumbNavigationLink href={c.href}>
                          {c.label}
                        </BreadcrumbNavigationLink>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          ) : (
            visibleMiddle.map((c) => (
              <React.Fragment key={c.href}>
                <li>
                  <BreadcrumbNavigationLink href={c.href}>
                    {c.label}
                  </BreadcrumbNavigationLink>
                </li>
                <li className={styles.separator}>/</li>
              </React.Fragment>
            ))
          )}

          {showPrev && prev && (
            <>
              <li>
                <BreadcrumbNavigationLink href={prev.href}>
                  {prev.label}
                </BreadcrumbNavigationLink>
              </li>
              <li className={styles.separator}>/</li>
            </>
          )}

          <li className={styles.current} aria-current="page">
            {current.label}
          </li>
        </ul>
      </nav>
    );
  }
);

Breadcrumbs.displayName = 'Breadcrumbs';

export default Breadcrumbs;

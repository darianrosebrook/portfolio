import Link from 'next/link';
import React from 'react';
import { AnimatedLink } from '@/ui/components/Links';
import styles from './Breadcrumbs.module.scss';

export type Crumb = {
  label: string;
  href: string;
};

export interface BreadcrumbsProps {
  base: Crumb; // e.g., Home or Foundations
  crumbs: Crumb[]; // ordered path from base to current
}

/**
 * Breadcrumbs with overflow handling.
 * - base link
 * - overflow as popover when crumbs.length > 3
 * - prev link when crumbs.length > 2
 * - current label (non-link)
 */
export function Breadcrumbs({ base, crumbs }: BreadcrumbsProps) {
  const total = crumbs.length;

  if (total === 0) {
    return (
      <nav className={styles.root} aria-label="Breadcrumb">
        <ul className={styles.list}>
          <li>
            <AnimatedLink href={base.href}>{base.label}</AnimatedLink>
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
    <nav className={styles.root} aria-label="Breadcrumb">
      <ul className={styles.list}>
        <li>
          <AnimatedLink href={base.href}>{base.label}</AnimatedLink>
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
                      <AnimatedLink href={c.href}>{c.label}</AnimatedLink>
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
                <AnimatedLink href={c.href}>{c.label}</AnimatedLink>
              </li>
              <li className={styles.separator}>/</li>
            </React.Fragment>
          ))
        )}

        {showPrev && prev && (
          <>
            <li>
              <AnimatedLink href={prev.href}>{prev.label}</AnimatedLink>
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

export default Breadcrumbs;

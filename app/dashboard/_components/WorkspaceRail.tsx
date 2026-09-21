'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './WorkspaceRail.module.css';

const sections = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/articles', label: 'Articles' },
  { href: '/dashboard/case-studies', label: 'Case Studies' },
  { href: '/dashboard/profile', label: 'Profile' },
];

/**
 * Persistent workspace navigation. Replaces the horizontal tab strip so the
 * current section stays visible while scrolling long libraries.
 */
export function WorkspaceRail() {
  const pathname = usePathname() ?? '';
  const isActive = (href: string) =>
    pathname === href ||
    (href !== '/dashboard' && pathname.startsWith(`${href}/`));

  return (
    <nav className={styles.rail} aria-label="Workspace">
      <p className={styles.label}>Workspace</p>
      <ul className={styles.list}>
        {sections.map((section) => {
          const active = isActive(section.href);
          return (
            <li key={section.href}>
              <Link
                href={section.href}
                className={styles.link}
                data-active={active}
                aria-current={active ? 'page' : undefined}
              >
                {section.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

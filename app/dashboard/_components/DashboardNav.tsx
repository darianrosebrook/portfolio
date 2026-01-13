'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../page.module.scss';

const tabs = [
  { href: '/dashboard/articles', label: 'Articles' },
  { href: '/dashboard/case-studies', label: 'Case Studies' },
  { href: '/dashboard/analytics', label: 'Analytics' },
  { href: '/dashboard/performance', label: 'Performance' },
  { href: '/dashboard/profile', label: 'Profile' },
];

export function DashboardNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    // Exact match for dashboard root
    if (href === '/dashboard' && pathname === '/dashboard') return true;
    // For other tabs, check if pathname starts with the href
    if (href !== '/dashboard' && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className={styles.tabs}>
      <ul>
        {tabs.map((t) => (
          <li key={t.href}>
            <Link
              href={t.href}
              className={styles.tabLink}
              data-active={isActive(t.href)}
            >
              {t.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

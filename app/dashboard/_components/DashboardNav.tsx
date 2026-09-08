'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from '../page.module.css';

const tabs = [
  { href: '/dashboard', label: 'Overview' },
  { href: '/dashboard/articles', label: 'Articles' },
  { href: '/dashboard/case-studies', label: 'Case Studies' },
  { href: '/dashboard/profile', label: 'Profile' },
];

export function DashboardNav() {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href ||
    (href !== '/dashboard' && pathname.startsWith(`${href}/`));
  return (
    <nav className={styles.tabs} aria-label="Dashboard">
      <ul>
        {tabs.map((tab) => (
          <li key={tab.href}>
            <Link
              href={tab.href}
              className={styles.tabLink}
              data-active={isActive(tab.href)}
              aria-current={isActive(tab.href) ? 'page' : undefined}
            >
              {tab.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

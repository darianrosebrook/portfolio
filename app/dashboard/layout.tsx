import Link from 'next/link';
import styles from './page.module.scss';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const tabs = [
    { href: '/dashboard/articles', label: 'Articles' },
    { href: '/dashboard/case-studies', label: 'Case Studies' },
    { href: '/dashboard/analytics', label: 'Analytics' },
    { href: '/dashboard/performance', label: 'Performance' },
    { href: '/dashboard/profile', label: 'Profile' },
  ];

  return (
    <section className="content">
      <nav className={styles.tabs}>
        <ul>
          {tabs.map((t) => (
            <li key={t.href}>
              <Link href={t.href}>{t.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className={styles.container}>{children}</div>
    </section>
  );
}

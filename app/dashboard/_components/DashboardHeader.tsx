import Link from 'next/link';
import styles from './DashboardHeader.module.css';

/**
 * Workspace header. The public navbar is suppressed on dashboard routes, so
 * this carries the two things a writer needs there: where they are, and a way
 * back to the live site.
 */
export function DashboardHeader() {
  return (
    <header className={styles.header}>
      <Link href="/dashboard" className={styles.brand}>
        <span className={styles.mark} aria-hidden="true" />
        Writing workspace
      </Link>
      <Link href="/" className={styles.viewSite}>
        View site
        <span aria-hidden="true">↗</span>
      </Link>
    </header>
  );
}

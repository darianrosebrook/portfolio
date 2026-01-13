import { DashboardNav } from './_components/DashboardNav';
import styles from './page.module.scss';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="content">
      <DashboardNav />
      <div className={styles.container}>{children}</div>
    </section>
  );
}

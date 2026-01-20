import { DashboardNav } from './_components/DashboardNav';
import styles from './page.module.scss';
import { ToastProvider, ToastViewport } from '@/ui/components/Toast';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ToastProvider>
      <section className="content">
        <DashboardNav />
        <div className={styles.container}>{children}</div>
      </section>
      <ToastViewport />
    </ToastProvider>
  );
}

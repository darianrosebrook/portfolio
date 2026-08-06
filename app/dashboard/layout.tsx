import { redirect } from 'next/navigation';
import { DashboardNav } from './_components/DashboardNav';
import styles from './page.module.css';
import { ToastProvider, ToastViewport } from '@/ui/components/Toast';
import { createClient } from '@/utils/supabase/server';

/**
 * Dashboard shell. Re-checks auth here so protection does not depend solely
 * on proxy/middleware being wired correctly.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    redirect('/');
  }

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

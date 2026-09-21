import { redirect } from 'next/navigation';
import { DashboardHeader } from './_components/DashboardHeader';
import { WorkspaceRail } from './_components/WorkspaceRail';
import shell from './_components/DashboardShell.module.css';
import { ToastProvider, ToastViewport } from '@/ui/components/Toast';
import { createClient } from '@/utils/supabase/server';

/**
 * Dashboard shell. Re-checks auth here so protection does not depend solely
 * on proxy/middleware being wired correctly.
 *
 * The public navbar and footer are suppressed for this route tree by
 * PublicChrome in the root layout; this shell renders the workspace chrome
 * instead. `.content` is the shared public container, so the workspace keeps
 * the same max-width and gutters as the rest of the site.
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
        <DashboardHeader />
        <div className={shell.body}>
          <WorkspaceRail />
          <main className={shell.main}>{children}</main>
        </div>
      </section>
      <ToastViewport />
    </ToastProvider>
  );
}

'use client';

import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';

interface PublicChromeProps {
  navbar: ReactNode;
  footer: ReactNode;
  cursor?: ReactNode;
  children: ReactNode;
}

/**
 * Splits the two chromes the app serves.
 *
 * Public routes keep the marketing navbar, footer and cursor. `/dashboard`
 * routes render the workspace shell from app/dashboard/layout.tsx instead, so
 * the marketing footer (six full-width social rows) stops appearing inside the
 * writing workspace.
 *
 * The decision is client-side because Next.js layouts never receive the
 * pathname; the navbar and footer stay server components and are passed in as
 * already-rendered nodes.
 */
export function PublicChrome({
  navbar,
  footer,
  cursor,
  children,
}: PublicChromeProps) {
  const pathname = usePathname();
  const inWorkspace =
    pathname === '/dashboard' || pathname?.startsWith('/dashboard/') === true;

  if (inWorkspace) {
    return <>{children}</>;
  }

  return (
    <>
      {navbar}
      {children}
      {footer}
      {cursor}
    </>
  );
}

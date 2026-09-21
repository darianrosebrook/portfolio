'use client';

import Link from 'next/link';
import { useState } from 'react';
import styles from './EditorLayout.module.css';

interface EditorLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  actions: React.ReactNode;
  saveStatus: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

/**
 * Editor layout component
 * Provides Notion-like layout with sidebar and top toolbar.
 * Styling lives in EditorLayout.module.css; the toolbar, canvas and sidebar are
 * described here as classes so no value is written inline.
 */
export function EditorLayout({
  children,
  sidebar,
  actions,
  saveStatus,
  backHref = '/dashboard/articles',
  backLabel = 'Articles',
}: EditorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className={styles.shell}>
      {/* Top toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.group}>
          <Link href={backHref} className={styles.back}>
            ← Back to {backLabel}
          </Link>
          {saveStatus}
        </div>
        <div className={styles.group}>
          {actions}
          <button
            type="button"
            className={styles.metadataToggle}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? 'Hide' : 'Show'} Metadata
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div className={styles.body}>
        {/* Editor */}
        <div className={styles.canvas}>
          <div className={styles.document}>{children}</div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && <div className={styles.sidebar}>{sidebar}</div>}
      </div>
    </div>
  );
}

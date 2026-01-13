'use client';

import Link from 'next/link';
import { useState } from 'react';

interface EditorLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  actions: React.ReactNode;
  saveStatus: React.ReactNode;
}

/**
 * Editor layout component
 * Provides Notion-like layout with sidebar and top toolbar
 */
export function EditorLayout({
  children,
  sidebar,
  actions,
  saveStatus,
}: EditorLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--semantic-color-background-primary)',
      }}
    >
      {/* Top toolbar */}
      <div
        style={{
          borderBottom: '1px solid var(--semantic-color-border-primary)',
          padding: '12px 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'var(--semantic-color-background-primary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link
            href="/dashboard/articles"
            style={{
              color: 'var(--semantic-color-foreground-secondary)',
              textDecoration: 'none',
              fontSize: '14px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Back to Articles
          </Link>
          {saveStatus}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {actions}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              padding: '6px 12px',
              border: '1px solid var(--semantic-color-border-primary)',
              borderRadius: 'var(--core-shape-radius-small)',
              background: 'var(--semantic-color-background-secondary)',
              color: 'var(--semantic-color-foreground-primary)',
              cursor: 'pointer',
              fontSize: '12px',
            }}
          >
            {sidebarOpen ? 'Hide' : 'Show'} Metadata
          </button>
        </div>
      </div>

      {/* Main content area */}
      <div
        style={{
          display: 'flex',
          flex: 1,
          overflow: 'hidden',
        }}
      >
        {/* Editor */}
        <div
          style={{
            flex: 1,
            overflow: 'auto',
            display: 'flex',
            justifyContent: 'center',
            padding: '48px 24px',
          }}
        >
          <div
            style={{
              maxWidth: '900px',
              width: '100%',
            }}
          >
            {children}
          </div>
        </div>

        {/* Sidebar */}
        {sidebarOpen && (
          <div
            style={{
              width: '320px',
              borderLeft: '1px solid var(--semantic-color-border-primary)',
              overflow: 'auto',
              background: 'var(--semantic-color-background-primary)',
              padding: '24px',
            }}
          >
            {sidebar}
          </div>
        )}
      </div>
    </div>
  );
}

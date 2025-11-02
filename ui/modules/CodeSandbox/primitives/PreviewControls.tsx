'use client';

import * as React from 'react';
import { ThemeSwitcher } from './ThemeSwitcher';

export type PreviewControlsProps = {
  theme: 'system' | 'light' | 'dark';
  onThemeChange: (theme: 'system' | 'light' | 'dark') => void;
  rtl: boolean;
  onRTLChange: (rtl: boolean) => void;
};

/**
 * Combined preview controls for theme and RTL direction.
 * Provides a unified interface for controlling preview appearance.
 */
export function PreviewControls({
  theme,
  onThemeChange,
  rtl,
  onRTLChange,
}: PreviewControlsProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <ThemeSwitcher
        value={theme}
        onChange={(v) => onThemeChange(v as 'system' | 'light' | 'dark')}
      />
      <div
        role="group"
        aria-label="Text direction"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        <span
          style={{
            fontSize: '14px',
            color: 'var(--semantic-color-foreground-secondary, #6b7280)',
            marginRight: '4px',
          }}
        >
          Direction:
        </span>
        <button
          type="button"
          role="switch"
          aria-checked={rtl}
          aria-label={rtl ? 'Right-to-left' : 'Left-to-right'}
          onClick={() => {
            onRTLChange(!rtl);
            // Persist preference
            if (typeof window !== 'undefined') {
              localStorage.setItem('preview-rtl', String(!rtl));
            }
          }}
          style={{
            appearance: 'none',
            border: '1px solid var(--semantic-color-border-default, #d1d5db)',
            padding: '4px 12px',
            borderRadius: '6px',
            background: rtl
              ? 'var(--semantic-color-background-accent-subtle, #e0e7ff)'
              : 'var(--semantic-color-background-primary, #ffffff)',
            color: rtl
              ? 'var(--semantic-color-foreground-accent, #4f46e5)'
              : 'var(--semantic-color-foreground-secondary, #6b7280)',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: rtl ? 600 : 400,
            transition: 'all 0.2s ease',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <span aria-hidden="true">{rtl ? 'RTL' : 'LTR'}</span>
        </button>
      </div>
    </div>
  );
}


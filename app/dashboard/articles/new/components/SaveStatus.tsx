'use client';

import type { SaveStatus } from '../hooks/useAutoSave';

interface SaveStatusProps {
  status: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
}

/**
 * Save status indicator component
 * Shows saving state, success, or error messages
 */
export function SaveStatus({ status, lastSaved, error }: SaveStatusProps) {
  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved to server';
      case 'local':
        return 'Saved locally (add a title to sync)';
      case 'error':
        return error || 'Error saving';
      default:
        return lastSaved ? `Saved ${formatTime(lastSaved)}` : 'Not saved';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'saving':
        return 'var(--semantic-color-foreground-secondary)';
      case 'saved':
        return 'var(--semantic-color-foreground-success)';
      case 'local':
        return 'var(--semantic-color-foreground-warning, #f59e0b)';
      case 'error':
        return 'var(--semantic-color-foreground-destructive)';
      default:
        return 'var(--semantic-color-foreground-secondary)';
    }
  };

  return (
    <div
      style={{
        fontSize: '12px',
        color: getStatusColor(),
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
      }}
    >
      {status === 'saving' && (
        <div
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: 'var(--semantic-color-background-accent)',
            animation: 'pulse 1.5s ease-in-out infinite',
          }}
        />
      )}
      {status === 'saved' && (
        <span style={{ color: 'var(--semantic-color-foreground-success)' }}>
          ✓
        </span>
      )}
      {status === 'local' && (
        <span style={{ color: 'var(--semantic-color-foreground-warning, #f59e0b)' }}>
          ⚡
        </span>
      )}
      {status === 'error' && (
        <span style={{ color: 'var(--semantic-color-foreground-destructive)' }}>
          ✕
        </span>
      )}
      <span>{getStatusText()}</span>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);

  if (diffSec < 10) {
    return 'just now';
  }
  if (diffSec < 60) {
    return `${diffSec}s ago`;
  }
  if (diffMin < 60) {
    return `${diffMin}m ago`;
  }
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

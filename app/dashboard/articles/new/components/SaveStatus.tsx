'use client';

import type { SaveStatus } from '../hooks/useAutoSave';
import styles from './SaveStatus.module.css';

interface SaveStatusProps {
  status: SaveStatus;
  lastSaved: Date | null;
  error: string | null;
}

/**
 * Save status indicator component
 * Shows saving state, success, or error messages.
 *
 * The state is carried as data-status so the colour comes from the stylesheet
 * rather than from a switch that returned inline style values.
 */
export function SaveStatus({ status, lastSaved, error }: SaveStatusProps) {
  const getStatusText = () => {
    switch (status) {
      case 'saving':
        return 'Saving...';
      case 'saved':
        return 'Saved to server';
      case 'local':
        return 'Changes awaiting server save';
      case 'error':
        return error || 'Error saving';
      default:
        return lastSaved ? `Saved ${formatTime(lastSaved)}` : 'Not saved';
    }
  };

  return (
    <div className={styles.status} data-status={status}>
      {status === 'saving' && <div className={styles.pulse} />}
      {status === 'saved' && (
        <span className={styles.glyph} aria-hidden="true">
          ✓
        </span>
      )}
      {status === 'local' && (
        <span className={styles.glyph} aria-hidden="true">
          ⚡
        </span>
      )}
      {status === 'error' && (
        <span className={styles.glyph} aria-hidden="true">
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

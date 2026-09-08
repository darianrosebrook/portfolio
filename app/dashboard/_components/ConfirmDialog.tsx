'use client';

import { ReactNode } from 'react';
import Button from '@/ui/components/Button';

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel: string;
  danger?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel,
  danger = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
      }}
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal
        aria-labelledby="confirm-dialog-title"
        style={{
          maxWidth: '440px',
          width: 'calc(100% - 48px)',
          padding: '24px',
          borderRadius: 'var(--core-shape-radius-03, 12px)',
          background: 'var(--semantic-color-background-primary, #111)',
          border: '1px solid var(--semantic-color-border-default, #333)',
        }}
      >
        <h2
          id="confirm-dialog-title"
          style={{
            margin: '0 0 8px',
            fontSize: 'var(--semantic-typography-heading-04, 18px)',
            color: 'var(--semantic-color-foreground-primary, #fff)',
          }}
        >
          {title}
        </h2>
        <div
          style={{
            margin: '0 0 20px',
            fontSize: 'var(--semantic-typography-body-03, 14px)',
            color: 'var(--semantic-color-foreground-secondary, #ccc)',
          }}
        >
          {description}
        </div>
        <div
          style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}
        >
          <Button variant="secondary" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            variant={danger ? 'destructive' : 'primary'}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

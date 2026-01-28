'use client';

import React from 'react';
import styles from './DashboardDemo.module.scss';

export const InvoicePaidCard: React.FC = () => {
  return (
    <div className={styles.formCard} style={{ position: 'relative' }}>
      <button className={styles.closeButton} style={{ position: 'absolute', top: 16, right: 16 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'var(--semantic-color-feedback-success-default)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px',
        }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <h3 style={{ fontSize: 18, fontWeight: 'bold', color: 'var(--semantic-color-text-primary)', marginTop: 16 }}>
          Invoice paid
        </h3>

        <p style={{ fontSize: 13, color: 'var(--semantic-color-text-secondary)', maxWidth: 280, margin: '0 auto' }}>
          You paid $17,975.30. A receipt copy was sent to accounting@example.com.
        </p>

        <div className={styles.cardActions}>
          <button type="button" className={styles.primaryButton} style={{ width: '100%' }}>
            Next invoice
          </button>
          <button type="button" className={styles.secondaryButton} style={{ width: '100%' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default InvoicePaidCard;

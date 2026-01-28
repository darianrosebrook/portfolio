'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const CompanyCardVisual: React.FC = () => {
  return (
    <div className={styles.formCard}>
      <h3>Your company card</h3>
      <p style={{ margin: '0 0 16px', fontSize: 13, color: 'var(--semantic-color-foreground-secondary)' }}>
        View and manage your corporate card.
      </p>

      {/* Credit card visual */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: 300,
          aspectRatio: '1.586 / 1',
          borderRadius: 16,
          padding: 24,
          background: 'var(--semantic-color-background-accent)',
          color: 'var(--semantic-color-foreground-inverse)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          overflow: 'hidden',
          marginBottom: 16,
        }}
      >
        {/* Gradient overlay for depth */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%, rgba(0,0,0,0.1) 100%)',
            borderRadius: 16,
            pointerEvents: 'none',
          }}
        />

        {/* Top: Chip icon */}
        <div style={{ position: 'relative', zIndex: 1 }}>
          <svg width="36" height="26" viewBox="0 0 36 26" fill="none">
            <rect x="0.5" y="0.5" width="35" height="25" rx="4" fill="#D4A853" stroke="#C4983F" />
            <line x1="0" y1="10" x2="36" y2="10" stroke="#C4983F" strokeWidth="0.5" />
            <line x1="0" y1="16" x2="36" y2="16" stroke="#C4983F" strokeWidth="0.5" />
            <line x1="12" y1="0" x2="12" y2="26" stroke="#C4983F" strokeWidth="0.5" />
            <line x1="24" y1="0" x2="24" y2="26" stroke="#C4983F" strokeWidth="0.5" />
          </svg>
        </div>

        {/* Middle: Card number */}
        <div style={{ position: 'relative', zIndex: 1, fontSize: 15, letterSpacing: 2.5, fontWeight: 500, fontFamily: 'monospace' }}>
          4929 3849 5027 1846
        </div>

        {/* Bottom: Name + expiry */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>CARDHOLDER</div>
            <div style={{ fontSize: 13, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>Sophie Johnson</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 10, opacity: 0.7, marginBottom: 2 }}>EXPIRES</div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>01 / 27</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className={styles.cardActions}>
        <button className={styles.secondaryButton}>Freeze</button>
        <button className={styles.primaryButton}>Done</button>
      </div>
    </div>
  );
};

export default CompanyCardVisual;

'use client';

import React from 'react';
import styles from './DashboardDemo.module.scss';

/**
 * Formal invoice card inspired by Radix UI's "Invoice #3463" example.
 * Shows a structured invoice document with header, dates, addresses,
 * and an itemized services breakdown.
 */
export const InvoiceCard: React.FC = () => {
  return (
    <div className={styles.formCard} style={{ position: 'relative' }}>
      {/* Close button */}
      <button
        className={styles.closeButton}
        style={{ position: 'absolute', top: 16, right: 16 }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      {/* Header */}
      <h3
        style={{
          color: 'var(--semantic-color-foreground-accent)',
          fontSize: 18,
          margin: 0,
          marginBottom: 16,
        }}
      >
        Invoice #3463
      </h3>

      {/* Date row */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          marginBottom: 20,
          fontSize: 13,
        }}
      >
        <div>
          <span style={{ color: 'var(--semantic-color-foreground-secondary)' }}>
            Issued:{' '}
          </span>
          <span style={{ color: 'var(--semantic-color-foreground-primary)' }}>
            June 21, 2023
          </span>
        </div>
        <div>
          <span style={{ color: 'var(--semantic-color-foreground-secondary)' }}>
            Due:{' '}
          </span>
          <span style={{ color: 'var(--semantic-color-foreground-primary)' }}>
            July 21, 2023
          </span>
        </div>
      </div>

      {/* Address section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          marginBottom: 24,
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <div>
          <div
            style={{
              color: 'var(--semantic-color-foreground-secondary)',
              marginBottom: 4,
            }}
          >
            To
          </div>
          <div style={{ color: 'var(--semantic-color-foreground-primary)' }}>
            Paradise Ventures
            <br />
            742 Evergreen Terrace
            <br />
            Springfield, IL 62074
          </div>
        </div>
        <div>
          <div
            style={{
              color: 'var(--semantic-color-foreground-secondary)',
              marginBottom: 4,
            }}
          >
            From
          </div>
          <div style={{ color: 'var(--semantic-color-foreground-primary)' }}>
            Rogue Widgets
            <br />
            1600 Baker Street NW
            <br />
            Washington, DC 20500
          </div>
        </div>
      </div>

      {/* Services table */}
      <div style={{ fontSize: 13 }}>
        {/* Header row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingBottom: 8,
            borderBottom: '1px solid var(--semantic-color-border-default)',
            marginBottom: 8,
            color: 'var(--semantic-color-foreground-secondary)',
          }}
        >
          <span>Services</span>
          <span>Price</span>
        </div>

        {/* Branding row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingBottom: 8,
            color: 'var(--semantic-color-foreground-primary)',
          }}
        >
          <span>Branding</span>
          <span>$20,000</span>
        </div>

        {/* Marketing website row */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            paddingBottom: 12,
            color: 'var(--semantic-color-foreground-primary)',
          }}
        >
          <span>Marketing website</span>
          <span>$17,500</span>
        </div>

        {/* Divider line */}
        <div
          style={{
            borderTop: '1px solid var(--semantic-color-border-default)',
            paddingTop: 12,
          }}
        >
          {/* Total row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontWeight: 700,
              color: 'var(--semantic-color-foreground-primary)',
            }}
          >
            <span>Total</span>
            <span>$38,500</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;

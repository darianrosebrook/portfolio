'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

interface KPI {
  abbrev: string;
  badge: string;
  variant: 'success' | 'warning' | 'neutral';
  value: string;
}

const kpis: KPI[] = [
  { abbrev: 'MRR', badge: '+3.2%', variant: 'success', value: '$350K' },
  { abbrev: 'OpEx', badge: '+12.8%', variant: 'warning', value: '$211K' },
  { abbrev: 'CapEx', badge: '+8.8%', variant: 'warning', value: '$94K' },
  { abbrev: 'GPM', badge: '+1.2%', variant: 'success', value: '44.6%' },
  { abbrev: 'NPM', badge: '0.0%', variant: 'neutral', value: '9.1%' },
  { abbrev: 'EBITDA', badge: '+4.3%', variant: 'success', value: '$443K' },
];

export const FinancialPerformanceCard: React.FC = () => {
  return (
    <div className={styles.formCard}>
      <h3>Financial performance</h3>
      <p
        style={{
          margin: 0,
          marginBottom: 'var(--semantic-spacing-margin-component)',
          fontSize: 13,
          color: 'var(--semantic-color-foreground-secondary)',
          lineHeight: 1.5,
        }}
      >
        Review your company&apos;s KPIs compared to the month before.
      </p>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 'var(--semantic-spacing-gap-grid)',
        }}
      >
        {kpis.map((kpi) => (
          <div
            key={kpi.abbrev}
            style={{
              padding: 'var(--semantic-spacing-padding-component)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--semantic-color-foreground-secondary)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                  fontWeight: 500,
                }}
              >
                {kpi.abbrev}
              </span>
              <span className={`${styles.badge} ${styles[kpi.variant]}`}>
                {kpi.badge}
              </span>
            </div>
            <div
              style={{
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--semantic-color-foreground-primary)',
              }}
            >
              {kpi.value}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FinancialPerformanceCard;

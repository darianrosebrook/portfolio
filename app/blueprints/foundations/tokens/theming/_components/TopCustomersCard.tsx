'use client';

import React from 'react';
import styles from './DashboardDemo.module.scss';

const customers = [
  {
    name: 'Elijah Wilson',
    since: 'Customer since November 3, 2017',
    total: '$15,432.56',
  },
  {
    name: 'Cameron Johnson',
    since: null,
    total: '$13,976.43',
  },
  {
    name: 'Sophia Martinez',
    since: 'Customer since December 17, 2019',
    total: '$11,653.03',
  },
  {
    name: 'Nathan Thompson',
    since: 'Customer since May 6, 2019',
    total: '$8,246.92',
  },
  {
    name: 'Olivia Adams',
    since: null,
    total: '$6,789.21',
  },
];

export const TopCustomersCard: React.FC = () => {
  return (
    <div className={styles.formCard}>
      <h3>Top customers</h3>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {customers.map((customer, index) => (
          <div
            key={customer.name}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 0',
              borderBottom:
                index < customers.length - 1
                  ? '1px solid var(--semantic-color-border-default)'
                  : 'none',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <span
                style={{
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'var(--semantic-color-foreground-primary)',
                }}
              >
                {customer.name}
              </span>
              {customer.since && (
                <span
                  style={{
                    fontSize: '12px',
                    color: 'var(--semantic-color-foreground-secondary)',
                  }}
                >
                  {customer.since}
                </span>
              )}
            </div>
            <span
              style={{
                fontSize: '16px',
                fontWeight: 700,
                color: 'var(--semantic-color-foreground-primary)',
              }}
            >
              {customer.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopCustomersCard;

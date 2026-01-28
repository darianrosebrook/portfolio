'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const AlertCard: React.FC = () => {
  return (
    <div className={styles.alertCard}>
      <div className={styles.alertIcon}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <line x1="12" y1="9" x2="12" y2="13" />
          <line x1="12" y1="17" x2="12.01" y2="17" />
        </svg>
      </div>
      <div className={styles.alertContent}>
        <h4>Low inventory warning</h4>
        <p>5 products are running low on stock. Consider restocking soon.</p>
      </div>
      <button className={styles.alertAction}>View products</button>
    </div>
  );
};

export default AlertCard;

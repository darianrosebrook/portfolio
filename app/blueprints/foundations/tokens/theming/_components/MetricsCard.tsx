'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const MetricsCard: React.FC = () => {
  return (
    <div className={styles.statsCard}>
      <h3>Today&apos;s metrics</h3>
      <div className={styles.metricList}>
        <div className={styles.metricItem}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Revenue</span>
            <span className={`${styles.metricChange} ${styles.positive}`}>+12.5%</span>
          </div>
          <div className={styles.metricValue}>$4,832</div>
          <div className={styles.metricBar}>
            <div className={styles.metricBarFill} style={{ width: '75%' }} />
          </div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Orders</span>
            <span className={`${styles.metricChange} ${styles.positive}`}>+8.2%</span>
          </div>
          <div className={styles.metricValue}>284</div>
          <div className={styles.metricBar}>
            <div className={styles.metricBarFill} style={{ width: '60%' }} />
          </div>
        </div>
        <div className={styles.metricItem}>
          <div className={styles.metricHeader}>
            <span className={styles.metricLabel}>Customers</span>
            <span className={`${styles.metricChange} ${styles.negative}`}>-2.1%</span>
          </div>
          <div className={styles.metricValue}>1,429</div>
          <div className={styles.metricBar}>
            <div className={styles.metricBarFill} style={{ width: '45%' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;

'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const TabsCard: React.FC = () => {
  return (
    <div className={styles.tabsCard}>
      <div className={styles.tabList}>
        <button className={`${styles.tab} ${styles.tabActive}`}>Overview</button>
        <button className={styles.tab}>Analytics</button>
        <button className={styles.tab}>Reports</button>
        <button className={styles.tab}>Settings</button>
      </div>
      <div className={styles.tabContent}>
        <h4>Dashboard overview</h4>
        <p>View your key metrics and recent activity at a glance.</p>
        <div className={styles.quickStats}>
          <div className={styles.quickStat}>
            <span className={styles.quickStatValue}>1,234</span>
            <span className={styles.quickStatLabel}>Total users</span>
          </div>
          <div className={styles.quickStat}>
            <span className={styles.quickStatValue}>$45K</span>
            <span className={styles.quickStatLabel}>Revenue</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TabsCard;

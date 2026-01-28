'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const ActivityCard: React.FC = () => {
  return (
    <div className={styles.activityCard}>
      <h3>Recent activity</h3>
      <div className={styles.activityList}>
        <div className={styles.activityItem}>
          <div className={styles.activityIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            </svg>
          </div>
          <div className={styles.activityContent}>
            <p className={styles.activityText}>Order #1005 shipped</p>
            <p className={styles.activityTime}>2 minutes ago</p>
          </div>
        </div>
        <div className={styles.activityItem}>
          <div className={styles.activityIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className={styles.activityContent}>
            <p className={styles.activityText}>New customer registered</p>
            <p className={styles.activityTime}>15 minutes ago</p>
          </div>
        </div>
        <div className={styles.activityItem}>
          <div className={styles.activityIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className={styles.activityContent}>
            <p className={styles.activityText}>Payment received: $234.50</p>
            <p className={styles.activityTime}>1 hour ago</p>
          </div>
        </div>
        <div className={styles.activityItem}>
          <div className={styles.activityIcon}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </div>
          <div className={styles.activityContent}>
            <p className={styles.activityText}>Conversion rate updated</p>
            <p className={styles.activityTime}>2 hours ago</p>
          </div>
        </div>
      </div>
      <button className={styles.linkButton}>View all activity</button>
    </div>
  );
};

export default ActivityCard;

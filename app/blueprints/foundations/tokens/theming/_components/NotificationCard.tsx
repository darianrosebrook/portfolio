'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const NotificationCard: React.FC = () => {
  return (
    <div className={styles.notificationCard}>
      <div className={styles.notificationHeader}>
        <div className={styles.notificationIcon}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </div>
        <div className={styles.notificationContent}>
          <h4>New order received</h4>
          <p>Order #1006 for $234.50</p>
        </div>
        <button className={styles.closeButton}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <div className={styles.notificationActions}>
        <button className={styles.secondaryButton}>View order</button>
        <button className={styles.primaryButton}>Mark as read</button>
      </div>
    </div>
  );
};

export default NotificationCard;

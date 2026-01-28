'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const DeliveryCard: React.FC = () => {
  return (
    <div className={styles.deliveryCard}>
      <h3>Delivery</h3>
      <div className={styles.deliveryOptions}>
        <button className={styles.deliveryOption}>Tomorrow</button>
        <button className={styles.deliveryOption}>Within 3 days</button>
      </div>
      <div className={styles.deliveryTime}>
        <p className={styles.label}>Tomorrow</p>
        <p className={styles.time}>12:00 pm – 2:00 pm</p>
      </div>
      <div className={styles.deliveryAddress}>
        <p className={styles.name}>Luna Rodriguez</p>
        <p className={styles.address}>9876 Maple Avenue</p>
        <p className={styles.address}>Cityville, WA 54321</p>
      </div>
      <div className={styles.mapPlaceholder}>
        <svg width="100%" height="120" viewBox="0 0 200 120" fill="none">
          <rect width="200" height="120" fill="var(--semantic-color-background-secondary)" />
          <path d="M20 80 Q60 40 100 60 T180 50" stroke="var(--semantic-color-foreground-accent)" strokeWidth="2" fill="none" />
          <circle cx="100" cy="60" r="4" fill="var(--semantic-color-foreground-accent)" />
        </svg>
      </div>
      <div className={styles.deliveryActions}>
        <button className={styles.secondaryButton}>Edit</button>
        <button className={styles.primaryButton}>Confirm</button>
      </div>
    </div>
  );
};

export default DeliveryCard;

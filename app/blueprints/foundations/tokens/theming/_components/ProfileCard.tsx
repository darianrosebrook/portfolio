'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const ProfileCard: React.FC = () => {
  return (
    <div className={styles.profileCard}>
      <div className={styles.profileHeader}>
        <div className={styles.profileAvatar}>
          <span>JD</span>
        </div>
        <div className={styles.profileInfo}>
          <h4>John Doe</h4>
          <p>john.doe@example.com</p>
        </div>
      </div>
      <div className={styles.profileStats}>
        <div className={styles.statItem}>
          <span className={styles.statValue}>24</span>
          <span className={styles.statLabel}>Orders</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>$1,234</span>
          <span className={styles.statLabel}>Spent</span>
        </div>
        <div className={styles.statItem}>
          <span className={styles.statValue}>12</span>
          <span className={styles.statLabel}>Reviews</span>
        </div>
      </div>
      <button className={styles.secondaryButton}>View profile</button>
    </div>
  );
};

export default ProfileCard;

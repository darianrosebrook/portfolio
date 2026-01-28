'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const ProgressCard: React.FC = () => {
  return (
    <div className={styles.progressCard}>
      <h3>Project progress</h3>
      <div className={styles.progressItem}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Design System</span>
          <span className={styles.progressPercent}>85%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: '85%' }} />
        </div>
      </div>
      <div className={styles.progressItem}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>API Integration</span>
          <span className={styles.progressPercent}>62%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: '62%' }} />
        </div>
      </div>
      <div className={styles.progressItem}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Documentation</span>
          <span className={styles.progressPercent}>45%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: '45%' }} />
        </div>
      </div>
      <div className={styles.progressItem}>
        <div className={styles.progressHeader}>
          <span className={styles.progressLabel}>Testing</span>
          <span className={styles.progressPercent}>30%</span>
        </div>
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: '30%' }} />
        </div>
      </div>
    </div>
  );
};

export default ProgressCard;

'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const SliderCard: React.FC = () => {
  return (
    <div className={styles.sliderCard}>
      <h3>Volume control</h3>
      <div className={styles.sliderGroup}>
        <label>Master volume</label>
        <div className={styles.sliderContainer}>
          <input type="range" min="0" max="100" defaultValue="75" className={styles.slider} />
          <span className={styles.sliderValue}>75%</span>
        </div>
      </div>
      <div className={styles.sliderGroup}>
        <label>Bass</label>
        <div className={styles.sliderContainer}>
          <input type="range" min="0" max="100" defaultValue="50" className={styles.slider} />
          <span className={styles.sliderValue}>50%</span>
        </div>
      </div>
      <div className={styles.sliderGroup}>
        <label>Treble</label>
        <div className={styles.sliderContainer}>
          <input type="range" min="0" max="100" defaultValue="60" className={styles.slider} />
          <span className={styles.sliderValue}>60%</span>
        </div>
      </div>
    </div>
  );
};

export default SliderCard;

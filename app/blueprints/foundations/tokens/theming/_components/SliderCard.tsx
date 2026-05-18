'use client';
import React from 'react';
import styles from './DashboardDemo.module.css';

type SliderRowProps = {
  id: string;
  label: string;
  defaultValue: number;
};

const SliderRow: React.FC<SliderRowProps> = ({ id, label, defaultValue }) => (
  <div className={styles.sliderGroup}>
    <label htmlFor={id}>{label}</label>
    <div className={styles.sliderContainer}>
      <input
        id={id}
        type="range"
        min="0"
        max="100"
        defaultValue={defaultValue}
        className={styles.slider}
      />
      <span className={styles.sliderValue}>{defaultValue}%</span>
    </div>
  </div>
);

export const SliderCard: React.FC = () => {
  return (
    <div className={styles.sliderCard}>
      <h3>Volume control</h3>
      <SliderRow id="volume-master" label="Master volume" defaultValue={75} />
      <SliderRow id="volume-bass" label="Bass" defaultValue={50} />
      <SliderRow id="volume-treble" label="Treble" defaultValue={60} />
    </div>
  );
};

export default SliderCard;

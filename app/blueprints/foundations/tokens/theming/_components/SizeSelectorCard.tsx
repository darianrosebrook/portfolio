'use client';
import React, { useState } from 'react';
import styles from './DashboardDemo.module.scss';

export const SizeSelectorCard: React.FC = () => {
  const [selectedSize, setSelectedSize] = useState('9');

  return (
    <div className={styles.sizeCard}>
      <h4>Size</h4>
      <div className={styles.sizeSelector}>
        {['5.5', '6', '6.5', '7', '7.5', '8', '8.5', '9', '9.5', '10'].map((size) => (
          <button
            key={size}
            className={`${styles.sizeOption} ${selectedSize === size ? styles.active : ''}`}
            onClick={() => setSelectedSize(size)}
          >
            {size}
          </button>
        ))}
      </div>
      <h4>Material</h4>
      <div className={styles.materialSelector}>
        <button className={styles.materialButton}>Leather</button>
        <button className={styles.materialButton}>Suede</button>
        <button className={styles.materialButton}>Mesh</button>
        <button className={styles.materialButton}>Canvas</button>
      </div>
      <h4>Color</h4>
      <div className={styles.colorSelector}>
        <button className={`${styles.colorButton} ${styles.white}`}>White</button>
        <button className={`${styles.colorButton} ${styles.gray}`}>Gray</button>
        <button className={`${styles.colorButton} ${styles.black}`}>Black</button>
        <button className={`${styles.colorButton} ${styles.red}`}>Red</button>
        <button className={`${styles.colorButton} ${styles.pink}`}>Pink</button>
        <button className={`${styles.colorButton} ${styles.violet}`}>Violet</button>
        <button className={`${styles.colorButton} ${styles.blue}`}>Blue</button>
        <button className={`${styles.colorButton} ${styles.green}`}>Green</button>
        <button className={`${styles.colorButton} ${styles.beige}`}>Beige</button>
      </div>
    </div>
  );
};

export default SizeSelectorCard;

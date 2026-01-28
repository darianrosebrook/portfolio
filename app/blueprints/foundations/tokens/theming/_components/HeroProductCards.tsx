'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const HeroProductCards: React.FC = () => {
  return (
    <>
      <div className={styles.heroCard}>
        <div className={styles.cardImage}>
          <div className={styles.imagePlaceholder}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        </div>
        <div className={styles.cardContent}>
          <h3>Back to basics</h3>
          <p>Simple and versatile</p>
          <button className={styles.cardButton}>Shop now</button>
        </div>
      </div>

      <div className={styles.heroCard}>
        <div className={styles.cardImage}>
          <div className={styles.imagePlaceholder}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
          </div>
        </div>
        <div className={styles.cardContent}>
          <h3>Pants and jeans</h3>
          <h4>Jeans #7</h4>
          <p className={styles.price}>$149</p>
          <p className={styles.description}>
            Jeans with a sense of nostalgia, as if they carry whispered tales of past adventures.
          </p>
          <div className={styles.cardActions}>
            <select className={styles.select}>
              <option>Lighter</option>
              <option>Darker</option>
            </select>
            <select className={styles.select}>
              <option>30</option>
              <option>32</option>
              <option>34</option>
            </select>
            <button className={styles.primaryButton}>Add to cart</button>
          </div>
        </div>
      </div>

      <div className={styles.heroCard}>
        <div className={styles.cardImage}>
          <div className={styles.imagePlaceholder}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
              <line x1="7" y1="7" x2="7.01" y2="7" />
            </svg>
          </div>
        </div>
        <div className={styles.cardContent}>
          <h3>Footwear</h3>
          <h4>Sneakers #12</h4>
          <p className={styles.price}>$149</p>
          <p className={styles.description}>
            Love at the first sight for enthusiasts seeking a fresh and whimsical style.
          </p>
          <div className={styles.cardActions}>
            <select className={styles.select}>
              <option>Pastel</option>
              <option>Bold</option>
            </select>
            <select className={styles.select}>
              <option>8</option>
              <option>9</option>
              <option>10</option>
            </select>
            <button className={styles.primaryButton}>Buy</button>
          </div>
        </div>
      </div>
    </>
  );
};

export default HeroProductCards;

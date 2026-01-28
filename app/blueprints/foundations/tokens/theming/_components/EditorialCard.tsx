'use client';

import React from 'react';
import styles from './DashboardDemo.module.scss';

/**
 * Editorial / marketing feature card inspired by Radix UI's "Dare to stand out" example.
 * A visually rich card with large image area, headline, body text, and a discount badge.
 */
export const EditorialCard: React.FC = () => {
  return (
    <div className={styles.heroCard}>
      <div className={styles.cardImage} style={{ height: 240 }}>
        <div className={styles.imagePlaceholder}>
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <rect x="2" y="2" width="20" height="20" rx="2" />
            <circle cx="8" cy="8" r="2" />
            <path d="M22 15l-5.5-5.5L5 21" />
            <path d="M18 8l-4 4" />
          </svg>
        </div>
        <span
          style={{
            position: 'absolute',
            top: 12,
            right: 12,
            padding: '6px 12px',
            background: 'var(--semantic-color-background-accent)',
            color: 'var(--semantic-color-foreground-inverse)',
            borderRadius: 'var(--semantic-shape-badge-radius, 16px)',
            fontSize: 14,
            fontWeight: 700,
          }}
        >
          -25%
        </span>
      </div>
      <div className={styles.cardContent}>
        <h3>Style</h3>
        <h4>Dare to stand out</h4>
        <p>
          Striking patterns, vibrant colors, and statement pieces that speak to
          the bold fashion enthusiast. From abstract prints to architectural
          silhouettes, our collection celebrates those who dare to express their
          authentic style.
        </p>
        <button className={styles.cardButton}>Shop the collection</button>
      </div>
    </div>
  );
};

export default EditorialCard;

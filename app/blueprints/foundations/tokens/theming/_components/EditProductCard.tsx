'use client';
import React from 'react';
import styles from './DashboardDemo.module.css';

export const EditProductCard: React.FC = () => {
  return (
    <div className={styles.formCard}>
      <h3>Edit product</h3>
      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label htmlFor="edit-product-title">Title</label>
          <input
            id="edit-product-title"
            type="text"
            defaultValue="Skirt #16"
            className={styles.input}
          />
        </div>
        <div className={styles.formGroup}>
          <label htmlFor="edit-product-price">Price</label>
          <input
            id="edit-product-price"
            type="text"
            defaultValue="$99"
            className={styles.input}
          />
        </div>
      </div>

      <div className={styles.formGroup}>
        <span className={styles.formLabel}>Media</span>
        <div className={styles.mediaGrid}>
          <div className={styles.mediaItem}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <div className={styles.mediaItem}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <label htmlFor="edit-product-description">Description</label>
        <div className={styles.textEditor}>
          <div className={styles.editorToolbar}>
            <button className={styles.toolButton}><strong>B</strong></button>
            <button className={styles.toolButton}><em>I</em></button>
            <button className={styles.toolButton}><u>U</u></button>
            <button className={styles.toolButton}>≡</button>
            <button className={styles.toolButton}>≣</button>
            <button className={styles.toolButton}>≢</button>
          </div>
          <textarea
            id="edit-product-description"
            className={styles.textarea}
            defaultValue="Amidst the soft hues and delicate silence, one's gaze is always drawn towards this skirt..."
            rows={4}
          />
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <span className={styles.formLabel}>Main material</span>
          <div className={styles.chipGroup}>
            <button className={`${styles.chip} ${styles.chipActive}`}>Synthetic</button>
            <button className={styles.chip}>Wool</button>
            <button className={styles.chip}>Cotton</button>
            <button className={styles.chip}>Linen</button>
            <button className={styles.chip}>Denim</button>
            <button className={styles.chip}>Leather</button>
          </div>
        </div>
      </div>

      <div className={styles.formRow}>
        <div className={styles.formGroup}>
          <span className={styles.formLabel}>Main color</span>
          <div className={styles.colorGrid}>
            <button className={`${styles.colorSwatch} ${styles.white}`} />
            <button className={`${styles.colorSwatch} ${styles.gray}`} />
            <button className={`${styles.colorSwatch} ${styles.black}`} />
            <button className={`${styles.colorSwatch} ${styles.red}`} />
            <button className={`${styles.colorSwatch} ${styles.pink}`} />
            <button className={`${styles.colorSwatch} ${styles.violet}`} />
            <button className={`${styles.colorSwatch} ${styles.blue}`} />
            <button className={`${styles.colorSwatch} ${styles.green}`} />
            <button className={`${styles.colorSwatch} ${styles.beige}`} />
          </div>
        </div>
      </div>

      <div className={styles.formGroup}>
        <span className={styles.formLabel}>Sizes</span>
        <div className={styles.sizeGrid}>
          <button className={styles.sizeButton}>XS</button>
          <button className={styles.sizeButton}>S</button>
          <button className={styles.sizeButton}>M</button>
          <button className={styles.sizeButton}>L</button>
          <button className={styles.sizeButton}>XL</button>
        </div>
      </div>
    </div>
  );
};

export default EditProductCard;

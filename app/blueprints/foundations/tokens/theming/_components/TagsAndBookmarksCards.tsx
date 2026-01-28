'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const TagsAndBookmarksCards: React.FC = () => {
  return (
    <>
      <div className={styles.tagsCard}>
        <h3>Product tags</h3>
        <div className={styles.tagCollection}>
          <span className={`${styles.tag} ${styles.tagActive}`}>Featured</span>
          <span className={styles.tag}>New Arrival</span>
          <span className={styles.tag}>Best Seller</span>
          <span className={styles.tag}>Limited Edition</span>
          <span className={styles.tag}>Sale</span>
          <span className={styles.tag}>Eco-Friendly</span>
          <span className={styles.tag}>Premium</span>
          <span className={styles.tag}>Vintage</span>
          <span className={styles.tag}>Handmade</span>
          <span className={styles.tag}>Organic</span>
        </div>
        <button className={styles.linkButton}>Manage tags</button>
      </div>

      <div className={styles.bookmarksCard}>
        <div className={styles.bookmarksHeader}>
          <h3>Bookmarks</h3>
          <button className={styles.linkButton}>Buy all</button>
        </div>
        <div className={styles.bookmarkGrid}>
          {[
            { name: 'Jeans #8', price: '$118' },
            { name: 'Jacket #3', price: '$49' },
            { name: 'Pants #10', price: '$32' },
            { name: 'Shirt #11', price: '$39' },
          ].map((item) => (
            <div key={item.name} className={styles.bookmarkItem}>
              <div className={styles.bookmarkImage}>
                <svg width="100%" height="100%" viewBox="0 0 100 100" fill="none">
                  <rect width="100" height="100" fill="var(--semantic-color-background-secondary)" />
                </svg>
              </div>
              <p className={styles.bookmarkName}>{item.name}</p>
              <p className={styles.bookmarkPrice}>{item.price}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default TagsAndBookmarksCards;

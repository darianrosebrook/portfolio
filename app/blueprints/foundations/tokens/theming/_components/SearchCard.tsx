'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const SearchCard: React.FC = () => {
  return (
    <div className={styles.searchCard}>
      <h3>Search products</h3>
      <div className={styles.searchInput}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <path d="M21 21l-4.35-4.35" />
        </svg>
        <input type="text" placeholder="Search..." className={styles.searchField} />
      </div>
      <div className={styles.filterTags}>
        <button className={`${styles.filterTag} ${styles.active}`}>All</button>
        <button className={styles.filterTag}>New</button>
        <button className={styles.filterTag}>Sale</button>
        <button className={styles.filterTag}>Featured</button>
      </div>
    </div>
  );
};

export default SearchCard;

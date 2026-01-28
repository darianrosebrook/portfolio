'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const ShoppingCartCard: React.FC = () => {
  return (
    <div className={styles.cartCard}>
      <h3>Shopping cart</h3>
      <div className={styles.cartItems}>
        <div className={styles.cartItem}>
          <div className={styles.itemImage}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
            </svg>
          </div>
          <div className={styles.itemDetails}>
            <p className={styles.itemName}>Poncho #4</p>
            <p className={styles.itemSize}>Size M</p>
          </div>
          <select className={styles.quantitySelect}><option>1</option><option>2</option><option>3</option></select>
          <p className={styles.itemPrice}>$79</p>
        </div>
        <div className={styles.cartItem}>
          <div className={styles.itemImage}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" />
            </svg>
          </div>
          <div className={styles.itemDetails}>
            <p className={styles.itemName}>Jeans #8</p>
            <p className={styles.itemSize}>Size 30</p>
          </div>
          <select className={styles.quantitySelect}><option>1</option><option>2</option><option>3</option></select>
          <p className={styles.itemPrice}>$118</p>
        </div>
        <div className={styles.cartItem}>
          <div className={styles.itemImage}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
            </svg>
          </div>
          <div className={styles.itemDetails}>
            <p className={styles.itemName}>Sneakers #14</p>
            <p className={styles.itemSize}>Size 8</p>
          </div>
          <select className={styles.quantitySelect}><option>1</option><option>2</option><option>3</option></select>
          <p className={styles.itemPrice}>$116</p>
        </div>
      </div>
      <div className={styles.cartTotal}>
        <span>Total</span>
        <span className={styles.totalAmount}>$313</span>
      </div>
      <button className={styles.checkoutButton}>Go to checkout</button>
    </div>
  );
};

export default ShoppingCartCard;

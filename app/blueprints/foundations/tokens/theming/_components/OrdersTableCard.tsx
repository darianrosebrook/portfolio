'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const OrdersTableCard: React.FC = () => {
  return (
    <div className={styles.ordersTable}>
      <div className={styles.tableHeader}>
        <h3>Orders</h3>
        <span className={styles.dateLabel}>May 2023</span>
      </div>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Order no.</th>
            <th>Payment</th>
            <th>Fulfillment</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>#1005</td><td><span className={`${styles.badge} ${styles.success}`}>Paid</span></td><td><span className={`${styles.badge} ${styles.warning}`}>Delivering</span></td><td>$154.60</td></tr>
          <tr><td>#1004</td><td><span className={`${styles.badge} ${styles.success}`}>Paid</span></td><td><span className={`${styles.badge} ${styles.warning}`}>Unfulfilled</span></td><td>$93.49</td></tr>
          <tr><td>#1003</td><td><span className={`${styles.badge} ${styles.neutral}`}>Refunded</span></td><td><span className={`${styles.badge} ${styles.error}`}>Cancelled</span></td><td>$39.00</td></tr>
          <tr><td>#1002</td><td><span className={`${styles.badge} ${styles.warning}`}>Unpaid</span></td><td><span className={`${styles.badge} ${styles.warning}`}>Unfulfilled</span></td><td>$438.90</td></tr>
          <tr><td>#1001</td><td><span className={`${styles.badge} ${styles.success}`}>Paid</span></td><td><span className={`${styles.badge} ${styles.success}`}>Fulfilled</span></td><td>$532.64</td></tr>
          <tr><td>#1000</td><td><span className={`${styles.badge} ${styles.success}`}>Paid</span></td><td><span className={`${styles.badge} ${styles.success}`}>Fulfilled</span></td><td>$625.03</td></tr>
        </tbody>
      </table>
      <button className={styles.showMoreButton}>Show more</button>
    </div>
  );
};

export default OrdersTableCard;

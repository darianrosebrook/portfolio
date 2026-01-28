'use client';

import React from 'react';
import styles from './DashboardDemo.module.scss';

export const SignUpCard: React.FC = () => {
  return (
    <div className={styles.formCard}>
      <h3>Sign up</h3>

      <div className={styles.formGroup}>
        <label htmlFor="signup-email">Email address</label>
        <input
          id="signup-email"
          type="email"
          placeholder="you@example.com"
          className={styles.input}
          autoComplete="email"
        />
      </div>

      <div className={styles.formGroup}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <label htmlFor="signup-password">Password</label>
          <button type="button" className={styles.linkButton}>
            Forgot password?
          </button>
        </div>
        <input
          id="signup-password"
          type="password"
          placeholder="Enter your password"
          className={styles.input}
          autoComplete="new-password"
        />
      </div>

      <div className={styles.cardActions}>
        <button type="button" className={styles.primaryButton}>
          Create an account
        </button>
        <button type="button" className={styles.secondaryButton}>
          Sign in
        </button>
      </div>
    </div>
  );
};

export default SignUpCard;

'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

export const SettingsCard: React.FC = () => {
  return (
    <div className={styles.settingsCard}>
      <h3>Preferences</h3>
      <div className={styles.settingItem}>
        <div className={styles.settingLabel}>
          <span>Email notifications</span>
          <span className={styles.settingDescription}>Receive updates via email</span>
        </div>
        <label className={styles.toggle}>
          <input type="checkbox" defaultChecked />
          <span className={styles.toggleSlider} />
        </label>
      </div>
      <div className={styles.settingItem}>
        <div className={styles.settingLabel}>
          <span>Marketing emails</span>
          <span className={styles.settingDescription}>Promotional content</span>
        </div>
        <label className={styles.toggle}>
          <input type="checkbox" />
          <span className={styles.toggleSlider} />
        </label>
      </div>
      <div className={styles.settingItem}>
        <div className={styles.settingLabel}>
          <span>Dark mode</span>
          <span className={styles.settingDescription}>Use dark theme</span>
        </div>
        <label className={styles.toggle}>
          <input type="checkbox" defaultChecked />
          <span className={styles.toggleSlider} />
        </label>
      </div>
      <div className={styles.settingItem}>
        <div className={styles.settingLabel}>
          <span>Auto-save</span>
          <span className={styles.settingDescription}>Save changes automatically</span>
        </div>
        <label className={styles.toggle}>
          <input type="checkbox" defaultChecked />
          <span className={styles.toggleSlider} />
        </label>
      </div>
    </div>
  );
};

export default SettingsCard;

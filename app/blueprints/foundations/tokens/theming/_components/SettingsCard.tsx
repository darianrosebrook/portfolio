'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

type SettingRowProps = {
  label: string;
  description: string;
  defaultChecked?: boolean;
};

const SettingRow: React.FC<SettingRowProps> = ({
  label,
  description,
  defaultChecked,
}) => (
  <div className={styles.settingItem}>
    <div className={styles.settingLabel}>
      <span>{label}</span>
      <span className={styles.settingDescription}>{description}</span>
    </div>
    <label className={styles.toggle} aria-label={label}>
      <input type="checkbox" defaultChecked={defaultChecked} />
      <span className={styles.toggleSlider} />
    </label>
  </div>
);

export const SettingsCard: React.FC = () => {
  return (
    <div className={styles.settingsCard}>
      <h3>Preferences</h3>
      <SettingRow
        label="Email notifications"
        description="Receive updates via email"
        defaultChecked
      />
      <SettingRow
        label="Marketing emails"
        description="Promotional content"
      />
      <SettingRow
        label="Dark mode"
        description="Use dark theme"
        defaultChecked
      />
      <SettingRow
        label="Auto-save"
        description="Save changes automatically"
        defaultChecked
      />
    </div>
  );
};

export default SettingsCard;

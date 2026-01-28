'use client';
import React from 'react';
import styles from './DashboardDemo.module.scss';

const categories = [
  {
    name: 'Comments',
    description:
      'Receive notifications when someone comments on your documents or mentions you.',
    channels: { Push: true, Email: true, Slack: false },
  },
  {
    name: 'Favorites',
    description:
      'Receive notifications when there is activity related to your favorited items.',
    channels: { Push: true, Email: false, Slack: false },
  },
  {
    name: 'New documents',
    description:
      'Receive notifications whenever people on your team create new documents.',
    channels: { Push: true, Email: true, Slack: false },
  },
];

export const NotificationSettingsCard: React.FC = () => {
  return (
    <div className={styles.formCard}>
      <h3>Notifications</h3>
      <p
        style={{
          fontSize: 13,
          color: 'var(--semantic-color-foreground-secondary)',
          margin: '0 0 16px',
        }}
      >
        Manage your notification settings.
      </p>

      {categories.map((category, index) => {
        const isLast = index === categories.length - 1;
        return (
          <div
            key={category.name}
            style={{
              borderBottom: isLast
                ? 'none'
                : '1px solid var(--semantic-color-border-default)',
              paddingBottom: isLast ? 0 : 16,
              marginBottom: isLast ? 0 : 16,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 'bold',
                color: 'var(--semantic-color-foreground-primary)',
              }}
            >
              {category.name}
            </div>
            <div
              style={{
                fontSize: 12,
                color: 'var(--semantic-color-foreground-secondary)',
                marginBottom: 12,
              }}
            >
              {category.description}
            </div>

            {Object.entries(category.channels).map(([channel, isOn]) => (
              <div
                key={channel}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 0',
                }}
              >
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--semantic-color-foreground-primary)',
                  }}
                >
                  {channel}
                </span>
                <label className={styles.toggle}>
                  <input type="checkbox" defaultChecked={isOn} />
                  <span className={styles.toggleSlider} />
                </label>
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
};

export default NotificationSettingsCard;

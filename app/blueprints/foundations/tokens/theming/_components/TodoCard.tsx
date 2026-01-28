'use client';

import React from 'react';
import styles from './DashboardDemo.module.scss';

const accentSpan = (text: string) => (
  <span style={{ color: 'var(--semantic-color-foreground-accent)' }}>{text}</span>
);

const checkboxStyle = {
  width: 18,
  height: 18,
  accentColor: 'var(--semantic-color-background-accent)',
  cursor: 'pointer' as const,
};

export const TodoCard: React.FC = () => {
  return (
    <div className={styles.formCard}>
      <h3>To-do</h3>
      <p
        style={{
          margin: '0 0 var(--semantic-spacing-margin-section)',
          fontSize: 14,
          color: 'var(--semantic-color-foreground-secondary)',
          lineHeight: 1.5,
        }}
      >
        Stay on top of your daily tasks.
      </p>

      {/* Item 1 */}
      <div className={styles.settingItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--semantic-spacing-gap-grid-medium)' }}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={{ fontSize: 14, color: 'var(--semantic-color-foreground-primary)' }}>
            Respond to comment {accentSpan('#384')} from Travis Ross
          </span>
        </div>
      </div>

      {/* Item 2 */}
      <div className={styles.settingItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--semantic-spacing-gap-grid-medium)' }}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={{ fontSize: 14, color: 'var(--semantic-color-foreground-primary)' }}>
            Invite {accentSpan('Acme Co.')} team to Slack
          </span>
        </div>
      </div>

      {/* Item 3 */}
      <div className={styles.settingItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--semantic-spacing-gap-grid-medium)' }}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={{ fontSize: 14, color: 'var(--semantic-color-foreground-primary)' }}>
            Create a report requested by Danilo Sousa
          </span>
        </div>
      </div>

      {/* Item 4 */}
      <div className={styles.settingItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--semantic-spacing-gap-grid-medium)' }}>
          <input type="checkbox" style={checkboxStyle} />
          <span style={{ fontSize: 14, color: 'var(--semantic-color-foreground-primary)' }}>
            Review support request {accentSpan('#85')}
          </span>
        </div>
      </div>

      {/* Item 5 - Checked */}
      <div className={styles.settingItem}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--semantic-spacing-gap-grid-medium)' }}>
          <input type="checkbox" defaultChecked style={checkboxStyle} />
          <span
            style={{
              fontSize: 14,
              color: 'var(--semantic-color-foreground-secondary)',
              textDecoration: 'line-through',
            }}
          >
            Close Q2 finances
          </span>
        </div>
      </div>
    </div>
  );
};

export default TodoCard;

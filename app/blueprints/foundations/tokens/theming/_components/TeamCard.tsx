'use client';

import React from 'react';
import styles from './DashboardDemo.module.scss';

const members = [
  { initials: 'EL', name: 'Emmeline Labrie', email: 'emmeline.labrie@example.com' },
  { initials: 'ZW', name: 'Zac Wight', email: 'zac.wight@example.com' },
  { initials: 'PN', name: 'Poppy Nicholls', email: 'poppy.nicholls@example.com' },
  { initials: 'MP', name: 'Marisa Palermo', email: 'marisa.palermo@example.com' },
];

export const TeamCard: React.FC = () => {
  return (
    <div className={styles.formCard}>
      <h3>Your team</h3>
      <p style={{ margin: '0 0 var(--semantic-spacing-margin-component)', fontSize: 14, color: 'var(--semantic-color-foreground-secondary)' }}>
        Invite and manage your team members.
      </p>

      {/* Invite row */}
      <div style={{ display: 'flex', gap: 'var(--semantic-spacing-gap-component)', marginBottom: 'var(--semantic-spacing-margin-section)' }}>
        <input
          type="text"
          placeholder="Email address"
          className={styles.input}
          style={{ flex: 1 }}
        />
        <button
          className={styles.primaryButton}
          style={{ padding: '6px 16px' }}
        >
          Invite
        </button>
      </div>

      {/* Member list */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {members.map((member, index) => (
          <div
            key={member.email}
            style={{
              display: 'flex',
              gap: 'var(--semantic-spacing-gap-component)',
              alignItems: 'center',
              padding: 'var(--semantic-spacing-padding-component) 0',
              borderBottom: index < members.length - 1 ? '1px solid var(--semantic-color-border-default)' : 'none',
            }}
          >
            {/* Avatar */}
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--semantic-color-background-accent)',
                color: 'var(--semantic-color-foreground-inverse)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
                flexShrink: 0,
              }}
            >
              {member.initials}
            </div>

            {/* Name and email */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--semantic-color-foreground-primary)' }}>
                {member.name}
              </div>
              <div style={{ fontSize: 13, color: 'var(--semantic-color-foreground-secondary)' }}>
                {member.email}
              </div>
            </div>

            {/* Overflow button */}
            <button className={styles.closeButton} style={{ fontSize: 18 }}>
              &#x22EF;
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TeamCard;

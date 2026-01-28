'use client';

import styles from './DashboardDemo.module.scss';

export function ProfileEditCard() {
  return (
    <div className={styles.formCard}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ margin: 0 }}>Your profile</h3>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className={styles.linkButton}>Cancel</button>
          <button
            className={styles.linkButton}
            style={{ color: 'var(--semantic-color-background-accent)' }}
          >
            Save
          </button>
        </div>
      </div>

      {/* Form fields */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div className={styles.formGroup}>
          <label>Name</label>
          <input className={styles.input} type="text" defaultValue="Vlad Moroz" />
        </div>
        <div className={styles.formGroup}>
          <label>Username</label>
          <input className={styles.input} type="text" defaultValue="@vladmoroz" />
        </div>
        <div className={styles.formGroup}>
          <label>Email</label>
          <input className={styles.input} type="email" defaultValue="hi@vladmoroz.com" />
        </div>
      </div>

      {/* Privacy section */}
      <div>
        <p style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: 'var(--semantic-color-foreground-primary)',
          marginTop: 16,
          marginBottom: 8,
        }}>
          Privacy
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              defaultChecked
              style={{
                accentColor: 'var(--semantic-color-background-accent)',
                width: 16,
                height: 16,
              }}
            />
            <span style={{ fontSize: 13, color: 'var(--semantic-color-foreground-primary)' }}>
              Display my listening history
            </span>
          </label>
          <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              style={{
                accentColor: 'var(--semantic-color-background-accent)',
                width: 16,
                height: 16,
              }}
            />
            <span style={{ fontSize: 13, color: 'var(--semantic-color-foreground-primary)' }}>
              Everyone can follow my activity
            </span>
          </label>
          <label style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <input
              type="checkbox"
              defaultChecked
              style={{
                accentColor: 'var(--semantic-color-background-accent)',
                width: 16,
                height: 16,
              }}
            />
            <span style={{ fontSize: 13, color: 'var(--semantic-color-foreground-primary)' }}>
              Show my playlists in search
            </span>
          </label>
        </div>
      </div>

      {/* Danger zone */}
      <div>
        <p style={{
          fontSize: 14,
          fontWeight: 'bold',
          color: 'var(--semantic-color-feedback-error-default)',
          marginTop: 16,
          marginBottom: 8,
        }}>
          Danger zone
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button style={{
            fontSize: 13,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--semantic-color-foreground-accent)',
            padding: 0,
            textAlign: 'left',
          }}>
            Reset recommendations
          </button>
          <button style={{
            fontSize: 13,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--semantic-color-feedback-error-default)',
            padding: 0,
            textAlign: 'left',
          }}>
            Delete profile
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProfileEditCard;

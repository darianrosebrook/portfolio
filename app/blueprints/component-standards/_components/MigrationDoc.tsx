'use client';

import { DocDiff } from '@/ui/modules/CodeSandbox';
import type { MigrationData } from '../_lib/migrationData';
import styles from './MigrationDoc.module.scss';

interface MigrationDocProps {
  migration: MigrationData;
}

export function MigrationDoc({ migration }: MigrationDocProps) {
  const {
    componentName,
    fromVersion,
    toVersion,
    before,
    after,
    notes,
    changes,
  } = migration;

  const getChangeTypeColor = (type: MigrationData['changes'][0]['type']) => {
    switch (type) {
      case 'added':
        return 'var(--semantic-color-background-success-subtle)';
      case 'changed':
        return 'var(--semantic-color-background-warning-subtle)';
      case 'deprecated':
        return 'var(--semantic-color-background-info-subtle)';
      case 'removed':
        return 'var(--semantic-color-background-danger-subtle)';
      default:
        return 'transparent';
    }
  };

  const getChangeTypeTextColor = (
    type: MigrationData['changes'][0]['type']
  ) => {
    switch (type) {
      case 'added':
        return 'var(--semantic-color-foreground-success)';
      case 'changed':
        return 'var(--semantic-color-foreground-warning)';
      case 'deprecated':
        return 'var(--semantic-color-foreground-info)';
      case 'removed':
        return 'var(--semantic-color-foreground-danger)';
      default:
        return 'var(--semantic-color-foreground-primary)';
    }
  };

  return (
    <div className={styles.migrationDoc}>
      <header className={styles.header}>
        <h1>
          {componentName} Migration Guide: {fromVersion} → {toVersion}
        </h1>
        <p className={styles.subtitle}>
          This guide helps you migrate from version {fromVersion} to {toVersion}{' '}
          of the {componentName} component.
        </p>
      </header>

      {/* Overview Section */}
      <section className={styles.section}>
        <h2>Overview</h2>
        <p>
          The {componentName} component has been updated with breaking changes
          and new features. Review the changes below and follow the migration
          steps to update your code.
        </p>

        {/* Changes Summary */}
        {changes.length > 0 && (
          <div className={styles.changesSummary}>
            <h3>Summary of Changes</h3>
            <ul className={styles.changesList}>
              {changes.map((change, index) => (
                <li key={index} className={styles.changeItem}>
                  <span
                    className={styles.changeBadge}
                    style={{
                      background: getChangeTypeColor(change.type),
                      color: getChangeTypeTextColor(change.type),
                    }}
                  >
                    {change.type}
                  </span>
                  <span>{change.description}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Migration Notes */}
        {notes.length > 0 && (
          <div className={styles.notes}>
            <h3>Important Notes</h3>
            <ul>
              {notes.map((note, index) => (
                <li key={index}>{note}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Code Comparison */}
      <section className={styles.section}>
        <h2>Code Comparison</h2>
        <p>
          Compare the before and after code to understand the changes. You can
          toggle between split and unified views, and see live previews of both
          versions.
        </p>
        <DocDiff
          left={before}
          right={after}
          view="split"
          showPreviews={true}
          syncScroll={true}
          height="600px"
        />
      </section>

      {/* Migration Steps */}
      <section className={styles.section}>
        <h2>Migration Steps</h2>
        <ol className={styles.steps}>
          {changes.map((change, index) => (
            <li key={index}>
              <strong>
                {change.type.charAt(0).toUpperCase() + change.type.slice(1)}
                :{' '}
              </strong>
              {change.description}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

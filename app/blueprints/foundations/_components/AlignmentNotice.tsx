'use client';

import type { GovernanceMetadata } from '@/types/foundationContent';
import { needsReview } from '@/utils/governance/reviewTracker';
import styles from './AlignmentNotice.module.scss';

interface AlignmentNoticeProps {
  governance: GovernanceMetadata;
}

export function AlignmentNotice({ governance }: AlignmentNoticeProps) {
  const isDeprecated = governance.alignment_status === 'deprecated';
  const needsReviewStatus = needsReview(governance);
  const isAligned =
    governance.alignment_status === 'aligned' && !needsReviewStatus;

  if (isAligned && !isDeprecated) {
    return null;
  }

  return (
    <div
      className={styles.alignmentNotice}
      data-status={governance.alignment_status}
      role="alert"
      aria-live="polite"
    >
      <div className={styles.icon}>
        {isDeprecated ? (
          <span aria-hidden="true">⚠️</span>
        ) : needsReviewStatus ? (
          <span aria-hidden="true">⏰</span>
        ) : (
          <span aria-hidden="true">✅</span>
        )}
      </div>
      <div className={styles.content}>
        <h3 className={styles.title}>
          {isDeprecated
            ? 'Deprecated Content'
            : needsReviewStatus
              ? 'Review Needed'
              : 'System Alignment'}
        </h3>
        <p className={styles.description}>
          {isDeprecated
            ? `This content is deprecated and may not reflect current system practices. Last reviewed: ${new Date(governance.last_review_date).toLocaleDateString()}.`
            : needsReviewStatus
              ? `This page supports ${governance.canonical_version}. Updates pending review. Next review due: ${new Date(governance.next_review_date).toLocaleDateString()}.`
              : `This page supports ${governance.canonical_version}.`}
        </p>
        {governance.system_changes && governance.system_changes.length > 0 && (
          <div className={styles.changes}>
            <strong>Recent system changes:</strong>
            <ul>
              {governance.system_changes.slice(-3).map((change, idx) => (
                <li key={idx}>
                  <time dateTime={change.date}>
                    {new Date(change.date).toLocaleDateString()}
                  </time>
                  : {change.description}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

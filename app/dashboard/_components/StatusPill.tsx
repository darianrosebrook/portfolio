import styles from './StatusPill.module.css';

export type StatusPillStatus = 'draft' | 'published' | 'archived' | 'scheduled';

interface StatusPillProps {
  status: StatusPillStatus;
  /** The working draft differs from the published version. */
  changes?: boolean;
}

/**
 * The single status language for library content.
 *
 * Previously each screen rendered its own badge — a dot+label badge on cards,
 * a separate outlined "unpublished changes" pill beside it, and a filled
 * "PUBLISHED" pill in the editor — so the same item looked different per
 * screen. "Unpublished changes" is a property of the status, not a second
 * competing badge.
 */
export function StatusPill({ status, changes = false }: StatusPillProps) {
  return (
    <span className={styles.pill} data-status={status}>
      <span className={styles.dot} aria-hidden="true" />
      {status}
      {changes && <span className={styles.changes}>unpublished changes</span>}
    </span>
  );
}

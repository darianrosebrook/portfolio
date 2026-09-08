import {
  RELATIONSHIP_META,
  DEFAULT_RELATIONSHIP_TYPE,
  contentHref,
  type RelatedContentItem,
} from '@/utils/supabase/contentRelations';
import styles from './RelatedContentSection.module.css';

interface RelatedContentSectionProps {
  /** Relations this content declares (outgoing edges). */
  relations: RelatedContentItem[];
  /** Content that declares a relation pointing here (incoming edges). */
  backlinks: RelatedContentItem[];
}

/**
 * Reader-facing rendering of the content graph: typed outgoing relations
 * plus incoming backlinks. Renders nothing when the item is unlinked in
 * both directions.
 */
export function RelatedContentSection({
  relations,
  backlinks,
}: RelatedContentSectionProps) {
  if (relations.length === 0 && backlinks.length === 0) {
    return null;
  }

  return (
    <aside className={styles.section} aria-label="Related content">
      {relations.length > 0 && (
        <div className={styles.group}>
          <h3 className={styles.heading}>Related content</h3>
          <ul className={styles.list}>
            {relations.map((item) => (
              <li key={`${item.type}-${item.id}`} className={styles.item}>
                {item.relationship_type !== DEFAULT_RELATIONSHIP_TYPE && (
                  <span className={styles.verb}>
                    {RELATIONSHIP_META[item.relationship_type].forwardVerb}
                  </span>
                )}
                <a
                  href={contentHref(item.type, item.slug)}
                  className={styles.link}
                >
                  {item.title}
                </a>
                <span className={styles.typeBadge}>
                  {item.type === 'article' ? 'Article' : 'Case study'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {backlinks.length > 0 && (
        <div className={styles.group}>
          <h3 className={styles.heading}>Referenced by</h3>
          <ul className={styles.list}>
            {backlinks.map((item) => (
              <li key={`${item.type}-${item.id}`} className={styles.item}>
                <span className={styles.verb}>
                  {RELATIONSHIP_META[item.relationship_type].reverseVerb}
                </span>
                <a
                  href={contentHref(item.type, item.slug)}
                  className={styles.link}
                >
                  {item.title}
                </a>
                <span className={styles.typeBadge}>
                  {item.type === 'article' ? 'Article' : 'Case study'}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}

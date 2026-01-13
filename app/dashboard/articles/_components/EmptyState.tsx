import Button from '@/ui/components/Button';
import styles from '../articles.module.scss';

interface EmptyStateProps {
  filter?: 'all' | 'published' | 'draft';
}

export function EmptyState({ filter = 'all' }: EmptyStateProps) {
  const messages = {
    all: {
      title: 'No articles yet',
      description:
        'Get started by creating your first article. Share your thoughts, tutorials, or insights with the world.',
    },
    published: {
      title: 'No published articles',
      description:
        'You haven\'t published any articles yet. Finish writing a draft and hit publish to see it here.',
    },
    draft: {
      title: 'No drafts',
      description:
        'All caught up! You don\'t have any articles in progress.',
    },
  };

  const { title, description } = messages[filter];

  return (
    <div className={styles.emptyState}>
      <svg
        className={styles.emptyIcon}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
        <polyline points="10 9 9 9 8 9" />
      </svg>
      <h3 className={styles.emptyTitle}>{title}</h3>
      <p className={styles.emptyDescription}>{description}</p>
      {filter === 'all' && (
        <Button as="a" href="/dashboard/articles/new">
          Create your first article
        </Button>
      )}
    </div>
  );
}

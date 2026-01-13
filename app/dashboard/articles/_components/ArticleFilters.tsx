'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import styles from '../articles.module.scss';

type FilterStatus = 'all' | 'published' | 'draft';

interface ArticleFiltersProps {
  counts: {
    all: number;
    published: number;
    draft: number;
  };
}

export function ArticleFilters({ counts }: ArticleFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentFilter = (searchParams.get('status') as FilterStatus) || 'all';

  const handleFilterChange = (status: FilterStatus) => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === 'all') {
      params.delete('status');
    } else {
      params.set('status', status);
    }
    router.push(`/dashboard/articles?${params.toString()}`);
  };

  return (
    <div className={styles.filters}>
      <button
        className={styles.filterButton}
        data-active={currentFilter === 'all'}
        onClick={() => handleFilterChange('all')}
      >
        All ({counts.all})
      </button>
      <button
        className={styles.filterButton}
        data-active={currentFilter === 'published'}
        onClick={() => handleFilterChange('published')}
      >
        Published ({counts.published})
      </button>
      <button
        className={styles.filterButton}
        data-active={currentFilter === 'draft'}
        onClick={() => handleFilterChange('draft')}
      >
        Drafts ({counts.draft})
      </button>
    </div>
  );
}

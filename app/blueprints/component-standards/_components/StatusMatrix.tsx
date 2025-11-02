'use client';

import type { ComponentItem } from '../_lib/componentsData';
import { getChangelog } from '../_lib/changelogData';
import { trackSearchNoResult } from '../_lib/analytics';
import Link from 'next/link';
import { useMemo, useState, useEffect } from 'react';
import styles from './StatusMatrix.module.scss';

interface StatusMatrixProps {
  components: ComponentItem[];
}

export function StatusMatrix({ components: initialComponents }: StatusMatrixProps) {
  const components = useMemo(() => initialComponents, [initialComponents]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [layerFilter, setLayerFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const categories = useMemo(() => {
    const cats = new Set(components.map((c) => c.category));
    return Array.from(cats).sort();
  }, [components]);

  const filteredComponents = useMemo(() => {
    return components.filter((component) => {
      const matchesSearch =
        searchQuery === '' ||
        component.component.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        component.alternativeNames?.some((name) =>
          name.toLowerCase().includes(searchQuery.toLowerCase())
        ) ||
        component.normalizedAliases?.some((alias) =>
          alias.toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesCategory =
        categoryFilter === 'all' || component.category === categoryFilter;

      const matchesLayer =
        layerFilter === 'all' || component.layer === layerFilter;

      const matchesStatus =
        statusFilter === 'all' || component.status === statusFilter;

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLayer &&
        matchesStatus
      );
    });
  }, [components, searchQuery, categoryFilter, layerFilter, statusFilter]);

  // Track no-result searches
  useEffect(() => {
    if (searchQuery && filteredComponents.length === 0) {
      trackSearchNoResult(searchQuery);
    }
  }, [searchQuery, filteredComponents.length]);

  // Generate suggested components based on search query
  const suggestedComponents = useMemo(() => {
    if (!searchQuery || filteredComponents.length > 0) {
      return [];
    }

    const queryLower = searchQuery.toLowerCase();
    const queryWords = queryLower.split(/\s+/).filter(Boolean);

    // Score components based on partial matches
    const scored = components
      .map((component) => {
        let score = 0;
        const nameLower = component.component.toLowerCase();
        const descLower = component.description.toLowerCase();
        const categoryLower = component.category.toLowerCase();

        // Exact matches get highest score
        if (nameLower.includes(queryLower)) score += 10;
        if (descLower.includes(queryLower)) score += 5;
        if (categoryLower.includes(queryLower)) score += 3;

        // Word matches
        queryWords.forEach((word) => {
          if (nameLower.includes(word)) score += 5;
          if (descLower.includes(word)) score += 2;
          if (categoryLower.includes(word)) score += 1;
        });

        // Alternative names
        component.alternativeNames?.forEach((alt) => {
          if (alt.toLowerCase().includes(queryLower)) score += 8;
        });

        return { component, score };
      })
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)
      .map((item) => item.component);

    return scored;
  }, [searchQuery, filteredComponents.length, components]);

  const getLastUpdated = (componentName: string): string | null => {
    const changelog = getChangelog(componentName);
    if (!changelog || changelog.entries.length === 0) {
      return null;
    }
    return changelog.entries[0].date;
  };

  const hasPlayground = (componentName: string): boolean => {
    // Check if playground file exists (simplified check)
    const playgroundFiles = [
      'button',
      'card',
      'input',
      'select',
      'tooltip',
      'accordion',
      'alert',
      'checkbox',
      'dialog',
      'switch',
      'textarea',
    ];
    return playgroundFiles.includes(componentName.toLowerCase());
  };

  return (
    <div className={styles.statusMatrix}>
      <header className={styles.header}>
        <h1>Component Status Matrix</h1>
        <p className={styles.subtitle}>
          Comprehensive overview of all components in the design system,
          including their status, documentation, and implementation details.
        </p>
      </header>

      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchFilter}>
          <input
            type="text"
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="category-filter">Category:</label>
          <select
            id="category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="layer-filter">Layer:</label>
          <select
            id="layer-filter"
            value={layerFilter}
            onChange={(e) => setLayerFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Layers</option>
            <option value="primitives">Primitives</option>
            <option value="compounds">Compounds</option>
            <option value="composers">Composers</option>
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label htmlFor="status-filter">Status:</label>
          <select
            id="status-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className={styles.select}
          >
            <option value="all">All Status</option>
            <option value="Built">Built</option>
            <option value="Planned">Planned</option>
            <option value="DocOnly">Doc Only</option>
          </select>
        </div>
      </div>

      {/* Results count */}
      <div className={styles.resultsCount}>
        Showing {filteredComponents.length} of {components.length} components
        {searchQuery && filteredComponents.length === 0 && (
          <span style={{ marginLeft: '12px', color: 'var(--semantic-color-foreground-warning, #f59e0b)' }}>
            No results found
          </span>
        )}
      </div>

      {/* No results message with suggestions */}
      {searchQuery && filteredComponents.length === 0 && (
        <div
          style={{
            marginTop: '24px',
            padding: '24px',
            backgroundColor: 'var(--semantic-color-background-info-subtle, #e0f2fe)',
            border: '1px solid var(--semantic-color-border-info, #bae6fd)',
            borderRadius: '8px',
          }}
        >
          <h3 style={{ marginTop: 0, marginBottom: '12px' }}>
            No components found for "{searchQuery}"
          </h3>
          <p style={{ marginBottom: '16px', fontSize: '14px' }}>
            We couldn't find any components matching your search. Try adjusting
            your filters or check out these suggested components:
          </p>
          {suggestedComponents.length > 0 ? (
            <ul
              style={{
                listStyle: 'none',
                padding: 0,
                margin: 0,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
              }}
            >
              {suggestedComponents.map((component) => (
                <li key={component.id}>
                  <Link
                    href={`/blueprints/component-standards/${component.slug}`}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      color: 'var(--semantic-color-foreground-accent, #0a65fe)',
                      textDecoration: 'none',
                      fontWeight: 500,
                    }}
                  >
                    {component.component}
                    <span
                      style={{
                        fontSize: '12px',
                        color: 'var(--semantic-color-foreground-secondary, #6b7280)',
                        fontWeight: 400,
                      }}
                    >
                      {component.category}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p style={{ fontSize: '14px', color: 'var(--semantic-color-foreground-secondary, #6b7280)' }}>
              Try searching with different keywords or browse all components above.
            </p>
          )}
        </div>
      )}

      {/* Table */}
      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Component</th>
              <th>Category</th>
              <th>Layer</th>
              <th>Status</th>
              <th>Playground</th>
              <th>Last Updated</th>
              <th>Docs</th>
            </tr>
          </thead>
          <tbody>
            {filteredComponents.map((component) => {
              const lastUpdated = getLastUpdated(component.component);
              const hasPlaygroundFile = hasPlayground(component.component);

              return (
                <tr key={component.id}>
                  <td>
                    <Link
                      href={`/blueprints/component-standards/${component.slug}`}
                      className={styles.componentLink}
                    >
                      {component.component}
                    </Link>
                    {component.description && (
                      <div className={styles.description}>
                        {component.description}
                      </div>
                    )}
                  </td>
                  <td>
                    <span className={styles.badge} data-type="category">
                      {component.category}
                    </span>
                  </td>
                  <td>
                    <span className={styles.badge} data-type="layer">
                      {component.layer}
                    </span>
                  </td>
                  <td>
                    <span
                      className={styles.badge}
                      data-type="status"
                      data-status={component.status.toLowerCase()}
                    >
                      {component.status}
                    </span>
                  </td>
                  <td>
                    {hasPlaygroundFile ? (
                      <span className={styles.checkmark} aria-label="Yes">
                        ✓
                      </span>
                    ) : (
                      <span className={styles.cross} aria-label="No">
                        —
                      </span>
                    )}
                  </td>
                  <td>
                    {lastUpdated ? (
                      <time
                        dateTime={lastUpdated}
                        className={styles.date}
                      >
                        {new Date(lastUpdated).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </time>
                    ) : (
                      <span className={styles.noData}>—</span>
                    )}
                  </td>
                  <td>
                    {component.paths?.docs ? (
                      <span className={styles.checkmark} aria-label="Yes">
                        ✓
                      </span>
                    ) : (
                      <span className={styles.cross} aria-label="No">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}


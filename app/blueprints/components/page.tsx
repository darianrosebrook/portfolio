import Link from 'next/link';
import path from 'path';
import fs from 'fs';
import styles from './page.module.scss';
import catalog from '@/app/blueprints/component-standards/components-transformed.json';
import { normalizeCategory, ORDERED_GROUPS, type GroupKey } from './utils';

type CatalogEntry = (typeof catalog.components)[number];

function getComponentDirs(): string[] {
  // Server-side read of `ui/components` to list concrete components
  const componentsDir = path.resolve(process.cwd(), 'ui/components');
  try {
    const entries = fs.readdirSync(componentsDir, { withFileTypes: true });
    return entries
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort((a, b) => a.localeCompare(b));
  } catch {
    return [];
  }
}

function makeCatalogIndex(entries: CatalogEntry[]): Map<string, CatalogEntry> {
  const map = new Map<string, CatalogEntry>();
  for (const item of entries) {
    map.set(item.component, item);
  }
  return map;
}

export const metadata = {
  title: 'Components Showcase',
  description:
    'A visual index of system components, grouped by purpose: actions, inputs, displays, and more.',
};

export default function ComponentsShowcasePage() {
  const componentDirs = getComponentDirs();
  const index = makeCatalogIndex(catalog.components);

  type Item = { name: string; category: GroupKey | 'Other' };
  const items: Item[] = componentDirs.map((dir) => {
    const entry = index.get(dir);
    const category = normalizeCategory(entry?.category);
    return { name: dir, category };
  });

  const grouped = items.reduce<Record<GroupKey | 'Other', Item[]>>(
    (acc, item) => {
      const key = item.category;
      if (!acc[key]) acc[key] = [] as Item[];
      acc[key].push(item);
      return acc;
    },
    {
      Actions: [],
      Inputs: [],
      Displays: [],
      Feedback: [],
      Navigation: [],
      Layout: [],
      Other: [],
    }
  );

  const groupsToRender: Array<GroupKey | 'Other'> = [
    ...ORDERED_GROUPS,
    'Other',
  ];

  return (
    <section className="content">
      <header className={styles.header}>
        <h1>Components Showcase</h1>
        <p>
          Explore all components in our system, grouped by purpose. Each card
          links to its source folder and any standards we have.
        </p>
      </header>

      {groupsToRender.map((groupKey) => {
        const list = grouped[groupKey as GroupKey | 'Other'];
        if (!list || list.length === 0) return null;
        return (
          <section key={groupKey} className={styles.section}>
            <div className={styles.badgeRow}>
              <span className={`${styles.badge} ${styles.badgeCategory}`}>
                {groupKey}
              </span>
              <span className={styles.count}>{list.length}</span>
            </div>
            <div className={styles.grid}>
              {list.map(({ name }) => {
                const componentStandardsAnchor = index.get(name)?.component
                  ? `#${index.get(name)!.component.toLowerCase()}`
                  : '';
                return (
                  <article key={name} className={styles.card}>
                    <h3 className={styles.cardTitle}>{name}</h3>
                    <nav>
                      <ul>
                        <li>
                          <Link
                            href={`/blueprints/component-standards${componentStandardsAnchor}`}
                          >
                            Standards reference
                          </Link>
                        </li>
                        <li>
                          <Link href={`/ui/components/${name}`}>
                            View source
                          </Link>
                        </li>
                      </ul>
                    </nav>
                  </article>
                );
              })}
            </div>
          </section>
        );
      })}
    </section>
  );
}

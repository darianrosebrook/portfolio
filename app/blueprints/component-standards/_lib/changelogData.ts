export type ChangelogChangeType =
  | 'added'
  | 'changed'
  | 'deprecated'
  | 'removed'
  | 'fixed'
  | 'security';

export interface ChangelogEntry {
  version: string;
  date: string;
  changes: {
    type: ChangelogChangeType;
    description: string;
  }[];
}

export interface ComponentChangelog {
  componentName: string;
  entries: ChangelogEntry[];
}

/**
 * Get changelog data for a component (if available).
 * Returns null if no changelog data exists.
 */
export function getChangelog(componentName: string): ComponentChangelog | null {
  // TODO: Implement actual changelog data lookup
  // For now, return example data for common components
  const examples: Record<string, ComponentChangelog> = {
    Button: {
      componentName: 'Button',
      entries: [
        {
          version: '2.0.0',
          date: '2024-01-15',
          changes: [
            {
              type: 'changed',
              description:
                'Renamed `onClick` prop to `onPress` for consistency',
            },
            {
              type: 'added',
              description:
                'Added `variant` prop with "primary" and "secondary" options',
            },
            {
              type: 'changed',
              description: 'Updated styling approach to use CSS classes',
            },
          ],
        },
        {
          version: '1.5.0',
          date: '2023-11-20',
          changes: [
            {
              type: 'added',
              description: 'Added `isLoading` prop for loading state',
            },
            {
              type: 'fixed',
              description: 'Fixed focus styles for keyboard navigation',
            },
          ],
        },
        {
          version: '1.0.0',
          date: '2023-09-01',
          changes: [
            {
              type: 'added',
              description: 'Initial release of Button component',
            },
          ],
        },
      ],
    },
    Input: {
      componentName: 'Input',
      entries: [
        {
          version: '1.2.0',
          date: '2024-02-10',
          changes: [
            {
              type: 'added',
              description: 'Added `success` prop for success state styling',
            },
            {
              type: 'changed',
              description: 'Improved error state visual feedback',
            },
          ],
        },
        {
          version: '1.0.0',
          date: '2023-09-01',
          changes: [
            {
              type: 'added',
              description: 'Initial release of Input component',
            },
          ],
        },
      ],
    },
  };

  return examples[componentName] || null;
}

/**
 * Get the latest version date for a component.
 * Returns null if no changelog exists.
 */
export function getLastUpdated(componentName: string): string | null {
  const changelog = getChangelog(componentName);
  if (!changelog || changelog.entries.length === 0) {
    return null;
  }
  return changelog.entries[0].date;
}







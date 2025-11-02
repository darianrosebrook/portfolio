import type { VirtualProject } from '@/ui/modules/CodeSandbox/types';

export type MigrationChangeType =
  | 'added'
  | 'changed'
  | 'deprecated'
  | 'removed';

export interface MigrationChange {
  type: MigrationChangeType;
  description: string;
}

export interface MigrationData {
  componentName: string;
  fromVersion: string;
  toVersion: string;
  before: VirtualProject;
  after: VirtualProject;
  notes: string[];
  changes: MigrationChange[];
}

/**
 * Example migration data structure.
 * This can be extended with actual migration data per component.
 */
export const exampleMigration: MigrationData = {
  componentName: 'Button',
  fromVersion: '1.0.0',
  toVersion: '2.0.0',
  before: {
    files: [
      {
        path: '/App.tsx',
        contents: `import { Button } from './Button';

export default function App() {
  return (
    <Button onClick={() => alert('clicked')}>
      Click me
    </Button>
  );
}`,
      },
      {
        path: '/Button.tsx',
        contents: `interface ButtonProps {
  onClick?: () => void;
  children: React.ReactNode;
}

export function Button({ onClick, children }: ButtonProps) {
  return (
    <button onClick={onClick} className="button">
      {children}
    </button>
  );
}`,
      },
    ],
    dependencies: { react: '18.x', 'react-dom': '18.x' },
  },
  after: {
    files: [
      {
        path: '/App.tsx',
        contents: `import { Button } from './Button';

export default function App() {
  return (
    <Button onPress={() => alert('clicked')}>
      Click me
    </Button>
  );
}`,
      },
      {
        path: '/Button.tsx',
        contents: `interface ButtonProps {
  onPress?: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

export function Button({ onPress, children, variant = 'primary' }: ButtonProps) {
  return (
    <button onClick={onPress} className={\`button button--\${variant}\`}>
      {children}
    </button>
  );
}`,
      },
    ],
    dependencies: { react: '18.x', 'react-dom': '18.x' },
  },
  notes: [
    'The `onClick` prop has been renamed to `onPress` for consistency across the design system.',
    'Added a new `variant` prop with support for "primary" and "secondary" styles.',
    'The component now uses CSS classes instead of inline styles for better performance.',
  ],
  changes: [
    {
      type: 'changed',
      description: 'Renamed `onClick` prop to `onPress`',
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
};

/**
 * Get migration data for a component (if available).
 * Returns null if no migration data exists.
 */
export function getMigrationData(componentName: string): MigrationData | null {
  // TODO: Implement actual migration data lookup
  // For now, return example for Button component
  if (componentName === 'Button') {
    return exampleMigration;
  }
  return null;
}

import Link from 'next/link';
import styles from '../page.module.scss';

/**
 * Metadata for the /blueprints/foundations/tokens/build-outputs page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Build Outputs | Darian Rosebrook',
  description:
    'From tokens to artifacts: composed JSON, global CSS variables, component-scoped SCSS, and TypeScript TokenPath types.',
  openGraph: {
    title: 'Build Outputs | Darian Rosebrook',
    description:
      'From tokens to artifacts: composed JSON, global CSS variables, component-scoped SCSS, and TypeScript TokenPath types.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build Outputs | Darian Rosebrook',
    description:
      'From tokens to artifacts: composed JSON, global CSS variables, component-scoped SCSS, and TypeScript TokenPath types.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function BuildOutputsPage() {
  return (
    <section className="content">
      <h1>Build Outputs</h1>
      <p>
        Our pipeline turns authored tokens into artifacts consumed by apps and
        docs. This ensures a single source of truth across repos.
      </p>

      <h2>Artifacts</h2>
      <ul>
        <li>
          <strong>Composed JSON:</strong>{' '}
          <code>ui/designTokens/designTokens.json</code>
        </li>
        <li>
          <strong>Global CSS variables:</strong>{' '}
          <code>app/designTokens.scss</code>
        </li>
        <li>
          <strong>Component SCSS:</strong>{' '}
          <code>ui/components/**/**.tokens.generated.scss</code>
        </li>
        <li>
          <strong>TypeScript paths:</strong> <code>types/designTokens.ts</code>
        </li>
      </ul>

      <h2>Commands</h2>
      <pre>
        <code>{`npm run tokens:build
npm run tokens:compose
npm run tokens:globals
npm run tokens:scss
npm run tokens:types`}</code>
      </pre>

      <div className={styles.placeholder}>
        <p>
          See <code>ui/designTokens/README.md</code> for details.
        </p>
      </div>

      <p>
        Next:{' '}
        <Link href="/blueprints/foundations/tokens/accessibility">
          Accessibility by Default →
        </Link>
      </p>
    </section>
  );
}

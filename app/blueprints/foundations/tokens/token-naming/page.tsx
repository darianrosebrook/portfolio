import Link from 'next/link';
import styles from '../page.module.scss';

/**
 * Metadata for the /blueprints/foundations/tokens/token-naming page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Token Naming & Hierarchy | Darian Rosebrook',
  description:
    'Conventions for namespacing, discoverability, and stability. Learn how to structure core, semantic, and component tokens.',
  openGraph: {
    title: 'Token Naming & Hierarchy | Darian Rosebrook',
    description:
      'Conventions for namespacing, discoverability, and stability. Learn how to structure core, semantic, and component tokens.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Token Naming & Hierarchy | Darian Rosebrook',
    description:
      'Conventions for namespacing, discoverability, and stability. Learn how to structure core, semantic, and component tokens.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function TokenNamingPage() {
  return (
    <section className="content">
      <h1>Token Naming & Hierarchy</h1>
      <p>
        Names are API design. Good names communicate intent and make discovery
        easy. Our conventions favor clarity over brevity and encode the token’s
        role and layer.
      </p>

      <h2>Guidelines</h2>
      <ul>
        <li>
          Always prefix with layer: <code>core.</code>, <code>semantic.</code>,{' '}
          <code>components.</code>
        </li>
        <li>Prefer nouns for tokens, verbs for utilities.</li>
        <li>
          Describe purpose, not implementation (e.g.,{' '}
          <code>foreground.primary</code> vs <code>blue.500</code>).
        </li>
        <li>Keep depth consistent—avoid skipping hierarchy levels.</li>
        <li>
          Use American spelling and kebab/camel case consistently across
          domains.
        </li>
      </ul>

      <h2>Examples</h2>
      <pre>
        <code>{`semantic.color.foreground.primary
semantic.elevation.surface.raised
components.button.primary.background`}</code>
      </pre>

      <div className={styles.placeholder}>
        <p>
          See <code>ui/designTokens/README.md</code> for authoring rules.
        </p>
      </div>

      <p>
        Next:{' '}
        <Link href="/blueprints/foundations/tokens/theming">
          Theming & Modes →
        </Link>
      </p>
    </section>
  );
}

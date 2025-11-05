import Link from 'next/link';
import styles from '../page.module.scss';

/**
 * Metadata for the /blueprints/foundations/tokens/theming page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Multi-Brand Theming | Darian Rosebrook',
  description:
    'How structured DTCG tokens enable brand switching, platform variants, and scalable theming across products with semantic aliasing.',
  openGraph: {
    title: 'Multi-Brand Theming | Darian Rosebrook',
    description:
      'How structured DTCG tokens enable brand switching, platform variants, and scalable theming across products with semantic aliasing.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-Brand Theming | Darian Rosebrook',
    description:
      'How structured DTCG tokens enable brand switching, platform variants, and scalable theming across products with semantic aliasing.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function ThemingPage() {
  return (
    <section className="content">
      <h1>Theming & Modes</h1>
      <p>
        Our primary approach to modes uses <code>$extensions.design.paths</code>
        with <code>light</code> and <code>dark</code> references on semantic
        tokens. This avoids duplication and keeps the intent attached to the
        token.
      </p>

      <h2>Mode references</h2>
      <pre>
        <code>{`{
  "$type": "color",
  "$value": "{color.palette.neutral.600}",
  "$extensions": {
    "design": {
      "paths": {
        "light": "{color.palette.neutral.600}",
        "dark": "{color.palette.neutral.300}"
      }
    }
  }
}`}</code>
      </pre>

      <h2>When to use explicit mode files</h2>
      <ul>
        <li>Large, deliberate divergences across modes.</li>
        <li>
          Performance-sensitive themes where precomposed files are faster.
        </li>
        <li>Temporary migrations from legacy variable sets.</li>
      </ul>

      <div className={styles.placeholder}>
        <p>
          See <code>ui/designTokens/light.json</code> and{' '}
          <code>ui/designTokens/dark.json</code>.
        </p>
      </div>

      <p>
        Next:{' '}
        <Link href="/blueprints/foundations/tokens/schema-validation">
          Schema & Validation →
        </Link>
      </p>
    </section>
  );
}

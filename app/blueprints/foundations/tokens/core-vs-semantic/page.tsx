import Link from 'next/link';
import styles from '../page.module.scss';

/**
 * Metadata for the /blueprints/foundations/tokens/core-vs-semantic page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Core vs Semantic Tokens | Darian Rosebrook',
  description:
    'Understand how core primitives and semantic roles work together. Why aliases beat copies, and how this structure scales to themes and brands.',
  openGraph: {
    title: 'Core vs Semantic Tokens | Darian Rosebrook',
    description:
      'Understand how core primitives and semantic roles work together. Why aliases beat copies, and how this structure scales to themes and brands.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Core vs Semantic Tokens | Darian Rosebrook',
    description:
      'Understand how core primitives and semantic roles work together. Why aliases beat copies, and how this structure scales to themes and brands.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function CoreVsSemanticPage() {
  return (
    <section className="content">
      <h1>Core vs Semantic Tokens</h1>
      <p>
        Our token model separates <strong>core</strong> primitives from
        <strong> semantic</strong> roles. Core values encode the building blocks
        of the system—palette ramps, spacing increments, type scales, motion
        durations. Semantic tokens alias these primitives into purposeful roles
        like foreground, background, status, or control sizes.
      </p>

      <h2>Why this separation?</h2>
      <ul>
        <li>
          <strong>Stability:</strong> Core values rarely change; semantics are
          the theming surface.
        </li>
        <li>
          <strong>Refactor safety:</strong> Semantics alias core values so brand
          changes don’t require component rewrites.
        </li>
        <li>
          <strong>A11y at the right layer:</strong> Contrast and motion
          decisions are enforced in semantic roles.
        </li>
      </ul>

      <h2>Examples</h2>
      <p>Core primitive (palette):</p>
      <pre>
        <code>{`{
  "$type": "color",
  "$value": "#1F2937"
}`}</code>
      </pre>
      <p>Semantic alias (foreground):</p>
      <pre>
        <code>{`{
  "$type": "color",
  "$value": "{core.color.palette.neutral.800}"
}`}</code>
      </pre>

      <div className={styles.placeholder}>
        <p>
          Source files: <code>ui/designTokens/core.tokens.json</code> and
          <code> ui/designTokens/semantic.tokens.json</code>
        </p>
      </div>

      <p>
        Next:{' '}
        <Link href="/blueprints/foundations/tokens/token-naming">
          Token Naming & Hierarchy →
        </Link>
      </p>
    </section>
  );
}

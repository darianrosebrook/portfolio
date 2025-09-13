import Link from 'next/link';
import styles from '../page.module.scss';

/**
 * Metadata for the /blueprints/foundations/tokens/accessibility page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Accessibility by Default | Darian Rosebrook',
  description:
    'How tokens encode accessibility decisions—contrast, reduced motion, minimum targets—so inclusivity is a default, not an afterthought.',
  openGraph: {
    title: 'Accessibility by Default | Darian Rosebrook',
    description:
      'How tokens encode accessibility decisions—contrast, reduced motion, minimum targets—so inclusivity is a default, not an afterthought.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accessibility by Default | Darian Rosebrook',
    description:
      'How tokens encode accessibility decisions—contrast, reduced motion, minimum targets—so inclusivity is a default, not an afterthought.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function AccessibilityTokensPage() {
  return (
    <section className="content">
      <h1>Accessibility by Default</h1>
      <p>
        Tokens are an excellent place to encode accessibility constraints. By
        putting these decisions at the foundation level, we ensure that every
        component inherits inclusive defaults.
      </p>

      <h2>Areas we encode</h2>
      <ul>
        <li>Contrast-aware color roles for text, borders, and states.</li>
        <li>Reduced-motion friendly timings and easing ramps.</li>
        <li>Minimum target sizes via spacing and dimension tokens.</li>
        <li>Focus rings and offsets as reusable compositions.</li>
      </ul>

      <div className={styles.placeholder}>
        <p>
          Related foundations:{' '}
          <Link href="/blueprints/foundations/accessibility/tokens">
            Accessibility & Tokens
          </Link>
        </p>
      </div>

      <p>
        Next:{' '}
        <Link href="/blueprints/foundations/tokens">
          Back to Tokens Overview →
        </Link>
      </p>
    </section>
  );
}

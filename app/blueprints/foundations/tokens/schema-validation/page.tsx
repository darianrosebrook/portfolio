import Link from 'next/link';
import styles from '../page.module.scss';

/**
 * Metadata for the /blueprints/foundations/tokens/schema-validation page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Schema & Validation | Darian Rosebrook',
  description:
    'JSON Schema for IntelliSense and AJV validation with custom lint checks. How we keep tokens safe-by-default.',
  openGraph: {
    title: 'Schema & Validation | Darian Rosebrook',
    description:
      'JSON Schema for IntelliSense and AJV validation with custom lint checks. How we keep tokens safe-by-default.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schema & Validation | Darian Rosebrook',
    description:
      'JSON Schema for IntelliSense and AJV validation with custom lint checks. How we keep tokens safe-by-default.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function SchemaValidationPage() {
  return (
    <section className="content">
      <h1>Schema & Validation</h1>
      <p>
        Editors load a local <code>designTokens.schema.json</code> for fast,
        offline IntelliSense. The schema is permissive for grouping (supports
        nested objects) but strict for primitives (types, patterns). Validation
        uses AJV with custom checks for units, missing types, circular
        references, and suspicious numbers.
      </p>

      <h2>Key rules we validate</h2>
      <ul>
        <li>Dimensions must include units; ratios are numbers.</li>
        <li>Line-height tokens are numbers; letter-spacing is a dimension.</li>
        <li>
          Token references match <code>{'{...}'}</code> patterns.
        </li>
        <li>No circular/self references.</li>
        <li>
          Mode references match <code>design.paths.light|dark</code>.
        </li>
      </ul>

      <div className={styles.placeholder}>
        <p>
          See <code>utils/designTokens/generateSchema.mjs</code> and
          <code> utils/designTokens/validateTokens.mjs</code>.
        </p>
      </div>

      <p>
        Next:{' '}
        <Link href="/blueprints/foundations/tokens/build-outputs">
          Build Outputs →
        </Link>
      </p>
    </section>
  );
}

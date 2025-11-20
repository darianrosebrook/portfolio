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
        Our DTCG 1.0 compliant JSON schema enforces structured value formats for
        type safety and platform flexibility. The schema validates the required
        structure of <code>$value</code> objects based on <code>$type</code>,
        ensuring interoperability with DTCG-compliant tools and preventing
        runtime errors.
      </p>

      <h2>DTCG 1.0 Type System</h2>
      <p>
        The schema enforces the official DTCG 1.0 type enumeration and their
        corresponding structured value formats:
      </p>

      <h3>Color Values</h3>
      <pre>
        <code>{`{
  "$type": "color",
  "$value": {
    "colorSpace": "srgb", // srgb, display-p3, oklch, etc.
    "components": [0.8, 0.2, 0.2], // 3-4 component array
    "alpha": 1 // optional, 0-1
  }
}`}</code>
      </pre>
      <p>
        Validates color space support and component array length based on the
        specified color space.
      </p>

      <h3>Dimension Values</h3>
      <pre>
        <code>{`{
  "$type": "dimension",
  "$value": {
    "value": 16,
    "unit": "px" // px or rem only
  }
}`}</code>
      </pre>
      <p>Enforces DTCG 1.0 unit restrictions and numeric value types.</p>

      <h3>Composite Tokens</h3>
      <p>
        Complex tokens like typography, shadows, and borders validate their
        sub-properties against structured formats.
      </p>

      <pre>
        <code>{`{
  "$type": "typography",
  "$value": {
    "fontFamily": "{typography.fontFamily.inter}",
    "fontSize": { "value": 16, "unit": "px" },
    "fontWeight": 400,
    "lineHeight": 1.5, // unitless number
    "letterSpacing": { "value": 0, "unit": "em" }
  }
}`}</code>
      </pre>

      <h2>Reference Validation</h2>
      <p>
        Token references are validated for proper syntax and resolved for
        circular dependencies and missing targets.
      </p>

      <h3>Reference Patterns</h3>
      <ul>
        <li>
          <code>{'{token.path}'}</code> - Standard token reference
        </li>
        <li>
          <code>{'{$extensions.design.paths.light}'}</code> - Extension
          references
        </li>
        <li>
          References resolve to compatible types (color to color, dimension to
          dimension)
        </li>
      </ul>

      <h3>Circular Reference Detection</h3>
      <pre>
        <code>{`// ❌ Circular reference detected
{
  "color": {
    "primary": { "$value": "{color.secondary}" },
    "secondary": { "$value": "{color.primary}" }
  }
}`}</code>
      </pre>

      <h2>Extension Validation</h2>
      <p>
        The <code>$extensions</code> property is validated for known extension
        patterns like theming and calculations.
      </p>

      <h3>Design Paths Extension</h3>
      <pre>
        <code>{`{
  "$extensions": {
    "design": {
      "paths": {
        "light": "{color.palette.neutral.100}",
        "dark": "{color.palette.neutral.800}"
      }
    }
  }
}`}</code>
      </pre>

      <h3>Design Calculations</h3>
      <pre>
        <code>{`{
  "$extensions": {
    "design": {
      "calc": "calc({spacing.size.04} + 2px)"
    }
  }
}`}</code>
      </pre>

      <h2>Schema Generation</h2>
      <p>
        Our schema is programmatically generated from the DTCG 1.0
        specification, ensuring it stays current with the standard and includes
        our custom extensions for theming.
      </p>

      <div className={styles.placeholder}>
        <p>
          Generated from{' '}
          <code>utils/designTokens/generators/generateSchema.mjs</code>
          <br />
          Validates with{' '}
          <code>utils/designTokens/validators/validateTokens.mjs</code>
        </p>
      </div>

      <h2>Validation in CI/CD</h2>
      <p>
        Schema validation runs in our CI pipeline, blocking merges when tokens
        don't conform to DTCG 1.0 structure or contain validation errors.
      </p>

      <ul>
        <li>
          <strong>Static analysis</strong>: JSON Schema validation with AJV
        </li>
        <li>
          <strong>Reference resolution</strong>: Graph analysis for circular
          dependencies
        </li>
        <li>
          <strong>Type compatibility</strong>: Ensures referenced tokens match
          expected types
        </li>
        <li>
          <strong>Extension validation</strong>: Custom rules for design
          extensions
        </li>
      </ul>

      <p>
        Previous:{' '}
        <Link href="/blueprints/foundations/tokens/resolver-module">
          ← Resolver Module
        </Link>{' '}
        | Next:{' '}
        <Link href="/blueprints/foundations/tokens/build-outputs">
          Build Outputs →
        </Link>
      </p>
    </section>
  );
}

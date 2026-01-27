import Link from 'next/link';
import styles from '../page.module.scss';

export const metadata = {
  title: 'DTCG 1.0 Structured Formats | Darian Rosebrook',
  description:
    'How we use DTCG 1.0 specification with structured values: color objects, dimension units, and composite tokens for scalable theming.',
  openGraph: {
    title: 'DTCG 1.0 Structured Formats | Darian Rosebrook',
    description:
      'How we use DTCG 1.0 specification with structured values: color objects, dimension units, and composite tokens for scalable theming.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DTCG 1.0 Structured Formats | Darian Rosebrook',
    description:
      'How we use DTCG 1.0 specification with structured values: color objects, dimension units, and composite tokens for scalable theming.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function DTCGFormatsPage() {
  return (
    <section className="content">
      <article>
        <h1>Deep Dive: DTCG 1.0 Structured Formats</h1>

        <h2>Why Follow DTCG?</h2>
        <p>
          The{' '}
          <strong>
            W3C Design Tokens Community Group (DTCG) 1.0 specification
          </strong>{' '}
          defines a standard format for design tokens that enables
          interoperability between tools, platforms, and organizations. By
          following this specification, our tokens work with Figma, Style
          Dictionary, Tokens Studio, and any other DTCG-compliant tool.
        </p>

        <p>
          More importantly, DTCG mandates structured object formats instead of
          simple strings. This enables type safety, platform flexibility, and
          scalable theming that wouldn&apos;t be possible with primitive string
          values.
        </p>

        <h2>Token Anatomy</h2>
        <p>Every DTCG token is an object with specific properties:</p>

        <pre className={styles.codeBlock}>
          <code>{`{
  "tokenName": {
    "$type": "color",                    // Required: token type
    "$value": "#0a65fe",                 // Required: token value
    "$description": "Primary brand blue", // Optional: documentation
    "$extensions": {                     // Optional: custom metadata
      "design.paths.dark": "#4d9fff"
    }
  }
}`}</code>
        </pre>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Property</th>
              <th>Required</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>$type</code>
              </td>
              <td>Yes</td>
              <td>Declares the token&apos;s data type for validation</td>
            </tr>
            <tr>
              <td>
                <code>$value</code>
              </td>
              <td>Yes</td>
              <td>The token&apos;s value (format depends on type)</td>
            </tr>
            <tr>
              <td>
                <code>$description</code>
              </td>
              <td>No</td>
              <td>Human-readable documentation</td>
            </tr>
            <tr>
              <td>
                <code>$extensions</code>
              </td>
              <td>No</td>
              <td>Custom metadata (theming, platform variants)</td>
            </tr>
          </tbody>
        </table>

        <h2>DTCG Type System</h2>
        <p>
          DTCG defines a fixed set of token types. Each type has specific value
          format requirements:
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Value Format</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>color</code>
              </td>
              <td>Hex string or color object</td>
              <td>
                <code>&quot;#0a65fe&quot;</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>dimension</code>
              </td>
              <td>Number with unit (px, rem)</td>
              <td>
                <code>&quot;16px&quot;</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>number</code>
              </td>
              <td>Unitless number</td>
              <td>
                <code>1.5</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>duration</code>
              </td>
              <td>Time with unit (ms, s)</td>
              <td>
                <code>&quot;250ms&quot;</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>cubicBezier</code>
              </td>
              <td>Array of 4 numbers</td>
              <td>
                <code>[0.4, 0, 0.2, 1]</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>fontFamily</code>
              </td>
              <td>String or array of strings</td>
              <td>
                <code>&quot;Inter, sans-serif&quot;</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>fontWeight</code>
              </td>
              <td>Number or keyword</td>
              <td>
                <code>700</code> or <code>&quot;bold&quot;</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>typography</code>
              </td>
              <td>Composite object</td>
              <td>See below</td>
            </tr>
            <tr>
              <td>
                <code>shadow</code>
              </td>
              <td>Composite object</td>
              <td>See below</td>
            </tr>
            <tr>
              <td>
                <code>border</code>
              </td>
              <td>Composite object</td>
              <td>See below</td>
            </tr>
          </tbody>
        </table>

        <h2>Color Values</h2>
        <p>
          Colors can be specified as hex strings or structured objects. We
          primarily use hex strings for simplicity, but structured objects
          enable advanced color space support.
        </p>

        <h3>Hex String (Simple)</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "$type": "color",
  "$value": "#0a65fe"
}`}</code>
        </pre>

        <h3>Structured Color Object</h3>
        <p>
          For advanced use cases, DTCG supports structured color objects with
          explicit color space and components:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`{
  "$type": "color",
  "$value": {
    "colorSpace": "srgb",
    "components": [0.04, 0.4, 0.996]
  }
}`}</code>
        </pre>

        <h3>Modern Color Spaces</h3>
        <p>
          Structured objects support modern color spaces like OKLCH for better
          perceptual uniformity:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`{
  "$type": "color",
  "$value": {
    "colorSpace": "oklch",
    "components": [0.65, 0.25, 240]
  },
  "$description": "OKLCH blue - perceptually uniform"
}`}</code>
        </pre>

        <h3>Color with Alpha</h3>
        <pre className={styles.codeBlock}>
          <code>{`// Hex with alpha
{
  "$type": "color",
  "$value": "#0a65fe80"  // 50% opacity
}

// Structured with alpha
{
  "$type": "color",
  "$value": {
    "colorSpace": "srgb",
    "components": [0.04, 0.4, 0.996],
    "alpha": 0.5
  }
}`}</code>
        </pre>

        <h2>Dimension Values</h2>
        <p>
          Dimensions represent spatial values with units. DTCG 1.0 restricts
          units to <code>px</code> and <code>rem</code> for consistency.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Pixel dimension
{
  "$type": "dimension",
  "$value": "16px"
}

// Relative dimension
{
  "$type": "dimension",
  "$value": "1rem"
}

// Zero (no unit required)
{
  "$type": "dimension",
  "$value": "0"
}`}</code>
        </pre>

        <h3>Dimension vs Number</h3>
        <p>
          Use <code>dimension</code> for spatial values that need units. Use{' '}
          <code>number</code> for unitless values like line-height multipliers:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Dimension: has unit
{
  "fontSize": {
    "$type": "dimension",
    "$value": "16px"
  }
}

// Number: unitless multiplier
{
  "lineHeight": {
    "$type": "number",
    "$value": 1.5
  }
}`}</code>
        </pre>

        <h2>Composite Tokens</h2>
        <p>
          Complex tokens like typography and shadows combine multiple values
          into a single token. These are called composite tokens.
        </p>

        <h3>Typography Composite</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "$type": "typography",
  "$value": {
    "fontFamily": "{core.typography.family.inter}",
    "fontSize": "16px",
    "fontWeight": 400,
    "lineHeight": 1.5,
    "letterSpacing": "0em"
  },
  "$description": "Body text style"
}`}</code>
        </pre>

        <h3>Shadow Composite</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "$type": "shadow",
  "$value": {
    "offsetX": "0px",
    "offsetY": "4px",
    "blur": "8px",
    "spread": "0px",
    "color": "#00000014"
  },
  "$description": "Subtle elevation shadow"
}`}</code>
        </pre>

        <h3>Border Composite</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "$type": "border",
  "$value": {
    "color": "{semantic.color.border.default}",
    "width": "1px",
    "style": "solid"
  },
  "$description": "Standard border"
}`}</code>
        </pre>

        <h2>Token References</h2>
        <p>
          Tokens can reference other tokens using the{' '}
          <code>{'{token.path}'}</code> syntax. This creates a graph of
          dependencies that the build system resolves.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Core token (leaf node)
{
  "palette": {
    "blue": {
      "500": {
        "$type": "color",
        "$value": "#0a65fe"
      }
    }
  }
}

// Semantic token (references core)
{
  "background": {
    "brand": {
      "$type": "color",
      "$value": "{core.color.palette.blue.500}"
    }
  }
}`}</code>
        </pre>

        <h3>Reference Resolution</h3>
        <p>
          References are resolved at build time. The build system follows the
          reference chain and substitutes the final value:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Source
semantic.color.background.brand = "{core.color.palette.blue.500}"

// Resolved
semantic.color.background.brand = "#0a65fe"`}</code>
        </pre>

        <h2>Extensions for Advanced Features</h2>
        <p>
          The <code>$extensions</code> property provides custom metadata for
          features beyond the DTCG spec. We use it for theming and calculations.
        </p>

        <h3>Theme-Specific Overrides</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "$type": "color",
  "$value": "{core.color.palette.neutral.600}",
  "$extensions": {
    "design.paths.light": "{core.color.palette.neutral.600}",
    "design.paths.dark": "{core.color.palette.neutral.300}"
  }
}`}</code>
        </pre>

        <h3>CSS Calculations</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "$type": "dimension",
  "$value": "16px",
  "$extensions": {
    "design.calc": "calc({core.spacing.size.04} + 2px)"
  }
}`}</code>
        </pre>

        <h2>Pitfalls to Avoid</h2>

        <h3>1. Wrong Type for Value</h3>
        <p>
          The <code>$type</code> must match the <code>$value</code> format.
          Mismatches cause validation errors.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Type/value mismatch
{
  "$type": "dimension",
  "$value": "#0a65fe"  // Color value with dimension type!
}

// ✅ GOOD: Matching type and value
{
  "$type": "color",
  "$value": "#0a65fe"
}`}</code>
        </pre>

        <h3>2. Missing Units on Dimensions</h3>
        <p>
          Dimensions require units (except zero). Numbers are for unitless
          values.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Dimension without unit
{
  "$type": "dimension",
  "$value": "16"  // Missing unit!
}

// ✅ GOOD: Dimension with unit
{
  "$type": "dimension",
  "$value": "16px"
}

// ✅ GOOD: Zero doesn't need unit
{
  "$type": "dimension",
  "$value": "0"
}`}</code>
        </pre>

        <h3>3. Invalid Unit Types</h3>
        <p>
          DTCG 1.0 only allows <code>px</code> and <code>rem</code> for
          dimensions. Other units like <code>em</code>, <code>%</code>, or{' '}
          <code>vh</code> are not valid.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Invalid units
{
  "$type": "dimension",
  "$value": "1em"     // em not allowed
}
{
  "$type": "dimension",
  "$value": "100%"    // % not allowed
}

// ✅ GOOD: Valid units
{
  "$type": "dimension",
  "$value": "16px"
}
{
  "$type": "dimension",
  "$value": "1rem"
}`}</code>
        </pre>

        <h3>4. Circular References</h3>
        <p>
          References cannot form cycles. The validator catches these at build
          time.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Circular reference
{
  "primary": { "$value": "{semantic.color.secondary}" },
  "secondary": { "$value": "{semantic.color.primary}" }
}

// ✅ GOOD: Linear reference chain
{
  "primary": { "$value": "{core.color.palette.blue.500}" },
  "secondary": { "$value": "{core.color.palette.blue.400}" }
}`}</code>
        </pre>

        <h3>5. Referencing Non-Existent Tokens</h3>
        <p>
          References must point to tokens that exist. Typos in paths cause build
          failures.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Typo in reference
{
  "$value": "{core.color.pallete.blue.500}"  // "pallete" typo!
}

// ✅ GOOD: Correct path
{
  "$value": "{core.color.palette.blue.500}"
}`}</code>
        </pre>

        <h2>Build System Integration</h2>
        <p>
          Our build pipeline transforms DTCG tokens into platform-specific
          formats:
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>DTCG Format</th>
              <th>CSS Output</th>
              <th>TypeScript Output</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>#0a65fe</code>
              </td>
              <td>
                <code>#0a65fe</code>
              </td>
              <td>
                <code>&apos;#0a65fe&apos;</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>16px</code>
              </td>
              <td>
                <code>16px</code>
              </td>
              <td>
                <code>&apos;16px&apos;</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>250ms</code>
              </td>
              <td>
                <code>250ms</code>
              </td>
              <td>
                <code>&apos;250ms&apos;</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>[0.4, 0, 0.2, 1]</code>
              </td>
              <td>
                <code>cubic-bezier(0.4, 0, 0.2, 1)</code>
              </td>
              <td>
                <code>[0.4, 0, 0.2, 1]</code>
              </td>
            </tr>
            <tr>
              <td>Typography composite</td>
              <td>Multiple CSS properties</td>
              <td>Typed object</td>
            </tr>
          </tbody>
        </table>

        <h2>Summary</h2>
        <ul>
          <li>
            <strong>DTCG 1.0</strong> provides a standard format for
            interoperability
          </li>
          <li>
            <strong>Every token</strong> has <code>$type</code> and{' '}
            <code>$value</code>; <code>$description</code> and{' '}
            <code>$extensions</code> are optional
          </li>
          <li>
            <strong>Colors</strong> can be hex strings or structured objects
            with color space
          </li>
          <li>
            <strong>Dimensions</strong> require units (<code>px</code>,{' '}
            <code>rem</code>) except for zero
          </li>
          <li>
            <strong>Composite tokens</strong> combine multiple values
            (typography, shadow, border)
          </li>
          <li>
            <strong>References</strong> use <code>{'{token.path}'}</code> syntax
            and cannot be circular
          </li>
          <li>
            <strong>Extensions</strong> enable theming and custom features
            beyond the spec
          </li>
        </ul>

        <h2>Next Steps</h2>
        <p>
          Understanding DTCG formats is foundational. From here, explore how the{' '}
          <Link href="/blueprints/foundations/tokens/core-vs-semantic">
            core vs semantic model
          </Link>{' '}
          uses these formats, how{' '}
          <Link href="/blueprints/foundations/tokens/schema-validation">
            schema validation
          </Link>{' '}
          enforces them, and how the{' '}
          <Link href="/blueprints/foundations/tokens/build-outputs">
            build pipeline
          </Link>{' '}
          transforms them into CSS and TypeScript.
        </p>
      </article>

      <Link href="/blueprints/foundations/tokens">
        &larr; Back to Design Tokens
      </Link>
    </section>
  );
}

import Link from 'next/link';
import styles from '../page.module.scss';

export const metadata = {
  title: 'Schema & Validation | Darian Rosebrook',
  description:
    'JSON Schema for IntelliSense and AJV validation with custom lint checks. How we keep tokens safe-by-default with type enforcement and circular reference detection.',
  openGraph: {
    title: 'Schema & Validation | Darian Rosebrook',
    description:
      'JSON Schema for IntelliSense and AJV validation with custom lint checks. How we keep tokens safe-by-default with type enforcement and circular reference detection.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Schema & Validation | Darian Rosebrook',
    description:
      'JSON Schema for IntelliSense and AJV validation with custom lint checks. How we keep tokens safe-by-default with type enforcement and circular reference detection.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function SchemaValidationPage() {
  return (
    <section className="content">
      <article>
        <h1>Deep Dive: Schema & Validation</h1>

        <h2>Why Schema Validation?</h2>
        <p>
          Design tokens are data, and data needs validation. Without it, typos
          become runtime bugs, invalid references break builds, and inconsistent
          formats cause cross-platform issues. Schema validation catches these
          problems before they reach production.
        </p>

        <p>
          Our validation strategy has two layers: JSON Schema for structural
          validation and IntelliSense, plus custom lint checks for semantic
          rules that JSON Schema can&apos;t express.
        </p>

        <h2>JSON Schema for DTCG Tokens</h2>
        <p>
          The schema validates token structure against the DTCG 1.0
          specification. Every token file references the schema, enabling editor
          IntelliSense and build-time validation.
        </p>

        <h3>Schema Reference</h3>
        <pre className={styles.codeBlock}>
          <code>{`// Every token file starts with schema reference
{
  "$schema": "./designTokens.schema.json",
  "color": {
    "palette": {
      "blue": {
        "500": {
          "$type": "color",
          "$value": "#0a65fe"
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Type Validation</h3>
        <p>
          The schema enforces that <code>$value</code> matches the declared{' '}
          <code>$type</code>:
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Type</th>
              <th>Valid Values</th>
              <th>Invalid Values</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>color</code>
              </td>
              <td>
                <code>#0a65fe</code>, <code>#0a65fe80</code>
              </td>
              <td>
                <code>blue</code>, <code>16px</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>dimension</code>
              </td>
              <td>
                <code>16px</code>, <code>1rem</code>, <code>0</code>
              </td>
              <td>
                <code>16</code>, <code>1em</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>number</code>
              </td>
              <td>
                <code>1.5</code>, <code>400</code>
              </td>
              <td>
                <code>&quot;1.5&quot;</code>, <code>16px</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>duration</code>
              </td>
              <td>
                <code>250ms</code>, <code>0.5s</code>
              </td>
              <td>
                <code>250</code>, <code>fast</code>
              </td>
            </tr>
            <tr>
              <td>
                <code>cubicBezier</code>
              </td>
              <td>
                <code>[0.4, 0, 0.2, 1]</code>
              </td>
              <td>
                <code>ease-in-out</code>
              </td>
            </tr>
          </tbody>
        </table>

        <h3>Reference Pattern Validation</h3>
        <p>
          Token references must follow the <code>{'{path.to.token}'}</code>{' '}
          pattern:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Schema validates reference syntax
{
  "pattern": "^\\{[a-zA-Z][a-zA-Z0-9._-]*\\}$"
}

// Valid references
"{core.color.palette.blue.500}"
"{semantic.spacing.size.04}"

// Invalid references (caught by schema)
"core.color.palette.blue.500"   // Missing braces
"{}"                            // Empty reference
"{123.invalid}"                 // Starts with number`}</code>
        </pre>

        <h2>Custom Lint Checks</h2>
        <p>
          JSON Schema validates structure, but some rules require semantic
          analysis. Our custom validator adds these checks:
        </p>

        <h3>1. Circular Reference Detection</h3>
        <p>
          References cannot form cycles. The validator builds a dependency graph
          and detects cycles:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ DETECTED: Circular reference
{
  "color": {
    "primary": { "$value": "{color.secondary}" },
    "secondary": { "$value": "{color.primary}" }
  }
}

// Error: Circular reference detected:
// color.primary → color.secondary → color.primary`}</code>
        </pre>

        <h3>2. Missing Reference Targets</h3>
        <p>References must point to tokens that exist:</p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ DETECTED: Missing reference target
{
  "foreground": {
    "primary": { "$value": "{core.color.pallete.blue.500}" }
    // Typo: "pallete" instead of "palette"
  }
}

// Error: Reference target not found:
// "{core.color.pallete.blue.500}" in foreground.primary`}</code>
        </pre>

        <h3>3. Type Compatibility</h3>
        <p>References must resolve to compatible types:</p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ DETECTED: Type mismatch
{
  "spacing": {
    "large": {
      "$type": "dimension",
      "$value": "{core.color.palette.blue.500}"  // Color, not dimension!
    }
  }
}

// Error: Type mismatch in spacing.large:
// Expected dimension, got color from reference`}</code>
        </pre>

        <h3>4. Unit Validation</h3>
        <p>
          Dimensions must have valid units. Numbers must be unitless. The
          validator enforces these rules:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ DETECTED: Invalid unit
{
  "spacing": {
    "medium": {
      "$type": "dimension",
      "$value": "1em"  // em not allowed in DTCG 1.0
    }
  }
}

// Error: Invalid unit "em" in spacing.medium
// Allowed units: px, rem`}</code>
        </pre>

        <h3>5. Suspicious Number Values</h3>
        <p>
          Large numbers without units often indicate mistakes (e.g., forgetting{' '}
          <code>px</code>):
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ⚠️ WARNING: Suspicious number
{
  "spacing": {
    "large": {
      "$type": "number",
      "$value": 48  // Did you mean "48px"?
    }
  }
}

// Warning: Large number 48 in spacing.large
// Consider if this should be a dimension with unit`}</code>
        </pre>

        <h2>Extension Validation</h2>
        <p>
          The <code>$extensions</code> property has its own validation rules for
          our custom features:
        </p>

        <h3>Design Paths Extension</h3>
        <pre className={styles.codeBlock}>
          <code>{`// Valid design.paths structure
{
  "$extensions": {
    "design.paths.light": "{core.color.palette.neutral.600}",
    "design.paths.dark": "{core.color.palette.neutral.300}"
  }
}

// ❌ Invalid: paths must be references or values
{
  "$extensions": {
    "design.paths.light": null,  // Invalid
    "design.paths.dark": 123     // Invalid
  }
}`}</code>
        </pre>

        <h3>Design Calc Extension</h3>
        <pre className={styles.codeBlock}>
          <code>{`// Valid calc expression
{
  "$extensions": {
    "design.calc": "calc({core.spacing.size.04} + 2px)"
  }
}

// ❌ Invalid: malformed calc
{
  "$extensions": {
    "design.calc": "calc({spacing.04} +"  // Unclosed expression
  }
}`}</code>
        </pre>

        <h2>Schema Generation</h2>
        <p>
          Our schema is programmatically generated from the DTCG 1.0
          specification. This ensures it stays current and includes our custom
          extensions:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// utils/designTokens/generators/generateSchema.mjs

// DTCG 1.0 type definitions
const dtcgTypes = {
  color: {
    pattern: '^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$',
    description: 'Hex color value'
  },
  dimension: {
    pattern: '^(0|[0-9]+(\\.[0-9]+)?(px|rem))$',
    description: 'Dimension with px or rem unit'
  },
  // ... other types
};

// Custom extensions
const extensionSchema = {
  'design.paths.light': { type: 'string' },
  'design.paths.dark': { type: 'string' },
  'design.calc': { type: 'string', pattern: '^calc\\(.*\\)$' }
};

// Generate combined schema
generateSchema(dtcgTypes, extensionSchema);`}</code>
        </pre>

        <h3>Regenerating the Schema</h3>
        <pre className={styles.codeBlock}>
          <code>{`# Regenerate schema after spec changes
npm run tokens:schema

# Output: ui/designTokens/designTokens.schema.json`}</code>
        </pre>

        <h2>Validation in CI/CD</h2>
        <p>
          Validation runs in the CI pipeline, blocking merges when tokens
          don&apos;t conform:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`# .github/workflows/tokens.yml
- name: Validate Tokens
  run: npm run tokens:validate

# Validation steps:
# 1. JSON Schema validation (AJV)
# 2. Reference resolution check
# 3. Circular dependency detection
# 4. Type compatibility verification
# 5. Unit validation
# 6. Extension validation`}</code>
        </pre>

        <h3>Validation Output</h3>
        <pre className={styles.codeBlock}>
          <code>{`$ npm run tokens:validate

Validating design tokens...

Schema validation:
  core/color.tokens.json ........... PASS
  core/spacing.tokens.json ......... PASS
  semantic/color.tokens.json ....... PASS

Reference validation:
  Checking 247 references .......... PASS
  No circular dependencies ......... PASS

Type validation:
  Checking type compatibility ...... PASS

Unit validation:
  Checking dimension units ......... PASS
  No suspicious numbers ............ PASS

All validations passed.`}</code>
        </pre>

        <h2>Editor IntelliSense</h2>
        <p>
          The schema enables rich editor support. VS Code, WebStorm, and other
          editors provide:
        </p>

        <ul>
          <li>
            <strong>Autocomplete</strong> for <code>$type</code> values
          </li>
          <li>
            <strong>Inline errors</strong> for invalid values
          </li>
          <li>
            <strong>Hover documentation</strong> from <code>$description</code>
          </li>
          <li>
            <strong>Go to definition</strong> for references
          </li>
        </ul>

        <pre className={styles.codeBlock}>
          <code>{`// VS Code settings.json
{
  "json.schemas": [
    {
      "fileMatch": ["**/designTokens/**/*.tokens.json"],
      "url": "./ui/designTokens/designTokens.schema.json"
    }
  ]
}`}</code>
        </pre>

        <h2>Pitfalls to Avoid</h2>

        <h3>1. Ignoring Validation Errors</h3>
        <p>
          Validation errors exist for a reason. Don&apos;t bypass them with{' '}
          <code>--force</code> flags or by disabling checks.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Bypassing validation
npm run tokens:build --skip-validation

// ✅ GOOD: Fix the underlying issue
// If validation fails, understand why and fix the token`}</code>
        </pre>

        <h3>2. Outdated Schema</h3>
        <p>
          If you add new token types or extensions, regenerate the schema.
          Outdated schemas cause false positives/negatives.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// After adding new extension type
npm run tokens:schema  // Regenerate
npm run tokens:validate  // Verify`}</code>
        </pre>

        <h3>3. Missing Schema Reference</h3>
        <p>
          Token files without <code>$schema</code> don&apos;t get editor
          IntelliSense. Always include the reference:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: No schema reference
{
  "color": { ... }
}

// ✅ GOOD: Schema reference included
{
  "$schema": "./designTokens.schema.json",
  "color": { ... }
}`}</code>
        </pre>

        <h3>4. Overly Permissive Patterns</h3>
        <p>
          Don&apos;t weaken schema patterns to &ldquo;fix&rdquo; validation
          errors. If a value doesn&apos;t match the pattern, the value is wrong,
          not the pattern.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Weakening the schema
{
  "dimension": {
    "pattern": ".*"  // Accepts anything!
  }
}

// ✅ GOOD: Fix the token value
{
  "$type": "dimension",
  "$value": "16px"  // Correct format
}`}</code>
        </pre>

        <h2>Running Validation</h2>
        <p>Validation can be run manually or as part of the build:</p>

        <pre className={styles.codeBlock}>
          <code>{`# Full validation
npm run tokens:validate

# Validation as part of build
npm run tokens:build  # Includes validation

# Verbose output for debugging
npm run tokens:validate -- --verbose

# Validate specific file
npm run tokens:validate -- --file=core/color.tokens.json`}</code>
        </pre>

        <h2>Summary</h2>
        <ul>
          <li>
            <strong>JSON Schema</strong> validates structure and enables
            IntelliSense
          </li>
          <li>
            <strong>Custom lint checks</strong> catch semantic issues (circular
            refs, missing targets)
          </li>
          <li>
            <strong>Type validation</strong> ensures values match declared types
          </li>
          <li>
            <strong>Unit validation</strong> enforces DTCG 1.0 unit restrictions
          </li>
          <li>
            <strong>Extension validation</strong> checks custom metadata format
          </li>
          <li>
            <strong>CI integration</strong> blocks invalid tokens from merging
          </li>
          <li>
            <strong>Never bypass validation</strong>&mdash;fix the underlying
            issue
          </li>
        </ul>

        <h2>Next Steps</h2>
        <p>
          Schema validation works with the{' '}
          <Link href="/blueprints/foundations/tokens/build-outputs">
            build pipeline
          </Link>{' '}
          to ensure only valid tokens reach production. For understanding what
          the schema validates, see{' '}
          <Link href="/blueprints/foundations/tokens/dtcg-formats">
            DTCG formats
          </Link>
          . For resolver-specific validation, see the{' '}
          <Link href="/blueprints/foundations/tokens/resolver-module">
            resolver module
          </Link>
          .
        </p>

        <div className={styles.placeholder}>
          <p>
            <strong>Source files:</strong>
          </p>
          <ul>
            <li>
              <code>ui/designTokens/designTokens.schema.json</code> &mdash;
              Generated schema
            </li>
            <li>
              <code>utils/designTokens/generators/generateSchema.mjs</code>{' '}
              &mdash; Schema generator
            </li>
            <li>
              <code>utils/designTokens/validators/validateTokens.mjs</code>{' '}
              &mdash; Custom validator
            </li>
          </ul>
        </div>
      </article>

      <Link href="/blueprints/foundations/tokens">
        &larr; Back to Design Tokens
      </Link>
    </section>
  );
}

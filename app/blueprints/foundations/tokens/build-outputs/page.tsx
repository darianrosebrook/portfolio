import Link from 'next/link';
import styles from '../page.module.scss';

export const metadata = {
  title: 'Build Outputs | Darian Rosebrook',
  description:
    'From tokens to artifacts: composed JSON, global CSS variables, component-scoped SCSS, and TypeScript TokenPath types for type-safe token access.',
  openGraph: {
    title: 'Build Outputs | Darian Rosebrook',
    description:
      'From tokens to artifacts: composed JSON, global CSS variables, component-scoped SCSS, and TypeScript TokenPath types for type-safe token access.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Build Outputs | Darian Rosebrook',
    description:
      'From tokens to artifacts: composed JSON, global CSS variables, component-scoped SCSS, and TypeScript TokenPath types for type-safe token access.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function BuildOutputsPage() {
  return (
    <section className="content">
      <article>
        <h1>Deep Dive: Build Outputs</h1>

        <h2>Why Build Outputs Matter</h2>
        <p>
          Design tokens are only valuable when they&apos;re consumable. Raw JSON
          files are the source of truth, but applications need CSS custom
          properties, SCSS variables, and TypeScript types. The build pipeline
          transforms authored tokens into these artifacts, ensuring a single
          source of truth propagates consistently across all consumers.
        </p>

        <p>
          Without a build pipeline, teams end up manually copying values,
          creating drift between design tools and code. With it, a change to a
          token automatically propagates to CSS, SCSS, TypeScript, and any other
          format the system needs.
        </p>

        <h2>The Build Pipeline</h2>
        <p>
          The pipeline transforms modular token files through several stages,
          each producing artifacts for different consumers:
        </p>

        <div className={styles.fileTree}>
          <pre>
            <code>{`Source Files                    Build Stages                    Outputs
─────────────────              ─────────────                   ─────────
core/*.tokens.json      ──┐
                          ├──▶  Compose  ──▶  designTokens.json
semantic/*.tokens.json  ──┘         │
                                    ├──────▶  designTokens.scss (CSS vars)
                                    │
                                    ├──────▶  *.tokens.generated.scss (per-component)
                                    │
                                    └──────▶  types/designTokens.ts (TypeScript)`}</code>
          </pre>
        </div>

        <h2>Output Artifacts</h2>

        <h3>1. Composed JSON</h3>
        <p>
          The composed JSON aggregates all modular token files into a single
          artifact. This is the canonical representation used by tooling,
          documentation, and runtime resolution.
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Output Path</td>
              <td>
                <code>ui/designTokens/designTokens.json</code>
              </td>
            </tr>
            <tr>
              <td>Generator</td>
              <td>
                <code>utils/designTokens/generators/compose.ts</code>
              </td>
            </tr>
            <tr>
              <td>Command</td>
              <td>
                <code>npm run tokens:compose</code>
              </td>
            </tr>
          </tbody>
        </table>

        <pre className={styles.codeBlock}>
          <code>{`// designTokens.json structure
{
  "core": {
    "color": {
      "palette": {
        "neutral": {
          "600": {
            "$type": "color",
            "$value": "#555555"
          }
        }
      }
    },
    "spacing": { ... },
    "typography": { ... }
  },
  "semantic": {
    "color": {
      "foreground": {
        "primary": {
          "$type": "color",
          "$value": "{core.color.mode.dark}",
          "$extensions": { ... }
        }
      }
    }
  }
}`}</code>
        </pre>

        <p>
          <strong>Use cases:</strong> Runtime token resolution, documentation
          generation, design tool sync, token visualization.
        </p>

        <h3>2. Global CSS Custom Properties</h3>
        <p>
          CSS custom properties enable runtime theming and are the primary
          consumption method for web applications. Every token becomes a CSS
          variable with a flattened, kebab-case name.
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Output Path</td>
              <td>
                <code>app/designTokens.scss</code>
              </td>
            </tr>
            <tr>
              <td>Generator</td>
              <td>
                <code>utils/designTokens/generators/global.ts</code>
              </td>
            </tr>
            <tr>
              <td>Command</td>
              <td>
                <code>npm run tokens:globals</code>
              </td>
            </tr>
          </tbody>
        </table>

        <pre className={styles.codeBlock}>
          <code>{`/* Generated CSS custom properties */
:root {
  /* Core tokens */
  --core-color-palette-neutral-600: #555555;
  --core-color-mode-dark: #141414;
  --core-color-mode-light: #fafafa;
  --core-spacing-size-04: 16px;
  --core-typography-ramp-4: 16px;
  
  /* Semantic tokens (light mode) */
  --semantic-color-foreground-primary: var(--core-color-mode-dark);
  --semantic-color-background-primary: var(--core-color-mode-light);
}

/* Dark mode overrides */
[data-theme="dark"] {
  --semantic-color-foreground-primary: var(--core-color-mode-light);
  --semantic-color-background-primary: var(--core-color-mode-dark);
}`}</code>
        </pre>

        <h4>Naming Convention</h4>
        <p>Token paths are converted to CSS variable names by:</p>
        <ol>
          <li>Replacing dots with hyphens</li>
          <li>Converting to lowercase</li>
          <li>
            Prefixing with <code>--</code>
          </li>
        </ol>

        <pre className={styles.codeBlock}>
          <code>{`Token Path                              CSS Variable
──────────                              ────────────
core.color.palette.neutral.600    →    --core-color-palette-neutral-600
semantic.color.foreground.primary →    --semantic-color-foreground-primary
semantic.components.button.primary.background
                                  →    --semantic-components-button-primary-background`}</code>
        </pre>

        <h3>3. Component-Scoped SCSS</h3>
        <p>
          Per-component SCSS files provide scoped token access for component
          styling. These files are generated alongside each component and import
          only the tokens that component needs.
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Output Pattern</td>
              <td>
                <code>ui/components/**/**.tokens.generated.scss</code>
              </td>
            </tr>
            <tr>
              <td>Generator</td>
              <td>
                <code>utils/designTokens/generators/generateCSSTokens.mjs</code>
              </td>
            </tr>
            <tr>
              <td>Command</td>
              <td>
                <code>npm run tokens:scss</code>
              </td>
            </tr>
          </tbody>
        </table>

        <pre className={styles.codeBlock}>
          <code>{`// ui/components/Button/Button.tokens.generated.scss
// Auto-generated - do not edit manually

$button-primary-background: var(--semantic-components-button-primary-background);
$button-primary-foreground: var(--semantic-components-button-primary-foreground);
$button-primary-border: var(--semantic-components-button-primary-border);
$button-secondary-background: var(--semantic-components-button-secondary-background);
// ...`}</code>
        </pre>

        <pre className={styles.codeBlock}>
          <code>{`// Button.module.scss - consuming the generated tokens
@import './Button.tokens.generated.scss';

.button {
  &--primary {
    background: $button-primary-background;
    color: $button-primary-foreground;
    border: 1px solid $button-primary-border;
  }
  
  &--secondary {
    background: $button-secondary-background;
    // ...
  }
}`}</code>
        </pre>

        <h3>4. TypeScript Token Paths</h3>
        <p>
          TypeScript types provide compile-time autocomplete and type safety for
          token access. The <code>TokenPath</code> union type includes every
          valid token path in the system.
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Property</th>
              <th>Value</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Output Path</td>
              <td>
                <code>types/designTokens.ts</code>
              </td>
            </tr>
            <tr>
              <td>Generator</td>
              <td>
                <code>utils/designTokens/generators/generateTypes.mjs</code>
              </td>
            </tr>
            <tr>
              <td>Command</td>
              <td>
                <code>npm run tokens:types</code>
              </td>
            </tr>
          </tbody>
        </table>

        <pre className={styles.codeBlock}>
          <code>{`// types/designTokens.ts (generated)

/** All valid token paths in the design system */
export type TokenPath =
  | 'core.color.palette.neutral.100'
  | 'core.color.palette.neutral.200'
  | 'core.color.palette.neutral.300'
  // ... hundreds more
  | 'semantic.color.foreground.primary'
  | 'semantic.color.foreground.secondary'
  | 'semantic.components.button.primary.background';

/** Color token paths only */
export type ColorTokenPath = Extract<TokenPath, \`${'${string}'}.color.${'${string}'}\`>;

/** Spacing token paths only */
export type SpacingTokenPath = Extract<TokenPath, \`${'${string}'}.spacing.${'${string}'}\`>;

/** Get a token value by path */
export function getTokenValue(path: TokenPath): string;

/** Get a CSS variable reference by token path */
export function getTokenVar(path: TokenPath): string;`}</code>
        </pre>

        <pre className={styles.codeBlock}>
          <code>{`// Usage in application code
import { getTokenVar, type TokenPath } from '@/types/designTokens';

// Autocomplete shows all valid paths
const primaryColor = getTokenVar('semantic.color.foreground.primary');
// → 'var(--semantic-color-foreground-primary)'

// Type error if path doesn't exist
const invalid = getTokenVar('semantic.color.nonexistent');
// TypeScript Error: Argument of type '"semantic.color.nonexistent"' 
// is not assignable to parameter of type 'TokenPath'`}</code>
        </pre>

        <h2>Build Commands</h2>
        <p>The build pipeline can be run as a whole or in individual stages:</p>

        <pre className={styles.codeBlock}>
          <code>{`# Full pipeline (recommended for CI/CD)
npm run tokens:build

# Individual stages
npm run tokens:schema     # Regenerate JSON Schema
npm run tokens:compose    # Compose core + semantic → designTokens.json
npm run tokens:globals    # Emit global CSS custom properties
npm run tokens:scss       # Emit per-component SCSS token files
npm run tokens:types      # Emit TypeScript TokenPath union
npm run tokens:validate   # Run AJV + custom validation`}</code>
        </pre>

        <h3>When to Run</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Command</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Added/modified a token</td>
              <td>
                <code>npm run tokens:build</code>
              </td>
            </tr>
            <tr>
              <td>Added a new component</td>
              <td>
                <code>npm run tokens:scss</code>
              </td>
            </tr>
            <tr>
              <td>CI/CD pipeline</td>
              <td>
                <code>npm run tokens:validate && npm run tokens:build</code>
              </td>
            </tr>
            <tr>
              <td>Debugging token issues</td>
              <td>
                <code>npm run tokens:validate</code>
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Mode-Aware Output</h2>
        <p>
          Tokens with <code>$extensions.design.paths</code> generate
          mode-specific CSS. The build system reads the extension and outputs
          both light and dark mode values:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Source token
{
  "foreground": {
    "primary": {
      "$type": "color",
      "$value": "{core.color.mode.dark}",
      "$extensions": {
        "design.paths.light": "{core.color.mode.dark}",
        "design.paths.dark": "{core.color.mode.light}"
      }
    }
  }
}

// Generated CSS
:root {
  --semantic-color-foreground-primary: var(--core-color-mode-dark);
}

[data-theme="dark"] {
  --semantic-color-foreground-primary: var(--core-color-mode-light);
}`}</code>
        </pre>

        <h2>Pitfalls to Avoid</h2>

        <h3>1. Editing Generated Files</h3>
        <p>
          Never edit generated files directly. Changes will be overwritten on
          the next build. Always modify the source token files.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Editing generated file
// ui/components/Button/Button.tokens.generated.scss
$button-primary-background: #0066cc; // Manual edit - will be lost!

// ✅ GOOD: Edit the source token
// semantic/components/component.tokens.json
{
  "button": {
    "primary": {
      "background": {
        "$type": "color",
        "$value": "{core.color.palette.blue.500}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>2. Forgetting to Rebuild</h3>
        <p>
          Token changes don&apos;t appear in the app until the build runs. If
          you&apos;re seeing stale values, run <code>npm run tokens:build</code>
          .
        </p>

        <h3>3. Circular References in Output</h3>
        <p>
          CSS custom properties can reference other variables, but circular
          references cause runtime failures. The validator catches these at
          build time.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Circular reference (caught by validator)
:root {
  --color-a: var(--color-b);
  --color-b: var(--color-a); // Circular!
}

// ✅ GOOD: Linear reference chain
:root {
  --core-color-blue-500: #0066cc;
  --semantic-color-brand: var(--core-color-blue-500);
  --button-background: var(--semantic-color-brand);
}`}</code>
        </pre>

        <h3>4. Missing Token Types</h3>
        <p>
          If TypeScript autocomplete isn&apos;t showing a token, the types may
          be stale. Run <code>npm run tokens:types</code> to regenerate.
        </p>

        <h2>Integration with Development Workflow</h2>

        <h3>Watch Mode</h3>
        <p>
          For active development, run the build in watch mode to automatically
          regenerate outputs when token files change:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`# Watch token files and rebuild on change
npm run tokens:watch`}</code>
        </pre>

        <h3>Pre-commit Hooks</h3>
        <p>
          The pre-commit hook validates tokens and ensures generated files are
          up to date:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`# .husky/pre-commit
npm run tokens:validate
npm run tokens:build
git add ui/designTokens/designTokens.json
git add app/designTokens.scss
git add types/designTokens.ts`}</code>
        </pre>

        <h2>Summary</h2>
        <ul>
          <li>
            <strong>Composed JSON</strong> &mdash; Single source of truth for
            tooling and documentation
          </li>
          <li>
            <strong>CSS Custom Properties</strong> &mdash; Runtime theming with{' '}
            <code>--token-name</code> variables
          </li>
          <li>
            <strong>Component SCSS</strong> &mdash; Scoped{' '}
            <code>$variable</code> access per component
          </li>
          <li>
            <strong>TypeScript Types</strong> &mdash; Compile-time autocomplete
            and type safety
          </li>
          <li>
            <strong>Never edit generated files</strong> &mdash; Always modify
            source tokens
          </li>
          <li>
            <strong>Run the build</strong> after token changes to see updates
          </li>
        </ul>

        <h2>Next Steps</h2>
        <p>
          With build outputs understood, explore how{' '}
          <Link href="/blueprints/foundations/tokens/schema-validation">
            schema validation
          </Link>{' '}
          catches errors before they reach production, and how{' '}
          <Link href="/blueprints/foundations/tokens/accessibility">
            accessibility tokens
          </Link>{' '}
          encode inclusive defaults into the system.
        </p>
      </article>

      <Link href="/blueprints/foundations/tokens">
        &larr; Back to Design Tokens
      </Link>
    </section>
  );
}

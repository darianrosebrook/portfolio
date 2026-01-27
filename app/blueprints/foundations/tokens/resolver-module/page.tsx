import Link from 'next/link';
import styles from '../page.module.scss';

export const metadata = {
  title: 'Resolver Module | Darian Rosebrook',
  description:
    'DTCG 1.0 Resolver Module for context-aware token resolution with sets, modifiers, and resolution orders for complex multi-brand theming.',
  openGraph: {
    title: 'Resolver Module | Darian Rosebrook',
    description:
      'DTCG 1.0 Resolver Module for context-aware token resolution with sets, modifiers, and resolution orders for complex multi-brand theming.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resolver Module | Darian Rosebrook',
    description:
      'DTCG 1.0 Resolver Module for context-aware token resolution with sets, modifiers, and resolution orders for complex multi-brand theming.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function ResolverModulePage() {
  return (
    <section className="content">
      <article>
        <h1>Deep Dive: Resolver Module</h1>

        <h2>Why a Resolver Module?</h2>
        <p>
          Simple token systems resolve references by direct substitution:{' '}
          <code>{'{core.color.blue.500}'}</code> becomes <code>#0a65fe</code>.
          But real-world systems need more: brand switching, theme variants,
          platform-specific values, and conditional overrides.
        </p>

        <p>
          The DTCG 1.0 Resolver Module provides a standardized approach to
          context-aware token resolution. It defines how token sets combine,
          which modifiers apply, and in what order conflicts are resolved.
        </p>

        <h2>Resolver Document Structure</h2>
        <p>
          A resolver document is a JSON file that defines the resolution
          strategy for a token system:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`{
  "$schema": "resolver.schema.json",
  "name": "Portfolio Design System Resolver",
  "version": "2025-01-01",
  "description": "Context-aware token resolution",
  
  "sets": { ... },           // Token collections
  "modifiers": { ... },      // Value transformations
  "resolutionOrder": [ ... ] // Precedence rules
}`}</code>
        </pre>

        <h3>Core Properties</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Property</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>sets</code>
              </td>
              <td>Named collections of tokens that can be combined</td>
            </tr>
            <tr>
              <td>
                <code>modifiers</code>
              </td>
              <td>Transformations applied to resolved values</td>
            </tr>
            <tr>
              <td>
                <code>resolutionOrder</code>
              </td>
              <td>Sequence determining which values win conflicts</td>
            </tr>
          </tbody>
        </table>

        <h2>Sets: Token Collections</h2>
        <p>
          Sets define collections of tokens that can be combined during
          resolution. Each set can reference external files or define inline
          tokens.
        </p>

        <h3>File-Based Sets</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "sets": {
    "foundation": {
      "description": "Core design tokens",
      "sources": [
        { "$ref": "core.tokens.json" }
      ]
    },
    "semantic": {
      "description": "Semantic tokens referencing foundation",
      "sources": [
        { "$ref": "semantic.tokens.json" }
      ]
    },
    "brand-acme": {
      "description": "Acme brand overrides",
      "sources": [
        { "$ref": "brands/acme.tokens.json" }
      ]
    }
  }
}`}</code>
        </pre>

        <h3>Inline Sets</h3>
        <p>
          For small overrides or runtime values, sets can define tokens inline:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`{
  "sets": {
    "runtime-overrides": {
      "description": "Dynamic runtime values",
      "tokens": {
        "color": {
          "brand": {
            "primary": {
              "$type": "color",
              "$value": "#custom-brand-color"
            }
          }
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Set Composition</h3>
        <p>Sets can reference other sets, building layers of tokens:</p>

        <pre className={styles.codeBlock}>
          <code>{`{
  "sets": {
    "foundation": {
      "sources": [{ "$ref": "core.tokens.json" }]
    },
    "semantic": {
      "sources": [
        { "$ref": "#/sets/foundation" },
        { "$ref": "semantic.tokens.json" }
      ]
    },
    "brand-complete": {
      "sources": [
        { "$ref": "#/sets/semantic" },
        { "$ref": "brand.tokens.json" }
      ]
    }
  }
}`}</code>
        </pre>

        <h2>Modifiers: Context Dimensions</h2>
        <p>
          Modifiers define dimensions of variation like theme, platform, or
          accessibility settings. Each modifier has contexts that can be
          activated.
        </p>

        <h3>Theme Modifier</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "modifiers": {
    "theme": {
      "description": "Color theme (light/dark)",
      "default": "light",
      "contexts": {
        "light": {
          "description": "Light theme",
          "sources": [
            { "$ref": "#/sets/foundation" },
            { "$ref": "#/sets/semantic" }
          ]
        },
        "dark": {
          "description": "Dark theme",
          "sources": [
            { "$ref": "#/sets/foundation" },
            { "$ref": "#/sets/semantic" },
            { "$ref": "themes/dark.tokens.json" }
          ]
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Platform Modifier</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "modifiers": {
    "platform": {
      "description": "Target platform",
      "default": "web",
      "contexts": {
        "web": {
          "sources": [{ "$ref": "platforms/web.tokens.json" }]
        },
        "ios": {
          "sources": [{ "$ref": "platforms/ios.tokens.json" }]
        },
        "android": {
          "sources": [{ "$ref": "platforms/android.tokens.json" }]
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Accessibility Modifier</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "modifiers": {
    "accessibility": {
      "description": "Accessibility preferences",
      "default": "default",
      "contexts": {
        "default": {
          "sources": []
        },
        "high-contrast": {
          "sources": [{ "$ref": "a11y/high-contrast.tokens.json" }]
        },
        "reduced-motion": {
          "sources": [{ "$ref": "a11y/reduced-motion.tokens.json" }]
        }
      }
    }
  }
}`}</code>
        </pre>

        <h2>Resolution Order</h2>
        <p>
          The resolution order defines precedence when multiple sets define the
          same token. Later entries override earlier ones.
        </p>

        <h3>Basic Resolution Order</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "resolutionOrder": [
    { "$ref": "#/sets/foundation" },
    { "$ref": "#/sets/semantic" },
    { "$ref": "#/modifiers/theme" }
  ]
}`}</code>
        </pre>

        <p>This means:</p>
        <ol>
          <li>Foundation tokens load first (base values)</li>
          <li>Semantic tokens override foundation where they conflict</li>
          <li>Theme modifier applies last, overriding both</li>
        </ol>

        <h3>Complex Resolution Order</h3>
        <pre className={styles.codeBlock}>
          <code>{`{
  "resolutionOrder": [
    { "$ref": "#/sets/foundation" },
    { "$ref": "#/sets/semantic" },
    { "$ref": "#/modifiers/platform" },
    { "$ref": "#/modifiers/theme" },
    { "$ref": "#/modifiers/accessibility" },
    { "$ref": "#/sets/brand-overrides" }
  ]
}`}</code>
        </pre>

        <h2>Resolution Contexts</h2>
        <p>
          When resolving tokens, you provide a context that specifies which
          modifier values to use:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Resolution context
const context = {
  theme: "dark",
  platform: "ios",
  accessibility: "high-contrast"
};

// Resolver applies context to resolution order
const resolvedTokens = resolver.resolve(context);`}</code>
        </pre>

        <h3>Context Examples</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Scenario</th>
              <th>Context</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Web, light theme</td>
              <td>
                <code>
                  {'{ platform: "web", theme: "light" }'}
                </code>
              </td>
            </tr>
            <tr>
              <td>iOS, dark theme</td>
              <td>
                <code>
                  {'{ platform: "ios", theme: "dark" }'}
                </code>
              </td>
            </tr>
            <tr>
              <td>High contrast mode</td>
              <td>
                <code>
                  {'{ accessibility: "high-contrast" }'}
                </code>
              </td>
            </tr>
            <tr>
              <td>Brand A, dark, Android</td>
              <td>
                <code>
                  {'{ brand: "acme", theme: "dark", platform: "android" }'}
                </code>
              </td>
            </tr>
          </tbody>
        </table>

        <h2>JSON Pointer References</h2>
        <p>
          The resolver uses JSON Pointer syntax for precise references within
          and across documents:
        </p>

        <h3>Internal References</h3>
        <pre className={styles.codeBlock}>
          <code>{`// Reference a set defined in the same document
{ "$ref": "#/sets/foundation" }

// Reference a modifier context
{ "$ref": "#/modifiers/theme/contexts/dark" }`}</code>
        </pre>

        <h3>External References</h3>
        <pre className={styles.codeBlock}>
          <code>{`// Reference an external file
{ "$ref": "core.tokens.json" }

// Reference a specific path in an external file
{ "$ref": "core.tokens.json#/color/palette/blue" }`}</code>
        </pre>

        <h2>Our Resolver Configuration</h2>
        <p>
          Here&apos;s our actual resolver configuration that handles foundation,
          semantic, and theme contexts:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ui/designTokens/resolver.json
{
  "$schema": "../utils/designTokens/validators/resolver.schema.json",
  "name": "Portfolio Design System Resolver",
  "version": "2025-01-01",
  
  "sets": {
    "foundation": {
      "description": "Core design tokens",
      "sources": [{ "$ref": "core.tokens.json" }]
    },
    "semantic": {
      "description": "Semantic tokens",
      "sources": [{ "$ref": "semantic.tokens.json" }]
    }
  },
  
  "modifiers": {
    "theme": {
      "description": "Color theme modifier",
      "default": "light",
      "contexts": {
        "light": {
          "description": "Light theme",
          "sources": [
            { "$ref": "#/sets/foundation" },
            { "$ref": "#/sets/semantic" }
          ]
        },
        "dark": {
          "description": "Dark theme",
          "sources": [
            { "$ref": "#/sets/foundation" },
            { "$ref": "#/sets/semantic" }
          ]
        }
      }
    }
  },
  
  "resolutionOrder": [
    { "$ref": "#/sets/foundation" },
    { "$ref": "#/sets/semantic" },
    { "$ref": "#/modifiers/theme" }
  ]
}`}</code>
        </pre>

        <h2>Build System Integration</h2>
        <p>
          The resolver integrates with the build system to generate
          context-specific outputs:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Build configuration
export default {
  resolver: './ui/designTokens/resolver.json',
  
  outputs: [
    {
      context: { theme: 'light' },
      css: './dist/tokens-light.css'
    },
    {
      context: { theme: 'dark' },
      css: './dist/tokens-dark.css'
    },
    {
      context: { theme: 'light', platform: 'ios' },
      swift: './dist/Tokens.swift'
    }
  ]
};`}</code>
        </pre>

        <h3>Runtime Resolution</h3>
        <pre className={styles.codeBlock}>
          <code>{`import { Resolver } from '@/utils/designTokens/resolver-module';
import resolverConfig from '@/ui/designTokens/resolver.json';

// Create resolver instance
const resolver = new Resolver(resolverConfig);

// Resolve for specific context
const lightTokens = resolver.resolve({ theme: 'light' });
const darkTokens = resolver.resolve({ theme: 'dark' });

// Get specific token value
const primaryColor = resolver.getToken(
  'semantic.color.foreground.primary',
  { theme: 'dark' }
);`}</code>
        </pre>

        <h2>Pitfalls to Avoid</h2>

        <h3>1. Circular Set References</h3>
        <p>
          Sets cannot reference themselves or form cycles. The resolver detects
          and rejects circular dependencies.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Circular reference
{
  "sets": {
    "a": { "sources": [{ "$ref": "#/sets/b" }] },
    "b": { "sources": [{ "$ref": "#/sets/a" }] }
  }
}

// ✅ GOOD: Linear dependency chain
{
  "sets": {
    "foundation": { "sources": [{ "$ref": "core.tokens.json" }] },
    "semantic": { "sources": [
      { "$ref": "#/sets/foundation" },
      { "$ref": "semantic.tokens.json" }
    ]}
  }
}`}</code>
        </pre>

        <h3>2. Missing Default Contexts</h3>
        <p>
          Every modifier should have a default context. Without it, resolution
          fails when no context is provided.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: No default
{
  "modifiers": {
    "theme": {
      "contexts": {
        "light": { ... },
        "dark": { ... }
      }
    }
  }
}

// ✅ GOOD: Default specified
{
  "modifiers": {
    "theme": {
      "default": "light",
      "contexts": {
        "light": { ... },
        "dark": { ... }
      }
    }
  }
}`}</code>
        </pre>

        <h3>3. Inconsistent Token Coverage</h3>
        <p>
          All contexts within a modifier should define the same tokens.
          Otherwise, some contexts will have missing values.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Dark theme missing tokens
{
  "contexts": {
    "light": {
      "sources": [
        { "$ref": "colors.json" },
        { "$ref": "spacing.json" }
      ]
    },
    "dark": {
      "sources": [
        { "$ref": "colors-dark.json" }
        // Missing spacing!
      ]
    }
  }
}

// ✅ GOOD: Consistent coverage
{
  "contexts": {
    "light": {
      "sources": [
        { "$ref": "#/sets/foundation" },
        { "$ref": "#/sets/semantic" }
      ]
    },
    "dark": {
      "sources": [
        { "$ref": "#/sets/foundation" },
        { "$ref": "#/sets/semantic" },
        { "$ref": "themes/dark-overrides.json" }
      ]
    }
  }
}`}</code>
        </pre>

        <h3>4. Wrong Resolution Order</h3>
        <p>
          Resolution order matters. More specific overrides should come later.
          Foundation before semantic, semantic before brand.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Brand before semantic (brand values get overwritten)
{
  "resolutionOrder": [
    { "$ref": "#/sets/foundation" },
    { "$ref": "#/sets/brand" },
    { "$ref": "#/sets/semantic" }
  ]
}

// ✅ GOOD: Most specific last
{
  "resolutionOrder": [
    { "$ref": "#/sets/foundation" },
    { "$ref": "#/sets/semantic" },
    { "$ref": "#/sets/brand" }
  ]
}`}</code>
        </pre>

        <h2>Summary</h2>
        <ul>
          <li>
            <strong>Sets</strong> define collections of tokens that can be
            combined
          </li>
          <li>
            <strong>Modifiers</strong> define variation dimensions (theme,
            platform, accessibility)
          </li>
          <li>
            <strong>Resolution order</strong> determines which values win
            conflicts
          </li>
          <li>
            <strong>Contexts</strong> specify which modifier values to use
            during resolution
          </li>
          <li>
            <strong>JSON Pointers</strong> enable precise internal and external
            references
          </li>
          <li>
            <strong>Build integration</strong> generates context-specific
            outputs
          </li>
        </ul>

        <h2>Next Steps</h2>
        <p>
          The resolver module works alongside{' '}
          <Link href="/blueprints/foundations/tokens/theming">
            multi-brand theming
          </Link>{' '}
          to enable complex scenarios. For simpler setups, the{' '}
          <code>$extensions.design.paths</code> approach in{' '}
          <Link href="/blueprints/foundations/tokens/core-vs-semantic">
            core vs semantic
          </Link>{' '}
          may be sufficient. See{' '}
          <Link href="/blueprints/foundations/tokens/schema-validation">
            schema validation
          </Link>{' '}
          for how resolver documents are validated.
        </p>

        <div className={styles.placeholder}>
          <p>
            <strong>Source files:</strong>
          </p>
          <ul>
            <li>
              <code>ui/designTokens/resolver.json</code> &mdash; Our resolver
              configuration
            </li>
            <li>
              <code>utils/designTokens/utils/resolver-module.ts</code> &mdash;
              Resolver implementation
            </li>
            <li>
              <code>utils/designTokens/validators/resolver.schema.json</code>{' '}
              &mdash; JSON Schema
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

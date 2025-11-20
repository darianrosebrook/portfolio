import Link from 'next/link';
import styles from '../page.module.scss';

/**
 * Metadata for the /blueprints/foundations/tokens/resolver-module page.
 * @type {import('next').Metadata}
 */
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
      <h1>Resolver Module</h1>

      <p>
        The DTCG 1.0 Resolver Module enables sophisticated, context-aware token
        resolution for complex theming scenarios. It provides a standardized
        approach to managing design tokens across multiple brands, platforms,
        themes, and modifiers through sets, modifiers, and resolution orders.
      </p>

      <h2>Why Resolver Module?</h2>
      <p>
        Traditional token resolution relies on simple reference substitution.
        The Resolver Module introduces:
      </p>
      <ul>
        <li>
          <strong>Context awareness</strong>: Resolve tokens based on brand,
          theme, platform
        </li>
        <li>
          <strong>Modifier application</strong>: Transform token values
          (lighten, scale, etc.)
        </li>
        <li>
          <strong>Resolution ordering</strong>: Control precedence of different
          contexts
        </li>
        <li>
          <strong>Reference validation</strong>: JSON Pointer support for
          external references
        </li>
      </ul>

      <h2>Resolver Document Structure</h2>
      <p>
        A resolver document defines how tokens are resolved across different
        contexts.
      </p>

      <h3>Basic Resolver Document</h3>
      <pre>
        <code>{`{
  "$schema": "https://www.designtokens.org/schema/resolver-1.0.schema.json",
  "name": "Multi-Brand Resolver",
  "version": "1.0.0",
  "description": "Resolver for brand and theme combinations",

  "sets": {
    "core": {
      "$ref": "./tokens/core.tokens.json"
    },
    "brand-a": {
      "$ref": "./tokens/brand-a.semantic.json"
    },
    "brand-b": {
      "$ref": "./tokens/brand-b.semantic.json"
    },
    "light-theme": {
      "$ref": "./tokens/light.overrides.json"
    },
    "dark-theme": {
      "$ref": "./tokens/dark.overrides.json"
    }
  },

  "modifiers": {
    "high-contrast": {
      "type": "contrast",
      "ratio": 7.0
    },
    "large-scale": {
      "type": "scale",
      "factor": 1.2
    }
  },

  "resolutionOrder": [
    "core",
    "brand-a",
    "light-theme",
    "high-contrast"
  ]
}`}</code>
      </pre>

      <h2>Sets</h2>
      <p>
        Sets define collections of tokens that can be combined. Each set can
        reference external token files or define inline tokens.
      </p>

      <h3>File-Based Sets</h3>
      <pre>
        <code>{`{
  "sets": {
    "core-colors": {
      "$ref": "./tokens/core.colors.json"
    },
    "brand-colors": {
      "$ref": "./tokens/brand.colors.json"
    },
    "platform-overrides": {
      "$ref": "./tokens/ios.overrides.json"
    }
  }
}`}</code>
      </pre>

      <h3>Inline Sets</h3>
      <pre>
        <code>{`{
  "sets": {
    "runtime-overrides": {
      "color": {
        "brand": {
          "primary": {
            "$type": "color",
            "$value": {
              "colorSpace": "srgb",
              "components": [0.2, 0.6, 1]
            }
          }
        }
      }
    }
  }
}`}</code>
      </pre>

      <h2>Modifiers</h2>
      <p>
        Modifiers transform token values during resolution. They can adjust
        colors, scale dimensions, or apply other transformations.
      </p>

      <h3>Color Modifiers</h3>
      <pre>
        <code>{`{
  "modifiers": {
    "high-contrast": {
      "type": "contrast",
      "ratio": 7.0,
      "target": "background"
    },
    "muted": {
      "type": "opacity",
      "value": 0.7
    },
    "accent-shift": {
      "type": "hue-rotate",
      "degrees": 45
    }
  }
}`}</code>
      </pre>

      <h3>Dimension Modifiers</h3>
      <pre>
        <code>{`{
  "modifiers": {
    "compact": {
      "type": "scale",
      "factor": 0.8,
      "target": "spacing"
    },
    "large-text": {
      "type": "scale",
      "factor": 1.25,
      "target": "fontSize"
    }
  }
}`}</code>
      </pre>

      <h2>Resolution Order</h2>
      <p>
        The resolution order defines the precedence of sets and modifiers during
        token resolution. Later entries override earlier ones.
      </p>

      <h3>Brand + Theme Resolution</h3>
      <pre>
        <code>{`{
  "resolutionOrder": [
    "core",
    "brand-a",
    "web-platform",
    "light-theme",
    "high-contrast"
  ]
}`}</code>
      </pre>

      <h3>Conditional Resolution</h3>
      <pre>
        <code>{`{
  "resolutionOrder": [
    "core",
    {
      "set": "brand-a",
      "when": {
        "brand": "acme"
      }
    },
    {
      "set": "brand-b",
      "when": {
        "brand": "globex"
      }
    }
  ]
}`}</code>
      </pre>

      <h2>Resolution Contexts</h2>
      <p>
        Contexts provide the input parameters for resolution, determining which
        sets and modifiers are applied.
      </p>

      <h3>Basic Context</h3>
      <pre>
        <code>{`const context = {
  brand: "acme",
  theme: "light",
  platform: "web",
  modifiers: ["high-contrast"]
};`}</code>
      </pre>

      <h3>Advanced Context</h3>
      <pre>
        <code>{`const context = {
  brand: "acme",
  theme: "dark",
  platform: "ios",
  modifiers: ["large-scale", "muted"],
  viewport: "mobile",
  userPreferences: {
    motion: "reduced",
    contrast: "high"
  }
};`}</code>
      </pre>

      <h2>JSON Pointer References</h2>
      <p>
        The resolver supports JSON Pointer syntax for precise references within
        and across documents.
      </p>

      <h3>Internal References</h3>
      <pre>
        <code>{`{
  "sets": {
    "typography": {
      "$ref": "#/typography",
      "typography": {
        "body": {
          "fontSize": { "$ref": "#/typography/scale/base" }
        }
      }
    }
  }
}`}</code>
      </pre>

      <h3>Cross-File References</h3>
      <pre>
        <code>{`{
  "sets": {
    "semantic": {
      "color": {
        "primary": {
          "$ref": "core.tokens.json#/color/brand/primary"
        }
      }
    }
  }
}`}</code>
      </pre>

      <h2>Integration with Build System</h2>
      <p>
        Our build system integrates the resolver module to generate
        context-specific outputs for different brands and platforms.
      </p>

      <h3>Build Configuration</h3>
      <pre>
        <code>{`// build.config.js
export default {
  resolver: './tokens/resolver.json',
  outputs: [
    {
      context: { brand: 'acme', theme: 'light' },
      css: './dist/acme-light.css',
      typescript: './dist/acme-light.d.ts'
    },
    {
      context: { brand: 'globex', theme: 'dark' },
      css: './dist/globex-dark.css',
      typescript: './dist/globex-dark.d.ts'
    }
  ]
};`}</code>
      </pre>

      <h3>Runtime Resolution</h3>
      <pre>
        <code>{`import { Resolver } from './utils/designTokens/utils/resolver-module';

const resolver = new Resolver(resolverDocument);
const tokens = resolver.resolve({
  brand: 'acme',
  theme: 'light',
  platform: 'web'
});`}</code>
      </pre>

      <div className={styles.placeholder}>
        <p>
          Implementation:{' '}
          <code>utils/designTokens/utils/resolver-module.ts</code>
          <br />
          Schema:{' '}
          <code>utils/designTokens/validators/resolver.schema.json</code>
          <br />
          Example: <code>ui/designTokens/resolver.example.json</code>
        </p>
      </div>

      <p>
        Previous:{' '}
        <Link href="/blueprints/foundations/tokens/theming">
          ← Multi-Brand Theming
        </Link>
      </p>
    </section>
  );
}

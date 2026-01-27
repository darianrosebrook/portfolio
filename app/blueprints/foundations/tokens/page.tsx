import Link from 'next/link';
import styles from './page.module.scss';

export const metadata = {
  title: 'Design Tokens Philosophy | Darian Rosebrook',
  description:
    'A two-tier token architecture following W3C DTCG 1.0: separating raw values from semantic purpose to build scalable, themeable design systems.',
  openGraph: {
    title: 'Design Tokens Philosophy | Darian Rosebrook',
    description:
      'A two-tier token architecture following W3C DTCG 1.0: separating raw values from semantic purpose to build scalable, themeable design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Design Tokens Philosophy | Darian Rosebrook',
    description:
      'A two-tier token architecture following W3C DTCG 1.0: separating raw values from semantic purpose to build scalable, themeable design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const sections = [
  {
    title: 'DTCG 1.0 Structured Formats',
    desc: 'How we use DTCG 1.0 specification with structured values: color objects, dimension units, and composite tokens.',
    href: '/blueprints/foundations/tokens/dtcg-formats',
  },
  {
    title: 'Core vs Semantic',
    desc: 'How primitives in core.* power purpose-driven semantic.* roles. Why aliases, not copies, improve scale and theming.',
    href: '/blueprints/foundations/tokens/core-vs-semantic',
  },
  {
    title: 'Token Naming & Hierarchy',
    desc: 'Conventions for namespacing, depth, and stability. How we avoid collisions and enable discoverability.',
    href: '/blueprints/foundations/tokens/token-naming',
  },
  {
    title: 'Multi-Brand Theming',
    desc: 'How structured tokens enable brand switching, platform variants, and scalable theming across products.',
    href: '/blueprints/foundations/tokens/theming',
  },
  {
    title: 'Resolver Module',
    desc: 'DTCG 1.0 Resolver Module for context-aware token resolution with sets, modifiers, and resolution orders.',
    href: '/blueprints/foundations/tokens/resolver-module',
  },
  {
    title: 'Schema & Validation',
    desc: 'DTCG 1.0 JSON Schema for IntelliSense and AJV validation with structured value enforcement.',
    href: '/blueprints/foundations/tokens/schema-validation',
  },
  {
    title: 'Build Outputs',
    desc: 'What we generate: composed JSON, global CSS vars, component SCSS, and TypeScript token path types.',
    href: '/blueprints/foundations/tokens/build-outputs',
  },
  {
    title: 'Accessibility by Default',
    desc: 'Contrast, motion preferences, target sizes—how tokens encode a11y constraints early.',
    href: '/blueprints/foundations/tokens/accessibility',
  },
];

export default function TokensFoundationPage() {
  return (
    <section className="content">
      <article>
        <h1>Design Tokens Philosophy</h1>
        <p className={styles.lead}>
          A two-tier architecture that separates &ldquo;what values exist&rdquo;
          from &ldquo;how values are used&rdquo;&mdash;enabling scalable theming
          and consistent design decisions.
        </p>

        <h2>The Core Philosophy: Separation of Concerns</h2>
        <p>
          Our token system is built on a fundamental principle:{' '}
          <strong>separate raw values from their semantic purpose</strong>. This
          isn&apos;t just organizational tidiness&mdash;it&apos;s a governance
          strategy that enables theming, brand switching, and systematic
          evolution without breaking components.
        </p>
        <p>
          When a designer specifies{' '}
          <code>semantic.color.foreground.primary</code>, they aren&apos;t
          picking a hex value. They&apos;re invoking a decision about hierarchy,
          contrast, and brand expression that has already been vetted. The token
          can be remapped to a different palette entry or tuned for light and
          dark modes, but its role and intent remain constant.
        </p>

        <h2>The Three Layers</h2>
        <p>
          Each layer represents a different level of abstraction, stability, and
          audience. Understanding where a token belongs helps teams make better
          decisions about naming, ownership, and extensibility.
        </p>

        <div className={styles.layerGrid}>
          <div className={styles.layerCard}>
            <span className={styles.layerNumber}>1</span>
            <h3>
              <Link href="/blueprints/foundations/tokens/core-vs-semantic">
                Core Tokens
              </Link>
            </h3>
            <p className={styles.layerTagline}>
              Raw values with no inherent meaning.
            </p>
            <p>
              The <strong>core layer</strong> defines primitives&mdash;the
              building blocks. Color palettes, spacing scales, typography ramps,
              motion durations. These are intentionally meaningless in terms of
              UI purpose: <code>core.color.palette.neutral.600</code> is just a
              gray&mdash;it doesn&apos;t say &ldquo;use me for text&rdquo; or
              &ldquo;use me for borders.&rdquo;
            </p>
            <dl>
              <dt>Examples</dt>
              <dd>
                <code>core.color.palette.blue.500</code>,{' '}
                <code>core.spacing.size.04</code>,{' '}
                <code>core.typography.ramp.4</code>
              </dd>
              <dt>Stability</dt>
              <dd>Rarely changes; these are the physics of the system</dd>
              <dt>Audience</dt>
              <dd>System maintainers, token authors</dd>
            </dl>
            <hr />
            <Link
              href="/blueprints/foundations/tokens/core-vs-semantic"
              className={styles.layerLink}
            >
              Deep dive into Core vs Semantic
            </Link>
          </div>

          <div className={styles.layerCard}>
            <span className={styles.layerNumber}>2</span>
            <h3>
              <Link href="/blueprints/foundations/tokens/theming">
                Semantic Tokens
              </Link>
            </h3>
            <p className={styles.layerTagline}>
              Purpose and meaning assigned to primitives.
            </p>
            <p>
              The <strong>semantic layer</strong> assigns roles by referencing
              core tokens. This is the theming surface&mdash;where brands
              diverge, accessibility constraints are enforced, and most
              designers interact with the system.
            </p>
            <dl>
              <dt>Examples</dt>
              <dd>
                <code>semantic.color.foreground.primary</code>,{' '}
                <code>semantic.color.background.danger</code>,{' '}
                <code>semantic.spacing.gap.grid</code>
              </dd>
              <dt>Stability</dt>
              <dd>Names are stable; values change per theme/brand</dd>
              <dt>Audience</dt>
              <dd>Product designers, component authors</dd>
            </dl>
            <hr />
            <Link
              href="/blueprints/foundations/tokens/theming"
              className={styles.layerLink}
            >
              Deep dive into Multi-Brand Theming
            </Link>
          </div>

          <div className={styles.layerCard}>
            <span className={styles.layerNumber}>3</span>
            <h3>
              <Link href="/blueprints/foundations/tokens/build-outputs">
                Component Tokens
              </Link>
            </h3>
            <p className={styles.layerTagline}>
              UI-specific composition of semantic roles.
            </p>
            <p>
              The <strong>component layer</strong> applies tokens to
              anatomy&mdash;button backgrounds, card shadows, input borders.
              These alias back to semantic roles but give component teams a
              stable handle for customization.
            </p>
            <dl>
              <dt>Examples</dt>
              <dd>
                <code>semantic.components.button.primary.background</code>,{' '}
                <code>semantic.components.input.border</code>
              </dd>
              <dt>Stability</dt>
              <dd>Tied to component API; changes with component evolution</dd>
              <dt>Audience</dt>
              <dd>Component developers, design system consumers</dd>
            </dl>
            <hr />
            <Link
              href="/blueprints/foundations/tokens/build-outputs"
              className={styles.layerLink}
            >
              Deep dive into Build Outputs
            </Link>
          </div>
        </div>

        <h2>Mode-Aware Tokens via Extensions</h2>
        <p>
          Rather than duplicating token files for light/dark themes, we use{' '}
          <code>$extensions.design.paths</code> to encode both variants in a
          single definition:
        </p>
        <pre className={styles.codeBlock}>
          <code>{`{
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
}`}</code>
        </pre>
        <p>
          This says: &ldquo;Primary text color references{' '}
          <code>core.color.mode.dark</code> in light mode, but flips to{' '}
          <code>core.color.mode.light</code> in dark mode.&rdquo; The token
          definition stays in one place while encoding both theme variants.
        </p>

        <h2>The Reference Chain</h2>
        <p>
          Tokens form a directed graph where each layer can reference tokens
          from the same or lower layers. The depth you choose determines how
          changes cascade:
        </p>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Layer</th>
              <th>Contains</th>
              <th>Can Reference</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Core</td>
              <td>Raw values only</td>
              <td>Nothing (leaf nodes)</td>
            </tr>
            <tr>
              <td>Semantic</td>
              <td>Aliases with purpose</td>
              <td>Core or other semantic tokens</td>
            </tr>
            <tr>
              <td>Component</td>
              <td>UI-specific bindings</td>
              <td>Semantic or core tokens</td>
            </tr>
          </tbody>
        </table>
        <p>
          This means changing <code>core.color.palette.blue.500</code>{' '}
          automatically propagates to every semantic token that references
          it&mdash;and from there to every component that uses those semantic
          tokens. Semantic-to-semantic references let you create shared roles
          (like <code>status.danger</code>) that multiple components can derive
          from.
        </p>

        <h2>Modular File Architecture</h2>
        <p>
          Tokens are split into focused files for maintainability. This reduces
          merge conflicts and makes ownership clearer:
        </p>
        <div className={styles.fileTree}>
          <pre>
            <code>{`ui/designTokens/
├── core/
│   ├── color.tokens.json      # Palettes, modes, data visualization
│   ├── typography.tokens.json # Font families, weights, scales
│   ├── spacing.tokens.json    # Spacing scale (00-10)
│   ├── motion.tokens.json     # Durations, easing curves
│   ├── shape.tokens.json      # Border radii, border styles
│   └── elevation.tokens.json  # Shadows, z-index layers
│
├── semantic/
│   ├── color.tokens.json      # Foreground, background, border, status
│   ├── typography.tokens.json # Text styles, hierarchies
│   ├── components/
│   │   └── component.tokens.json
│   └── ...
│
├── designTokens.json          # Composed aggregate (build artifact)
└── resolver.json              # Theme resolution order`}</code>
          </pre>
        </div>

        <h2>Build Pipeline Outputs</h2>
        <p>The tokens compile to multiple formats for different consumers:</p>
        <ul>
          <li>
            <strong>CSS Custom Properties</strong> &mdash;{' '}
            <code>--core-color-palette-neutral-500</code> for runtime theming
          </li>
          <li>
            <strong>SCSS Variables</strong> &mdash; Per-component token files
            for scoped styling
          </li>
          <li>
            <strong>TypeScript Types</strong> &mdash; <code>TokenPath</code>{' '}
            union for autocomplete and type safety
          </li>
          <li>
            <strong>Composed JSON</strong> &mdash; Single artifact for runtime
            or tooling consumption
          </li>
        </ul>

        <h2>The Golden Rule</h2>
        <p className={styles.highlight}>
          <strong>Never use raw values in components.</strong> Always reference
          tokens so the entire system can be re-themed by changing a single
          source file.
        </p>
        <p>
          This isn&apos;t just about efficiency&mdash;it&apos;s a structural
          guarantee of consistency. Without tokens, a change to a brand color
          requires hunting down dozens of places where the same decision was
          repeated. With tokens, a single alias change cascades predictably
          across the system.
        </p>

        <h2>Summary</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Layer</th>
              <th>Purpose</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Core</td>
              <td>Raw values, no meaning</td>
              <td>
                <code>core.color.palette.blue.500</code> = <code>#0a65fe</code>
              </td>
            </tr>
            <tr>
              <td>Semantic</td>
              <td>Purpose + theme awareness</td>
              <td>
                <code>semantic.color.foreground.link</code> ={' '}
                <code>{'{core.color.palette.red.500}'}</code>
              </td>
            </tr>
            <tr>
              <td>Component</td>
              <td>UI-specific composition</td>
              <td>
                <code>semantic.components.button.primary.background</code>
              </td>
            </tr>
          </tbody>
        </table>

        <h2>Deep Dives</h2>
        <p>
          The following topics extend this overview into more specialized
          guidance:
        </p>
        <div className={styles.grid}>
          {sections.map(({ title, desc, href }) => (
            <div key={title} className={styles.card}>
              <h3>{title}</h3>
              <p>{desc}</p>
              <Link href={href}>Read more</Link>
            </div>
          ))}
        </div>

        <h2>Start Exploring</h2>
        <nav className={styles.layerNav}>
          <Link
            href="/blueprints/foundations/tokens/core-vs-semantic"
            className={styles.layerNavLink}
          >
            <span className={styles.layerNavNumber}>1</span>
            <div>
              <span className={styles.layerNavTitle}>Core vs Semantic</span>
              <span className={styles.layerNavDesc}>The two-tier model</span>
            </div>
          </Link>
          <Link
            href="/blueprints/foundations/tokens/theming"
            className={styles.layerNavLink}
          >
            <span className={styles.layerNavNumber}>2</span>
            <div>
              <span className={styles.layerNavTitle}>Multi-Brand Theming</span>
              <span className={styles.layerNavDesc}>Mode-aware tokens</span>
            </div>
          </Link>
          <Link
            href="/blueprints/foundations/tokens/build-outputs"
            className={styles.layerNavLink}
          >
            <span className={styles.layerNavNumber}>3</span>
            <div>
              <span className={styles.layerNavTitle}>Build Outputs</span>
              <span className={styles.layerNavDesc}>CSS, SCSS, TypeScript</span>
            </div>
          </Link>
          <Link
            href="/blueprints/foundations/tokens/schema-validation"
            className={styles.layerNavLink}
          >
            <span className={styles.layerNavNumber}>4</span>
            <div>
              <span className={styles.layerNavTitle}>Schema & Validation</span>
              <span className={styles.layerNavDesc}>Type-safe tokens</span>
            </div>
          </Link>
        </nav>
      </article>
    </section>
  );
}

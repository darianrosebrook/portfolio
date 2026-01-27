import Link from 'next/link';
import styles from './page.module.scss';
import { DashboardDemo } from './_components';
import { BrandSwitcher } from '@/ui/components/BrandSwitcher';
import { Tabs, TabList, Tab, TabPanel } from '@/ui/components/Tabs';

export const metadata = {
  title: 'Multi-Brand Theming | Darian Rosebrook',
  description:
    'How structured DTCG tokens enable brand switching, platform variants, and scalable theming across products with semantic aliasing.',
  openGraph: {
    title: 'Multi-Brand Theming | Darian Rosebrook',
    description:
      'How structured DTCG tokens enable brand switching, platform variants, and scalable theming across products with semantic aliasing.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Multi-Brand Theming | Darian Rosebrook',
    description:
      'How structured DTCG tokens enable brand switching, platform variants, and scalable theming across products with semantic aliasing.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

export default function ThemingPage() {
  return (
    <div>
      {/* Hero Section - Full Bleed */}
      <section className={styles.themingHero}>
        <div className={styles.heroContent}>
          <span className={styles.heroLabel}>Deep Dive</span>
          <h1 className={styles.heroTitle}>Multi-Brand Theming</h1>
          <p className={styles.heroDescription}>
            Modern design systems serve multiple products, brands, and
            platforms. The two-tier token architecture makes this possible
            without duplicating the entire system.
          </p>
          <div className={styles.heroFeatures}>
            <div className={styles.heroFeature}>
              <span className={styles.featureIcon}>
                <CheckIcon />
              </span>
              <span>Runtime brand switching via data attributes</span>
            </div>
            <div className={styles.heroFeature}>
              <span className={styles.featureIcon}>
                <CheckIcon />
              </span>
              <span>Five dimensions: color, shape, spacing, motion, type</span>
            </div>
            <div className={styles.heroFeature}>
              <span className={styles.featureIcon}>
                <CheckIcon />
              </span>
              <span>CSS cascade layers for predictable overrides</span>
            </div>
            <div className={styles.heroFeature}>
              <span className={styles.featureIcon}>
                <CheckIcon />
              </span>
              <span>Semantic tokens as the theming surface</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tabs Section */}
      <section className={styles.tabsSection}>
        <Tabs defaultValue="content" className={styles.tabs}>
          <TabList className={styles.tabList}>
            <Tab value="content">Content</Tab>
            <Tab value="playground">Playground</Tab>
          </TabList>
          <TabPanel value="content" className={styles.tabPanel}>
            <div className={`${styles.contentSection} content`}>
              <h2>The Theming Model</h2>
              <p>
                Multi-brand theming works by maintaining a stable core layer
                while allowing the semantic layer to vary per brand. Beyond
                colors, brands can customize shape (radius), spacing (density),
                motion (timing), and typography (weight).
              </p>

              <div className={styles.fileTree}>
                <pre>
                  <code>{`Core Layer (Shared)              Brand Layer (Overrides)
────────────────────              ─────────────────────
core/                             brands/
├── color.tokens.json      →      ├── default.tokens.json
├── spacing.tokens.json    →      ├── corporate.tokens.json
├── shape.tokens.json      →      ├── forest.tokens.json
├── motion.tokens.json     →      ├── sunset.tokens.json
└── typography.tokens.json →      └── midnight.tokens.json

Components reference semantic tokens via CSS variables.
Brand layer overrides semantic values when [data-brand] is set.`}</code>
                </pre>
              </div>

              <h2>What Changes Per Brand</h2>
              <p>Each brand can customize five categories of tokens:</p>

              <ul>
                <li>
                  <strong>Color</strong> &mdash; Primary accent, link colors,
                  highlights
                </li>
                <li>
                  <strong>Shape</strong> &mdash; Border radius (sharp, medium,
                  rounded, pill)
                </li>
                <li>
                  <strong>Spacing</strong> &mdash; Component padding and gaps
                  (compact, comfortable, relaxed)
                </li>
                <li>
                  <strong>Motion</strong> &mdash; Transition duration and easing
                  (snappy, standard, slow)
                </li>
                <li>
                  <strong>Typography</strong> &mdash; Font weights (light,
                  regular, medium, bold)
                </li>
              </ul>

              <h3>Brand Token Structure</h3>
              <pre className={styles.codeBlock}>
                <code>{`// brands/corporate.tokens.json
{
  "$brand": {
    "name": "corporate",
    "description": "Professional, efficient, compact"
  },
  "color": {
    "foreground": {
      "accent": { "$value": "{color.palette.blue.500}" }
    }
  },
  "shape": {
    "control": {
      "radius": {
        "default": { "$value": "{shape.radius.02}" } // 4px - small
      }
    }
  },
  "spacing": {
    "component": {
      "padding": { "$value": "{spacing.size.05}" }, // 12px - compact
      "gap": { "$value": "{spacing.size.04}" }      // 8px
    }
  },
  "motion": {
    "interaction": {
      "duration": { "$value": "{motion.duration.short}" } // 150ms
    }
  },
  "typography": {
    "body": {
      "fontWeight": { "$value": "{typography.weight.medium}" } // 500
    }
  }
}`}</code>
              </pre>

              <h2>CSS Output with Cascade Layers</h2>
              <p>
                The build system generates CSS with cascade layers that ensure
                brand overrides take precedence:
              </p>

              <pre className={styles.codeBlock}>
                <code>{`@layer core, semantic, theme, brand;

@layer brand {
  [data-brand="corporate"] {
    --semantic-color-foreground-accent: var(--core-color-palette-blue-500);
    --semantic-shape-control-radius-default: var(--core-shape-radius-02);
    --semantic-spacing-component-padding: var(--core-spacing-size-05);
    --semantic-motion-interaction-duration: var(--core-motion-duration-short);
    --semantic-typography-body-font-weight: var(--core-typography-weight-medium);
  }

  @media (prefers-color-scheme: dark) {
    [data-brand="corporate"] {
      --semantic-color-foreground-accent: var(--core-color-palette-blue-400);
      /* Dark mode adjustments */
    }
  }
}`}</code>
              </pre>

              <h2>Runtime Brand Switching</h2>
              <p>
                Brand switching at runtime is handled by updating a data
                attribute on the document element:
              </p>

              <pre className={styles.codeBlock}>
                <code>{`// React context for brand management
function setBrand(brand: BrandId) {
  document.documentElement.setAttribute('data-brand', brand);
  localStorage.setItem('brand', brand);
}

// Usage
setBrand('corporate'); // Instantly switches all brand tokens`}</code>
              </pre>

              <h2>Core Layer: Brand-Agnostic Primitives</h2>
              <p>
                The core layer contains primitives that all brands share. These
                are the raw materials&mdash;color palettes, spacing scales,
                typography ramps&mdash;that brands draw from.
              </p>

              <pre className={styles.codeBlock}>
                <code>{`// core/color.tokens.json - Universal palette
{
  "palette": {
    "red": {
      "500": { "$type": "color", "$value": "#d9292b" }
    },
    "blue": {
      "500": { "$type": "color", "$value": "#0a65fe" }
    },
    "green": {
      "500": { "$type": "color", "$value": "#22c55e" }
    }
  }
}

// core/shape.tokens.json - Radius scale
{
  "radius": {
    "01": { "$value": "2px" },  // Sharp
    "02": { "$value": "4px" },  // Small
    "03": { "$value": "8px" },  // Medium
    "04": { "$value": "16px" }, // Large
    "full": { "$value": "9999px" } // Pill
  }
}`}</code>
              </pre>

              <h2>Pitfalls to Avoid</h2>

              <h3>1. Duplicating Core Tokens Per Brand</h3>
              <p>
                Each brand should reference core tokens, not define their own
                values. Duplicating defeats the purpose of the two-tier model.
              </p>

              <pre className={styles.codeBlock}>
                <code>{`// BAD: Brand defines its own primitives
{ "blue": { "500": { "$value": "#0a65fe" } } } // Duplicates core!

// GOOD: Brand references core primitives
{ "background": { "brand": { "$value": "{core.color.palette.blue.500}" } } }`}</code>
              </pre>

              <h3>2. Inconsistent Semantic Structure</h3>
              <p>
                All brands must use the same semantic token structure.
                Components reference semantic paths, so those paths must exist
                in every brand.
              </p>

              <h3>3. Hardcoding Brand Logic in Components</h3>
              <p>
                Components should be brand-agnostic. They reference semantic
                tokens and let the token system handle brand differences.
              </p>

              <pre className={styles.codeBlock}>
                <code>{`// BAD: Brand logic in component
.button { background: var(--brand-a-blue); }

// GOOD: Brand-agnostic component
.button { background: var(--semantic-color-background-accent); }`}</code>
              </pre>

              <h3>4. Forgetting Accessibility Across Brands</h3>
              <p>
                Each brand&apos;s semantic tokens must maintain accessibility
                requirements. A brand can&apos;t choose colors that fail
                contrast ratios.
              </p>

              <h2>Summary</h2>
              <ul>
                <li>
                  <strong>Core tokens are brand-agnostic</strong> &mdash; Shared
                  palettes, scales, and ramps
                </li>
                <li>
                  <strong>Semantic tokens are the theming surface</strong>{' '}
                  &mdash; Where brands diverge
                </li>
                <li>
                  <strong>Five dimensions of variation</strong> &mdash; Color,
                  shape, spacing, motion, typography
                </li>
                <li>
                  <strong>CSS cascade layers</strong> &mdash; Ensure brand
                  overrides take precedence
                </li>
                <li>
                  <strong>Runtime switching via data attributes</strong> &mdash;
                  Instant brand changes
                </li>
              </ul>

              <h2>Next Steps</h2>
              <p>
                Multi-brand theming relies on the{' '}
                <Link href="/blueprints/foundations/tokens/resolver-module">
                  resolver module
                </Link>{' '}
                for complex resolution scenarios. For simpler setups, understand
                how{' '}
                <Link href="/blueprints/foundations/tokens/build-outputs">
                  build outputs
                </Link>{' '}
                generate brand-specific artifacts, and how{' '}
                <Link href="/blueprints/foundations/tokens/accessibility">
                  accessibility tokens
                </Link>{' '}
                ensure all brands remain inclusive.
              </p>
            </div>
          </TabPanel>
          <TabPanel value="playground" className={styles.tabPanel}>
            <div className={styles.heroBrandSwitcher}>
              <BrandSwitcher
                showDensity={true}
                showPersonality={true}
                showFonts={true}
              />
            </div>
            <div className={styles.playgroundSection}>
              <DashboardDemo />
            </div>
          </TabPanel>
        </Tabs>
      </section>

      <nav className={styles.navFooter}>
        <Link href="/blueprints/foundations/tokens" className={styles.navLink}>
          &larr; Back to Design Tokens
        </Link>
        <Link
          href="/blueprints/foundations/tokens/resolver-module"
          className={styles.navLink}
        >
          Resolver Module &rarr;
        </Link>
      </nav>
    </div>
  );
}

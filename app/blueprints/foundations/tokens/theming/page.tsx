import Link from 'next/link';
import styles from './page.module.scss';
import { DashboardDemo } from './_components';
import { PlaygroundWrapper } from './_components/PlaygroundWrapper';
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
                Multi-brand theming works through three layers. Core tokens
                define raw primitives (palettes, scales). Semantic tokens give
                those primitives meaning (accent, background, border). Brand
                tokens remap semantic values to different core primitives.
              </p>

              <div className={styles.fileTree}>
                <pre>
                  <code>{`Semantic Token                       Default (red)         Corporate (blue)
─────────────────                    ─────────────         ────────────────
--semantic-color-foreground-accent   → palette.red.500     → palette.blue.500
--semantic-color-background-accent   → palette.red.500     → palette.blue.500
--semantic-color-border-accent       → palette.red.500     → palette.blue.500
--semantic-color-foreground-link     → palette.red.500     → palette.blue.600
--semantic-shape-control-radius      → shape.radius.04     → shape.radius.02
--semantic-spacing-component-padding → spacing.size.05     → spacing.size.04
--semantic-motion-interaction-dur.   → motion.dur.short    → motion.dur.short2

Components always reference --semantic-* tokens.
Brand files remap which core primitives those tokens resolve to.`}</code>
                </pre>
              </div>

              <p>
                The source files mirror this structure. Core token files define
                the shared primitives, and each brand file selectively overrides
                the semantic mappings:
              </p>

              <div className={styles.fileTree}>
                <pre>
                  <code>{`Core Layer (Shared)              Brand Layer (Overrides)
────────────────────              ─────────────────────
core/                             brands/
├── color.tokens.json              ├── default.tokens.json
├── spacing.tokens.json            ├── corporate.tokens.json
├── shape.tokens.json              ├── forest.tokens.json
├── motion.tokens.json             ├── sunset.tokens.json
└── typography.tokens.json         ├── midnight.tokens.json
                                   ├── ocean.tokens.json
                                   ├── canary.tokens.json
                                   ├── monochrome.tokens.json
                                   ├── rose.tokens.json
                                   └── slate.tokens.json`}</code>
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
              <p>
                Each brand token file references core primitives using the DTCG
                token reference syntax. The <code>$extensions</code> object
                provides separate light and dark values for color tokens,
                enabling per-brand dark mode adjustments:
              </p>
              <pre className={styles.codeBlock}>
                <code>{`// brands/corporate.tokens.json
{
  "$brand": {
    "name": "corporate",
    "description": "Professional corporate brand with blue accents"
  },
  "color": {
    "foreground": {
      "accent": {
        "$type": "color",
        "$value": "{color.palette.blue.500}",
        "$extensions": {
          "design.paths.light": "{color.palette.blue.500}",
          "design.paths.dark": "{color.palette.blue.400}"
        }
      }
    },
    "background": {
      "accent": {
        "$type": "color",
        "$value": "{color.palette.blue.500}",
        "$extensions": {
          "design.paths.light": "{color.palette.blue.500}",
          "design.paths.dark": "{color.palette.blue.400}"
        }
      }
    }
  },
  "shape": {
    "control": {
      "radius": {
        "default": { "$value": "{shape.radius.02}" }  // 4px
      }
    }
  },
  "spacing": {
    "component": {
      "padding": { "$value": "{spacing.size.04}" },    // 8px
      "gap": { "$value": "{spacing.size.03}" }         // 4px
    }
  },
  "motion": {
    "interaction": {
      "duration": { "$value": "{motion.duration.short2}" } // 83ms
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
                The build system generates CSS with cascade layers. Each layer
                has increasing precedence&mdash;brand overrides always win over
                theme defaults, and theme defaults win over semantic defaults:
              </p>

              <pre className={styles.codeBlock}>
                <code>{`@layer core, semantic, theme, brand, density;

@layer theme {
  /* Light/dark theme defaults (applied via class on <html>) */
  .light {
    --semantic-color-foreground-accent: #d9292b;   /* default red */
    --semantic-color-background-primary: #ffffff;
    /* ...all semantic color tokens for light mode... */
  }
  .dark { /* dark mode overrides */ }

  @media (prefers-color-scheme: dark) {
    :root { /* system dark mode */ }
    .light { /* manual light override when system prefers dark */ }
  }
}

@layer brand {
  /* Base brand overrides (light mode default) */
  [data-brand="corporate"] {
    --semantic-color-foreground-accent: var(--core-color-palette-blue-500);
    --semantic-color-background-accent: var(--core-color-palette-blue-500);
    --semantic-shape-control-radius-default: var(--core-shape-radius-02);
    --semantic-spacing-component-padding: var(--core-spacing-size-04);
    --semantic-motion-interaction-duration: var(--core-motion-duration-short2);
    --semantic-typography-body-font-weight: var(--core-typography-weight-medium);
  }

  /* Manual light toggle override (when system prefers dark) */
  .light[data-brand="corporate"] {
    --semantic-color-foreground-accent: var(--core-color-palette-blue-500);
    /* ...same light values, ensuring brand wins over theme layer... */
  }

  /* Dark mode overrides for this brand */
  @media (prefers-color-scheme: dark) {
    [data-brand="corporate"] {
      --semantic-color-foreground-accent: var(--core-color-palette-blue-400);
      /* ...shifted palette values for dark backgrounds... */
    }
  }
}`}</code>
              </pre>

              <h2>Runtime Brand Switching</h2>
              <p>
                Brand switching at runtime is handled by updating a{' '}
                <code>data-brand</code> attribute on the document element. CSS
                selectors like <code>[data-brand=&quot;corporate&quot;]</code>{' '}
                activate the correct brand overrides instantly, with no
                JavaScript style recalculation needed:
              </p>

              <pre className={styles.codeBlock}>
                <code>{`// BrandContext sets the data attribute on <html>
function setBrand(brand: BrandId) {
  document.documentElement.setAttribute('data-brand', brand);
  localStorage.setItem('brand', brand);
}

// Density uses the same pattern
function setDensity(density: DensityId) {
  document.documentElement.setAttribute('data-density', density);
}

// The light/dark toggle adds a class to <html>,
// which the brand layer accounts for:
//   .light[data-brand="corporate"] { ... }
//   .dark[data-brand="corporate"]  { ... }`}</code>
              </pre>

              <h2>Core Layer: Brand-Agnostic Primitives</h2>
              <p>
                The core layer contains primitives that all brands share. These
                are the raw materials&mdash;color palettes, spacing scales,
                typography ramps&mdash;that brands draw from. No brand defines
                its own palette; each one references values from this shared set.
              </p>

              <pre className={styles.codeBlock}>
                <code>{`// Core primitives generate CSS variables like:
--core-color-palette-red-500: #d9292b;
--core-color-palette-blue-500: #0a65fe;
--core-color-palette-green-500: #487e1e;

--core-shape-radius-01: 2px;    // Sharp
--core-shape-radius-02: 4px;    // Small
--core-shape-radius-03: 8px;    // Medium
--core-shape-radius-04: 16px;   // Large

--core-spacing-size-03: 4px;
--core-spacing-size-04: 8px;
--core-spacing-size-05: 12px;

--core-motion-duration-short: 150ms;
--core-motion-duration-short2: 83ms;

// Brands reference these via var(), so changing a core
// primitive updates every brand that uses it.`}</code>
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
            <PlaygroundWrapper>
              <div className={styles.playgroundLayout}>
                <aside className={styles.playgroundAside}>
                  <BrandSwitcher
                    showDensity
                    showPersonality
                    showFonts
                    sticky
                  />
                </aside>
                <div className={styles.playgroundSection}>
                  <DashboardDemo />
                </div>
              </div>
            </PlaygroundWrapper>
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

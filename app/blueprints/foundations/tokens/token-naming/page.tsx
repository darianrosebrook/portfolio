import Link from 'next/link';
import styles from '../page.module.scss';

export const metadata = {
  title: 'Token Naming & Hierarchy | Darian Rosebrook',
  description:
    'Conventions for namespacing, discoverability, and stability. Learn how to structure core, semantic, and component tokens for scalable design systems.',
  openGraph: {
    title: 'Token Naming & Hierarchy | Darian Rosebrook',
    description:
      'Conventions for namespacing, discoverability, and stability. Learn how to structure core, semantic, and component tokens for scalable design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Token Naming & Hierarchy | Darian Rosebrook',
    description:
      'Conventions for namespacing, discoverability, and stability. Learn how to structure core, semantic, and component tokens for scalable design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function TokenNamingPage() {
  return (
    <section className="content">
      <article>
        <h1>Deep Dive: Token Naming & Hierarchy</h1>

        <h2>Why Naming Matters</h2>
        <p>
          Token names are API design. They&apos;re the interface between design
          decisions and implementation&mdash;the contract that designers,
          developers, and tooling all depend on. A poorly named token creates
          confusion, duplication, and technical debt. A well-named token
          communicates intent, enables discovery, and scales gracefully.
        </p>

        <p>
          Unlike code variables that can be refactored with IDE tooling, token
          names propagate across design tools, documentation, CSS output, and
          TypeScript types. Renaming a token is a breaking change that ripples
          through the entire system. This makes getting names right from the
          start essential.
        </p>

        <h2>The Naming Formula</h2>
        <p>
          Every token name follows a consistent pattern that encodes its layer,
          category, and purpose:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`[layer].[category].[subcategory].[variant].[state]

Examples:
core.color.palette.neutral.600
semantic.color.foreground.primary
semantic.components.button.primary.background
semantic.spacing.gap.grid`}</code>
        </pre>

        <h3>Layer Prefix (Required)</h3>
        <p>
          Every token starts with its layer prefix. This immediately
          communicates where the token lives in the hierarchy and what it can
          reference:
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Prefix</th>
              <th>Purpose</th>
              <th>Can Reference</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>core.</code>
              </td>
              <td>Raw primitives with no semantic meaning</td>
              <td>Nothing (leaf nodes with raw values)</td>
            </tr>
            <tr>
              <td>
                <code>semantic.</code>
              </td>
              <td>Purpose-driven roles and aliases</td>
              <td>
                <code>core.*</code> or other <code>semantic.*</code> tokens
              </td>
            </tr>
            <tr>
              <td>
                <code>semantic.components.</code>
              </td>
              <td>UI-specific bindings</td>
              <td>
                <code>semantic.*</code> or <code>core.*</code> tokens
              </td>
            </tr>
          </tbody>
        </table>

        <h3>Category (Required)</h3>
        <p>
          The category groups tokens by their fundamental type. This enables
          filtering, tooling, and mental models:
        </p>

        <table className={styles.table}>
          <thead>
            <tr>
              <th>Category</th>
              <th>What It Contains</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <code>color</code>
              </td>
              <td>All color values</td>
              <td>palette, foreground, background, border, status</td>
            </tr>
            <tr>
              <td>
                <code>spacing</code>
              </td>
              <td>Spatial dimensions</td>
              <td>size scale, gap, padding, margin</td>
            </tr>
            <tr>
              <td>
                <code>typography</code>
              </td>
              <td>Text-related values</td>
              <td>family, weight, ramp, lineHeight, letterSpacing</td>
            </tr>
            <tr>
              <td>
                <code>motion</code>
              </td>
              <td>Animation properties</td>
              <td>duration, easing, delay, stagger</td>
            </tr>
            <tr>
              <td>
                <code>shape</code>
              </td>
              <td>Geometric properties</td>
              <td>radius, border</td>
            </tr>
            <tr>
              <td>
                <code>elevation</code>
              </td>
              <td>Depth and layering</td>
              <td>shadow, depth, level</td>
            </tr>
            <tr>
              <td>
                <code>components</code>
              </td>
              <td>Component-specific tokens</td>
              <td>button, input, card, badge</td>
            </tr>
          </tbody>
        </table>

        <h3>Subcategory (Context-Dependent)</h3>
        <p>
          Subcategories provide additional grouping within a category. Their
          structure depends on the layer:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Core: Subcategory describes the value type
core.color.palette.neutral.600    // "palette" = color scale
core.color.mode.dark              // "mode" = theme base colors
core.spacing.size.04              // "size" = spacing scale

// Semantic: Subcategory describes the role
semantic.color.foreground.primary // "foreground" = text/icon colors
semantic.color.background.danger  // "background" = surface colors
semantic.color.border.subtle      // "border" = boundary colors
semantic.color.status.success     // "status" = feedback colors`}</code>
        </pre>

        <h3>Variant and State (Optional)</h3>
        <p>
          Variants describe visual weight or emphasis. States describe
          interactive conditions:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Variants (visual weight)
semantic.components.button.primary.background
semantic.components.button.secondary.background
semantic.components.button.danger.background

// States (interactive conditions)
semantic.components.button.primary.background.hover
semantic.components.button.primary.background.active
semantic.components.button.primary.background.disabled`}</code>
        </pre>

        <h2>Naming Principles</h2>

        <h3>1. Describe Purpose, Not Implementation</h3>
        <p>
          Token names should communicate <em>what something is for</em>, not{' '}
          <em>what it looks like</em>. This enables theming and evolution
          without breaking names.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Describes implementation
semantic.color.blue500
semantic.color.grayText
semantic.spacing.16px

// ✅ GOOD: Describes purpose
semantic.color.foreground.link
semantic.color.foreground.secondary
semantic.spacing.gap.grid`}</code>
        </pre>

        <h3>2. Use Nouns for Tokens, Verbs for Utilities</h3>
        <p>
          Tokens represent values (nouns). Utilities and functions represent
          actions (verbs). This distinction keeps the mental model clear.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Tokens (nouns) - represent values
semantic.color.foreground.primary
semantic.motion.duration.short
semantic.elevation.shadow.raised

// Utilities (verbs) - represent actions
getTokenValue('semantic.color.foreground.primary')
resolveReference('{core.color.palette.blue.500}')
validateToken(tokenDefinition)`}</code>
        </pre>

        <h3>3. Maintain Consistent Depth</h3>
        <p>
          Tokens at the same conceptual level should have the same depth. Avoid
          skipping hierarchy levels or creating inconsistent structures.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Inconsistent depth
semantic.color.primary           // 3 levels
semantic.color.foreground.primary // 4 levels
semantic.color.background.surface.raised // 5 levels

// ✅ GOOD: Consistent depth within category
semantic.color.foreground.primary
semantic.color.foreground.secondary
semantic.color.foreground.tertiary
semantic.color.background.primary
semantic.color.background.secondary
semantic.color.background.raised`}</code>
        </pre>

        <h3>4. Use American English Spelling</h3>
        <p>
          For consistency across the codebase, use American English spelling.
          This aligns with CSS property names and most programming conventions.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: British spelling
semantic.color.grey.500
semantic.color.foreground.colour

// ✅ GOOD: American spelling
semantic.color.gray.500
semantic.color.foreground.color`}</code>
        </pre>

        <h3>5. Prefer Explicit Over Abbreviated</h3>
        <p>
          Clarity beats brevity. Abbreviated names save a few characters but
          cost discoverability and understanding.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Abbreviated
semantic.clr.fg.prim
semantic.typ.wt.bd
semantic.spc.sz.04

// ✅ GOOD: Explicit
semantic.color.foreground.primary
semantic.typography.weight.bold
semantic.spacing.size.04`}</code>
        </pre>

        <h2>Hierarchy Patterns</h2>

        <h3>Core Token Hierarchy</h3>
        <p>
          Core tokens organize raw values by their type. The hierarchy reflects
          the nature of the value, not its usage:
        </p>

        <div className={styles.fileTree}>
          <pre>
            <code>{`core/
├── color/
│   ├── palette/
│   │   ├── neutral/     # 100-800 grayscale
│   │   ├── red/         # 100-800 red scale
│   │   ├── blue/        # 100-800 blue scale
│   │   └── ...
│   ├── mode/
│   │   ├── light        # Base light color
│   │   ├── dark         # Base dark color
│   │   └── transparent  # Transparent
│   └── datavis/         # Chart colors
│
├── spacing/
│   └── size/
│       ├── 00           # 0
│       ├── 01           # 1px
│       ├── 02           # 2px
│       └── ...          # up to 10 (64px)
│
├── typography/
│   ├── family/          # Font families
│   ├── weight/          # Font weights
│   ├── ramp/            # Size scale
│   ├── lineHeight/      # Line height ratios
│   └── letterSpacing/   # Letter spacing values
│
├── motion/
│   ├── duration/        # Timing values
│   ├── easing/          # Easing curves
│   └── delay/           # Delay values
│
├── shape/
│   ├── radius/          # Border radii
│   └── border/          # Border styles
│
└── elevation/
    ├── shadow/          # Box shadows
    └── depth/           # Z-index layers`}</code>
          </pre>
        </div>

        <h3>Semantic Token Hierarchy</h3>
        <p>
          Semantic tokens organize values by their purpose in the UI. The
          hierarchy reflects usage patterns and design decisions:
        </p>

        <div className={styles.fileTree}>
          <pre>
            <code>{`semantic/
├── color/
│   ├── foreground/
│   │   ├── primary      # Main text
│   │   ├── secondary    # Supporting text
│   │   ├── tertiary     # Subtle text
│   │   ├── link         # Link text
│   │   └── inverse      # Text on dark backgrounds
│   ├── background/
│   │   ├── primary      # Main surface
│   │   ├── secondary    # Alternate surface
│   │   ├── brand        # Brand-colored surface
│   │   └── danger       # Error/warning surface
│   ├── border/
│   │   ├── default      # Standard borders
│   │   ├── subtle       # Light borders
│   │   └── strong       # Emphasized borders
│   └── status/
│       ├── info         # Informational
│       ├── success      # Positive
│       ├── warning      # Caution
│       └── danger       # Error/critical
│
├── spacing/
│   ├── gap/             # Flex/grid gaps
│   ├── padding/         # Internal spacing
│   └── margin/          # External spacing
│
├── components/
│   ├── button/
│   │   ├── primary/
│   │   │   ├── background
│   │   │   ├── foreground
│   │   │   └── border
│   │   ├── secondary/
│   │   └── danger/
│   ├── input/
│   ├── card/
│   └── ...`}</code>
          </pre>
        </div>

        <h2>Pitfalls to Avoid</h2>

        <h3>1. Color Names in Semantic Tokens</h3>
        <p>
          Never use color names in semantic tokens. This couples the name to a
          specific implementation and breaks when themes change.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Color name in semantic token
semantic.color.blueButton
semantic.color.redError
semantic.color.greenSuccess

// ✅ GOOD: Purpose-based names
semantic.color.background.brand
semantic.color.status.danger
semantic.color.status.success`}</code>
        </pre>

        <h3>2. Size Values in Names</h3>
        <p>
          Avoid embedding specific values in token names. Use relative terms or
          scale positions instead.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Values in names
semantic.spacing.16px
semantic.typography.fontSize14
semantic.motion.duration200ms

// ✅ GOOD: Relative or scale-based names
semantic.spacing.size.04
semantic.typography.size.body
semantic.motion.duration.short`}</code>
        </pre>

        <h3>3. Inconsistent Pluralization</h3>
        <p>
          Be consistent with singular vs plural. Generally, use singular for
          categories and plural for collections.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Inconsistent pluralization
semantic.colors.foreground.primary
semantic.color.backgrounds.primary
semantic.component.button.primary

// ✅ GOOD: Consistent (singular categories)
semantic.color.foreground.primary
semantic.color.background.primary
semantic.components.button.primary`}</code>
        </pre>

        <h3>4. Overloaded Names</h3>
        <p>
          Each token should have one clear purpose. Avoid names that could apply
          to multiple contexts.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Ambiguous names
semantic.color.primary        // Primary what? Text? Background?
semantic.spacing.default      // Default for what context?
semantic.border.main          // Main border color? Width? Style?

// ✅ GOOD: Specific names
semantic.color.foreground.primary
semantic.spacing.gap.grid
semantic.color.border.default`}</code>
        </pre>

        <h3>5. Skipping Hierarchy Levels</h3>
        <p>
          Don&apos;t skip levels in the hierarchy. This creates inconsistent
          paths and breaks tooling expectations.
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Skipped levels
semantic.primary                    // Missing category
semantic.color.primary              // Missing subcategory
semantic.components.background      // Missing component name

// ✅ GOOD: Complete hierarchy
semantic.color.foreground.primary
semantic.color.background.primary
semantic.components.button.primary.background`}</code>
        </pre>

        <h2>Naming for Discoverability</h2>
        <p>
          Good naming enables discovery through autocomplete, search, and
          browsing. Consider how developers will find tokens:
        </p>

        <h3>Autocomplete-Friendly</h3>
        <p>
          Names should narrow down progressively. Start broad (layer), then
          category, then specifics:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Typing "semantic.color." shows:
semantic.color.foreground.*
semantic.color.background.*
semantic.color.border.*
semantic.color.status.*

// Typing "semantic.color.foreground." shows:
semantic.color.foreground.primary
semantic.color.foreground.secondary
semantic.color.foreground.tertiary
semantic.color.foreground.link`}</code>
        </pre>

        <h3>Search-Friendly</h3>
        <p>
          Names should be searchable by common terms. Include the most likely
          search terms in the path:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Searching "button" finds:
semantic.components.button.*

// Searching "error" or "danger" finds:
semantic.color.status.danger
semantic.color.background.danger
semantic.components.button.danger.*`}</code>
        </pre>

        <h2>Summary</h2>
        <ul>
          <li>
            <strong>Layer prefix</strong> is required&mdash;
            <code>core.</code>, <code>semantic.</code>, or{' '}
            <code>semantic.components.</code>
          </li>
          <li>
            <strong>Describe purpose</strong>, not implementation&mdash;
            <code>foreground.primary</code> not <code>gray600</code>
          </li>
          <li>
            <strong>Use nouns</strong> for tokens, verbs for utilities
          </li>
          <li>
            <strong>Maintain consistent depth</strong> within categories
          </li>
          <li>
            <strong>Prefer explicit</strong> over abbreviated names
          </li>
          <li>
            <strong>Avoid</strong> color names, size values, and ambiguous terms
            in semantic tokens
          </li>
        </ul>

        <p>
          Well-named tokens are an investment that pays dividends in
          maintainability, discoverability, and team velocity. Take the time to
          get names right&mdash;your future self and your team will thank you.
        </p>

        <h2>Next Steps</h2>
        <p>
          With naming conventions established, explore how tokens enable{' '}
          <Link href="/blueprints/foundations/tokens/theming">
            multi-brand theming
          </Link>
          , how the{' '}
          <Link href="/blueprints/foundations/tokens/resolver-module">
            resolver module
          </Link>{' '}
          handles context-aware resolution, and how{' '}
          <Link href="/blueprints/foundations/tokens/schema-validation">
            schema validation
          </Link>{' '}
          enforces these conventions automatically.
        </p>
      </article>

      <Link href="/blueprints/foundations/tokens">
        &larr; Back to Design Tokens
      </Link>
    </section>
  );
}

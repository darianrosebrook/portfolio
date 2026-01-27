import Link from 'next/link';
import styles from '../page.module.scss';

export const metadata = {
  title: 'Core vs Semantic Tokens | Darian Rosebrook',
  description:
    'Understand how core primitives and semantic roles work together. Why aliases beat copies, and how layered abstraction scales to themes and brands.',
  openGraph: {
    title: 'Core vs Semantic Tokens | Darian Rosebrook',
    description:
      'Understand how core primitives and semantic roles work together. Why aliases beat copies, and how layered abstraction scales to themes and brands.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Core vs Semantic Tokens | Darian Rosebrook',
    description:
      'Understand how core primitives and semantic roles work together. Why aliases beat copies, and how layered abstraction scales to themes and brands.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

export default function CoreVsSemanticPage() {
  return (
    <section className="content">
      <article>
        <h1>Deep Dive: Core vs Semantic Tokens</h1>

        <h2>The Stable Contract</h2>
        <p>
          Design tokens should be a stable contract between the design layer and
          the structure layer in a design system. When a system inevitably goes
          through a rebrand, we want the surface layer to be quick to adopt and
          change, while maintenance of those changes requires minimal effort.
        </p>

        <p>
          We achieve this through layered abstraction&mdash;encoding design
          decisions into the structure of our components while offering small
          escape hatches for maintainers to easily theme or swap underlying
          styles. The question isn&apos;t whether to use layers, but{' '}
          <strong>at what depth do you want to make changes?</strong>
        </p>

        <h2>The Tree Model of Abstraction</h2>
        <p>
          Think of tokens as a tree structure. At the root, you have raw
          values&mdash;the actual hex codes, pixel values, and timing functions.
          As you move toward the leaves (the components), each branch adds a
          layer of abstraction and meaning.
        </p>

        <div className={styles.fileTree}>
          <pre>
            <code>{`Depth 0: Raw Value     →  #fafafa
    ↓
Depth 1: Primitive     →  neutral-100
    ↓
Depth 2: Semantic      →  surface-primary (or background-neutral-primary)
    ↓
Depth 3: Component     →  card-background-default
    ↓
Depth 4+: Variant      →  card-background-hover`}</code>
          </pre>
        </div>

        <p>
          If you have a change that affects many items, would you rather chase
          down 700+ uses of the same value at the component level, or change one
          value further up the tree and let it cascade down the branches?
        </p>

        <h3>Depth Trade-offs</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Depth</th>
              <th>Abstraction Level</th>
              <th>Change Impact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>0</td>
              <td>Raw value</td>
              <td>Changes everything using that value</td>
            </tr>
            <tr>
              <td>1</td>
              <td>Primitive</td>
              <td>Changes all semantics referencing it</td>
            </tr>
            <tr>
              <td>2</td>
              <td>Semantic</td>
              <td>Changes all components using that role</td>
            </tr>
            <tr>
              <td>3</td>
              <td>Component</td>
              <td>Changes one component&apos;s appearance</td>
            </tr>
            <tr>
              <td>4+</td>
              <td>Variant/State</td>
              <td>Changes one specific state</td>
            </tr>
          </tbody>
        </table>

        <p>
          A shallow depth of abstraction forces you to either make tokens
          support more layers (losing fidelity) or broaden the number of tokens
          you expose to consumers. Neither is ideal.
        </p>

        <h2>The Core Layer: Raw Building Blocks</h2>
        <p>
          Core tokens define raw values with no inherent meaning. A color like{' '}
          <code>core.color.palette.neutral.600</code> is just a gray&mdash;it
          doesn&apos;t say &ldquo;use me for text&rdquo; or &ldquo;use me for
          borders.&rdquo; This intentional meaninglessness is what makes core
          tokens stable and reusable.
        </p>

        <h3>What Lives in Core</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Path</th>
              <th>Examples</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Color Palettes</td>
              <td>
                <code>core.color.palette.*</code>
              </td>
              <td>neutral.100-800, red.100-800, blue.100-800</td>
            </tr>
            <tr>
              <td>Mode Colors</td>
              <td>
                <code>core.color.mode.*</code>
              </td>
              <td>light, dark, black, white, transparent</td>
            </tr>
            <tr>
              <td>Spacing Scale</td>
              <td>
                <code>core.spacing.size.*</code>
              </td>
              <td>00 (0), 01 (1px), 02 (2px), ... 10 (64px)</td>
            </tr>
            <tr>
              <td>Typography Ramp</td>
              <td>
                <code>core.typography.ramp.*</code>
              </td>
              <td>1 (10px), 2 (12px), ... 16 (192px)</td>
            </tr>
            <tr>
              <td>Font Weights</td>
              <td>
                <code>core.typography.weight.*</code>
              </td>
              <td>thin (100), regular (400), bold (700)</td>
            </tr>
            <tr>
              <td>Motion</td>
              <td>
                <code>core.motion.*</code>
              </td>
              <td>easing-smooth, easing-snappy, duration-short</td>
            </tr>
            <tr>
              <td>Border Radii</td>
              <td>
                <code>core.shape.radius.*</code>
              </td>
              <td>none (0), 01 (2px), 02 (4px), full (9999px)</td>
            </tr>
            <tr>
              <td>Elevation</td>
              <td>
                <code>core.elevation.*</code>
              </td>
              <td>level.1, level.2, depth.0-4</td>
            </tr>
          </tbody>
        </table>

        <h3>Core Token Structure</h3>
        <pre className={styles.codeBlock}>
          <code>{`// core/color.tokens.json
{
  "palette": {
    "neutral": {
      "600": {
        "$type": "color",
        "$value": "#555555",
        "$description": "Level 600 of the neutral color scale, a dark shade."
      }
    }
  }
}`}</code>
        </pre>

        <p>
          Notice that descriptions are purely factual&mdash;&ldquo;a dark
          shade&rdquo; rather than &ldquo;use for secondary text.&rdquo; Core
          tokens describe <em>what</em> they are, not <em>how</em> to use them.
        </p>

        <h2>The Semantic Layer: Purpose and Meaning</h2>
        <p>
          Semantic tokens assign roles by referencing other tokens. They answer
          the question: &ldquo;What is this value <em>for</em>?&rdquo; This is
          where design decisions are encoded&mdash;where we say &ldquo;primary
          text should be dark in light mode and light in dark mode.&rdquo;
        </p>

        <h3>Semantic Tokens Can Reference Other Semantics</h3>
        <p>
          A key insight: semantic tokens aren&apos;t limited to referencing only
          core tokens. They can reference other semantic tokens when it makes
          sense for the abstraction. This is how you build useful layers of
          meaning:
        </p>

        <pre className={styles.codeBlock}>
          <code>{`// Semantic referencing core (base role)
{
  "status": {
    "danger": {
      "$type": "color",
      "$value": "{core.color.palette.red.500}",
      "$description": "Base danger/error color"
    }
  }
}

// Semantic referencing semantic (derived role)
{
  "components": {
    "button": {
      "danger": {
        "background": {
          "$type": "color",
          "$value": "{semantic.color.status.danger}",
          "$description": "Danger button inherits from status.danger"
        }
      }
    },
    "alert": {
      "danger": {
        "border": {
          "$type": "color",
          "$value": "{semantic.color.status.danger}",
          "$description": "Alert border also inherits from status.danger"
        }
      }
    }
  }
}`}</code>
        </pre>

        <p>
          Now if you change <code>status.danger</code>, both the button and
          alert update together. This is the power of choosing the right depth
          of abstraction.
        </p>

        <h3>What Lives in Semantic</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Category</th>
              <th>Path</th>
              <th>Purpose</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Foreground</td>
              <td>
                <code>semantic.color.foreground.*</code>
              </td>
              <td>Text, icons, and other content colors</td>
            </tr>
            <tr>
              <td>Background</td>
              <td>
                <code>semantic.color.background.*</code>
              </td>
              <td>Surface and container colors</td>
            </tr>
            <tr>
              <td>Border</td>
              <td>
                <code>semantic.color.border.*</code>
              </td>
              <td>Dividers, outlines, and boundaries</td>
            </tr>
            <tr>
              <td>Status</td>
              <td>
                <code>semantic.color.status.*</code>
              </td>
              <td>Info, success, warning, danger indicators</td>
            </tr>
            <tr>
              <td>Interaction</td>
              <td>
                <code>semantic.interaction.*</code>
              </td>
              <td>Hover, active, disabled, selected states</td>
            </tr>
            <tr>
              <td>Components</td>
              <td>
                <code>semantic.components.*</code>
              </td>
              <td>Button, input, badge, and other UI elements</td>
            </tr>
          </tbody>
        </table>

        <h2>The Reference Chain</h2>
        <p>
          References form a directed graph from components down to raw values.
          The depth you choose determines how changes cascade:
        </p>

        <div className={styles.fileTree}>
          <pre>
            <code>{`Component CSS
    ↓ uses
semantic.components.button.danger.background
    ↓ references
semantic.color.status.danger
    ↓ references
core.color.palette.red.500
    ↓ contains
"#d9292b" (the actual value)`}</code>
          </pre>
        </div>

        <p>
          Changing <code>core.color.palette.red.500</code> updates everything
          that references it. Changing <code>semantic.color.status.danger</code>{' '}
          updates all danger-related components but leaves other uses of red
          unchanged. Changing{' '}
          <code>semantic.components.button.danger.background</code> only affects
          that specific button variant.
        </p>

        <h3>Practical Example: The Rebrand Scenario</h3>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Raw Value</th>
              <th>Primitive</th>
              <th>Semantic</th>
              <th>Component</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>2px</td>
              <td>unit-2</td>
              <td>grid-gap-xs</td>
              <td>table-margin-compact</td>
            </tr>
            <tr>
              <td>8px</td>
              <td>unit-5</td>
              <td>grid-gap-md</td>
              <td>table-margin-default</td>
            </tr>
            <tr>
              <td>#fafafa</td>
              <td>neutral-100</td>
              <td>surface-primary</td>
              <td>card-background-default</td>
            </tr>
            <tr>
              <td>#fee197</td>
              <td>yellow-100</td>
              <td>background-feedback-warning</td>
              <td>alert-warning-background</td>
            </tr>
            <tr>
              <td>#2a2a2a</td>
              <td>neutral-900</td>
              <td>foreground-primary</td>
              <td>foreground-body-primary</td>
            </tr>
            <tr>
              <td>cubic-bezier(...)</td>
              <td>easing-snappy</td>
              <td>destructive-action-easing</td>
              <td>chip-remove-action-easing</td>
            </tr>
          </tbody>
        </table>

        <h2>Mode-Aware Tokens</h2>
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
      },
      "$description": "Primary foreground color for text and icons"
    }
  }
}`}</code>
        </pre>

        <pre className={styles.codeBlock}>
          <code>{`/* Generated CSS */
:root {
  --semantic-color-foreground-primary: #141414;
}

[data-theme="dark"] {
  --semantic-color-foreground-primary: #fafafa;
}`}</code>
        </pre>

        <h2>Pitfalls to Avoid</h2>

        <h3>1. Raw Values in Semantic Tokens</h3>
        <p>
          Semantic tokens should <strong>never</strong> contain raw values. This
          breaks the reference chain and prevents systematic updates.
        </p>
        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Raw value in semantic token
{
  "foreground": {
    "primary": {
      "$type": "color",
      "$value": "#141414"  // Breaks the reference chain!
    }
  }
}

// ✅ GOOD: Reference to core token
{
  "foreground": {
    "primary": {
      "$type": "color",
      "$value": "{core.color.mode.dark}"
    }
  }
}`}</code>
        </pre>

        <h3>2. Circular References</h3>
        <p>
          While semantic-to-semantic references are valid, they cannot form
          cycles. The validator catches these at build time.
        </p>
        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Circular reference
{
  "accent": { "$value": "{semantic.color.link}" },
  "link": { "$value": "{semantic.color.accent}" }  // Cycle!
}

// ✅ GOOD: Linear chain
{
  "accent": { "$value": "{core.color.palette.red.500}" },
  "link": { "$value": "{semantic.color.accent}" }  // Derives from accent
}`}</code>
        </pre>

        <h3>3. Using Core Tokens Directly in Components</h3>
        <p>
          Components should use semantic tokens, not core tokens. This ensures
          theming works correctly and design decisions stay centralized.
        </p>
        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Component using core token
.button {
  background: var(--core-color-palette-blue-500);
}

// ✅ GOOD: Component using semantic token
.button {
  background: var(--semantic-color-background-brand);
}`}</code>
        </pre>

        <h3>4. Wrong Depth of Abstraction</h3>
        <p>
          Choose the depth that matches how you expect changes to cascade. Too
          shallow means more manual updates; too deep means less flexibility.
        </p>
        <pre className={styles.codeBlock}>
          <code>{`// ❌ BAD: Too shallow - button directly references core
{
  "button": {
    "danger": {
      "background": { "$value": "{core.color.palette.red.500}" }
    }
  },
  "alert": {
    "danger": {
      "border": { "$value": "{core.color.palette.red.500}" }
    }
  }
}
// Changing "danger" color requires updating both tokens

// ✅ GOOD: Appropriate depth - shared semantic role
{
  "status": {
    "danger": { "$value": "{core.color.palette.red.500}" }
  },
  "button": {
    "danger": {
      "background": { "$value": "{semantic.color.status.danger}" }
    }
  },
  "alert": {
    "danger": {
      "border": { "$value": "{semantic.color.status.danger}" }
    }
  }
}
// Changing "danger" color requires updating one token`}</code>
        </pre>

        <h2>The Restaurant Menu Problem</h2>
        <p>
          For a system to be quick to understand, it&apos;s important to reduce
          mental decisions as early as possible. It should be obvious what to
          grab off the bat, rather than overwhelming someone with fine-grained
          abstraction.
        </p>

        <p>
          Finding the balance between delicate detail and &ldquo;too simple to
          be useful&rdquo; can be difficult. The details become apparent after
          understanding how your consuming audience turns to you for help with
          their needs.
        </p>

        <h2>Summary</h2>
        <ul>
          <li>
            <strong>Tokens form a tree</strong> with raw values at the root and
            components at the leaves.
          </li>
          <li>
            <strong>Depth determines change impact</strong>&mdash;choose the
            level where you want changes to cascade.
          </li>
          <li>
            <strong>Core tokens</strong> are raw values with no inherent
            meaning&mdash;the building blocks.
          </li>
          <li>
            <strong>Semantic tokens</strong> assign purpose and can reference
            both core and other semantic tokens.
          </li>
          <li>
            <strong>Avoid</strong> raw values in semantic tokens, circular
            references, and using core tokens directly in components.
          </li>
          <li>
            <strong>Balance abstraction</strong>&mdash;too shallow means more
            manual updates; too deep means less flexibility.
          </li>
        </ul>

        <p>
          The discipline of choosing the right depth of abstraction is what
          makes the system scalable. When you need to rebrand, support a new
          theme, or audit accessibility, well-structured tokens ensure you can
          make changes confidently at the appropriate level.
        </p>

        <h2>Next Steps</h2>
        <p>
          Understanding the layered model is foundational. From here, explore
          how tokens are{' '}
          <Link href="/blueprints/foundations/tokens/token-naming">
            named and organized
          </Link>
          , how{' '}
          <Link href="/blueprints/foundations/tokens/theming">
            multi-brand theming
          </Link>{' '}
          works, and how the{' '}
          <Link href="/blueprints/foundations/tokens/build-outputs">
            build pipeline
          </Link>{' '}
          transforms tokens into CSS, SCSS, and TypeScript.
        </p>

        <div className={styles.placeholder}>
          <p>
            <strong>Source files:</strong>
          </p>
          <ul>
            <li>
              <code>ui/designTokens/core/</code> &mdash; Modular core token
              files
            </li>
            <li>
              <code>ui/designTokens/semantic/</code> &mdash; Modular semantic
              token files
            </li>
            <li>
              <code>ui/designTokens/designTokens.json</code> &mdash; Composed
              aggregate
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

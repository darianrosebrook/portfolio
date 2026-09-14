/**
 * Foundation Meta: Theming Strategies
 * How alias tokens, layered cascade precedence, and theme inheritance
 * make dark mode, brand variants, and density modes data instead of
 * rewrites — and what theming is contractually forbidden from changing.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Theming Strategies',
  description:
    'Support dark mode, brand variations, and density modes without touching components: alias tokens with per-mode resolution, cascade-layer precedence, brand accent remapping, and the contract that keeps themes from breaking the system.',
  slug: 'meta/theming',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/meta/theming',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'theming, dark mode, brand themes, cascade layers, token aliases',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens'],
    next_units: ['color', 'motion'],
    assessment_required: false,
    estimated_reading_time: 14,
  },
  governance: {
    canonical_version: 'System v1',
    alignment_status: 'aligned',
    last_review_date: new Date().toISOString(),
    next_review_date: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ).toISOString(),
  },
  author: {
    name: 'Darian Rosebrook',
    role: 'Staff Design Technologist, Design Systems Architect',
    expertise: ['Design Systems', 'Theming', 'CSS Architecture'],
    profileUrl: 'https://darianrosebrook.com',
    imageUrl: 'https://darianrosebrook.com/darianrosebrook.jpg',
  },
};

const sections: FoundationSection[] = [
  {
    type: 'meta-header',
    id: 'meta-header',
    order: 1,
    content: null,
  },
  {
    type: 'alignment-notice',
    id: 'alignment-notice',
    order: 2,
    content: null,
  },
  {
    type: 'why-matters',
    id: 'why-matters',
    title: 'Why This Matters',
    order: 3,
    content: (
      <>
        <p>
          Every product eventually asks for themes: a dark mode because users
          expect it, a second brand because the company acquired one, a dense
          variant because power users begged. The only question is whether those
          arrive as <em>data</em> the system already understands or as forks
          that touch every component. Theming is not a feature you add; it is a
          property you earn from how the token layers were built—or discover you
          never had.
        </p>
        <p>
          The mechanism this system uses is worth studying precisely because it
          is boring: aliases that resolve differently per mode, a cascade with
          declared precedence, and brand files that are three fields long. Dark
          mode, ten brands, and four densities all ride the same three moves,
          and no component knows any of them exist.
        </p>
        <p>
          This page covers the strategy level—how the layers compose into
          themes. The token mechanics underneath are covered in the tokens
          pages, and the deepest worked playground lives at the theming
          deep-dive (<code>/blueprints/foundations/tokens/theming</code>).
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Three Axes, One Cascade',
    order: 4,
    content: (
      <>
        <h3>Axis 1: Modes (Light/Dark)</h3>
        <p>
          Mode theming lives in the semantic layer&apos;s alias structure. Every
          mode-relevant token carries <code>design.paths.light</code> and{' '}
          <code>design.paths.dark</code> references—
          <code>foreground.primary</code> is <code>mode.dark</code> in light
          theme and <code>mode.light</code> in dark, the inversion that keeps
          text legible on both surfaces. The generated stylesheet emits these
          twice: as <code>.light</code>/<code>.dark</code> classes an
          application can pin, and inside an{' '}
          <code>@media (prefers-color-scheme: dark)</code> block so the default
          follows the OS. Precedence between &quot;what the OS says&quot; and
          &quot;what the user pinned&quot; is an application decision; the
          tokens only guarantee both exist.
        </p>

        <h3>Axis 2: Brands</h3>
        <p>
          A brand file is the smallest possible theme: which core family the{' '}
          <code>brand.primary</code> ramp points at, plus a density. Ten ship
          today, and every one is three fields:
        </p>
        <pre>
          <code>{`// ui/designTokens/brands/*.tokens.json — the complete theme
default:     { accent: "red",     density: "default"  } // site identity
canary:      { accent: "yellow",  density: "default"  }
corporate:   { accent: "blue",    density: "compact"  }
forest:      { accent: "green",   density: "spacious" }
midnight:    { accent: "violet",  density: "tight"    }
monochrome:  { accent: "neutral", density: "tight"    }
ocean:       { accent: "teal",    density: "spacious" }
rose:        { accent: "red",     density: "spacious" }
slate:       { accent: "blue",    density: "compact"  }
sunset:      { accent: "orange",  density: "default"  }`}</code>
        </pre>
        <p>
          Because semantic tokens reference <code>brand.primary.500</code>—a{' '}
          <em>position</em>, not a hue—swapping the accent re-resolves every
          action, link, and highlight in the product. The generated brand layer
          emits <code>[data-brand=&quot;ocean&quot;]</code> scoped blocks (light
          and dark variants each), and applying a brand is setting one attribute
          on the root element. Nothing else in the system changes.
        </p>

        <h3>Axis 3: Density</h3>
        <p>
          Density is the axis teams forget until a data product needs it.
          Semantic spacing resolves through the density scales (
          <code>tight/compact/default/spacious</code> slots), so{' '}
          <code>[data-density]</code> rescales padding, gaps, and stack spacing
          product-wide. Note that brands <em>bundle</em> a density—ocean is
          spacious, midnight is tight—which is a default, not a cage: the axes
          compose because they live in separate cascade layers and can be
          overridden independently.
        </p>

        <h3>The Cascade Does the Resolution</h3>
        <p>All three axes resolve through one declared precedence:</p>
        <pre>
          <code>{`@layer core, semantic, theme, brand, density;`}</code>
        </pre>
        <p>
          Core values can never win against semantics; themes override
          semantics; brands override themes; density sits on top. That single
          line is the theming architecture—no specificity wars, no{' '}
          <code>!important</code>, no load-order luck. A new theme is
          <em>additive</em>: emit another scoped block; existing rules are never
          edited, which is what makes ten brands cheap to maintain and the
          eleventh cheap to add.
        </p>

        <h3>The Contract Themes Cannot Break</h3>
        <p>
          Theming has a hard boundary: themes change <strong>values</strong>,
          never <strong>structure</strong>. A theme may re-resolve{' '}
          <code>foreground.primary</code> to any ramp step; it may not remove
          the token, rename it, or change which components consume it. The
          semantic role names are the public API—stable across every mode,
          brand, and density—and every consumer (including the scoped component
          tokens with their literal fallbacks) is compiled against that API. A
          theme that needs a new role is not a theme; it is a system change with
          its own review.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Who Owns Which Axis',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the brand pairings—which accent, which default
          density—and the mode equivalences that can&apos;t be derived: which
          neutral step a border becomes in dark mode, whether a shadow gains a
          hairline. These are judgment calls encoded once per theme, reviewed as
          theme data.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the resolution guarantees: themes emit before first
          paint (no flash of wrong theme), the pinned-versus-OS precedence
          behaves, and nothing in application code branches on{' '}
          <code>if (isDarkMode)</code>—that conditional is the smell that
          theming failed and logic is compensating.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          Accessibility owns the per-theme audit: contrast pairs are claims{' '}
          <em>per mode per brand</em>, and the tenth brand is where &quot;we
          check contrast&quot; quietly becomes &quot;we checked it once.&quot;
          The pair ledger from the color foundation grows multiplicatively with
          themes; budget the audit when budgeting the theme.
        </p>
      </>
    ),
  },
  {
    type: 'design-code-interplay',
    id: 'design-code-interplay',
    title: 'Design & Code Interplay',
    order: 6,
    content: null,
    designContent: (
      <>
        <p>
          In the design tool, the three axes appear as Figma variable modes: a
          light/dark mode pair on every semantic variable, and brand collections
          that mirror the accent remapping. A designer previews ocean-in-dark by
          switching two mode toggles, never by re-painting—because the variables
          reference ramp positions exactly as the JSON does. Theme review
          happens on the mode matrix, not on screenshots of one lucky
          combination.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, the generated layers and their scoping tell the whole story:
        </p>
        <pre>
          <code>{`/* Generated: app/designTokens.scss (structure) */
@layer core, semantic, theme, brand, density;

@layer theme {
  .dark { /* class-pinned dark */ }
  @media (prefers-color-scheme: dark) {
    :root { /* OS-following dark */ }
  }
}

@layer brand {
  [data-brand='ocean'] {
    --semantic-color-action-background-primary-default:
      var(--core-color-palette-teal-500);
  }
  .dark[data-brand='ocean'] { /* dark-mode ocean */ }
}

@layer density {
  [data-density='tight'] {
    --semantic-spacing-stack:
      var(--core-spacing-density-tight-sm);
  }
}`}</code>
        </pre>
        <p>Applying a theme is data, and changing your mind is data:</p>
        <pre>
          <code>{`<html data-brand="ocean" data-density="compact">
  <!-- pin class: light or dark, or omit and follow the OS -->`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Shipping the Eleventh Brand',
    order: 7,
    content: (
      <>
        <p>
          The marketing team needs a &quot;aurora&quot; brand for a product
          launch—green-accented, dark-leaning. Walk the entire cost:
        </p>
        <ol>
          <li>
            <strong>Create the brand file:</strong>{' '}
            <code>brands/aurora.tokens.json</code> ={' '}
            <code>{`{ name: "aurora", accent: "green", density: "compact" }`}</code>{' '}
            — three fields, done. The green ramp already exists,
            contrast-anchored like every family.
          </li>
          <li>
            <strong>Rebuild tokens:</strong> the generator emits the{' '}
            <code>[data-brand=&quot;aurora&quot;]</code> blocks (light and dark)
            into the brand layer. Diff review: two scoped blocks, additive only.
          </li>
          <li>
            <strong>Audit the pairs:</strong> the contrast ledger gains a
            column—aurora&apos;s action-on-white and accent-as-text pairs
            against the same thresholds. Green.500 is a different hex than
            red.500; the ≈4.9:1 claim must be re-derived, not assumed.
          </li>
          <li>
            <strong>Apply:</strong> <code>data-brand=&quot;aurora&quot;</code>{' '}
            on the launch pages. Zero component edits, zero application
            branches, and removing the brand after the launch is deleting one
            attribute.
          </li>
        </ol>
        <p>
          Total system cost: three fields, one build, one audit column. That
          ratio is the entire argument for layered theming—and the measure of
          how far a theme-less system would have had to travel.
        </p>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'constraints-tradeoffs',
    title: 'Constraints & Trade-offs',
    order: 8,
    content: (
      <>
        <ul>
          <li>
            <strong>Theme count vs audit cost:</strong> every theme multiplies
            the contrast matrix and visual QA surface. Ten brands are affordable
            because the audit is token-pair based; thirty would demand generated
            audits, not reviewed ones.
          </li>
          <li>
            <strong>Bundled vs independent axes:</strong> brands defaulting a
            density is ergonomic but couples the axes in users&apos; minds;
            keeping the layers separate preserves override freedom at the cost
            of one more concept to teach.
          </li>
          <li>
            <strong>Attribute scoping vs build-time themes:</strong> runtime{' '}
            <code>[data-brand]</code> switching ships one stylesheet with all
            themes (larger cache, instant switch); build-time theming ships
            smaller sheets per brand (more artifacts, no runtime switch). This
            system chose runtime; a marketing-site-only product might rationally
            choose builds.
          </li>
          <li>
            <strong>OS-following vs pinned modes:</strong> the media query gives
            correct-by-default behavior; the classes give user control. Shipping
            both costs a small precedence decision in the app shell; shipping
            either alone costs a complaint category.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'theming-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Theme conditionals in application code</h3>
        <pre>
          <code>{`// ❌ Logic compensating for failed theming
if (isDarkMode) iconColor = 'white';

// ✅ The token already resolved; consume it
color: var(--ds-card-color-foreground-default);`}</code>
        </pre>
        <h3>2. Hardcoded values that ignore themes</h3>
        <pre>
          <code>{`/* ❌ Correct in exactly one theme */
.hero { background: #0a65fe; }
/* ✅ Resolves per theme */
.hero { background:
  var(--semantic-color-action-background-primary-default); }`}</code>
        </pre>
        <h3>3. Auditing one theme and shipping ten</h3>
        <p>
          The pairs are per-mode per-brand claims. The fix is the ledger
          discipline from the color foundation, run as data, not the memory of
          having once checked.
        </p>
        <h3>4. Themes that change structure</h3>
        <p>
          A &quot;theme&quot; that renames tokens, adds roles, or repoints
          consumers is a system change wearing a theme&apos;s costume. Route it
          through system review; the cascade is not the tool for it.
        </p>
      </>
    ),
  },
  {
    type: 'verification-checklist',
    id: 'verification-checklist',
    title: 'Verification Checklist',
    order: 9,
    content: null,
  },
  {
    type: 'additional-resources',
    id: 'additional-resources',
    title: 'Additional Resources',
    order: 9.5,
    content: (
      <>
        <ul>
          <li>
            <strong>Theming deep-dive</strong> — the worked playground with live
            theme-switching cards (
            <code>/blueprints/foundations/tokens/theming</code>)
          </li>
          <li>
            <strong>Color Foundations</strong> — ramps, roles, and the per-mode
            contrast ledger (<code>/blueprints/foundations/color</code>)
          </li>
          <li>
            <strong>Spacing &amp; Sizing</strong> — the density scales the third
            axis resolves through (<code>/blueprints/foundations/spacing</code>)
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>ui/designTokens/brands/*.tokens.json</code>, the{' '}
            <code>@layer</code> order in the generated{' '}
            <code>app/designTokens.scss</code>
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'cross-references',
    id: 'cross-references',
    title: 'Related Concepts',
    order: 10,
    content: null,
  },
  {
    type: 'assessment-prompt',
    id: 'assessment-prompt',
    title: 'Reflection Questions',
    order: 11,
    content: null,
  },
];

const content = createFoundationContent(pageMetadata, sections);

content.verificationChecklist = [
  {
    id: 'values-not-structure',
    label: 'Themes change values, never structure',
    description: 'Role names and consumers are stable across all themes',
    required: true,
  },
  {
    id: 'no-theme-conditionals',
    label: 'No isDarkMode-style branches in application code',
    description: 'Conditionals compensating for theming are defects',
    required: true,
  },
  {
    id: 'per-theme-audit',
    label: 'Contrast pairs are audited per mode per brand',
    description: 'The ledger grows with the theme count, by data',
    required: true,
  },
  {
    id: 'additive-only',
    label: 'New themes emit additive scoped blocks',
    description: 'Existing rules are never edited to add a theme',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Your CTO asks for a "high-contrast accessibility theme." Which axis is it — a mode, a brand, or something else — and what does the answer imply about the contrast matrix and the audit you owe it?',
    type: 'application',
  },
  {
    question:
      'A teammate defends a hardcoded hero color because "the design is brand-specific." What will break, in what order, and which layer should own the value instead?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The ramp and role machinery themes re-resolve',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The layer architecture themes ride on',
      type: 'foundation',
    },
    {
      slug: 'spacing',
      title: 'Spacing & Sizing Foundations',
      description: 'The density axis and its slot scales',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['22', '18', '02'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function MetaThemingPage() {
  return <FoundationPage content={content} />;
}

/**
 * Foundation Meta: Token Naming & Hierarchy
 * How a deterministic path-to-variable transform, layer namespaces, and
 * role-first naming keep a token system legible at every tier — and
 * why the naming rule is the API.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Token Naming & Hierarchy',
  description:
    'Structure tokens for clarity, reuse, and scalability: layer namespaces, a deterministic path-to-variable transform, role-first semantic naming, and the conventions that let any consumer locate the decision they need without a guide.',
  slug: 'meta/token-naming',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/meta/token-naming',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'token naming, hierarchy, namespaces, design tokens, conventions',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens'],
    next_units: ['color', 'motion'],
    assessment_required: false,
    estimated_reading_time: 13,
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
    expertise: ['Design Systems', 'Tokens', 'Naming'],
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
          Names are the interface. A token&apos;s value can be wrong and fixed
          in one place; a token&apos;s <em>name</em> is read a thousand times—by
          designers choosing, by engineers consuming, by grep at 2am during an
          incident, by the new hire learning where decisions live. Naming that
          must be explained verbally has already failed; the whole point of a
          token system is that structure carries the explanation.
        </p>
        <p>
          Hierarchy is the other half. This system spans three layers and three
          themes, and its single defense against that complexity is that{' '}
          <strong>every name reveals its own position</strong>: which layer it
          lives in, what it decides, and how it got from JSON path to CSS
          variable. None of that is convention-by-memo; it is a deterministic
          transform enforced by linters, which means naming cannot drift even
          when attention does.
        </p>
        <p>
          This page covers the naming system as built here: the DTCG source
          format, the namespace rules in the generator, the path-to-variable
          transform, and the semantic naming grammar.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Format, Namespace, Transform, Grammar',
    order: 4,
    content: (
      <>
        <h3>The Source Format Is DTCG</h3>
        <p>
          Token sources follow the W3C Design Tokens format: groups nest
          objects, and the reserved <code>$</code>-prefixed keys carry the
          metadata—<code>$value</code>, <code>$type</code>,{' '}
          <code>$description</code>, <code>$extensions</code>. The discipline
          that matters for naming:{' '}
          <strong>every path segment is a decision</strong>.{' '}
          <code>color.palette.blue.600</code> reads as
          domain→collection→family→step, and each segment answers a question
          someone will ask.
        </p>

        <h3>Namespace by Rule, Not by Memory</h3>
        <p>
          Which layer a token belongs to is not a judgment call; the generator
          classifies by path pattern (
          <code>utils/designTokens/generators/generateCSSTokens.mjs</code>
          ):
        </p>
        <pre>
          <code>{`// determineNamespace(tokenPath) — core patterns (verified excerpt)
color.(mode|palette|datavis).*      typography.(fontFamily|weight|ramp|…)
spacing.size.*                      elevation.(level|offset|blur|spread).*
opacity.(50…full)                   dimension.(breakpoint|tapTargetMin|…)
shape.(radius|border.*)             motion.(duration|easing|keyframes|delay|stagger)
scale.*  density.*  layer.*  layout.*  icon.*  effect.*

// Everything else — foreground, background, border, action, feedback,
// status, syntax, control, interaction… — is semantic.`}</code>
        </pre>
        <p>
          The rule encodes the layer doctrine: primitives and raw scales are{' '}
          <code>core</code>; anything that names a job is <code>semantic</code>.
          Because it is a rule, the prefix on a CSS variable is trustworthy
          evidence—seeing <code>--core-</code> in component code means a layer
          boundary was crossed, which is exactly what the reference linter
          flags.
        </p>

        <h3>The Transform Is Deterministic</h3>
        <p>
          From JSON path to CSS custom property, four mechanical steps, no
          exceptions:
        </p>
        <pre>
          <code>{`// tokenPathToCSSVar — dots → hyphens, camelCase → kebab,
// strip invalids, collapse hyphens, prepend namespace

color.palette.blue.600      → --core-color-palette-blue-600
motion.duration.extraLong1  → --core-motion-duration-extra-long1
effect.backdropBlur.sm      → --core-effect-backdrop-blur-sm
foreground.primary          → --semantic-color-foreground-primary
action.background.primary.hover
                            → --semantic-color-action-background-primary-hover`}</code>
        </pre>
        <p>
          Determinism is the feature. Anyone holding a token&apos;s source path
          can write its CSS name and be right; anyone reading a CSS name can
          walk back to the source file without a lookup table. Systems where
          that round-trip needs a human acquire a translation layer, and
          translation layers acquire bugs.
        </p>

        <h3>Semantic Grammar: Role, Property, State</h3>
        <p>
          Semantic names follow one grammar:{' '}
          <strong>role → property → state</strong>, deepest last:{' '}
          <code>action.background.primary.hover</code> — the action role, its
          background property, the primary variant, hover state. The test is the
          sentence test:{' '}
          <em>&quot;the hover background of the primary action&quot;</em> reads
          correctly in reverse. Names that fail it— <code>blueDark2</code>,{' '}
          <code>color_new</code>, <code>btnBg</code>—encode implementation order
          instead of intent, and intent is what survives refactors.
        </p>
        <p>
          The component layer adds one wrap:{' '}
          <code>--ds-&lt;component&gt;-&lt;property&gt;</code>, scoped by{' '}
          <code>[data-ds-component]</code>—so{' '}
          <code>--ds-card-color-background-default</code> is unambiguously the
          Card&apos;s opinion, resolvable to a semantic token with a literal
          fallback. Three tiers, one grammar, zero ambiguity about who owns a
          name.
        </p>

        <h3>What the Linters Enforce</h3>
        <p>
          Two scripts make the conventions load-bearing:{' '}
          <code>scripts/check-kebab-token-vars.mjs</code> fails any emitted
          variable that is not kebab-case (the transform&apos;s contract), and{' '}
          <code>scripts/check-token-references.mjs</code> walks token references
          for the layer rules—core references core, semantics reference core,
          components reference semantics. Naming that is linted does not need
          memorizing; it needs only to stay deterministic.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Who Names What',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own semantic grammar—the role words, the state vocabulary,
          the decision of when a variant deserves a name. The Figma variable
          tree mirrors the JSON paths, so a designer&apos;s naming choice is the
          engineer&apos;s consumption contract from day one.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the transform and its invariants: namespace correctness,
          kebab emission, reference direction. When a new token group is added,
          the pattern list in the generator is the only place to register its
          layer—and the only place it can be gotten wrong centrally instead of
          everywhere.
        </p>
        <h3>Governance Impact</h3>
        <p>
          Governance owns renames, which are API breaks: a semantic name with
          consumers is a contract, and changing it is a deprecation cycle, not a
          find-and-replace. The naming hierarchy makes the blast radius of any
          rename visible before it starts—which names are internal (core steps)
          and which are public (semantic roles, component tokens).
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
          In the design tool, the hierarchy appears as the variable tree&apos;s
          shape: collections for domains, groups for families, variables named
          by the same grammar. A designer creating a semantic variable{' '}
          <em>must</em> finish the sentence &quot;this is the … of the …&quot;
          to name it at all—the tree enforces role-first thinking the way the
          JSON does.
        </p>
        <p>
          The review ritual that keeps the two sides identical: pick any
          variable in the file, read its path aloud, and confirm the CSS name
          derives by the transform. Ten seconds, any token, and it catches drift
          the moment it appears rather than the quarter after.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>In code, the round trip is mechanical in both directions:</p>
        <pre>
          <code>{`// Forward: source path → CSS variable (the generator's job)
"motion.duration.extraLong1": { "$value": "1500ms" }
  → --core-motion-duration-extra-long1: 1500ms;

// Reverse: CSS variable → source (any engineer's job, from memory)
--semantic-color-action-background-primary-hover
  → semantic/color.tokens.json → action.background.primary.hover

// The lint floor both directions stand on
npm run tokens:lint
  check-kebab-token-vars.mjs     // emission stays kebab
  check-token-references.mjs     // references stay layer-legal`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Naming a New Token Without Regret',
    order: 7,
    content: (
      <>
        <p>
          A new state arrives: cards need a &quot;dragging&quot; look. Name it
          correctly in five moves:
        </p>
        <ol>
          <li>
            <strong>Layer first:</strong> is this a primitive (new elevation
            level? new shadow?) or a role (existing parts, new intent)? Dragging
            typically composes existing elevation and opacity—the answer is{' '}
            <em>semantic</em>, and the name starts in the semantic file.
          </li>
          <li>
            <strong>Finish the sentence:</strong> &quot;the elevation applied
            while the card is dragged&quot; →{' '}
            <code>elevation.surface.dragging</code>—role (<code>surface</code>),
            state (<code>dragging</code>). If the sentence needs the word
            &quot;blue&quot; or &quot;8px&quot;, stop: that is a value leaking
            into a name.
          </li>
          <li>
            <strong>Check the transform:</strong> the emitted name will be{' '}
            <code>--semantic-elevation-surface-dragging</code>—run the sentence
            test on <em>that</em>, since it is what a thousand future readers
            will see.
          </li>
          <li>
            <strong>Reference legally:</strong> its <code>$value</code> points
            at <code>{`{elevation.level.2}`}</code>—semantic to core, the
            direction the reference linter requires.
          </li>
          <li>
            <strong>Register consumers:</strong> the Card&apos;s scoped token
            wraps it (<code>--ds-card-elevation-dragging</code>) so the name
            gains a component surface without becoming one.
          </li>
        </ol>
        <p>
          Five moves, zero new conventions, and the name is now findable by role
          from either side of the design/code line.
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
            <strong>Path-length vs flatness:</strong> deep paths (
            <code>action.background.primary.hover</code>) carry structure but
            lengthen names and files; flat short names are punchy and lose the
            taxonomy. The system takes depth at the semantic layer because roles{' '}
            <em>are</em> the taxonomy.
          </li>
          <li>
            <strong>Namespace-by-regex vs explicit layer files:</strong>{' '}
            classifying by pattern keeps sources free of boilerplate but
            centralizes the truth in one regex list—a new primitive family that
            forgets to register silently lands in <code>semantic</code>. The
            lint catches direction, not misplacement.
          </li>
          <li>
            <strong>State vocabulary size:</strong> every state word
            (default/hover/active/disabled/dragging…) multiplies names. The
            working rule from the color page applies verbatim: add a state when
            it themes or fails differently, not because a variant exists.
          </li>
          <li>
            <strong>Stable names vs better names:</strong> renaming for taste
            breaks every consumer; the discipline is to live with a
            mediocre-but-stable name and reserve renames for genuine semantic
            errors, executed as deprecations.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'naming-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Values in names</h3>
        <pre>
          <code>{`// ❌ The name expires when the value changes
"spacing.size.16px"  /  --color-blue-600-text

// ✅ Name the decision; let the value be data
"spacing.size.06"    /  --semantic-color-foreground-primary`}</code>
        </pre>
        <h3>2. Implementation names for semantic roles</h3>
        <pre>
          <code>{`// ❌ Says where it renders, not what it decides
"sidebarAccentBevel"

// ✅ Role → property → state
"elevation.surface.dragging"`}</code>
        </pre>
        <h3>3. Synonym drift</h3>
        <p>
          <code>text</code>/<code>foreground</code>/<code>label</code> for the
          same role; <code>gap</code>/<code>stack</code>/<code>spacing</code>{' '}
          for the same property. Every synonym doubles the search space and
          halves the trust. One glossary, enforced in review, is the fix.
        </p>
        <h3>4. Skipping the component tier</h3>
        <pre>
          <code>{`/* ❌ Global semantics consumed raw by components */
.card { box-shadow: var(--semantic-elevation-surface-dragging); }
/* ✅ The component names its own surface */
.card { box-shadow: var(--ds-card-elevation-dragging); }`}</code>
        </pre>
        <h3>5. Hand-written variable names</h3>
        <p>
          A CSS variable typed from memory that the transform wouldn&apos;t
          produce (wrong hyphen, kept camelCase) silently resolves to nothing—or
          worse, to a fallback. The kebab lint plus copy-from-source habit
          closes it.
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
            <strong>Atomic vs Semantic</strong> — the layer doctrine these names
            encode (<code>/blueprints/foundations/meta/atomic-vs-semantic</code>
            )
          </li>
          <li>
            <strong>Core vs Semantic deep-dive</strong> — the worked layer
            boundary (
            <code>/blueprints/foundations/tokens/core-vs-semantic</code>)
          </li>
          <li>
            <strong>DTCG format</strong> — the source syntax (
            <code>https://tr.designtokens.org/format/</code>)
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>utils/designTokens/generators/generateCSSTokens.mjs</code>{' '}
            (the transform), <code>scripts/check-*-token-*.mjs</code> (the
            lints)
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
    id: 'role-grammar',
    label: 'Semantic names pass the sentence test',
    description: 'Role → property → state, readable in reverse',
    required: true,
  },
  {
    id: 'no-values-in-names',
    label: 'No values leak into names',
    description: 'Hex, px, and step numbers stay in $value data',
    required: true,
  },
  {
    id: 'transform-round-trips',
    label: 'Every CSS name derives from its source path by the transform',
    description: 'Deterministic both directions, no lookup table',
    required: true,
  },
  {
    id: 'one-glossary',
    label: 'One word per concept across design and code',
    description: 'No synonym drift between tools and sources',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'A teammate proposes renaming foreground.secondary to text.dim because it is shorter. Walk the full cost: consumers, themes, tools, and the conditions under which the rename is nonetheless correct.',
    type: 'application',
  },
  {
    question:
      'You find --semantic-color-brand-blue-hover in a stylesheet. List every rule this name violates and reconstruct what its author probably needed.',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The layer architecture the naming system describes',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The ramp and role vocabulary these names point at',
      type: 'foundation',
    },
    {
      slug: 'component-architecture',
      title: 'Component Architecture',
      description: 'Why the --ds-* component tier exists as a naming wrap',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['34', '18', '02'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function MetaTokenNamingPage() {
  return <FoundationPage content={content} />;
}

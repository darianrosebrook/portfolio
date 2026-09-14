/**
 * Foundation Tooling: Code-Side
 * The pipeline that carries tokens into code: a DTCG-native build with
 * schema validation, deterministic generation to CSS and types, layer
 * lints, and accessibility rules wired into the lint config — plus the
 * industry tools that occupy the same niches.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Code Tooling',
  description:
    'Integrate tokens into code with a validated pipeline: DTCG schema checks, deterministic generation to CSS custom properties and types, layer-boundary lints, accessibility rules in the lint config, and component contracts enforced at push time.',
  slug: 'tooling/code',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/tooling/code',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'code tooling, token pipeline, linters, DTCG, validators',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['engineering', 'design'],
    prerequisites: ['tokens'],
    next_units: ['motion', 'color'],
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
    expertise: ['Design Systems', 'Tooling', 'Build Pipelines'],
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
          A token system in code is only as strong as its pipeline.
          Hand-maintained CSS variables rot on the first busy week; unvalidated
          token JSON rots silently until a typo&apos;s reference resolves to
          nothing in production. The code-side tooling exists to make
          correctness cheaper than drift: schemas that reject malformed tokens
          at build time, generation that makes the emitted CSS deterministic,
          and lints that catch the boundary violations review misses.
        </p>
        <p>
          This repository&apos;s pipeline is deliberately DTCG-native and
          custom—the format is the standard W3C shape, but the build is
          purpose-built around the layering and brand machinery you have met in
          the foundations pages. Where an industry tool occupies the same niche
          (Style Dictionary for generation, Tailwind for consumption ergonomics,
          eslint-plugin-jsx-a11y for markup accessibility), this page names it
          and shows what this system does instead and why.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Validate, Generate, Lint, Enforce',
    order: 4,
    content: (
      <>
        <h3>The Build: Compose, Then Emit</h3>
        <p>
          The pipeline is two commands in <code>package.json</code>:
        </p>
        <pre>
          <code>{`tokens:build       tsx utils/designTokens/runners/build.ts
                  && node generateCSSTokens.mjs
tokens:build:full  same, with --no-incremental (clean builds)

// build.ts composes: core + semantic + brands → designTokens.json
// generateCSSTokens.mjs emits: app/designTokens.scss
//   (cascade layers, .light/.dark, [data-brand], [data-density])`}</code>
        </pre>
        <p>
          Incremental mode skips unchanged work; the full mode is the CI-grade
          path and also gates <code>next build</code> itself (<code>build</code>{' '}
          runs the token build first, so a token error is a build error, not a
          runtime surprise). The emitted stylesheet is the one you have seen
          throughout: 316 core custom properties, semantic aliases, theme and
          brand layers—the whole theming architecture as a build artifact.
        </p>

        <h3>Validation Before Generation</h3>
        <p>
          The token sources are schema-checked with a W3C DTCG validator (
          <code>w3c-validator.mjs</code> plus the repo schema) covering the
          format&apos;s invariants—types match values, references resolve, no
          cycles. Around it live the repo&apos;s own checks, runnable as a
          single chain:
        </p>
        <pre>
          <code>{`npm run validate   # the full chain
  contracts:validate      # component contracts well-formed
  contracts:traceability  # bindings resolve to real tokens
  contracts:tokens        # scoped CSS matches contracts
  tokens:lint             # kebab vars + reference directions
  styles:tokens           # style values match tokens
  typecheck && lint && format:check`}</code>
        </pre>
        <p>
          The design principle: every claim the foundations pages
          make—references flow one way, names are kebab, components consume
          their own tier—has a command that checks it. Docs that cannot be
          executed are suggestions; these are gates.
        </p>

        <h3>The Layer Lints</h3>
        <p>
          Two scripts do the boundary enforcement:
          <code>check-token-references.mjs</code> walks every token reference
          and fails direction violations (core depending on semantic, components
          reaching past their scope), and{' '}
          <code>check-kebab-token-vars.mjs</code> holds the emitted naming to
          the deterministic transform. Together they make the atomic-vs-semantic
          doctrine mechanical: the layer boundary is not a diagram, it is a
          failing check.
        </p>

        <h3>Accessibility in the Lint Config</h3>
        <p>
          Markup-level accessibility rides the standard ESLint plugin—
          <code>next/core-web-vitals</code> registers <code>jsx-a11y</code>, and
          this repo promotes key rules to hard errors:
        </p>
        <pre>
          <code>{`// eslint.config.mjs (excerpt)
'jsx-a11y/alt-text': 'error',
'jsx-a11y/anchor-has-content': 'error',
'jsx-a11y/anchor-is-valid': 'error',
// …with axe-core (wcag2a, wcag2aa, best-practice) in the
// vitest setup for rendered-output auditing.`}</code>
        </pre>
        <p>
          The split of labor is deliberate: jsx-a11y catches the static sins
          (missing alt, empty anchors) at lint speed; axe catches the rendered
          sins (contrast, roles, names) in the component tests; and the token
          validator catches the numeric sins (pair ratios) at build time. Three
          layers, no gaps between &quot;looks fine&quot; and
          &quot;checked.&quot;
        </p>

        <h3>The Industry Tools, Honestly Placed</h3>
        <ul>
          <li>
            <strong>Style Dictionary</strong> is the category-standard generator
            (JSON in, any platform out). This repo&apos;s generator is custom
            because the layering—brand accent remapping, density slots, the
            core/semantic namespace rule—is opinionated enough that a bespoke
            150-line transform beats a configured framework. Teams starting
            fresh should evaluate Style Dictionary first and go custom only at
            the same provocation.
          </li>
          <li>
            <strong>Tailwind</strong> maps tokens to utility ergonomics. This
            repo keeps CSS custom properties and scoped component tokens
            instead—consumption stays semantic (<code>var(--ds-card-…)</code>)
            rather than utility-composed, which preserves the layer boundary in
            the usage syntax itself.
          </li>
          <li>
            <strong>eslint-plugin-jsx-a11y</strong> — used here as above, the
            standard choice, promoted to errors.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Who Owns the Pipeline',
    order: 5,
    content: (
      <>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the pipeline end to end: build scripts, validators,
          generators, and the discipline that the generated artifacts are never
          hand-edited. A pipeline PR changes how every token ships and reviews
          accordingly.
        </p>
        <h3>Design Impact</h3>
        <p>
          Designers consume the pipeline&apos;s outputs on their side (mirrored
          variables, generated libraries) and author its inputs (token JSON or
          plugin-pushed values, per the authority decision). The validation
          chain is the designer&apos;s error message as much as the
          engineer&apos;s.
        </p>
        <h3>Governance Impact</h3>
        <p>
          Governance owns which checks block versus warn, and when the chain
          runs (pre-commit for speed, pre-push and CI for certainty—the
          automation page&apos;s territory). A check nobody can bypass is a
          policy; everything else is advice.
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
          To a designer, the pipeline shows up as reliability: the variables in
          the file always match the CSS in the product, because both are
          projections of the same validated JSON. When the file says{' '}
          <code>neutral/600</code> and the inspector says{' '}
          <code>--core-color-palette-neutral-600</code>, that agreement is the
          pipeline working—and the moment it breaks, the chain says where.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>The developer loop against the pipeline, end to end:</p>
        <pre>
          <code>{`# Author a token change (JSON), then:
npm run tokens:build        # compose + emit (fast, incremental)
npm run validate            # the full claim chain

git commit                  # lint-staged: prettier+eslint on touched files
git push                    # pre-push: contracts + lint + the heavy checks

# What you must never do:
# - edit app/designTokens.scss by hand (generated; next build overwrites)
# - edit ui/components/*/​*.tokens.css by hand (generated from contracts)
# - merge with a failing validate chain ("just this once" is policy debt)`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: A Bad Token, Caught Three Ways',
    order: 7,
    content: (
      <>
        <p>
          Watch the tooling catch one realistic mistake—a semantic token
          referencing a hex instead of a core path:
        </p>
        <ol>
          <li>
            <strong>Schema/validation:</strong> <code>tokens:schema</code> and
            the DTCG validator reject the malformed <code>$value</code> before
            anything emits—the cheapest catch, at author time.
          </li>
          <li>
            <strong>Layer lint:</strong> had it slipped through as a reference
            to the wrong layer, <code>check-token-references</code> fails the
            direction; the error names the token and the rule, not a stack trace
            three systems away.
          </li>
          <li>
            <strong>Traceability:</strong> <code>contracts:traceability</code>{' '}
            catches the consumer side—any component binding whose{' '}
            <code>resolvesTo</code> no longer exists—so the blast radius is
            enumerated by the chain, not discovered in a screenshot review.
          </li>
        </ol>
        <p>
          Three nets, each cheaper than the one below it. That layering of
          checks is the entire craft of pipeline design: catch wrong at the
          moment it is cheapest to be right.
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
            <strong>Custom pipeline vs framework:</strong> bespoke generators
            fit the layering exactly and cost maintenance; Style Dictionary buys
            community support and costs configuration ceiling. This repo chose
            custom at the point its opinions outgrew configuration.
          </li>
          <li>
            <strong>Check speed vs check coverage:</strong> the fast checks run
            on every commit (lint-staged), the chain on push. Moving a slow
            check earlier buys safety with friction—the placement is a decision,
            not a default.
          </li>
          <li>
            <strong>Errors vs warnings:</strong> every rule promoted to error
            removes a judgment call from review; every one left warning retains
            flexibility. The ledger of which rules sit where is policy worth
            reviewing quarterly.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'code-tooling-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Editing generated artifacts</h3>
        <pre>
          <code>{`/* ❌ app/designTokens.scss — AUTO-GENERATED, overwritten next build */
/* ✅ Edit the JSON, run the build, review the generated diff */`}</code>
        </pre>
        <h3>2. Disabling a lint to ship</h3>
        <p>
          <code>eslint-disable</code> on a token rule is policy debt with
          interest—the boundary erodes one exception at a time. Waivers belong
          in configuration with expiry, not in code comments forever.
        </p>
        <h3>3. Validating only the happy path</h3>
        <p>
          A chain that never sees malformed input stops being trusted. Feed it
          broken fixtures in tests (the repo&apos;s validator tests do) or it
          will silently rot.
        </p>
        <h3>4. Pipeline drift from docs</h3>
        <p>
          When a check changes meaning, the foundations pages that cite it
          change in the same commit—or the docs become a second, wronger source
          of truth.
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
            <strong>Automation &amp; CI/CD</strong> — where the chain runs (
            <code>/blueprints/foundations/tooling/automation</code>)
          </li>
          <li>
            <strong>Token pipeline deep-dives</strong> — build outputs, the
            resolver module, schema validation (
            <code>/blueprints/foundations/tokens</code> and children)
          </li>
          <li>
            <strong>Style Dictionary</strong> — the category-standard generator
            (<code>https://styledictionary.com</code>)
          </li>
          <li>
            <strong>The sources</strong> —{' '}
            <code>utils/designTokens/runners/build.ts</code>,{' '}
            <code>generators/generateCSSTokens.mjs</code>,{' '}
            <code>eslint.config.mjs</code>, <code>scripts/*</code>
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
    id: 'schema-gated',
    label: 'Token changes pass schema validation before emitting',
    description: 'Malformed JSON fails at build, not in production',
    required: true,
  },
  {
    id: 'generated-untouched',
    label: 'Generated artifacts are never hand-edited',
    description: 'JSON and contracts are the only writable sources',
    required: true,
  },
  {
    id: 'chain-green',
    label: 'The validate chain is green on every merge',
    description: 'Contracts, references, kebab, styles, types, lint',
    required: true,
  },
  {
    id: 'a11y-three-layers',
    label: 'Accessibility checks run at lint, test, and build',
    description: 'jsx-a11y errors, axe in vitest, pair validation in the chain',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Trace one token from JSON edit to production CSS: name every check it passes, in order, and what each is protecting against.',
    type: 'application',
  },
  {
    question:
      'Your team proposes replacing the custom generator with Style Dictionary. List what you would gain, what you must recreate, and which repo-specific invariants would be hardest to express.',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The layers the pipeline validates and emits',
      type: 'foundation',
    },
    {
      slug: 'component-architecture',
      title: 'Component Architecture',
      description: 'The contracts the traceability checks walk',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The pair claims the validator enforces',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['20', '27', '02'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function ToolingCodePage() {
  return <FoundationPage content={content} />;
}

/**
 * Foundation Tooling: Design-Side
 * The tools that define, test, and maintain design-side foundations:
 * token plugins and Figma variables that mirror the token layers,
 * contrast checking at the point of choice, and libraries whose
 * structure keeps the design file honest about the system.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Design Tooling',
  description:
    'Keep design-side foundations definable and testable: token plugins and Figma variables that mirror the core/semantic/component layers, contrast checking at the point of choice, and library structure that makes off-system design visible.',
  slug: 'tooling/design',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/tooling/design',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'design tooling, Figma variables, token plugins, contrast',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens'],
    next_units: ['color', 'motion'],
    assessment_required: false,
    estimated_reading_time: 12,
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
    expertise: ['Design Systems', 'Tooling', 'Figma'],
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
          Design tools are where token systems go to be reborn as palettes. The
          failure is rarely malicious: a designer under deadline grabs the
          nearest swatch, the file ships, and six months later nobody can say
          which colors are the system. Tooling is the counter-pressure—when the{' '}
          <em>fastest</em> way to paint is also the system way, drift stops
          being a discipline problem and becomes a tooling property.
        </p>
        <p>
          The other half is verification. The same WCAG math the code side
          enforces in CI exists as design-side plugins, so a pair can be checked
          while the color is still a decision rather than a deployment. When
          both sides compute the same numbers from the same source values,
          contrast stops being a hand-off argument.
        </p>
        <p>
          This page covers the design-side tooling as this repository practices
          it—and the tool categories that earn their keep in any tokenized
          system.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Variables, Generators, Checkers, Libraries',
    order: 4,
    content: (
      <>
        <h3>Figma Variables as the Token Mirror</h3>
        <p>
          Figma variables are the design tool&apos;s native token primitive:
          named, aliased, and mode-aware. The mapping that keeps file and code
          aligned is structural:
        </p>
        <ul>
          <li>
            <strong>Variable collections mirror core groups</strong> — a
            collection per domain (color palettes, spacing, motion), variables
            named by the same paths (<code>brand.primary/500</code>) so
            &quot;600&quot; means the same thing in both worlds.
          </li>
          <li>
            <strong>Aliases mirror semantic references</strong> — a semantic
            variable&apos;s value <em>is</em> the core variable, exactly as{' '}
            <code>foreground.primary</code> references{' '}
            <code>{`{color.mode.dark}`}</code> in the JSON.
          </li>
          <li>
            <strong>Modes mirror theme resolution</strong> — light/dark modes
            re-bind the alias per mode, matching{' '}
            <code>design.paths.light/dark</code>; brand collections mirror the
            brand files&apos; accent remapping.
          </li>
        </ul>
        <p>
          The test of the mirror is the round trip: any variable in the file,
          read as a path, emits the CSS name the generator would produce. When
          that holds, the design file is a second consumer of the token system
          rather than a parallel source of truth.
        </p>

        <h3>Token Plugins: The Pipeline&apos;s Design End</h3>
        <p>
          Plugins bridge file and pipeline in both directions. Push-style
          plugins (Tokens Studio for Figma is the category leader) serialize
          variables to token JSON—the design tool becomes an authoring surface
          for the same files the build consumes. Pull-style pipelines (this
          repository&apos;s shape) generate the design-side libraries from the
          token sources, as the Adaptive-DS-Colors plugin does for ramps:
          contrast-keyed generation in the tool, verified values in the repo.
          The choice is authority—<em>which side is the source</em>—and it must
          be exactly one side.
        </p>

        <h3>Contrast Checking at the Point of Choice</h3>
        <p>
          Design-side contrast plugins implement the same relative luminance
          math the repo&apos;s <code>tokenValidator.ts</code> enforces (AA 4.5:1
          / 3:1, AAA 7:1 / 4.5:1). The workflow worth institutionalizing: pair
          checks <em>inside</em> the design file against the role pairs—
          <code>foreground.secondary</code> on <code>background.primary</code>{' '}
          (≈7.5:1 light, ≈9.5:1 dark)—so the numbers a designer sees while
          choosing are the numbers CI will compute later. Disagreements between
          the two are tooling bugs, not judgment calls.
        </p>

        <h3>Library Structure as Drift Detector</h3>
        <p>
          The component library&apos;s structure does quiet enforcement:
          component variants&apos; layers named for slots (matching the contract
          anatomy), painted only with bound variables. Off-system color becomes{' '}
          <em>visibly</em>
          off—any raw swatch in a layer is a defect by definition, findable by
          inspection. The enforcement is cheap because it is structural; nobody
          audits what the structure already prevents.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Who Owns Which Tool',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the file-to-mirror fidelity: variable naming, mode
          wiring, and the discipline of painting only with variables. The
          tooling makes the discipline easy; the review keeps it true.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the bridge code—serializers, generators, and the sync
          scripts that keep one side authoritative. The invariants (round trips,
          no dual sources of truth) are code review questions with tooling
          answers.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          Accessibility owns the checker configuration: which pairs are checked,
          at which level, per mode—so the design-side numbers and the CI numbers
          cannot silently diverge.
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
          The design-side day: open the library, paint with variables bound by
          contract, check pairs with the contrast plugin, and flag anything the
          vocabulary cannot express as a system gap rather than a local
          override. The file&apos;s structure—the collections, the modes, the
          slot-named layers—is the tooling; it works even when nobody is
          watching.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          The code-side guarantee underneath: one source, mechanical emission,
          and numbers that match the plugin&apos;s:
        </p>
        <pre>
          <code>{`// The authority is the JSON; the file mirrors it
"foreground.secondary": {
  "$value": "{color.palette.neutral.600}",
  "$extensions": {
    "design.paths.dark": "{color.palette.neutral.300}"
  }
}

// Emitted (and what the Figma alias resolves to in each mode):
//   light: #555555 on #ffffff → 7.45:1
//   dark:  #aeaeae on #000000 → 9.47:1
// Same math, plugin and validator — one answer.`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Onboarding a Designer to the Toolchain',
    order: 7,
    content: (
      <>
        <p>
          The first week on a tokenized toolchain, compressed to four moves:
        </p>
        <ol>
          <li>
            <strong>Paint only with variables</strong>—if a color, size, or
            radius cannot be found in the collections, that is a system gap
            report, not a raw-swatch situation.
          </li>
          <li>
            <strong>Switch modes before judging dark mode</strong>— never
            re-paint for dark; the aliases re-resolve. If the result is wrong,
            the fix is a paths entry, not the file.
          </li>
          <li>
            <strong>Check pairs while choosing</strong>—run the contrast plugin
            on any new pairing before it leaves the canvas; the thresholds are
            the same four numbers from the foundations pages.
          </li>
          <li>
            <strong>Round-trip one token a week</strong>—pick any variable, read
            its path, confirm the CSS name. Two minutes that keep the mirror
            honest and the drift caught.
          </li>
        </ol>
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
            <strong>Push vs pull authority:</strong> file-authoring plugins put
            designers in control and risk schema drift; pipeline-generated
            libraries guarantee fidelity and make the tool a viewer. This repo
            pulls; teams with strong design-engineering overlap can push safely.
          </li>
          <li>
            <strong>Variable coverage vs tool limits:</strong> Figma variables
            cannot express every token shape (keyframe strings, structured
            shadows); the unexpressible stays code-side and documented, never
            approximated in-file.
          </li>
          <li>
            <strong>Checker strictness vs designer autonomy:</strong> failing
            builds on contrast in the design tool is premature; surfacing
            numbers is the right pressure at the point of choice, with CI as the
            hard gate.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'design-tooling-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Two sources of truth</h3>
        <p>
          Variables hand-edited away from the pipeline (or JSON hand-edited away
          from the plugin) fork the system at the file boundary. One side
          writes; the other reads.
        </p>
        <h3>2. Detached styles</h3>
        <pre>
          <code>{`// Bad: A style whose fill is a literal
Fill: #717171
// Good: A style bound to the variable
Fill: neutral/500  (variable)`}</code>
        </pre>
        <h3>3. Mode-painting dark themes</h3>
        <p>
          Duplicate frames with re-painted colors defeat the entire mode
          mechanism and diverge from the JSON paths on the next change.
        </p>
        <h3>4. Plugin numbers taken on faith</h3>
        <p>
          A checker whose math or background assumption differs from the
          validator produces confident wrong answers. Calibrate once against the
          same pairs CI checks.
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
            <strong>Code Tooling</strong> — the pipeline this file mirrors (
            <code>/blueprints/foundations/tooling/code</code>)
          </li>
          <li>
            <strong>Color Foundations</strong> — the pair numbers the checkers
            share (<code>/blueprints/foundations/color</code>)
          </li>
          <li>
            <strong>Theming Strategies</strong> — what modes and brands mean
            mechanically (<code>/blueprints/foundations/meta/theming</code>)
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
    id: 'one-authority',
    label: 'Exactly one side authors tokens; the other mirrors',
    description: 'File-to-pipeline or pipeline-to-file, never both',
    required: true,
  },
  {
    id: 'variables-only',
    label: 'Library layers paint only with bound variables',
    description: 'Raw swatches are visible defects by definition',
    required: true,
  },
  {
    id: 'modes-not-repaints',
    label: 'Dark mode and brands switch modes, never re-paint',
    description: 'Aliases re-resolve exactly as design.paths do',
    required: true,
  },
  {
    id: 'calibrated-checkers',
    label: 'Contrast plugins agree with the CI validator',
    description: 'Same math, same pairs, one answer',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Audit a Figma file you know: what fraction of fills/sizes are variables, and what does the non-variable remainder predict about the codebase it ships to?',
    type: 'application',
  },
  {
    question:
      'Your team wants designers to author tokens in-file for speed. What must be true about schema validation and review before that is safe, and what failure does it make structurally impossible to see?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The layers the toolchain mirrors',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The pair ledger the checkers share',
      type: 'foundation',
    },
    {
      slug: 'motion',
      title: 'Motion & Duration Foundations',
      description: 'The token shapes design tools cannot fully express',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['20', '22', '32'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function ToolingDesignPage() {
  return <FoundationPage content={content} />;
}

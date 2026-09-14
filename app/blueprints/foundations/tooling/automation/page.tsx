/**
 * Foundation Tooling: Automation & CI/CD
 * Where the checks run: staged-file hooks for speed, pre-push gates
 * for certainty, deployment as the final consumer — and the design
 * for growing local gates into continuous integration without
 * losing either property.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Automation & CI/CD',
  description:
    'Automate token distribution, theme switching, and documentation updates: staged hooks for speed, pre-push gates for certainty, deployment pipelines that build from source, and the honest design for growing local automation into CI.',
  slug: 'tooling/automation',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/tooling/automation',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'automation, CI, hooks, pipelines, deployment',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['engineering', 'governance'],
    prerequisites: ['tokens'],
    next_units: ['motion', 'color'],
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
    expertise: ['Design Systems', 'CI/CD', 'Automation'],
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
          A check that only runs when someone remembers is a habit, not a
          system. The foundations pages have made claims throughout—references
          flow one way, contracts stay traceable, pairs pass per mode—and every
          one of those claims is only as real as the automation that re-verifies
          it on <em>every</em> change, including the rushed ones. Especially the
          rushed ones.
        </p>
        <p>
          The second reason is distribution. A token change that requires manual
          steps—rebuild here, copy a file there, ping the design team—will
          eventually skip one, and the skip is always discovered in production.
          Automation makes the correct path the <em>only</em> path: the build
          regenerates the artifacts, the deploy consumes them, the docs rebuild
          from the same sources.
        </p>
        <p>
          This page covers the automation as it exists in this repository—hooks,
          gates, and the deploy pipeline—and the concrete design for growing it,
          because the honest state is: strong local automation, continuous
          integration as the next step rather than a present fact.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Speed Layers, Certainty Layers, Distribution',
    order: 4,
    content: (
      <>
        <h3>Layer 1: Commit-Time (Fast, Touched-Files Only)</h3>
        <p>
          On every commit, lint-staged runs only against the files in the
          commit:
        </p>
        <pre>
          <code>{`// .lintstagedrc.json — the staged-file contract
"*.{js,jsx,ts,tsx}": ["prettier --write", "eslint --fix --max-warnings 0"]
"*.{css,scss}":       ["prettier --write", "stylelint --fix --allow-empty-input"]
"*.{json,md,yml,yaml}": ["prettier --write"]`}</code>
        </pre>
        <p>
          The design principle is <strong>latency budgeting</strong>:
          commit-time checks must be fast enough that nobody is tempted to{' '}
          <code>--no-verify</code>, so they are scoped to touched files and
          limited to fixing (formatting) and fast judging (lint). Anything
          slower moves up a layer.
        </p>

        <h3>Layer 2: Push-Time (Slow, Whole-System)</h3>
        <p>
          The pre-push hook is where certainty lives—whole-repo checks that are
          too slow for every commit but cheap enough for every push:
        </p>
        <pre>
          <code>{`// .husky/pre-push (shape)
node scripts/validate-contracts.mjs   # contract well-formedness
npm run lint                          # whole-repo lint
# …and the heavy gates from the validate chain, run where
#   failure blocks the push, not the commit`}</code>
        </pre>
        <p>
          This is the layer that makes the foundations claims <em>gates</em>: a
          layer-boundary violation cannot leave the machine quietly. The
          tradeoff is deliberate—a push that takes minutes is a tax everyone
          pays gladly exactly until they bypass it, which is why the fast layer
          exists to keep the bypass culture from starting.
        </p>

        <h3>Layer 3: Build-and-Deploy (The Distribution)</h3>
        <p>
          Deployment is where automation stops being a gate and becomes a
          producer. This repository&apos;s build composes the full chain:{' '}
          <code>next build</code> runs the token build first, so the deployed
          CSS is always regenerated from the JSON sources—the distribution of
          tokens, themes, and documentation updates is a property of the
          pipeline, never a manual step:
        </p>
        <pre>
          <code>{`"build": "npm run tokens:build:full && next build"

// Deploy (Vercel): push to main → build → the artifacts ship:
//   app/designTokens.scss   (regenerated, never hand-edited)
//   component token CSS     (generated from contracts)
//   documentation           (built from the same sources)`}</code>
        </pre>
        <p>
          Theme switching needs nothing from this layer—brands and density are
          runtime data attributes—but the <em>arrival</em> of a new brand is a
          build event, which is precisely the point: the eleventh brand of the
          theming page costs its three fields plus one green pipeline.
        </p>

        <h3>The Honest Gap: Continuous Integration</h3>
        <p>
          What this repository does <em>not</em> have yet is hosted CI—no GitHub
          Actions workflows run the chain on pull requests and main. The local
          gates are strong, but local gates share a failure mode: they run on
          the machines of the willing. The growth design is mechanical because
          the chain already exists as commands:
        </p>
        <pre>
          <code>{`# .github/workflows/validate.yml (the shape to grow into)
on: [pull_request, push: { branches: [main] }]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm run tokens:build:full   # regeneration is green
      - run: npm run validate            # the whole claim chain
      - run: npm run test                # unit + rendered axe
      - run: npm run test:e2e            # the browser contract`}</code>
        </pre>
        <p>
          The reason this is a small step rather than a project: every check is
          already a command with a clean exit code. Automation that must be{' '}
          <em>invented</em> for CI is a rewrite; automation that must be{' '}
          <em>wired</em> is an afternoon. The discipline that got the chain to
          command-shaped is the actual work, and it is done.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Who Owns Which Layer',
    order: 5,
    content: (
      <>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the hooks&apos; contents and the pipeline
          definitions—and the latency budget that keeps each layer tolerable. A
          gate that everyone bypasses is worse than no gate: it trains the
          bypass.
        </p>
        <h3>Governance Impact</h3>
        <p>
          Governance owns placement policy: which checks block commits, pushes,
          merges, or deploys. The rule of thumb this repo follows—fix-fast at
          commit, judge-slow at push, verify-everything at merge—is policy,
          revisable, and worth revisiting when check runtimes change.
        </p>
        <h3>Team Impact</h3>
        <p>
          The team owns the culture the automation encodes:
          <code>--no-verify</code> is always available, and its rare, justified
          use (with a follow-up issue) is the healthy pattern. Zero bypasses
          with resentment means the gates are miscalibrated, not that the team
          is virtuous.
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
          To the design side, automation shows up as delivery reliability: a
          token change merged on Tuesday is in every consumer—CSS, mirrored
          variables on the next library sync, documentation—without a
          coordination message. The automation replaces the sync meeting with a
          green check, which is the only meeting replacement that actually
          works.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>The wiring, from the developer&apos;s point of view:</p>
        <pre>
          <code>{`npm run tokens:build        # author-time: fast regeneration
git add … && git commit    # lint-staged: touched files, fix + fast lint
git push                   # pre-push: contracts, whole-repo gates
# main updated → deploy builds from source, artifacts ship

# The invariant the wiring enforces:
#   no token JSON reaches main whose artifacts were not regenerated
#   no contract violation leaves a machine without a named failure`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Wiring the Missing CI Layer',
    order: 7,
    content: (
      <>
        <p>Turn the honest gap into an afternoon, in four moves:</p>
        <ol>
          <li>
            <strong>Inventory the chain as commands:</strong>{' '}
            <code>validate</code>, <code>test</code>, <code>test:e2e</code>,{' '}
            <code>tokens:build:full</code> — each already exits cleanly.
            Anything not command-shaped (a manual step, a &quot;remember
            to&quot;) becomes a script first; that is the only real work.
          </li>
          <li>
            <strong>Pick the blocking set per event:</strong> PRs block on the
            full chain; pushes to main additionally run e2e. Keep deploy-preview
            environments for visual review—automation verifies claims, humans
            verify taste.
          </li>
          <li>
            <strong>Budget the runtime:</strong> if the chain takes twenty
            minutes, split jobs (tokens → lint/type → test → e2e) so failures
            report fast and parallels buy minutes. A slow CI is a bypassed CI.
          </li>
          <li>
            <strong>Retire the duplicated local gates gradually:</strong> keep
            pre-push fast checks for feedback, move the certainty set to CI once
            it reliably runs there—two enforcement points for the same check is
            maintenance debt in the other direction.
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
            <strong>Local gates vs hosted CI:</strong> local is instant and
            private; hosted is unbypassable and auditable. The mature answer is
            both, with the split by latency, and this repo is mid-journey by
            design.
          </li>
          <li>
            <strong>Blocking vs advisory checks:</strong> every blocking check
            is a bet that the class of error it catches is cheaper than the
            friction it adds. Review the bet when check runtimes or team size
            changes.
          </li>
          <li>
            <strong>Pipeline as sole distributor vs published packages:</strong>{' '}
            rebuilding everything from source at deploy (this repo) guarantees
            coherence and costs rebuild time; publishing versioned token
            packages optimizes consumers&apos; installs and adds a versioning
            surface to govern.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'automation-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Gates slow enough to bypass</h3>
        <pre>
          <code>{`# Bad: Whole-repo e2e on every commit — bypass culture incoming
# Good: Touched-file fixes at commit, chain at push, e2e at merge`}</code>
        </pre>
        <h3>2. Manual steps with signposts</h3>
        <p>
          A README saying &quot;remember to rebuild tokens&quot; is a step that
          will be skipped under deadline. If it matters, it is a hook or a
          pipeline stage; if it is a README, it is optional.
        </p>
        <h3>3. Checks nobody can fail</h3>
        <p>
          A gate that has never been red is untested—feed it a broken fixture
          deliberately (in a sandbox branch) and confirm it blocks. Trust in
          automation is earned by watching it refuse.
        </p>
        <h3>4. Distributed truth</h3>
        <p>
          Artifacts built anywhere other than the pipeline (a laptop&apos;s
          output committed by hand) reintroduce the dual-source problem the
          pipeline exists to kill. Generated files merge only from generated
          runs.
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
            <strong>Code Tooling</strong> — the checks these layers run (
            <code>/blueprints/foundations/tooling/code</code>)
          </li>
          <li>
            <strong>Component standards</strong> — the contract validation the
            gates enforce (<code>/blueprints/component-standards</code>)
          </li>
          <li>
            <strong>GitHub Actions documentation</strong> — the hosting layer
            this page grows into (<code>https://docs.github.com/actions</code>)
          </li>
          <li>
            <strong>The sources</strong> — <code>.husky/pre-push</code>,{' '}
            <code>.lintstagedrc.json</code>, the <code>validate</code> script in{' '}
            <code>package.json</code>
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
    id: 'every-change-checked',
    label: 'Every change re-runs the claims it could break',
    description: 'Commit-time fast checks; push-time certainty gates',
    required: true,
  },
  {
    id: 'regeneration-only',
    label: 'Generated artifacts ship only from pipeline runs',
    description: 'No hand-committed generated files',
    required: true,
  },
  {
    id: 'latency-budgeted',
    label: 'Each layer runs within its tolerance budget',
    description: 'Gates slow enough to matter, fast enough to keep',
    required: true,
  },
  {
    id: 'unbypassable-core',
    label: 'The core chain runs somewhere nobody can skip',
    description: 'Hosted CI on merge — the growth path this repo has wired',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'List the checks that run on your current project per commit, push, and merge. Which foundations claims have no check at all — and what would the command for one of them look like?',
    type: 'application',
  },
  {
    question:
      'A teammate argues pre-push hooks are enough and CI is bureaucracy. Steelman the position, then name the two failure modes only hosted CI prevents.',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'The sources the pipeline regenerates from',
      type: 'foundation',
    },
    {
      slug: 'component-architecture',
      title: 'Component Architecture',
      description: 'The contracts the gates validate',
      type: 'foundation',
    },
    {
      slug: 'motion',
      title: 'Motion & Duration Foundations',
      description: 'A page whose reduced-motion claims the e2e suite checks',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['15', '20', '27'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function ToolingAutomationPage() {
  return <FoundationPage content={content} />;
}

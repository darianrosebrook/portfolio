/**
 * UX Pattern: Input & Forms
 * Forms as the highest-stakes pattern: the compound Field anatomy,
 * labels over placeholders, validation that announces, and error
 * states that never rely on color alone — grounded in this system's
 * Field/TextField/Label contracts.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../foundations/_lib/contentBuilder';
import { FoundationPage } from '../../foundations/_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Input & Forms Patterns',
  description:
    'Design forms that respect the user: compound field anatomy with named slots, labels over placeholders, validation that announces through the accessibility tree, and errors legible without color — all mapped to the system\u2019s Field, TextField, and Label contracts.',
  slug: 'forms',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/ux-patterns/forms',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'forms, inputs, validation, labels, error states',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens'],
    next_units: ['selection', 'feedback'],
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
    expertise: ['Design Systems', 'Forms', 'Accessibility'],
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
          Forms are where users do the hardest work: they type, they remember,
          they make mistakes under mild anxiety. Every form is a small promise
          about competence—label clearly, forgive errors, never make the user
          guess your rules. Break the promise and the cost is direct: abandoned
          signups, support tickets, wrong data in the database.
        </p>
        <p>
          Forms are also the pattern where accessibility failures concentrate,
          because a form is a live conversation with the accessibility tree:
          labels associate, errors announce, focus moves with intent. The
          system&apos;s answer is structural—the compound <code>Field</code>{' '}
          component owns the conversation once, so every form inherits correct
          behavior instead of re-attempting it.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Anatomy, Labels, Validation, Errors',
    order: 4,
    content: (
      <>
        <h3>The Compound Field Anatomy</h3>
        <p>
          The system&apos;s field is not an input; it is a compound of named
          parts, declared in the contract:
        </p>
        <pre>
          <code>{`// ui/components/Field/Field.contract.json — anatomy
["root", "error", "help", "label", "header", "control"]

// The parts compose:
//   root — the association boundary (what belongs together)
//   header — optional affordance row (actions, requirements)
//   label — the persistent question being asked
//   control — the input proper (Input, Select, Checkbox…)
//   help — standing guidance, always available
//   error — the corrective response, announced when present`}</code>
        </pre>
        <p>
          The anatomy is the pattern: each slot has a job, a binding, and an
          a11y behavior. Composition (rather than a mega-props input) keeps the
          jobs inspectable—reviewers see the parts; the tree announces them
          correctly; designers restyle one part without renegotiating the
          others.
        </p>

        <h3>Labels Over Placeholders</h3>
        <p>
          A label is a permanent question; a placeholder is hint-text that
          vanishes exactly when the user needs it— at input—and that screen
          readers may skip. The rules the system encodes: labels are{' '}
          <strong>always visible, always associated</strong> (
          <code>Label htmlFor</code> to the control&apos;s id), placeholders
          demonstrate format (dd/mm), never name the field, and the label
          survives in error state—&quot;Email is required&quot; reads; a red
          outline alone does not.
        </p>

        <h3>Validation: When and How to Speak</h3>
        <ul>
          <li>
            <strong>Validate on blur, not on keystroke</strong> — screaming at a
            half-typed email teaches nothing except dread. Re-validate on input
            only <em>after</em> the first error, to signal recovery.
          </li>
          <li>
            <strong>Announce through the tree</strong> — the error slot renders{' '}
            <code>role=&quot;alert&quot;</code> (or wires{' '}
            <code>aria-describedby</code> to the control) so the correction
            reaches screen readers with the same timing sighted users get.
          </li>
          <li>
            <strong>Preserve the user&apos;s work</strong> — never clear a field
            on failed validation; the error is in the system&apos;s expectation
            or the message, not necessarily the typing.
          </li>
        </ul>

        <h3>Errors Without Color Alone</h3>
        <p>
          Error state is <code>feedback.border.error</code> plus icon plus
          message—the border pairs with the error token from the feedback ramp,
          and the message text is the actual carrier. Color is the fastest
          channel for sighted users and an absent one for others: the pattern
          requires <strong>at least two channels</strong> (color + text always;
          icon as the common third). The pair ledger guarantees the error color
          clears 3:1 in both modes; nothing about the redundancy is decorative.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Owning the Conversation',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the question quality: labels that ask plainly, help text
          that prevents errors, error messages that name the fix (&quot;add an
          @&quot;, not &quot;invalid format&quot;). The anatomy keeps each
          artifact in its slot.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the wiring: association (label→control,
          error→describedby), timing (blur-then-live), and the contract&apos;s
          declared behavior staying true in every state.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          The a11y function owns the announcement audit: error timing, recovery
          signaling, and the two-channel rule— verified in the axe layer and the
          manual pass.
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
          The design side of forms is the state matrix: each field drawn in
          default, focus, filled, error, and disabled, with the error&apos;s two
          channels visible. The comp is the contract&apos;s preview—the slots
          named in the file are the slots named in the JSON.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>The compound field, assembled and wired:</p>
        <pre>
          <code>{`// Composition over configuration
<Field>
  <Field.Header optional>Optional</Field.Header>
  <Field.Label htmlFor="email">Email</Field.Label>
  <Input id="email" type="email" invalid={!!error} />
  {error
    ? <Field.Error role="alert">{error}</Field.Error>
    : <Field.Help>We use this to sign you in.</Field.Help>}
</Field>

// The wiring underneath:
//   label htmlFor → control id       (name association)
//   invalid → feedback border token  (color channel)
//   role="alert" on error            (tree channel)
//   help ↔ error swap                (one message slot, no stacking)`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: A Recoverable Signup Form',
    order: 7,
    content: (
      <>
        <p>Ship one form end to end—a three-field signup:</p>
        <ol>
          <li>
            <strong>Anatomy first:</strong> three <code>Field</code> compounds,
            each with label, control, help; no placeholders doing a label&apos;s
            job.
          </li>
          <li>
            <strong>Flow order:</strong> DOM order equals tab order equals
            visual order; the submit button last and reachable; Enter submits
            the form (native <code>form</code> semantics, free).
          </li>
          <li>
            <strong>Validation:</strong> blur-validated email format with a
            recovery message; on submit, focus the first invalid field—the user
            lands <em>at</em> the problem, not below it.
          </li>
          <li>
            <strong>Errors:</strong> border token + message text + icon;
            per-field messages, never a banner alone; the corrected field
            announces recovery by dropping the alert.
          </li>
          <li>
            <strong>Verify:</strong> axe on the errored state (not just
            default), a keyboard walk of the submit failure, and one VoiceOver
            pass of the error announcement.
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
            <strong>Blur validation vs submit validation:</strong> blur catches
            early, submit is calmer; the system default is blur-then-live
            because recovery feedback outweighs the interruption, but quiet
            forms (search) validate on submit only.
          </li>
          <li>
            <strong>Compound anatomy vs single-component convenience:</strong>{' '}
            composition costs a few lines per field and buys per-slot styling,
            association, and review; the mega-input is shorter to type and
            forever to maintain.
          </li>
          <li>
            <strong>Inline errors vs error summary:</strong> long forms (10+
            fields) add a submit-time summary with links; short forms keep it
            inline. The pattern, not the habit, decides.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'forms-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Placeholder as label</h3>
        <pre>
          <code>{`// Bad: The question disappears on focus
<input placeholder="Email address" />
// Good
<Label htmlFor="e">Email address</Label>
<input id="e" placeholder="you@example.com" />`}</code>
        </pre>
        <h3>2. Color-only errors</h3>
        <pre>
          <code>{`/* Bad: A border nothing announces */
.inputError { border-color: var(--semantic-color-feedback-border-error); }
/* Good: Border + role=alert message + icon — two channels minimum */`}</code>
        </pre>
        <h3>3. Validating every keystroke</h3>
        <p>
          Errors at input-time for half-typed values punish the middle of
          thinking. Blur first; live-validate only the recovery.
        </p>
        <h3>4. Clearing on error</h3>
        <p>
          Emptying a field to &quot;help&quot; retries destroys work and trust
          in one move. Never.
        </p>
        <h3>5. Disabled submit as validation theater</h3>
        <p>
          A permanently disabled submit with no explanation hides the rule;
          enable it and explain on failure, or show the requirement beside it.
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
            <strong>Selection patterns</strong> — the choice controls that live
            inside forms (<code>/blueprints/ux-patterns/selection</code>)
          </li>
          <li>
            <strong>Feedback patterns</strong> — the announcement family errors
            belong to (<code>/blueprints/ux-patterns/feedback</code>)
          </li>
          <li>
            <strong>Component anatomy</strong> — the contract slots this pattern
            composes (<code>/blueprints/component-standards/anatomy</code>)
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
    id: 'labels-associated',
    label: 'Every control has a visible, associated label',
    description: 'Placeholders demonstrate format, never name',
    required: true,
  },
  {
    id: 'errors-two-channels',
    label: 'Errors communicate through at least two channels',
    description: 'Color + announced text; icon as the common third',
    required: true,
  },
  {
    id: 'validation-timing',
    label: 'Validation speaks on blur and recovers live',
    description: 'Never punish half-typed values',
    required: true,
  },
  {
    id: 'work-preserved',
    label: 'Failed validation never destroys user input',
    description: 'Focus moves to the problem; values persist',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Audit a form you own against the five failure modes in this page. Which appears most, and what does the Field anatomy change about fixing it?',
    type: 'application',
  },
  {
    question:
      'Argue for and against a disabled submit button on a signup form, using the two user states (knows-the-rules, does-not) as your frame.',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'component-architecture',
      title: 'Component Architecture',
      description: 'The compound-component pattern Field instantiates',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The feedback ramps and pair ledger behind error colors',
      type: 'foundation',
    },
    {
      slug: 'accessibility',
      title: 'Accessibility as System Infrastructure',
      description: 'The tree-level obligations forms carry',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['05', '01', '26'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function FormsPage() {
  return <FoundationPage content={content} />;
}

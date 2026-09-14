/**
 * UX Pattern: Feedback & Status
 * The announcement family: the alert-versus-status distinction,
 * toasts that stack and expire, loading states that tell the truth,
 * and empty states that are screens, not apologies.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../foundations/_lib/contentBuilder';
import { FoundationPage } from '../../foundations/_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Feedback & Status Patterns',
  description:
    'Tell users the truth about system state: the alert-versus-status announcement distinction, toasts that stack and expire honestly, loading states that match actual waiting, and empty states designed as screens rather than silences.',
  slug: 'feedback',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/ux-patterns/feedback',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'feedback, toasts, alerts, loading states, empty states',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens'],
    next_units: ['forms', 'navigation'],
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
    expertise: ['Design Systems', 'Feedback', 'Accessibility'],
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
          Every interface is having a conversation about state—did that work? is
          this loading? why is this empty?—whether anyone designed the
          conversation or not. Silence is an answer users hate: they resubmit
          forms, they reload pages, they conclude the app is broken. Feedback
          design is the discipline of answering{' '}
          <em>
            at the right urgency, through the right channel, at the right moment
          </em>
          .
        </p>
        <p>
          The wrong urgency is its own failure class: everything announcing as
          an emergency trains users to ignore emergencies. This system&apos;s
          family—Alert, AlertNotice, Toast, Skeleton, Spinner, Progress,
          Status—exists to make urgency a <em>chosen</em> property, declared in
          the component contracts and expressed through the accessibility
          tree&apos;s two announcement channels.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Two Channels, Four Urgencies',
    order: 4,
    content: (
      <>
        <h3>The Announcement Distinction: Alert vs Status</h3>
        <p>
          The accessibility tree has exactly two polite-volume channels for
          spontaneous announcements, and they encode urgency. The Toast contract
          declares both because the component serves both:
        </p>
        <pre>
          <code>{`// ui/components/Toast/Toast.contract.json (excerpt)
"role": "alert",
"roles": ["alert", "status"]

// role="alert"  → assertive: interrupts, for what matters NOW
//                  (failures, destructive confirmations)
// role="status" → polite: announces at the next breath
//                  (successes, completions)
// Choosing the channel IS choosing the urgency.`}</code>
        </pre>
        <p>
          The discipline that keeps both usable:{' '}
          <strong>reserve assertive for what deserves interruption</strong>. A
          success toast on <code>alert</code> is the boy who cried wolf in ARIA
          form.
        </p>

        <h3>The Urgency Ladder</h3>
        <ul>
          <li>
            <strong>Inline (Field.Error):</strong> scoped to one control,
            adjacent, persistent until fixed. The lowest urgency and the highest
            precision.
          </li>
          <li>
            <strong>Banner (Alert/AlertNotice):</strong>
            page-scoped, persistent, dismissible when actionable. For what
            changes the page&apos;s meaning.
          </li>
          <li>
            <strong>Toast:</strong> transient, stacked, for confirmations of
            actions the user just took. Success on <code>status</code>; failure
            on <code>alert</code> with an action to retry.
          </li>
          <li>
            <strong>Blocking (dialog):</strong> reserved for decisions, not
            information—the overlay pattern&apos;s territory, borrowed never.
          </li>
        </ul>

        <h3>Loading States That Tell the Truth</h3>
        <p>
          A spinner is a promise about time. Keep the promise honest with the
          system&apos;s own timing vocabulary: under ~300ms (
          <code>duration.medium0</code>), show nothing—flash-of-loading is its
          own insult; to ~1s (<code>long0</code>), a spinner or Skeleton
          suffices; beyond that, Progress with real information, because an
          unbounded wait with a boundless animation is a lie with a spinner on
          it. Skeletons add the shape promise: they placeholders the{' '}
          <em>layout</em> of what is coming, so arrival does not reflow the
          world (the motion system&apos;s reduced-motion contract applies to
          shimmer too—fades, not sweeps).
        </p>

        <h3>Empty States Are Screens</h3>
        <p>
          &quot;No results&quot; is a screen with a job: explain why it is
          empty, and offer the next move (clear filters, create the first thing,
          learn what belongs here). An empty state that is a bare sentence
          abandons the user at exactly the moment they need direction most. It
          is navigation wearing quiet clothes.
        </p>

        <h3>Optimistic Honesty</h3>
        <p>
          Optimistic UI (act succeeded, correct later if wrong) is a feedback
          strategy, not an escape from it: the optimistic state must be visually
          distinct from confirmed, rollbacks must announce as clearly as the
          original success, and the pattern is honest only where reversal is
          cheap. Confident where cheap, honest where not.
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
          Designers own the urgency assignments—the ladder mapped per message
          type—and the empty states, which are design work wearing humility.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the channel wiring: alert vs status per contract,
          stacking order (newest where attention already is), timers that
          respect the duration vocabulary, and rollbacks that announce.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          The a11y function owns announcement etiquette: nothing assertive
          without cause, no stacked announcements colliding, and the manual pass
          confirming the tree says what the pixels imply.
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
          The design side of feedback is the message inventory: every state the
          product can announce, its urgency ladder position, its channel, and
          its lifespan—drawn as a matrix, reviewed as one. Teams that skip the
          matrix ship urgency by accident.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>The ladder, as assembled:</p>
        <pre>
          <code>{`// Inline: scoped, persistent, precise
<Field.Error role="alert">{error}</Field.Error>

// Toast: transient, stacked, channeled by urgency
toast.success('Project saved', { role: 'status' });   // polite
toast.failure('Save failed',  { role: 'alert',        // assertive
  action: { label: 'Retry', onActivate: retry } });

// Loading: honest about time
{elapsed < 300 ? null
  : elapsed < 1000 ? <Spinner label="Loading" />
  : <Progress value={percent} label="Importing" />}

// Empty: a screen with a job
<EmptyState title="No projects yet"
  body="Projects hold your tokens and docs."
  action={<Button onClick={create}>Create project</Button>} />`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: The Save Flow, End to End',
    order: 7,
    content: (
      <>
        <p>One action—the document save—through the whole family:</p>
        <ol>
          <li>
            <strong>Trigger:</strong> Cmd+S. If under 300ms round-trip is
            expected, act optimistically: the title flickers to <em>saving</em>{' '}
            styling (distinct, quiet).
          </li>
          <li>
            <strong>Waiting:</strong> beyond a second, the button shows
            Progress—truth about time, not a spinner pretending.
          </li>
          <li>
            <strong>Success:</strong> a toast on <code>status</code>—polite, 4s
            life, no action needed; the optimistic styling resolves to
            confirmed.
          </li>
          <li>
            <strong>Failure:</strong> a toast on <code>alert</code> with Retry;
            the document reverts visibly; nothing is silently lost.
          </li>
          <li>
            <strong>Verify:</strong> the announcement pass—both channels heard,
            no collisions, rollbacks as audible as successes.
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
            <strong>Toast transience vs persistence:</strong> disappearing
            confirmations respect attention and outrun slow readers—critical
            messages persist or log somewhere retrievable.
          </li>
          <li>
            <strong>Optimism vs certainty:</strong> optimistic UI feels instant
            and lies sometimes; blocking feels slow and never lies. The cost of
            being wrong decides.
          </li>
          <li>
            <strong>Skeleton fidelity vs maintenance:</strong> high-fidelity
            skeletons promise the layout precisely and must track it;
            low-fidelity ones age better and reflow more.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'feedback-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Assertive everything</h3>
        <pre>
          <code>{`// Bad: Every announcement interrupts
<div role="alert">Welcome back!</div>
// Good: Urgency is chosen; welcome is status or nothing`}</code>
        </pre>
        <h3>2. The eternal spinner</h3>
        <p>
          An animation with no information. Past a second, progress needs a
          dimension—percent, steps, or honest uncertainty language.
        </p>
        <h3>3. Success nobody can hear</h3>
        <p>
          Visual-only confirmation for an action a screen reader user took. If
          the user acted, the tree answers.
        </p>
        <h3>4. The silent rollback</h3>
        <p>
          Optimistic state vanishing without announcement—the user believes the
          save happened. Rollbacks announce on <code>alert</code>, always.
        </p>
        <h3>5. Empty as dead end</h3>
        <p>
          &quot;No results&quot; with no path forward. Every empty state names
          the next move.
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
            <strong>Forms</strong> — the inline tier of the ladder (
            <code>/blueprints/ux-patterns/forms</code>)
          </li>
          <li>
            <strong>Motion &amp; Duration</strong> — the timing vocabulary
            loading states borrow (<code>/blueprints/foundations/motion</code>)
          </li>
          <li>
            <strong>ARIA live regions</strong> — the channels themselves (
            <code>
              https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/ARIA_Live_Regions
            </code>
            )
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
    id: 'urgency-chosen',
    label: 'Every announcement has a chosen urgency and channel',
    description: 'The ladder position is a decision, not an accident',
    required: true,
  },
  {
    id: 'assertive-reserved',
    label: 'Assertive announcements are reserved for true interruption',
    description: 'Success is status; failure with action is alert',
    required: true,
  },
  {
    id: 'loading-honest',
    label: 'Loading states match actual waiting honestly',
    description: 'Nothing under 300ms; real progress past 1s',
    required: true,
  },
  {
    id: 'empties-have-jobs',
    label: 'Empty states explain and offer the next move',
    description: 'Screens, not silences',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Build the message inventory for a product you touch: state, urgency, channel, lifespan for every announcement. Which entries were accidental, and what did fixing the worst one change?',
    type: 'application',
  },
  {
    question:
      'An optimistic save feels instant but fails 1-in-50 times. Argue the rollback announcement design, and what the failure rate would have to be for you to abandon optimism.',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'accessibility',
      title: 'Accessibility as System Infrastructure',
      description: 'The announcement channels and their etiquette',
      type: 'foundation',
    },
    {
      slug: 'motion',
      title: 'Motion & Duration Foundations',
      description: 'The timing vocabulary honest loading borrows',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'The feedback ramps (success/warning/error) pair correctly',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['26', '25', '01'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function FeedbackPage() {
  return <FoundationPage content={content} />;
}

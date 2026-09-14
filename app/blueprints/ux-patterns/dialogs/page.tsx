/**
 * UX Pattern: Dialogs & Overlays
 * The overlay family — dialogs, sheets, popovers, tooltips — as one
 * pattern with one contract: layered surfaces that own focus, return
 * it, move with intent, and never leak context.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../foundations/_lib/contentBuilder';
import { FoundationPage } from '../../foundations/_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Dialogs & Overlay Patterns',
  description:
    'Master the overlay family: dialogs that trap and return focus, sheets and popovers sized to intent, tooltips that respect delay and dismissal, entrance/exit motion from the interaction composites, and the elevation semantics that keep layering honest.',
  slug: 'dialogs',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/ux-patterns/dialogs',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'dialogs, modals, popovers, tooltips, focus management',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens'],
    next_units: ['navigation', 'feedback'],
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
    expertise: ['Design Systems', 'Overlays', 'Accessibility'],
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
          Overlays are the interface raising its voice. Done well, a dialog is a
          focused conversation—attention narrows, a decision happens, context
          resumes untouched. Done badly, it is an ambush: focus lost, background
          scrolling, the close button a mystery, the keyboard user stranded
          outside looking in. The difference is never visual polish; it is
          whether the overlay honors four contracts simultaneously—focus,
          dismissal, layering, and motion.
        </p>
        <p>
          This system treats the whole family—Dialog, Sheet, Popover, Tooltip,
          Walkthrough—as one pattern with a shared contract, declared in each
          component&apos;s contract file and expressed through the foundations
          you have already met: elevation for layering, motion composites for
          entrance and exit, and the accessibility tree for everything that
          matters most.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: The Four Contracts',
    order: 4,
    content: (
      <>
        <h3>Contract 1: Focus Is Borrowed, Then Returned</h3>
        <p>
          An open overlay <em>owns</em> focus: it moves focus into itself on
          open, cycles Tab within itself while open (the trap), and—most
          forgotten—returns focus to the trigger on close. The Dialog contract
          declares exactly this:
        </p>
        <pre>
          <code>{`// ui/components/Dialog/Dialog.contract.json (excerpt)
"role": "dialog",
"labeling": ["aria-label"],
"keyboard": [{ "key": "Enter|Space", /* trigger semantics */ },
              /* + Tab cycling, Escape to close */]

// The pattern's invariants:
//   open   → focus moves to the dialog (title or first control)
//   open   → Tab cycles inside; background is inert
//   close  → focus returns to the invoking trigger`}</code>
        </pre>
        <p>
          The return is the invariant teams drop, and it is the one that strands
          keyboard users at the page start—their context destroyed by a closed
          dialog they successfully used.
        </p>

        <h3>Contract 2: Dismissal Is Obvious and Redundant</h3>
        <ul>
          <li>
            <strong>Escape closes</strong>—every overlay, no exceptions; it is
            the user&apos;s universal exit.
          </li>
          <li>
            <strong>A visible close affordance</strong>—icon button with a real
            name (&quot;Close&quot;), the Icon binary&apos;s meaningful case.
          </li>
          <li>
            <strong>
              Scrim click closes—except for destructive or flow dialogs
            </strong>
            , where an accidental click losing a form is worse than rigidity.
            The rule is declared per usage, and the destructive case says why it
            is exempt.
          </li>
        </ul>

        <h3>Contract 3: Layering Is Semantic, Not Decorative</h3>
        <p>
          Overlays sit at the top of the elevation story: the scrim is flat with
          the page, the dialog panel is <code>surface.floating</code> (level 2)
          or the modal step for the heavyweight cases, and the stacking order (
          <code>elevation.depth</code>) must agree with the shadow—a tooltip
          that renders above a modal in z-index but below it visually is a lie
          in one channel or the other. Nested overlays compose deliberately:
          popover over dialog over page, each layer&apos;s depth greater than
          its parent&apos;s.
        </p>

        <h3>Contract 4: Motion With an Exit Faster Than the Entrance</h3>
        <p>
          The composites encode the family&apos;s timing: modal enters on{' '}
          <code>medium2 + soft.enter</code> (333ms, comfortable arrival) and
          exits on <code>medium1 + soft.exit</code> (250ms)—arriving information
          is worth perceiving; departing information is not. Tooltips invert the
          ratio with a <code>delay.medium</code> (100ms) entry so grazing does
          not spam, and a <code>short1</code> (50ms) exit so they vanish without
          ceremony. And the whole family carries its{' '}
          <code>prefers-reduced-motion</code> block: fades survive, travel does
          not.
        </p>

        <h3>Choosing the Family Member</h3>
        <pre>
          <code>{`Dialog    — interruptive, modal: the user must decide
Sheet     — the dialog's side-dwelling cousin (tasks, filters)
Popover   — anchored, transient, non-modal by default
Tooltip   — deferential: explains, never acts; no focus of its own
Walkthrough — sequenced guidance riding the same machinery

The chooser is attention budget, not aesthetics: how much of the
user's context does this surface need to take?`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Owning the Contracts',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the attention decision—which family member, how modal,
          what the scrim obscures—and the destructive-dialog exemptions, argued
          per case.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the invariants: trap, return, inert background, Escape,
          depth-order agreement. The contract file is where each is declared;
          the e2e walk is where each is proven.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          The a11y function owns the announcement quality: dialog names
          (aria-label carrying the title), the scrim&apos;s silence, and the
          manual pass on focus return.
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
          The design side of overlays is the layer diagram: page, scrim, panel,
          nested layers—with the elevation role and the motion timing annotated
          per layer. The comp answers &quot;how much context does this
          take?&quot; visually (scrim opacity, panel offset) before code answers
          it structurally.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>The contracts, as one dialog&apos;s implementation:</p>
        <pre>
          <code>{`function Dialog({ open, onClose, title, trigger }) {
  // Focus: in on open, cycled while open, returned on close
  // Inert: background unreachable (aria-hidden + pointer-events)
  // Layer: scrim flat, panel floating, depth ordered
  // Motion: enter medium2/soft.enter, exit medium1/soft.exit
  return (
    <Overlay show={open} onEscape={onClose}>
      <div role="dialog" aria-label={title}
           data-ds-component="Dialog"> {/* contract-bound */}
        {children}
      </div>
    </Overlay>
  );
}

// The e2e walk that proves the invariants:
//   tab to trigger → Enter → focus inside dialog
//   Tab × n → focus never escapes the panel
//   Escape → dialog closes → focus is BACK on the trigger`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: A Destructive Confirm Dialog',
    order: 7,
    content: (
      <>
        <p>The hardest overlay used well—&quot;Delete this project?&quot;:</p>
        <ol>
          <li>
            <strong>Family choice:</strong> interruption is the point → Dialog,
            modal, with a titled scrim.
          </li>
          <li>
            <strong>Wording:</strong> the title names the object; the body names
            the consequence; the buttons are &quot;Delete project&quot; /
            &quot;Cancel&quot; (the affirmative says what it does—no generic
            OK).
          </li>
          <li>
            <strong>Destructive styling:</strong> the affirmative action uses
            the destructive ramp, focus lands on <em>Cancel</em> (safe default
            first), and the scrim click is exempt—accidentally deleting is worse
            than one extra click.
          </li>
          <li>
            <strong>Contracts:</strong> Escape cancels; focus returns to the
            row&apos;s menu trigger; depth above any popover that opened the
            flow; motion on the composites with reduced-motion fades.
          </li>
          <li>
            <strong>Verify:</strong> the keyboard walk including focus return,
            axe on the open state, and one VoiceOver pass confirming the
            announced title.
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
            <strong>Modality vs context:</strong> modality focuses decisions and
            blocks all else—the strongest tool and the most abused. The system
            bias: non-modal by default, modal by declared necessity.
          </li>
          <li>
            <strong>Scrim dismissability vs safety:</strong> click-to-dismiss
            speeds casual flows and destroys careful ones; destructive dialogs
            opt out, loudly.
          </li>
          <li>
            <strong>One overlay vs stacked overlays:</strong> stacks multiply
            every invariant; most stacks are a navigation design failure wearing
            a component solution.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'dialogs-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. The vanishing focus</h3>
        <p>
          Dialog closes, focus snaps to body. The return invariant exists
          precisely for this; it is contract behavior, not a nicety.
        </p>
        <h3>2. The leaky trap</h3>
        <p>
          Tab escapes to browser chrome or hidden background controls—background
          inertness is part of the same contract, not a separate feature.
        </p>
        <h3>3. Tooltip as control</h3>
        <p>
          Tooltips explain; they never hold actions—keyboard and touch users
          cannot reach them. Interactive content belongs in a popover with
          focus.
        </p>
        <h3>4. Depth disagreement</h3>
        <pre>
          <code>{`/* ❌ Level-3 shadow under a level-1 bar */
.modal { z-index: 10; box-shadow: var(--core-elevation-level-3); }
.nav   { z-index: 100; }
/* ✅ Depth numbers order with shadow levels */`}</code>
        </pre>
        <h3>5. Motion without exit</h3>
        <p>
          Entrances animated, closes instant—the overlay family lives or exits
          together; the composites price both.
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
            <strong>Elevation &amp; Shadows</strong> — the layering semantics
            overlays ride (<code>/blueprints/foundations/elevation</code>)
          </li>
          <li>
            <strong>Motion &amp; Duration</strong> — the composites that time
            the family (<code>/blueprints/foundations/motion</code>)
          </li>
          <li>
            <strong>ARIA APG dialog pattern</strong> — the reference behavior (
            <code>https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/</code>)
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
    id: 'focus-borrowed-returned',
    label: 'Focus enters, cycles, and returns to the trigger',
    description: 'The return is the invariant teams drop',
    required: true,
  },
  {
    id: 'escape-redundant',
    label: 'Escape plus a named visible close affordance',
    description: 'Redundant exits; scrim rules declared per case',
    required: true,
  },
  {
    id: 'depth-agrees',
    label: 'Stacking order agrees with elevation levels',
    description: 'Shadows and z-index tell one story',
    required: true,
  },
  {
    id: 'non-modal-default',
    label: 'Modality is a declared decision, not a default',
    description: 'Attention budget justifies each modal',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Take a stacked-overlay flow you know (popover → dialog → dialog?) and rewrite it as a single dialog or a page. What invariants did the stack multiply, and what did the redesign eliminate?',
    type: 'application',
  },
  {
    question:
      'A product spec asks for tooltips containing a link. Which contract does that violate, which family member belongs there instead, and what changes for touch users?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'elevation',
      title: 'Elevation & Shadow Foundations',
      description: 'The layer semantics and depth ordering',
      type: 'foundation',
    },
    {
      slug: 'motion',
      title: 'Motion & Duration Foundations',
      description: 'The modal/tooltip composites that time the family',
      type: 'foundation',
    },
    {
      slug: 'accessibility',
      title: 'Accessibility as System Infrastructure',
      description: 'The focus contracts overlays must honor',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['13', '25', '26'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function DialogsPage() {
  return <FoundationPage content={content} />;
}

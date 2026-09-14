/**
 * UX Pattern: Selection & Actions
 * Choosing as a contract: single vs multiple, known vs unknown
 * option counts, the group semantics that make choices legible,
 * the switch-vs-checkbox distinction, and actions whose names say
 * what they do.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../foundations/_lib/contentBuilder';
import { FoundationPage } from '../../foundations/_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Selection & Actions Patterns',
  description:
    'Design choosing well: radio vs checkbox vs switch semantics, selects sized to option counts, filter chips as reversible selection, group semantics with fieldsets and legends, and action names that say what they do.',
  slug: 'selection',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/ux-patterns/selection',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'selection, checkbox, radio, switch, chips, actions',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens'],
    next_units: ['forms', 'dialogs'],
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
    expertise: ['Design Systems', 'Interaction Design', 'Accessibility'],
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
          Selection is where small semantic errors compound into large user
          errors. A checkbox doing a radio&apos;s job allows contradictory
          answers. A switch doing a checkbox&apos;s job implies immediacy the
          system does not deliver. A select with three options makes the user
          open a menu to see a list that would have fit on the screen. None of
          these are visual problems; all of them are <em>semantics</em>{' '}
          problems—and semantics are exactly what the accessibility tree
          exposes, which is why the same errors that confuse users also fail
          audits.
        </p>
        <p>
          The system&apos;s selection inventory—Checkbox, Select, Switch,
          ToggleSwitch, Chip, Shuttle—maps each control to the question it is
          allowed to answer, declared in the contracts and styled by the state
          tokens you have met throughout.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: Semantics First, Then Sizing',
    order: 4,
    content: (
      <>
        <h3>The Semantic Table</h3>
        <pre>
          <code>{`Control     Question it may answer
radio       exactly one of a visible small set (2–5)
checkbox    any number of a visible small set, including none
switch      an immediate, reversible mode toggle (state applies NOW)
select      one of a set too large or too volatile to show inline
chip        a reversible filter — selection that narrows content
Shuttle     moving items between two named collections

The pairing rules that make it a system:
  radio groups:  fieldset + legend; arrows cycle; checked stays
  checkbox:      independent state; group label optional
  switch:        never inside a form's submit; it IS the submit
  mixed state:   a parent checkbox may show indeterminate —
                 never a third value the child cannot reach`}</code>
        </pre>
        <p>
          The switch line carries the most misuse: a switch is an{' '}
          <em>immediate action</em> wearing a control&apos;s clothes.
          &quot;Notifications&quot; as a switch changes them now; as a checkbox
          in a form it changes them on submit. Users read the affordance as a
          promise about timing—honor it or use the other control.
        </p>

        <h3>Sizing the Choice</h3>
        <p>
          Option count is a layout decision with a semantic floor: two to five
          options render inline (radios or checkboxes—visible options beat
          hidden ones at every count a screen can hold); beyond that, a Select
          (the pattern page&apos;s rule of thumb from the forms family);
          volatile or filter-like sets become chips. The anti-pattern is the
          three-option select: a menu holding what a row would have shown.
        </p>

        <h3>Groups Are Semantics, Not Boxes</h3>
        <p>
          A visual cluster of choices is not a group until the tree says so:{' '}
          <code>fieldset</code> with a <code>legend</code> names the question
          the choices answer (&quot;Delivery speed&quot;), the arrows cycle
          radios within it, and the legend is the group&apos;s accessible name.
          Without it, a screen reader announces five orphaned radios and the
          user must reverse-engineer the question from the answers—the interface
          equivalent of Jeopardy.
        </p>

        <h3>Selection You Can See Coming</h3>
        <p>
          Chosen states draw from the state vocabulary—selected is distinct from
          focused is distinct from hovered (the navigation page&apos;s
          three-questions rule, applied to choices)—and the selection&apos;s{' '}
          <em>consequence</em> is visible: filter chips show what narrowing
          happened and how to undo it (the feedback family&apos;s reversibility,
          worn as a control). Selection without visible consequence is a trap
          the user sets and discovers later.
        </p>

        <h3>Actions Name Themselves</h3>
        <p>
          The actions around selection obey one rule:{' '}
          <strong>the button says what it does</strong>. &quot;Delete 3
          items&quot; not &quot;OK&quot;; &quot;Apply filters&quot; not
          &quot;Submit&quot;. The count in the label is the selection becoming
          legible in the action itself—and the destructive case pairs with the
          destructive ramp and the dialog pattern&apos;s confirm, as the dialogs
          page showed.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Owning the Choosing',
    order: 5,
    content: (
      <>
        <h3>Design Impact</h3>
        <p>
          Designers own the question and its rendering: the option set, the
          count-appropriate control, the group label, and the visible
          consequence of choosing.
        </p>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own the semantics: native controls first, groups wired
          (fieldset/legend or ARIA equivalents), indeterminate derived from
          children, switch immediacy delivered.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          The a11y function owns the announcement audit: groups named, states
          truthful, mixed never meaning unreachable—and the arrow-key cycling
          that makes radio groups fast instead of tab-heavy.
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
          The design side of selection is the decision table per screen: the
          question, the option count, the control chosen, the group name, and
          the consequence visibility. Drawn once, it is the contract
          review&apos;s artifact; drawn never, it is re-argued per screen
          forever.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>The semantics, as the tree needs them:</p>
        <pre>
          <code>{`// Radio group: the question names the group
<fieldset>
  <legend>Delivery speed</legend>
  <label><input type="radio" name="speed" value="std" /> Standard</label>
  <label><input type="radio" name="speed" value="exp" /> Express</label>
</fieldset>

// Indeterminate is derived, never a value
checkbox.indeterminate = selected.length > 0
  && selected.length < options.length;

// Switch: immediate — this IS the action
<Switch checked={muted} onChange={setMuted}>Mute notifications</Switch>

// Actions count the selection
<Button variant="destructive" onClick={confirmDelete}>
  Delete {selected.length} {selected.length === 1 ? 'item' : 'items'}
</Button>`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: A Table With Bulk Selection',
    order: 7,
    content: (
      <>
        <p>The stress test—a data table with bulk actions:</p>
        <ol>
          <li>
            <strong>Per-row:</strong> a checkbox, independent, labeled by the
            row&apos;s name (not &quot;select row&quot; noise—the label is the
            content).
          </li>
          <li>
            <strong>Header:</strong> the select-all checkbox, indeterminate when
            partial, its state derived from children—never lying about what it
            will do.
          </li>
          <li>
            <strong>Actions:</strong> appear when selection exists, named with
            counts (&quot;Export 12&quot;), destructive ones confirmed via the
            dialog pattern with safe-default focus.
          </li>
          <li>
            <strong>Keyboard:</strong> the whole flow operable— space toggles,
            shift-space ranges (declared behavior, tested in the e2e walk),
            Escape clears.
          </li>
          <li>
            <strong>Announcement:</strong> selection changes reach the tree (the
            action bar&apos;s count as a polite status)—sighted users see the
            count; everyone hears it.
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
            <strong>Inline visibility vs space:</strong> showing options beats
            hiding them until it costs the layout; the crossover is honest (a
            screen cannot hold twenty radios) and the select is the concession,
            not the default.
          </li>
          <li>
            <strong>Switch immediacy vs form semantics:</strong> immediate
            application feels fast and fragments submission models; deferred
            forms batch cleanly and hide pending state. One model per screen.
          </li>
          <li>
            <strong>Chips vs a filter dialog:</strong> chips keep filters
            visible and reversible; dialogs scale to complex filters and hide
            state. Visible-until-complex is the default ordering.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'selection-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Checkbox doing radio work</h3>
        <p>
          Checkboxes for a one-of set allow contradictory selections; radios for
          any-of sets strand single answers. The semantic table is not a
          suggestion.
        </p>
        <h3>2. The ungrouped group</h3>
        <pre>
          <code>{`<!-- ❌ Five radios, no question -->
<input type="radio"> A <input type="radio"> B …
<!-- ✅ -->
<fieldset><legend>Plan</legend> …radios… </fieldset>`}</code>
        </pre>
        <h3>3. Indeterminate as a choice</h3>
        <p>
          The mixed state describes children; a user who can click into it has
          been offered a state that means nothing.
        </p>
        <h3>4. Selects holding three options</h3>
        <p>
          A menu hiding a list the screen could show. Radios or checkboxes at
          every small count.
        </p>
        <h3>5. Actions named OK</h3>
        <p>
          &quot;OK&quot; names nothing. Buttons say what they do; with
          selection, they say it with counts.
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
            <strong>Forms</strong> — the fields selections live inside (
            <code>/blueprints/ux-patterns/forms</code>)
          </li>
          <li>
            <strong>Dialogs</strong> — destructive selection confirms (
            <code>/blueprints/ux-patterns/dialogs</code>)
          </li>
          <li>
            <strong>ARIA APG patterns</strong> — checkbox/radio reference
            behaviors (
            <code>https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/</code>)
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
    id: 'semantic-table',
    label: 'Controls answer only their licensed questions',
    description: 'Radio=one-of, checkbox=any-of, switch=immediate mode',
    required: true,
  },
  {
    id: 'groups-named',
    label: 'Choice groups carry a legend naming the question',
    description: 'fieldset semantics; arrows cycle radios',
    required: true,
  },
  {
    id: 'count-sized',
    label: 'Control choice matches option count',
    description: 'Inline at 2-5; select beyond; chips for filters',
    required: true,
  },
  {
    id: 'actions-count',
    label: 'Actions name what they do, with counts when selecting',
    description: 'Never OK; destructive actions confirm via dialog',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Take a settings screen you know and audit it against the semantic table. Which control answers a question it is not licensed to, and what contradictory state can a user reach because of it?',
    type: 'application',
  },
  {
    question:
      'A team wants filter chips that apply only on a Save button, citing consistency with the form. What promise do chips make that this breaks, and what is the honest alternative?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'forms',
      title: 'Forms',
      description: 'The field anatomy selections compose into',
      type: 'pattern',
    },
    {
      slug: 'dialogs',
      title: 'Dialogs & Overlays',
      description: 'Destructive selection confirmation',
      type: 'pattern',
    },
    {
      slug: 'accessibility',
      title: 'Accessibility as System Infrastructure',
      description: 'The group and state semantics choices live by',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['26', '05', '01'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function SelectionPage() {
  return <FoundationPage content={content} />;
}

/**
 * Foundation Accessibility: Assistive Technology Support
 * The consumers that define the real contract: screen readers, keyboard
 * navigation, and the wider AT ecosystem — and how a design system
 * meets them through semantics, order, names, and honest manual passes.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Assistive Technology Support',
  description:
    'Support screen readers and assistive tools properly: the name/role/value tree they consume, keyboard navigation as the operability backbone, semantics in component contracts, and the manual AT passes automation cannot replace.',
  slug: 'accessibility/assistive-tech',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/accessibility/assistive-tech',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'assistive technology, screen readers, keyboard, ARIA, semantics',
  learning: {
    learning_level: 'intermediate',
    role_relevance: ['engineering', 'a11y', 'design'],
    prerequisites: ['philosophy'],
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
    expertise: ['Design Systems', 'Accessibility', 'Frontend Architecture'],
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
          Assistive technologies are the users your interface cannot see. A
          screen reader does not experience your carefully composed layout—it
          experiences an <em>accessibility tree</em> of names, roles, and
          values, linearized in DOM order, announced one node at a time. A
          keyboard user does not experience your hover states—they experience a
          tab order and whatever focus tells them. Designing for the visible
          interface while ignoring the tree is designing a beautiful building
          with no doors.
        </p>
        <p>
          For a design system the stakes compound: every semantic mistake ships
          inside a component and multiplies across every screen that uses it.
          The inverse is equally true—
          <strong>
            get the semantics right in the component once, and every consumer
            inherits correct behavior
          </strong>{' '}
          without reading a line of ARIA documentation. That is the leverage
          this page is about.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: The Tree, The Order, The Names',
    order: 4,
    content: (
      <>
        <h3>The Accessibility Tree Is the Real Interface</h3>
        <p>
          Browsers derive an accessibility tree from the DOM—each node exposing
          a name, a role, a value, and states. AT consumes that tree, not your
          pixels. The system-level consequence: components are where the tree is
          either well-formed or broken, which is why the contract files carry
          semantics as <em>fields</em>:
        </p>
        <pre>
          <code>{`// From any ui/components/*/[Name].contract.json
"a11y": {
  "role": "generic",          // the tree node's role
  "labeling": [],             // how the name is provided
  "keyboard": [],             // expected keyboard behavior
  "apgPattern": null          // ARIA Authoring Practices pattern
}`}</code>
        </pre>
        <p>
          Declared semantics are reviewable semantics: a component whose
          contract says <code>role: &quot;button&quot;</code> but whose keyboard
          list is empty has a visible hole, before any screen reader run. The
          fields are also testable surface—the tooling page&apos;s audits read
          them as expectations.
        </p>

        <h3>Names: Every Control Answers &quot;What Am I?&quot;</h3>
        <p>
          The accessible name is the tree&apos;s primary key. The system&apos;s
          smallest complete example is the Icon component&apos;s binary:
        </p>
        <pre>
          <code>{`// ui/components/Icon/Icon.tsx (behavior)
label provided  → role="img" + aria-label={label}   // meaningful
label omitted   → aria-hidden="true"                // decorative

// Meaningful: the icon IS the affordance
<Icon icon={faXmark} label="Close" />
// Decorative: adjacent text carries the meaning
<button><Icon icon={faStar} /> Favorite</button>`}</code>
        </pre>
        <p>
          The default is silence, and the default is correct—in a well-composed
          interface most icons sit beside text that already names the thing. The
          failure modes are symmetric and silent: unlabeled meaningful icons
          vanish from the tree; labeled decorative icons announce noise
          (&quot;star… Favorite&quot;). Names are also a quality surface: a name
          is a name (&quot;Close&quot;), not a description (&quot;gray x icon
          top right&quot;).
        </p>

        <h3>Order: DOM Is Reading Order, Layout Is Styling</h3>
        <p>
          The tree is linear; screens are not. The system rule that reconciles
          them: <strong>DOM order equals reading order</strong>, and visual
          arrangement is achieved with flow and grid placement—never by
          re-ordering the DOM to match a picture. The search-results pattern
          from the grid page is the canonical case: filters come after results
          in the DOM (screen reader users hit content first) and are placed
          visually with grid placement. Break the rule and two users of the same
          screen experience different products—the sighted one and everyone
          else.
        </p>

        <h3>Keyboard: The Operability Backbone</h3>
        <ul>
          <li>
            <strong>Everything interactive is reachable</strong> by Tab and
            arrow keys—the native elements give this free, which is most of the
            native-first argument.
          </li>
          <li>
            <strong>Focus is always visible</strong>—the composed focus ring
            from the token page, never <code>outline: none</code> without an
            equal-or-better replacement.
          </li>
          <li>
            <strong>Overlays manage focus</strong>—dialogs trap focus while open
            and return it to the trigger on close; menus move focus into
            themselves and restore it. This is contract material (the{' '}
            <code>keyboard</code> list), not per-usage discretion.
          </li>
          <li>
            <strong>Keyboard is the test substrate</strong>—the e2e suite drives
            the product the way a keyboard user does; a component that cannot be
            driven by keyboard cannot even be tested.
          </li>
        </ul>

        <h3>The Wider AT Ecosystem</h3>
        <p>
          Screen readers (VoiceOver, NVDA, JAWS, TalkBack) are the most cited
          consumers, but the tree serves all of it: switch access, voice control
          (which addresses controls
          <em> by name</em>—the naming discipline above, doubly load-bearing),
          magnification (which turns your responsive layout into a panning
          interface—the reflow guarantee), and reading modes that strip your CSS
          entirely (leaving exactly your semantics and your order). The unifying
          observation: <strong>every AT is a tree consumer</strong>. Serve the
          tree, and the ecosystem follows.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Who Owns the Tree',
    order: 5,
    content: (
      <>
        <h3>Engineering Impact</h3>
        <p>
          Engineers own tree correctness in components: native elements first,
          ARIA only for what native cannot express, contracts filled honestly,
          focus management as specified behavior. The review question is always
          available: &quot;what does the tree say?&quot;
        </p>
        <h3>Design Impact</h3>
        <p>
          Designers own the names and the order: the accessible names that
          appear on controls (they are the designer&apos;s words, three
          surfaces—tree, tooltip, aria-label), and reading order as a design
          decision the DOM then honors.
        </p>
        <h3>Accessibility Impact</h3>
        <p>
          The a11y function owns the manual passes automation cannot replace:
          real screen reader walks on the real patterns, on the real browsers,
          with the real complaints filed as contract and test gaps rather than
          as one-off fixes.
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
          The design-side expression of the tree: comps annotated with names
          (what each control announces), order (the numbered reading sequence),
          and meaning-status for every icon. It is fifteen minutes per screen,
          and it converts accessibility from an engineering surprise into a
          design deliverable—because the annotations are exactly the contract
          fields the component needs filled.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>Code-side, the rules as the component patterns enforce them:</p>
        <pre>
          <code>{`// Native first — the tree comes free
<button onClick={save}>Save</button>
// name: "Save" · role: button · operable · focusable · done

// ARIA only where native cannot express the pattern
<div role="tablist">
  <button role="tab" aria-selected="true" aria-controls="panel-1">…</button>
</div>
// and the contract's apgPattern names the reference implementation

// Focus management as specified behavior, not discretion
function Dialog({ onClose }) {
  // trap focus while open; return to trigger on close
  // → contract a11y.keyboard lists Tab cycling + Escape
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: The Screen Reader Pass, as Protocol',
    order: 7,
    content: (
      <>
        <p>
          The manual pass that automation cannot replace, run as a repeatable
          protocol rather than a vibe:
        </p>
        <ol>
          <li>
            <strong>Pick the pattern, not the page:</strong> one component at a
            time—the Dialog, the Select, the Tabs—in a real screen, on VoiceOver
            or NVDA.
          </li>
          <li>
            <strong>Navigate as two users:</strong> by Tab/arrow (structure) and
            by the screen reader&apos;s roster (landmarks, headings, controls).
            Both must make sense independently.
          </li>
          <li>
            <strong>Transcribe what you hear:</strong> the announcement stream,
            verbatim. &quot;star, Favorite, button&quot; is a finding, not a
            paraphrase.
          </li>
          <li>
            <strong>File gaps where they live:</strong> missing name → component
            contract; wrong order → DOM/page structure; trap failure → keyboard
            behavior spec; noise → the decorative default missed. Every finding
            lands in a layer, or it lands nowhere.
          </li>
          <li>
            <strong>Add the regression check:</strong> what axe or the e2e walk{' '}
            <em>can</em> assert gets asserted, so the next pass hunts only what
            automation cannot see.
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
            <strong>Native-first vs full ARIA control:</strong> native elements
            inherit a decade of browser and AT bugfixes; bespoke ARIA
            re-implements them with none. The cost of native is styling
            discipline, which the design system exists to pay.
          </li>
          <li>
            <strong>Manual passes vs automation:</strong> the pass is slow,
            unscalable, and irreplaceable—the computable subset automates;
            comprehension and announcement quality do not. Budget both or have
            neither.
          </li>
          <li>
            <strong>Announcement verbosity:</strong> richer ARIA labeling can
            over-describe (polite live regions become chatty). Name quality is
            editorial work with a11y consequences.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'assistive-tech-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <h3>1. Divs with event handlers</h3>
        <pre>
          <code>{`// ❌ Invisible to the tree: no role, no name, no keys
<div onClick={submit}>Submit</div>
// ✅
<button onClick={submit}>Submit</button>`}</code>
        </pre>
        <h3>2. Outline removed, nothing added</h3>
        <pre>
          <code>{`/* ❌ Keyboard users lose their cursor */
.card:focus { outline: none; }
/* ✅ Never remove without replacing — and the ring token exists */`}</code>
        </pre>
        <h3>3. Visual order ≠ DOM order</h3>
        <p>
          Re-ordered DOM matching a picture breaks every tree consumer&apos;s
          mental model; grid placement is styling and costs nothing.
        </p>
        <h3>4. Focus left stranded after overlays close</h3>
        <p>
          The dialog closes and focus snaps to the page start—the keyboard
          user&apos;s context is destroyed. Return to the trigger; it is
          contract behavior.
        </p>
        <h3>5. Testing only with automation</h3>
        <p>
          Green axe on a tree that announces nonsense is green nonsense. The
          manual pass is the only check for announcement quality.
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
            <strong>ARIA Authoring Practices Guide</strong> — the pattern
            reference the contracts cite (
            <code>https://www.w3.org/WAI/ARIA/apg/</code>)
          </li>
          <li>
            <strong>Accessibility tooling</strong> — what the automation layer
            can and cannot see (
            <code>/blueprints/foundations/accessibility/tooling</code>)
          </li>
          <li>
            <strong>Component standards</strong> — the contract anatomy these
            semantics live in (
            <code>/blueprints/component-standards/anatomy</code>)
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
    id: 'native-first',
    label: 'Native elements carry interactions; ARIA fills real gaps',
    description: 'Div-with-handler never ships',
    required: true,
  },
  {
    id: 'names-quality',
    label: 'Every interactive control has a quality accessible name',
    description: 'Names, not descriptions; one name, three surfaces',
    required: true,
  },
  {
    id: 'dom-equals-reading',
    label: 'DOM order equals reading order on every screen',
    description: 'Layout reorders visually, never structurally',
    required: true,
  },
  {
    id: 'manual-pass-scheduled',
    label: 'Screen reader passes run per pattern on a schedule',
    description: 'Transcribed findings filed into layers',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'Run the announcement-transcription protocol on one pattern you own. Write the verbatim stream, mark each line good/noise/missing, and name the layer each finding belongs to.',
    type: 'application',
  },
  {
    question:
      'Voice control addresses controls by their accessible names. What does that fact alone imply about name collisions across a screen, and where should the rule live?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'accessibility',
      title: 'Accessibility as System Infrastructure',
      description: 'The track landing this semantics layer serves',
      type: 'foundation',
    },
    {
      slug: 'icons',
      title: 'Icon Foundations',
      description: 'The meaningful-vs-decorative binary in full',
      type: 'foundation',
    },
    {
      slug: 'layout',
      title: 'Layout Foundations',
      description: 'DOM order, flow, and the reflow guarantee',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['42', '01', '26'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function AccessibilityAssistiveTechPage() {
  return <FoundationPage content={content} />;
}

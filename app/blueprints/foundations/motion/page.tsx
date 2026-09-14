/**
 * Foundation: Motion & Duration
 * How tokenized motion—durations, easings, stagger, and reduced-motion
 * contracts—turns animation from a per-component improvisation into a
 * system capability.
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Motion & Duration Foundations',
  description:
    'Design motion as a tokenized system: duration scales, easing vocabularies, stagger choreography, interaction composites, and prefers-reduced-motion as a first-class contract rather than an afterthought.',
  slug: 'motion',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/motion',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'motion tokens, duration, easing, stagger, reduced motion, animation',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens'],
    next_units: ['elevation', 'layout'],
    assessment_required: false,
    estimated_reading_time: 20,
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
    expertise: ['Design Systems', 'Motion Design', 'Accessibility'],
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
          Motion is the only foundation users experience <em>in time</em>. A
          color either matches or it does not; an animation can be almost right
          and still feel wrong—too slow to feel responsive, too fast to be
          perceived, too bouncy to be trusted. That sensitivity is exactly why
          motion cannot be tuned per component by feel: the judgments that make
          motion feel deliberate are relative ones, and relative judgments need
          a shared scale.
        </p>
        <p>
          Motion also carries a unique obligation the other foundations do not:
          for a meaningful minority of users, animation is not a preference but
          a health risk. Vestibular disorders turn large translations and
          parallax into nausea triggers. A motion system that treats
          reduced-motion as a runtime contract—checked the same way contrast is
          checked—is the difference between inclusive motion and motion that
          excludes.
        </p>
        <p>
          This page walks the motion system as it exists in this repository: a
          duration scale and easing vocabulary in{' '}
          <code>ui/designTokens/core/motion.tokens.json</code>, interaction
          composites in the semantic layer, and a reduced-motion architecture
          that spans CSS media queries and a React context.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts: The Parts of a Motion Language',
    order: 4,
    content: (
      <>
        <p>
          A motion language decomposes into four independently tokenizable
          decisions. Separating them is what makes motion composable—when
          duration, easing, distance, and sequencing are each a scale, an
          animation is four references instead of a bespoke invention.
        </p>

        <h3>Durations: A Scale, Not a Number</h3>
        <p>
          The core layer defines sixteen duration tokens spanning 50ms to
          1500ms. The names, not the values, are the interface:
        </p>
        <pre>
          <code>{`// ui/designTokens/core/motion.tokens.json (values)
"instant":  "100ms"   // immediate feedback (presses)
"short1":    "50ms"   // minimal perceivable change
"short2":    "83ms"   // hover transitions (≈5 frames)
"short3":   "167ms"   // focus appearance, quick exits
"short":    "150ms"   // general quick transitions
"medium0":  "300ms"   // deliberate standard transitions
"medium1":  "250ms"   // standard enters and exits
"medium2":  "333ms"   // comfortable entrances (modals)
"medium3":  "500ms"   // emphasis, large surfaces
"long0":    "600ms"   // spacious transitions
"long1":    "667ms"   // dramatic entrances
"long2":    "833ms"   // page-level choreography
"long3":   "1000ms"   // hero moments only
"extraLong1": "1500ms" // ambient/loading loops`}</code>
        </pre>
        <p>
          Two derivations shaped this scale, and they pull in different
          directions. First, every value is a whole number of frames at 60fps—3
          frames (50ms) through 90 (1500ms)—which keeps animations off mid-frame
          boundaries. Second, perception: a duration change needs roughly a 15%
          difference to be noticed at all, so useful scale steps sit at least
          that far apart (the spacing scale&apos;s 33–100% jumps clear the floor
          comfortably; so do the composites below, at 20–67%). Where the two
          derivations collide, frame alignment loses—nobody perceives a frame
          boundary.
        </p>
        <p>
          Auditing the scale against that floor finds four collisions: 150/167ms
          (+11%), 300/333ms (+11%), 600/667ms (+11%), and <code>medium</code>/
          <code>medium1</code>, which are both 250ms. Those are name-only
          distinctions—two tokens for one perceptual answer—and they are the
          classic seed of drift: two teams pick differently by name, no reviewer
          can arbitrate because nothing looks different. The names themselves
          have warts of the same kind: <code>instant</code> (100ms, 6 frames) is
          slower than <code>short2</code> (83ms), and the base-versus-numbered
          relation is inconsistent—<code>short</code> outlasts{' '}
          <code>short1</code>, <code>medium</code> equals <code>medium1</code>,
          and <code>long</code> (400ms) is shorter than <code>long1</code>{' '}
          (667ms). Scales earn trust when names predict values; here the repair
          is at the vocabulary layer— collapse or re-derive the sub-floor
          pairs—because the frame values underneath are fine.
        </p>
        <p>
          The deeper lesson is that{' '}
          <strong>granularity and availability are separate decisions</strong>.
          The raw scale can afford over-provision—sixteen names, roughly twelve
          distinguishable answers—precisely because consumers are not offered
          it: the interaction composites are the availability dial, and the
          durations they expose (83, 100, 167, 250, 333ms) are all comfortably
          above the perceptual floor. The menu problem is solved at the tier
          that choosers actually see, not by pretending the raw scale is tight.
        </p>

        <h3>Easings: The Vocabulary of Feel</h3>
        <p>
          Duration says how long; easing says how it feels along the way. The
          core vocabulary keeps the set small and paired:
        </p>
        <pre>
          <code>{`// ui/designTokens/core/motion.tokens.json (values)
"standard":     "cubic-bezier(0.4, 0, 0.2, 1)"     // default workhorse
"emphasizedIn": "cubic-bezier(0.2, 0, 0, 1)"       // sharp arrival
"emphasizedOut":"cubic-bezier(0.4, 0, 0.2, 1)"     // = standard (see below)
"quick": {
  "enter":      "cubic-bezier(0, 0, 0.1, 1)"       // sharp start, smooth end
  "exit":       "cubic-bezier(1, 0, 1, 1)"         // smooth start, sharp end
}
"soft": {
  "enter":      "cubic-bezier(0, 0, 0.7, 1)"       // gentle acceleration
  "exit":       "cubic-bezier(0.3, 0, 1, 1)"       // gentle deceleration
}
"continuous":   "cubic-bezier(0.3, 0, 0.7, 1)"     // smooth throughout
"bounce":       "cubic-bezier(0.3, 0, 0.1, 1.25)"  // slight overshoot
"linear":       "cubic-bezier(0, 0, 1, 1)"         // constant speed`}</code>
        </pre>
        <p>
          The enter/exit pairing is the load-bearing idea. Enter and exit are
          different physical events: things arriving decelerate into place;
          things leaving accelerate away. A single &quot;ease&quot; token forces
          one physics on both. Tokens like <code>quick.enter</code> versus{' '}
          <code>quick.exit</code> encode the asymmetry—the exit curves are the
          enter curves run backward in character, which is also why exits are
          usually shorter than enters in the composite tokens below.
        </p>
        <p>
          The same honesty applies here as with durations:{' '}
          <code>emphasizedOut</code> is currently identical to{' '}
          <code>standard</code>. Whether that is convergence or an unfilled
          slot, the vocabulary&apos;s shape (a distinct name) is right even
          where the value has not yet diverged.
        </p>

        <h3>Distance and Sequencing: Translate and Stagger</h3>
        <p>
          How far a thing moves changes how the duration reads—the same 250ms
          feels snappy over 10px and sluggish over 100px—so distance is
          tokenized too: <code>motion.translate.none/sm/md</code> at{' '}
          <code>0px/10px/20px</code>. Sequencing gets its own scale in{' '}
          <code>motion.stagger</code>, and its base unit is the frame:
        </p>
        <ul>
          <li>
            <code>stagger.xs</code> — 17ms, one frame at 60fps: sequences read
            as simultaneous-but-ordered
          </li>
          <li>
            <code>stagger.sm</code> — 30ms: list items; the composed{' '}
            <code>--core-motion-stagger-list</code> alias resolves here
          </li>
          <li>
            <code>stagger.md</code> — 60ms: cards ({' '}
            <code>--core-motion-stagger-card</code>)
          </li>
          <li>
            <code>stagger.lg</code> — 100ms: sections ({' '}
            <code>--core-motion-stagger-section</code>)
          </li>
        </ul>
        <p>
          Frame-anchored staggers exist because perceptual simultaneity has a
          hard boundary: below roughly one frame, sequence is invisible.
          Composed aliases like <code>stagger.list</code> exist so call sites
          say what they are animating, and the choreography decision lives in
          one place.
        </p>

        <h3>Interaction Composites: Where the Layers Meet</h3>
        <p>
          The semantic layer composes the primitives into named interactions—
          <code>motion.interaction.*</code>—exactly the way color composes ramps
          into roles:
        </p>
        <pre>
          <code>{`// ui/designTokens/semantic/motion.tokens.json (excerpt)
"interaction": {
  "press":  { "duration": "{motion.duration.instant}",
              "easing":   "{motion.easing.standard}",
              "scale":    0.98 },
  "hover":  { "duration": "{motion.duration.short2}",
              "easing":   "{motion.easing.quick.enter}" },
  "focus":  { "duration": "{motion.duration.short3}",
              "easing":   "{motion.easing.soft.enter}" },
  "enter":  { "duration": "{motion.duration.medium1}",
              "easing":   "{motion.easing.soft.enter}" },
  "exit":   { "duration": "{motion.duration.short3}",
              "easing":   "{motion.easing.quick.exit}" },
  "modal": {
    "enter": { "duration": "{motion.duration.medium2}",
               "easing":   "{motion.easing.soft.enter}" },
    "exit":  { "duration": "{motion.duration.medium1}",
               "easing":   "{motion.easing.soft.exit}" } },
  "tooltip": {
    "enter": { "duration": "{motion.duration.short3}",
               "easing":   "{motion.easing.quick.enter}",
               "delay":    "{motion.delay.medium}" },
    "exit":  { "duration": "{motion.duration.short1}",
               "easing":   "{motion.easing.quick.exit}" } }
}`}</code>
        </pre>
        <p>
          Read <code>hover</code> as a sentence: 83ms, quick-enter easing. Read{' '}
          <code>tooltip</code> as a designed opinion: enter after a 100ms delay
          (so grazing the trigger does not spam tooltips), disappear in 50ms
          (nobody needs to watch a tooltip leave). These composites are where
          motion design judgment gets encoded—once— instead of re-argued in
          every component.
        </p>

        <h3>Reduced Motion Is a Contract, Not a Fallback</h3>
        <p>
          The system supports <code>prefers-reduced-motion</code> with two
          coordinated mechanisms, and both are load-bearing:
        </p>
        <ul>
          <li>
            <strong>CSS:</strong> component styles wrap transitions and keyframe
            animations in <code>@media (prefers-reduced-motion: reduce)</code>{' '}
            blocks— dozens of components ship them, from Button and Dialog to
            Toast and Skeleton. The pattern is uniform: reduce to instant or
            opacity-only motion.
          </li>
          <li>
            <strong>React:</strong> a <code>ReducedMotionContext</code> provider
            feeds a <code>useReducedMotion()</code> hook that combines{' '}
            <code>window.matchMedia</code> with a <code>localStorage</code> (
            <code>reduce-motion</code>) override, so scripted animations—page
            transitions, walk-throughs, scroll reveals—can respect the same
            signal the CSS does, plus a manual switch for users whose browsers
            do not expose the media query.
          </li>
        </ul>
        <p>
          The reason both exist: media queries can only style, but much of
          today&apos;s motion is orchestrated in JavaScript. When CSS and script
          read different signals, users get the worst of both—a reduced CSS
          layer with full-motion scroll choreography on top. One signal, two
          consumers, zero divergence.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Where Motion Decisions Land',
    order: 5,
    content: (
      <>
        <p>
          Motion fails organizationally before it fails technically, usually
          because the wrong layer owns the decision. The working split:
        </p>

        <h3>Design Impact</h3>
        <p>
          Designers own choreography—the <em>ordering and emphasis</em> of
          movement—and the composites encode it. What should enter first, the
          scrim or the sheet? Does this list stagger as one gesture or as
          independent items? These are judgment calls about attention, and they
          belong in named composites like <code>motion.interaction.modal</code>{' '}
          where they can be reviewed as motion design, not buried in a
          component&apos;s easing choice.
        </p>

        <h3>Engineering Impact</h3>
        <p>
          Engineers own the mechanism: keyframe tokens (<code>fadeIn</code>,{' '}
          <code>slideUp</code>, <code>slideDown</code>, <code>scaleIn</code>,{' '}
          <code>pulse</code>) that name animations once and reference them
          everywhere, and the CSS var emission that keeps every consumer on the
          same values. The discipline that keeps it clean is the same as
          color&apos;s: components reference tokens, never literal milliseconds
          or bezier strings.
        </p>

        <h3>Accessibility Impact</h3>
        <p>
          Accessibility owns the reduction semantics: what motion remains when
          the user opts out. Good reduced-motion is not no motion—opacity fades
          and color shifts usually survive, while translation, scale, and
          parallax do not. Encoding that policy per-keyframe (which animations
          reduce to what) turns a health accommodation into a reviewed, testable
          part of the system instead of a per-component conscience.
        </p>

        <h3>Performance Impact</h3>
        <p>
          Motion and performance share a budget. The compositor-friendly
          properties (transform, opacity) are the cheap ones; animating layout
          properties reflows the page per frame. Tokenizing distance as{' '}
          <code>translate</code> quietly steers animation toward transforms—the
          token set and the performance model reinforce each other, and the{' '}
          <code>effect.backdropBlur</code> tokens (4/8/12px) keep even expensive
          filters on a scale.
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
          In the design tool, the motion system appears as three named scales a
          prototyper can reach for without inventing numbers:
        </p>
        <ul>
          <li>
            <strong>Duration as a named set</strong> — modes or styles matching{' '}
            <code>short1…extraLong1</code>, so a prototype&apos;s
            &quot;250ms&quot; and production&apos;s{' '}
            <code>motion.duration.medium1</code> are the same decision.
          </li>
          <li>
            <strong>Easing as a curated library</strong> — the nine curves,
            named, with the enter/exit pairing preserved. The prototype that
            reaches for <code>quick.enter</code> hands engineering a
            requirement, not a suggestion.
          </li>
          <li>
            <strong>Stagger as choreography data</strong> — delays expressed as{' '}
            <code>stagger.sm/md/lg</code> per list/card/section, so the feel of
            a sequenced reveal survives the design-to-code handoff instead of
            degrading to &quot;add a delay.&quot;
          </li>
        </ul>
        <p>
          The composite table is the contract between the disciplines: a
          designer specifies an interaction by name (&quot;modal enter&quot;),
          and the prototype&apos;s timing is the implementation&apos;s timing,
          because both read the same token. When a prototype needs something the
          vocabulary cannot express, that gap is a design-system bug report—the
          vocabulary grows by decision, not by drift.
        </p>
      </>
    ),
    codeContent: (
      <>
        <p>
          In code, the token pipeline is deterministic and the naming is
          mechanical. Motion paths live in the <code>core</code> namespace,
          camelCase becomes kebab-case, and the values land as CSS custom
          properties:
        </p>
        <pre>
          <code>{`// utils/designTokens/generators/generateCSSTokens.mjs (behavior)
// motion.(duration|easing|keyframes|delay|stagger) → "core." namespace

motion.duration.extraLong1  → --core-motion-duration-extra-long1: 1500ms
motion.easing.standard      → --core-motion-easing-standard:
                              cubic-bezier(0.4, 0, 0.2, 1)
motion.stagger.xs           → --core-motion-stagger-xs: 17ms
motion.delay.medium         → --core-motion-delay-medium: 100ms`}</code>
        </pre>
        <p>
          A component consumes them like any other token—through its scoped
          contract, with the interaction composite deciding duration and easing
          together:
        </p>
        <pre>
          <code>{`/* Composites resolve to their parts; components stay declarative */
[data-ds-component='Dialog'] {
  --ds-dialog-motion-duration-enter:
    var(--core-motion-duration-medium2, 333ms);
  --ds-dialog-motion-easing-enter:
    var(--core-motion-easing-soft-enter,
        cubic-bezier(0, 0, 0.7, 1));
}

.dialog[open] {
  animation: var(--ds-dialog-motion-duration-enter)
             var(--ds-dialog-motion-easing-enter)
             slideUp;
}`}</code>
        </pre>
        <p>
          And the reduced-motion contract in CSS, the pattern dozens of
          components in this repo ship:
        </p>
        <pre>
          <code>{`@media (prefers-reduced-motion: reduce) {
  .dialog,
  .dialog::backdrop {
    animation-duration: 1ms;   /* effectively instant */
    animation-iteration-count: 1;
    transition-duration: 1ms;   /* states still change, */
  }                             /* they just don't travel */
}`}</code>
        </pre>
        <p>
          For scripted motion, the same signal flows through React—
          ReducedMotionContext combines the media query with a localStorage
          override so orchestration code and CSS never disagree about whether
          motion is on:
        </p>
        <pre>
          <code>{`// context/ReducedMotionContext.tsx (behavior)
const prefersReducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const manualOverride =
  localStorage.getItem('reduce-motion'); // 'true' | 'false' | null

const reduceMotion =
  manualOverride !== null
    ? manualOverride === 'true'         // explicit user choice wins
    : prefersReducedMotion;             // else follow the OS

// Consumers: AnimatedSection, AnimatedCard, AnimatedText,
// PageTransition, NavigationLink, useWalkthrough`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Choreographing a Toast Stack',
    order: 7,
    content: (
      <>
        <p>
          Toasts are the perfect motion exercise because they exercise every
          part of the language at once: they enter and exit, they stack
          (sequencing), they must not block interaction (duration), and they are
          exactly the kind of ambient movement some users need gone. Ship one
          end to end.
        </p>

        <h3>Step 1: Name the interactions before writing CSS</h3>
        <p>
          A toast enters from a screen edge and exits by retreating—but unlike a
          modal it is not a focal element, so its timing should read as
          peripheral. From the composites: <code>enter</code> is{' '}
          <code>medium1</code> (250ms) with <code>soft.enter</code>;{' '}
          <code>exit</code> is <code>short3</code> (167ms) with{' '}
          <code>quick.exit</code>. Enter slower than exit: arriving information
          is worth perceiving, departing information is not.
        </p>

        <h3>Step 2: Tokenize the travel</h3>
        <p>
          The slide distance is <code>motion.translate.md</code> (20px). Resist
          larger distances: the toast should read as sliding in from just
          off-stage, not crossing the theater. Distance and duration are one
          perceptual decision—250ms over 20px is gentle; the same 250ms over
          120px is a whip.
        </p>

        <h3>Step 3: Sequence the stack with stagger</h3>
        <pre>
          <code>{`/* New toast pushes the stack; the push is the choreography */
.toastStack > .toast {
  transition: transform var(--core-motion-duration-medium1)
              var(--core-motion-easing-soft-enter);
}

.toastStack > .toast:nth-child(n+2) {
  /* Each older toast yields slightly after the new one lands */
  transition-delay: var(--core-motion-stagger-xs); /* 17ms, 1 frame */
}`}</code>
        </pre>
        <p>
          One frame of cascade makes the stack move as a body rather than as
          synchronized rows. This is what stagger tokens are for: the difference
          between &quot;list&quot; and &quot;flock&quot; is usually 17ms.
        </p>

        <h3>Step 4: Write the reduced-motion variant deliberately</h3>
        <pre>
          <code>{`@media (prefers-reduced-motion: reduce) {
  .toast {
    /* No travel: fade only, and be honest about dismissal */
    animation-name: fadeIn;
    animation-duration: var(--core-motion-duration-short1);
  }
  .toastStack > .toast:nth-child(n+2) {
    transition-delay: 0ms; /* reflow the stack instantly */
  }
}`}</code>
        </pre>
        <p>
          Notice the policy choice encoded here: fades survive, translation does
          not, and the stack reflow becomes instant because spatial shuffling is
          exactly the motion vestibular users need avoided. The toast still
          communicates—the information arrives and departs—but nothing moves.
        </p>

        <h3>Step 5: Check the auto-dismiss against the duration scale</h3>
        <p>
          How long a toast stays is not animation, but it is time, and the scale
          keeps it coherent: a toast that enters in 250ms and auto-dismisses at{' '}
          <code>medium3</code> (500ms) would vanish while still arriving.
          Dismissal timers want the long end of the scale or beyond it—seconds,
          not milliseconds—and that boundary is exactly where animation tokens
          end and product behavior tokens would begin.
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
        <p>
          Motion&apos;s tradeoffs are unusual because the failure modes are
          perceptual and accessibility-bound rather than visual. The ones that
          shape this system:
        </p>
        <ul>
          <li>
            <strong>Scale size vs expressive range:</strong> sixteen durations
            and nine easings cover most product motion, but brand-moment
            animations will want things the vocabulary does not say. The escape
            hatch is a new named token with review— never an inline bezier in a
            component, which is how vocabularies silently become folklore.
          </li>
          <li>
            <strong>Exit speed vs perceived stability:</strong> fast exits feel
            responsive but can make the interface feel like it is hiding things.
            The composites take the position that exits outrank enters in speed
            but never match <code>instant</code>; where that is wrong, change
            the composite—the reasoning lives there.
          </li>
          <li>
            <strong>Stagger delight vs scan speed:</strong> sequenced reveals
            are charming exactly once and costly every time after. Long staggers
            on lists users re-visit daily tax everyone to delight someone once.
            The composed aliases keep the choreography adjustable in one place
            when the charm wears off.
          </li>
          <li>
            <strong>One reduced-motion policy vs per-animation nuance:</strong>{' '}
            a blanket &quot;no motion&quot; rule throws away fades that help
            comprehension; a fully per-animation policy multiplies review
            surface. This system encodes policy per keyframe family (fades
            survive, travel does not)—coarse enough to audit, fine enough to
            respect.
          </li>
          <li>
            <strong>CSS-only vs orchestrated motion:</strong> pure CSS motion is
            cheap and automatically respects media queries, but sequenced
            choreography wants script. Splitting the signal source (media query
            + context with override) costs a small sync surface and buys
            consistency across both worlds.
          </li>
          <li>
            <strong>Frame-anchored staggers vs high-refresh displays:</strong>{' '}
            17ms is one frame at 60fps and a third of one at 120Hz—on
            high-refresh hardware the same token reads differently. The values
            optimize for the median display; the honest answer for precision
            choreography is refresh-aware resolution, which the token structure
            permits but the current build does not do.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'motion-pitfalls',
    title: 'Common Pitfalls & Failure Modes',
    order: 8.5,
    content: (
      <>
        <p>
          The failure modes that recur in motion systems, with the repairs that
          fit this architecture:
        </p>

        <h3>1. Literal durations in components</h3>
        <pre>
          <code>{`// ❌ Twenty components, twenty opinions about "quick"
.tooltip { transition: all 180ms ease-in-out; }

// ✅ One opinion, at the tier that owns it: the tooltip composite
//    (short3 + quick.enter + delay.medium — see the semantic layer)
.tooltip {
  transition-duration: var(--core-motion-duration-short3, 167ms);
  transition-timing-function:
    var(--core-motion-easing-quick-enter, cubic-bezier(0, 0, 0.1, 1));
  transition-delay: var(--core-motion-delay-medium, 100ms);
}
// Hand-picking from the raw scale re-opens the decision the composites
// closed — and invites the sub-perceptual pairs nobody can arbitrate.`}</code>
        </pre>
        <p>
          The damage from literals is comparative: 180ms next to 167ms next to
          200ms reads as inconsistency no one can name, because the difference
          is invisible in review and obvious in product.
        </p>

        <h3>2. One easing for enter and exit</h3>
        <pre>
          <code>{`// ❌ Symmetric physics for asymmetric events
.menu { transition: transform 250ms var(--core-motion-easing-soft-enter); }
.menu[data-state='closed'] { /* same curve runs backward */ }

// ✅ Exit is its own decision
.menu[data-state='open']   { transition-timing-function:
  var(--core-motion-easing-soft-enter); }
.menu[data-state='closed'] { transition-timing-function:
  var(--core-motion-easing-soft-exit); }`}</code>
        </pre>
        <p>
          Reusing an enter curve for exit is not free symmetry; it is a physics
          claim—decelerating departures—that reads as sluggish dismissal.
        </p>

        <h3>3. Reduced motion bolted on at the end</h3>
        <pre>
          <code>{`// ❌ Motion shipped, reduction "added later" — later never comes
.hero { animation: parallax 30s linear infinite; }

// ✅ The reduction ships in the same rule set
@media (prefers-reduced-motion: reduce) {
  .hero { animation: none; }
}`}</code>
        </pre>
        <p>
          In this repository the pattern is established across dozens of
          components; the review norm that keeps it true is that a transition
          without its reduce block is incomplete, the way a color without its
          contrast check is incomplete.
        </p>

        <h3>4. Animating layout properties</h3>
        <pre>
          <code>{`// ❌ Reflows every frame
.accordion { transition: height 250ms; }

// ✅ Transform, always transform
.accordionPanel {
  transform: scaleY(0);
  transform-origin: top;
  transition: transform var(--core-motion-duration-medium1)
              var(--core-motion-easing-soft-enter);
}`}</code>
        </pre>
        <p>
          The token set quietly enforces the performant path—translate tokens
          are transforms—but height/width/top/left animations sneak back in
          wherever motion is not tokenized.
        </p>

        <h3>5. Stagger as a loop index</h3>
        <pre>
          <code>{`// ❌ Delay grows with list length; item 30 waits 900ms
.items:nth-child(n) { transition-delay: calc(n * 30ms); }

// ✅ Cap the sequence — choreography, not pagination
.items:nth-child(1) { transition-delay: 0ms; }
.items:nth-child(2) { transition-delay: var(--core-motion-stagger-sm); }
.items:nth-child(3) { transition-delay: var(--core-motion-stagger-md); }
/* beyond three, items arrive with their row, not after it */`}</code>
        </pre>
        <p>
          Uncapped stagger turns scroll position into wait time. Sequence the
          first movement, then stop sequencing.
        </p>

        <h3>6. Scripted motion ignoring the shared signal</h3>
        <pre>
          <code>{`// ❌ CSS respects the OS setting; the scroll reveal does not
useEffect(() => { animateOnScroll(element, { distance: 60 }); }, []);

// ✅ One signal, both worlds
const { prefersReducedMotion } = useReducedMotion();
useEffect(() => {
  animateOnScroll(element,
    prefersReducedMotion ? { distance: 0, fade: true }
                         : { distance: 60 });
}, [prefersReducedMotion]);`}</code>
        </pre>
        <p>
          A motion system earns its reduced-motion contract the moment
          orchestration code consults the same source of truth as the
          stylesheet. Divergence here is not a style bug; it is an accessibility
          defect.
        </p>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'motion-health-metrics',
    title: 'Motion System Health Metrics',
    order: 8.75,
    content: (
      <>
        <p>
          Motion health is checkable, and the checks are cheaper than the
          perceptual damage they prevent:
        </p>

        <h3>Signal 1: Token coverage</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> component transitions and animations
            reference duration/easing custom properties (or composites)
            exclusively; a grep for literal <code>ms</code> and{' '}
            <code>cubic-bezier</code> in component CSS returns only token
            fallbacks.
          </li>
          <li>
            <strong>Warning:</strong> literals cluster in one area—usually a
            legacy or imported feature—flagging where migration stalled.
          </li>
          <li>
            <strong>Critical:</strong> new components ship with literal timing;
            the vocabulary has stopped being the default path.
          </li>
        </ul>

        <h3>Signal 2: Reduction coverage</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> every rule set that animates also handles{' '}
            <code>prefers-reduced-motion: reduce</code>; scripted animation
            consumes <code>useReducedMotion()</code>; the two mechanisms never
            disagree.
          </li>
          <li>
            <strong>Warning:</strong> CSS coverage is complete but scripted
            motion (scroll reveals, walkthroughs, transitions between routes)
            reads only the media query or only the override.
          </li>
          <li>
            <strong>Critical:</strong> any traveling animation without a reduce
            path—this is a health-risk defect, prioritized like a contrast
            failure.
          </li>
        </ul>

        <h3>Signal 3: Vocabulary drift</h3>
        <ul>
          <li>
            <strong>Healthy:</strong> composites answer real interactions;
          </li>
          <li>
            <strong>Warning:</strong> a composite is being overridden at call
            sites (&quot;modal enter, but faster here&quot;), meaning the
            composite no longer represents the design judgment.
          </li>
          <li>
            <strong>Critical:</strong> token names whose values contradict their
            semantics (an <code>instant</code> slower than a <code>short</code>
            )—users of the vocabulary are being quietly lied to, and trust in
            names is the vocabulary&apos;s entire value.
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'motion-migration',
    title: 'Migration Strategy: From Ad-Hoc Animation to Tokens',
    order: 8.9,
    content: (
      <>
        <p>
          Existing motion is usually scattered literals with inconsistent feel.
          The migration mirrors the color hex-to-token campaign:
        </p>
        <ol>
          <li>
            <strong>Inventory transitions and animations.</strong> Grep
            component styles for <code>transition</code>, <code>animation</code>
            , literal <code>ms</code>/<code>s</code> durations, and{' '}
            <code>cubic-bezier</code> literals. Group by approximate
            duration—most systems find three or four clusters hiding under a
            dozen different numbers.
          </li>
          <li>
            <strong>Snap clusters to the scale.</strong> Map each cluster to its
            nearest scale step (180ms→<code>short3</code> 167ms; 300ms→
            <code>medium0</code>). The visual diff of snapping is near-zero; the
            consistency dividend is immediate.
          </li>
          <li>
            <strong>Replace easing literals with vocabulary.</strong>{' '}
            <code>ease-in-out</code> maps to <code>standard</code>; the bespoke
            curves either match an existing token closely enough to snap, or
            they earn a new named token with review.
          </li>
          <li>
            <strong>Add reduce blocks where missing.</strong> Every file touched
            in steps 2–3 gets its <code>prefers-reduced-motion</code> handling
            in the same change—migration that drops accessibility debt is not
            migration.
          </li>
          <li>
            <strong>Turn on the checks per directory.</strong> As each area
            migrates, lint it against literal timing values so regression is
            blocked where cleanup happened.
          </li>
        </ol>
        <p>A mechanical sketch of the snap pass:</p>
        <pre>
          <code>{`// Literal → token fallback replacement, same shape as color
const durationMap = {
  '150ms': '--core-motion-duration-short',
  '180ms': '--core-motion-duration-short3',  // snapped 167ms
  '250ms': '--core-motion-duration-medium1',
  '300ms': '--core-motion-duration-medium0',
};

for (const file of componentCssFiles) {
  let css = read(file);
  for (const [literal, token] of Object.entries(durationMap)) {
    css = css.replaceAll(literal, \`var(\${token}, \${literal})\`);
  }
  write(file, css); // literals survive as fallbacks; behavior holds
}`}</code>
        </pre>
        <p>
          The snap pass deliberately changes feel by milliseconds at most; its
          purpose is to make the <em>next</em> motion decision cheap and
          consistent, and every subsequent tuning change lands in one token
          instead of forty files.
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
        <p>Where to go next, inside and outside this system:</p>
        <ul>
          <li>
            <strong>Design Tokens</strong> — the architecture these motion
            scales live in: formats, resolution, and validation (
            <code>/blueprints/foundations/tokens</code>).
          </li>
          <li>
            <strong>Color Foundations</strong> — the sibling page showing the
            same three-layer pattern applied to ramps, roles, and component
            contracts (<code>/blueprints/foundations/color</code>).
          </li>
          <li>
            <strong>CSS cascading and cascade layers</strong> — how the
            generated token stylesheet structures precedence (
            <code>https://developer.mozilla.org/en-US/docs/Web/CSS/@layer</code>
            ).
          </li>
          <li>
            <strong>Prefers-reduced-motion</strong> — the media query at the
            center of the reduction contract (
            <code>
              https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
            </code>
            ).
          </li>
          <li>
            <strong>The sources themselves</strong> —{' '}
            <code>ui/designTokens/core/motion.tokens.json</code>,{' '}
            <code>ui/designTokens/semantic/motion.tokens.json</code>,{' '}
            <code>context/ReducedMotionContext.tsx</code>, and the generated{' '}
            <code>app/designTokens.scss</code>.
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
    id: 'tokenized-timing',
    label: 'Every transition and animation references motion tokens',
    description:
      'No literal ms or cubic-bezier values in component rules; fallbacks only in scoped contracts',
    required: true,
  },
  {
    id: 'reduced-motion-css',
    label: 'Every animated rule set handles prefers-reduced-motion',
    description: 'CSS media blocks ship with the motion, not after it',
    required: true,
  },
  {
    id: 'reduced-motion-script',
    label: 'Scripted motion consumes the same signal as CSS',
    description: 'useReducedMotion() for orchestration; no divergent sources',
    required: true,
  },
  {
    id: 'compositor-friendly',
    label: 'Movement animates transform and opacity, not layout',
    description: 'Translate tokens keep distance on the compositor path',
    required: false,
  },
  {
    id: 'capped-stagger',
    label: 'Stagger sequences are capped, not index-proportional',
    description: 'Long lists do not convert scroll position into wait time',
    required: false,
  },
];

content.assessmentPrompts = [
  {
    question:
      'A product spec asks for a toast that "slides in, stacks, and auto-dismisses." Write the motion design: which composites for enter/exit, which translate and stagger tokens, what the reduced-motion variant keeps and drops, and why enter is slower than exit.',
    type: 'application',
  },
  {
    question:
      'You inherit a component with transition: all 180ms ease-in-out and no reduce block. What does each part of that line cost the system, and what is the ordered repair?',
    type: 'application',
  },
  {
    question:
      'The duration scale has instant at 100ms while short1 is 50ms. What does this kind of name/value contradiction do to a vocabulary, and what are the honest ways to resolve it?',
    type: 'reflection',
  },
];

content.crossReferences = {
  concepts: [
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description:
        'The token architecture these motion scales live in: formats, resolution, validation',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description:
        'The sibling three-layer pattern applied to ramps, roles, and contrast',
      type: 'foundation',
    },
    {
      slug: 'philosophy',
      title: 'Philosophy of Design Systems',
      description:
        'The systems-thinking frame that treats motion as infrastructure in time',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['25', '02', '01'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function MotionPage() {
  return <FoundationPage content={content} />;
}

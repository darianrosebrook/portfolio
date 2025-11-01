import styles from './page.module.scss';

/**
 * Metadata for the /blueprints/foundations/motion page.
 * @type {import('next').Metadata}
 */
export const metadata = {
  title: 'Motion & Duration Foundations | Darian Rosebrook',
  description:
    'Learn how to create meaningful, accessible motion and animation systems that reinforce brand and usability in design systems.',
  openGraph: {
    title: 'Motion & Duration Foundations | Darian Rosebrook',
    description:
      'Learn how to create meaningful, accessible motion and animation systems that reinforce brand and usability in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motion & Duration Foundations | Darian Rosebrook',
    description:
      'Learn how to create meaningful, accessible motion and animation systems that reinforce brand and usability in design systems.',
    images: ['https://darianrosebrook.com/darianrosebrook.jpg'],
  },
};

const MotionPage: React.FC = () => {
  return (
    <section className="content">
      <h1>Motion & Duration Foundations</h1>
      <p>
        Motion brings interfaces to life, providing feedback and enhancing
        usability. This section covers how to create meaningful animations that
        respect user preferences, support accessibility, and reinforce your
        brand&apos;s personality.
      </p>

      <h2>Conceptual Understanding: Why Motion Matters</h2>
      <p>
        Motion in interface design is not decorative—it&apos;s a fundamental
        communication mechanism. When done thoughtfully, motion creates a
        bridge between user intention and system response, making digital
        interfaces feel responsive, predictable, and alive.
      </p>

      <h3>The Psychology of Motion</h3>
      <p>
        Human perception is highly attuned to movement. Motion draws attention,
        communicates change, and creates spatial relationships. In digital
        interfaces, motion serves three primary functions:
      </p>
      <ul>
        <li>
          <strong>Feedback:</strong> Confirms that an action has been registered
          and processed. Without motion, users may wonder if their click,
          swipe, or tap was successful.
        </li>
        <li>
          <strong>Orientation:</strong> Helps users understand spatial
          relationships and transitions between states. Motion creates a sense of
          continuity that static layouts cannot.
        </li>
        <li>
          <strong>Hierarchy:</strong> Guides attention to important changes or
          new information. Well-timed motion can direct focus more effectively
          than static visual cues alone.
        </li>
      </ul>

      <h3>Motion as a Design Constraint</h3>
      <p>
        Motion design operates within tight constraints. Unlike print design,
        where motion doesn&apos;t exist, or film, where motion is the primary
        medium, interface motion must:
      </p>
      <ul>
        <li>
          <strong>Be fast enough</strong> to feel responsive (typically
          100–300ms for interaction feedback)
        </li>
        <li>
          <strong>Be slow enough</strong> to be perceived (minimum 100ms to
          register as motion)
        </li>
        <li>
          <strong>Not interfere</strong> with user productivity or cognitive
          processing
        </li>
        <li>
          <strong>Respect accessibility</strong> preferences and not cause
          vestibular disorders
        </li>
      </ul>

      <p>
        These constraints aren&apos;t limitations—they&apos;re opportunities to
        create motion that feels intentional, polished, and considerate of user
        needs.
      </p>

      <h2>Practical Application: Building a Motion System</h2>

      <h3>Duration: The Temporal Foundation</h3>
      <p>
        Duration determines how long animations take. Frame-based thinking helps
        align durations with visual perception:
      </p>
      <ul>
        <li>
          <strong>16.67ms = 1 frame</strong> at 60fps (the standard refresh
          rate)
        </li>
        <li>
          <strong>Instant (100ms):</strong> Immediate feedback for button
          presses and state changes
        </li>
        <li>
          <strong>Short (150–167ms):</strong> Standard hover and focus
          transitions (8–10 frames)
        </li>
        <li>
          <strong>Medium (250–333ms):</strong> Comfortable transitions for
          entering/exiting content (15–20 frames)
        </li>
        <li>
          <strong>Long (500–1000ms):</strong> Deliberate transitions for major
          state changes (30–60 frames)
        </li>
      </ul>

      <p>
        Our duration tokens are frame-aligned for consistency:
      </p>
      <pre>
        <code>{`{
  "core.motion.duration.short2": "83ms",   // 5 frames
  "core.motion.duration.short3": "167ms",  // 10 frames
  "core.motion.duration.medium2": "333ms", // 20 frames
  "core.motion.duration.long1": "667ms"    // 40 frames
}`}</code>
      </pre>

      <h3>Easing: The Personality of Motion</h3>
      <p>
        Easing functions define how motion accelerates and decelerates. They
        determine whether motion feels mechanical or organic, sharp or smooth,
        energetic or calm.
      </p>

      <h4>Easing Categories</h4>
      <ul>
        <li>
          <strong>Ease-in:</strong> Starts slow, ends fast. Creates a sense of
          acceleration. Good for exits and dismissals.
        </li>
        <li>
          <strong>Ease-out:</strong> Starts fast, ends slow. Creates a sense of
          deceleration. Good for entrances and reveals.
        </li>
        <li>
          <strong>Ease-in-out:</strong> Starts and ends slow, fast in the
          middle. Most natural feeling. Good for general transitions.
        </li>
        <li>
          <strong>Linear:</strong> Constant speed. Feels mechanical. Use
          sparingly, typically for loading indicators or progress bars.
        </li>
      </ul>

      <p>
        Our easing tokens provide semantic meaning:
      </p>
      <pre>
        <code>{`{
  "core.motion.easing.quick.enter": "cubic-bezier(0, 0, 0.1, 1)",
  "core.motion.easing.quick.exit": "cubic-bezier(1, 0, 1, 1)",
  "core.motion.easing.soft.enter": "cubic-bezier(0, 0, 0.7, 1)",
  "core.motion.easing.soft.exit": "cubic-bezier(0.3, 0, 1, 1)",
  "core.motion.easing.standard": "cubic-bezier(0.4, 0, 0.2, 1)"
}`}</code>
      </pre>

      <h3>Semantic Motion Tokens</h3>
      <p>
        Just as color tokens describe purpose rather than value, motion tokens
        describe intent rather than implementation:
      </p>
      <pre>
        <code>{`{
  "semantic.motion.interaction.press": {
    "duration": "{motion.duration.instant}",
    "easing": "{motion.easing.standard}",
    "scale": 0.98
  },
  "semantic.motion.interaction.hover": {
    "duration": "{motion.duration.short2}",
    "easing": "{motion.easing.quick.enter}"
  },
  "semantic.motion.interaction.enter": {
    "duration": "{motion.duration.medium1}",
    "easing": "{motion.easing.soft.enter}"
  },
  "semantic.motion.interaction.exit": {
    "duration": "{motion.duration.short3}",
    "easing": "{motion.easing.quick.exit}"
  }
}`}</code>
      </pre>

      <p>
        This semantic approach enables:
      </p>
      <ul>
        <li>
          <strong>Consistency:</strong> All buttons use the same press animation
          token
        </li>
        <li>
          <strong>Maintainability:</strong> Changing the press animation updates
          all buttons
        </li>
        <li>
          <strong>Brand expression:</strong> Different brands can remap tokens
          while maintaining semantic meaning
        </li>
      </ul>

      <h2>Systems Integration: Motion in the Design System</h2>

      <h3>Motion and Accessibility</h3>
      <p>
        Motion must respect user preferences. The{' '}
        <code>prefers-reduced-motion</code> media query signals when users
        prefer less or no motion:
      </p>

      <pre>
        <code>{`@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}`}</code>
      </pre>

      <p>
        However, blanket disabling of all motion can break functionality. A more
        nuanced approach:
      </p>
      <ul>
        <li>
          <strong>Disable decorative motion:</strong> Parallax, background
          animations, pulsing effects
        </li>
        <li>
          <strong>Preserve essential motion:</strong> Modal transitions, focus
          indicators, loading states
        </li>
        <li>
          <strong>Simplify motion:</strong> Replace complex animations with
          simpler alternatives
        </li>
      </ul>

      <h3>Motion and Performance</h3>
      <p>
        Poorly implemented motion causes jank, drains battery, and frustrates
        users. Performance considerations:
      </p>
      <ul>
        <li>
          <strong>Use transform and opacity:</strong> These properties are
          GPU-accelerated and don&apos;t trigger layout or paint
        </li>
        <li>
          <strong>Avoid animating:</strong> <code>width</code>,{' '}
          <code>height</code>, <code>top</code>, <code>left</code>—these
          trigger layout recalculation
        </li>
        <li>
          <strong>Limit simultaneous animations:</strong> Too many concurrent
          animations can overwhelm the browser
        </li>
        <li>
          <strong>Use <code>will-change</code>:</strong> Hint to the browser
          about upcoming animations, but use sparingly
        </li>
      </ul>

      <h3>Motion and Component Architecture</h3>
      <p>
        Motion tokens integrate with component tokens:
      </p>
      <pre>
        <code>{`.button {
  transition: transform var(--semantic-motion-interaction-press-duration)
                var(--semantic-motion-interaction-press-easing);
  
  &:active {
    transform: scale(var(--semantic-motion-interaction-press-scale));
  }
  
  @media (prefers-reduced-motion: reduce) {
    transition: none;
    &:active {
      transform: none;
      opacity: 0.7;
    }
  }
}`}</code>
      </pre>

      <h2>Critical Reflection: Trade-offs and Edge Cases</h2>

      <h3>Duration Trade-offs</h3>
      <p>
        Choosing duration involves balancing multiple factors:
      </p>
      <ul>
        <li>
          <strong>Too fast:</strong> Motion becomes imperceptible, users miss
          feedback
        </li>
        <li>
          <strong>Too slow:</strong> Interface feels sluggish, users become
          impatient
        </li>
        <li>
          <strong>Context matters:</strong> Loading animations can be slower
          (500ms+) because they communicate progress. Interaction feedback must
          be fast (100–200ms) to feel responsive.
        </li>
      </ul>

      <h3>Easing Trade-offs</h3>
      <p>
        Different easing curves communicate different personalities:
      </p>
      <ul>
        <li>
          <strong>Sharp curves:</strong> Feel energetic but can be jarring
        </li>
        <li>
          <strong>Soft curves:</strong> Feel polished but can feel slow
        </li>
        <li>
          <strong>Bounce:</strong> Adds playfulness but can feel unprofessional
          in enterprise contexts
        </li>
        <li>
          <strong>Linear:</strong> Feels mechanical but is predictable for
          progress indicators
        </li>
      </ul>

      <h3>Accessibility Edge Cases</h3>
      <p>
        Motion accessibility isn&apos;t binary:
      </p>
      <ul>
        <li>
          <strong>Vestibular disorders:</strong> Users may need reduced motion
          but not complete elimination
        </li>
        <li>
          <strong>Attention disorders:</strong> Motion can be distracting or
          helpful depending on context
        </li>
        <li>
          <strong>Low bandwidth:</strong> Users may prefer reduced motion to
          save data
        </li>
        <li>
          <strong>Battery constraints:</strong> Complex animations drain
          battery faster
        </li>
      </ul>

      <h3>When to Break the Rules</h3>
      <p>
        Sometimes, breaking motion conventions is appropriate:
      </p>
      <ul>
        <li>
          <strong>Celebratory moments:</strong> Success animations can be more
          expressive
        </li>
        <li>
          <strong>Brand expression:</strong> Unique easing curves can reinforce
          brand personality
        </li>
        <li>
          <strong>Error states:</strong> More pronounced motion can draw
          attention to critical issues
        </li>
      </ul>
      <p>
        The key is intentionality: every deviation should serve a purpose and be
        documented.
      </p>

      <h2>Motion Patterns and Best Practices</h2>

      <h3>Enter/Exit Patterns</h3>
      <p>
        Entrances and exits should feel different:
      </p>
      <ul>
        <li>
          <strong>Enter:</strong> Slightly slower, softer easing (ease-out) to
          welcome content
        </li>
        <li>
          <strong>Exit:</strong> Faster, sharper easing (ease-in) to dismiss
          quickly
        </li>
      </ul>
      <p>
        This creates a natural rhythm: content arrives gently, departs quickly.
      </p>

      <h3>Staggered Animations</h3>
      <p>
        Staggering creates flow and hierarchy:
      </p>
      <pre>
        <code>{`.list-item {
  animation-delay: calc(var(--index) * var(--semantic-motion-stagger-list));
}`}</code>
      </pre>
      <p>
        Stagger tokens should be small enough to feel connected (17–100ms) but
        large enough to be perceived.
      </p>

      <h3>Choreography</h3>
      <p>
        Multiple elements animating together should feel coordinated:
      </p>
      <ul>
        <li>
          <strong>Related elements:</strong> Use similar durations and easing
        </li>
        <li>
          <strong>Sequential animations:</strong> Start related animations in
          quick succession (50–100ms delays)
        </li>
        <li>
          <strong>Opposing elements:</strong> Exit animations should complete
          before enter animations begin
        </li>
      </ul>

      <h2>Implementation Patterns</h2>

      <h3>CSS Transitions</h3>
      <p>
        For simple state changes:
      </p>
      <pre>
        <code>{`.component {
  transition: transform var(--semantic-motion-interaction-hover-duration)
              var(--semantic-motion-interaction-hover-easing);
  
  &:hover {
    transform: translateY(-2px);
  }
}`}</code>
      </pre>

      <h3>CSS Animations</h3>
      <p>
        For complex, reusable animations:
      </p>
      <pre>
        <code>{`@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.component {
  animation: fadeIn var(--semantic-motion-interaction-enter-duration)
            var(--semantic-motion-interaction-enter-easing);
}`}</code>
      </pre>

      <h3>Reduced Motion Implementation</h3>
      <p>
        Respect user preferences at multiple levels:
      </p>
      <pre>
        <code>{`/* Component level */
@media (prefers-reduced-motion: reduce) {
  .decorative-animation {
    animation: none;
  }
  
  .essential-transition {
    /* Simplify but keep */
    transition-duration: 100ms;
  }
}

/* JavaScript level */
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

if (!prefersReducedMotion) {
  // Enable complex animations
}`}</code>
      </pre>

      <h2>Common Mistakes and Anti-patterns</h2>
      <ul>
        <li>
          <strong>Motion for motion&apos;s sake:</strong> Every element doesn&apos;t
          need to animate. Use motion purposefully.
        </li>
        <li>
          <strong>Ignoring reduced motion:</strong> Always check{' '}
          <code>prefers-reduced-motion</code> before enabling animations.
        </li>
        <li>
          <strong>Inconsistent timing:</strong> Random durations create a
          chaotic feel. Use your token system.
        </li>
        <li>
          <strong>Animating wrong properties:</strong> Animating layout properties
          causes jank. Use transform and opacity.
        </li>
        <li>
          <strong>Too many simultaneous animations:</strong> Overwhelming users
          with motion reduces clarity.
        </li>
        <li>
          <strong>Motion blocking interaction:</strong> Don&apos;t delay
          critical feedback or block user actions.
        </li>
      </ul>

      <h2>Best Practices</h2>
      <ul>
        <li>
          <strong>Start with tokens:</strong> Use semantic motion tokens, not
          hardcoded values
        </li>
        <li>
          <strong>Test with reduced motion:</strong> Verify your interface
          works without motion
        </li>
        <li>
          <strong>Measure performance:</strong> Use browser DevTools to identify
          performance bottlenecks
        </li>
        <li>
          <strong>Document exceptions:</strong> When you break motion
          conventions, explain why
        </li>
        <li>
          <strong>Consider context:</strong> Mobile devices may need simpler
          motion due to performance constraints
        </li>
        <li>
          <strong>Test with users:</strong> Gather feedback on motion timing
          and easing preferences
        </li>
        <li>
          <strong>Frame-align durations:</strong> Use multiples of 16.67ms for
          smooth 60fps animations
        </li>
        <li>
          <strong>Match motion to brand:</strong> Easing curves can reinforce
          brand personality
        </li>
      </ul>

      <h2>Related Foundations</h2>
      <p>
        Motion intersects with other foundations:
      </p>
      <ul>
        <li>
          <strong>Accessibility:</strong> Motion must respect user preferences
          and not cause harm
        </li>
        <li>
          <strong>Interaction Tokens:</strong> Motion reinforces interaction
          states (hover, focus, active)
        </li>
        <li>
          <strong>Performance:</strong> Motion impacts rendering performance and
          battery life
        </li>
        <li>
          <strong>Components:</strong> Components use motion tokens for
          consistent behavior
        </li>
      </ul>
    </section>
  );
};

export default MotionPage;

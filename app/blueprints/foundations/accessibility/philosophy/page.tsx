/**
 * Foundation: Accessibility as System Infrastructure
 * Expanded content with comprehensive accessibility foundations
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Accessibility as System Infrastructure',
  description:
    "Accessibility is more than a checklist—it's a mindset that enhances design decision-making and expands usability for everyone. Learn how to embed accessibility as a system invariant rather than an afterthought.",
  slug: 'accessibility',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/accessibility',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'accessibility, a11y, WCAG, ARIA, inclusive design',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['philosophy'],
    next_units: ['component-architecture'],
    assessment_required: false,
    estimated_reading_time: 22,
  },
  governance: {
    canonical_version: 'WCAG 2.1 AA',
    alignment_status: 'aligned',
    last_review_date: new Date().toISOString(),
    next_review_date: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ).toISOString(),
  },
  author: {
    name: 'Darian Rosebrook',
    role: 'Staff Design Technologist, Design Systems Architect',
    expertise: ['Accessibility', 'WCAG', 'ARIA', 'Inclusive Design'],
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
    title: 'Why Accessibility Matters',
    order: 3,
    content: (
      <>
        <p>
          Accessibility is more than a checklist—it's a mindset that enhances
          design decision-making and expands usability for everyone. When
          accessibility is treated as a design constraint rather than a
          compliance requirement, it leads to better, more inclusive products.
        </p>
        <p>
          Accessibility is not about making exceptions for a small group of
          users. It's about recognizing that human abilities exist on a
          spectrum, and that designs that work for people with disabilities
          often work better for everyone. Accessibility improvements benefit all
          users: clearer labeling helps everyone understand interfaces, keyboard
          navigation speeds up power users, and high contrast improves
          readability in bright sunlight.
        </p>
        <p>
          Most importantly, accessibility should be embedded as a system
          invariant rather than an afterthought. This means building
          accessibility into tokens, components, and patterns from the start,
          not adding it as a retrofit.
        </p>
      </>
    ),
  },
  {
    type: 'core-concepts',
    id: 'core-concepts',
    title: 'Core Concepts',
    order: 4,
    content: (
      <>
        <h3>WCAG, APCA, and ARIA Integration</h3>
        <p>
          Accessibility in design systems is built on three foundational
          standards:
        </p>
        <ul>
          <li>
            <strong>WCAG 2.1:</strong> Web Content Accessibility Guidelines
            provide success criteria for perceivable, operable, understandable,
            and robust content. Level AA compliance is typically the minimum
            standard for design systems.
          </li>
          <li>
            <strong>APCA:</strong> Advanced Perceptual Contrast Algorithm
            provides more accurate contrast evaluation than WCAG ratios,
            especially for dark mode and non-standard color combinations.
          </li>
          <li>
            <strong>ARIA:</strong> Accessible Rich Internet Applications
            attributes provide semantic meaning when HTML alone is insufficient.
            ARIA should enhance, not replace, proper HTML semantics.
          </li>
        </ul>

        <h3>Accessible Defaults</h3>
        <p>Design systems should provide accessible defaults at every layer:</p>
        <ul>
          <li>
            <strong>Token-level:</strong> Color tokens encode minimum contrast
            ratios. Spacing tokens ensure minimum touch target sizes (44×44px).
            Motion tokens respect <code>prefers-reduced-motion</code>.
          </li>
          <li>
            <strong>Component-level:</strong> Components ship with proper ARIA
            attributes, keyboard navigation, and focus management built in.
          </li>
          <li>
            <strong>Pattern-level:</strong> Common patterns like forms,
            navigation, and modals follow accessible interaction models.
          </li>
        </ul>

        <h3>Cross-Platform Accessibility</h3>
        <p>Accessibility requirements differ across platforms:</p>
        <ul>
          <li>
            <strong>Web:</strong> WCAG 2.1 AA, keyboard navigation, screen
            reader support, focus indicators
          </li>
          <li>
            <strong>iOS:</strong> VoiceOver support, Dynamic Type, accessibility
            labels, trait-based navigation
          </li>
          <li>
            <strong>Android:</strong> TalkBack support, content descriptions,
            accessibility focus, semantic actions
          </li>
        </ul>
        <p>
          While implementations differ, the principles remain consistent:
          semantic structure, clear labeling, keyboard/touch navigation, and
          perceivable feedback.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: Accessibility as Infrastructure',
    order: 5,
    content: (
      <>
        <h3>Token-Level Validation</h3>
        <p>
          Accessibility starts at the token level. Color tokens should validate
          contrast ratios during build. Spacing tokens should enforce minimum
          touch target sizes. Motion tokens should respect user preferences.
          This ensures accessibility is encoded at the lowest level of the
          system.
        </p>

        <h3>Component-Level Guarantees</h3>
        <p>
          Components should provide accessibility guarantees through their APIs.
          A button component should always have proper focus management. A form
          field should always be associated with its label. A modal should
          always trap focus. These guarantees are non-negotiable system
          invariants.
        </p>

        <h3>Testing and Continuous Validation</h3>
        <p>
          Accessibility must be tested continuously, not just audited
          periodically. Automated tools like axe, pa11y, and jest-axe catch many
          issues. Manual testing with screen readers and keyboard navigation
          catches others. Both are essential for maintaining accessibility as
          the system evolves.
        </p>
      </>
    ),
  },
  {
    type: 'design-code-interplay',
    id: 'design-code-interplay',
    title: 'Design & Code Interplay',
    order: 6,
    content: (
      <>
        <p>
          Accessibility requires collaboration between design and engineering.
          Let's examine how accessibility principles manifest in actual code.
        </p>

        <h3>Semantic HTML: The Foundation</h3>
        <p>
          The most accessible code starts with correct HTML semantics. A button
          should be a <code>{'<button>'}</code>, not a <code>{'<div>'}</code>{' '}
          styled to look like a button. Semantic HTML provides built-in
          accessibility without additional code:
        </p>

        <pre>
          <code>{`// ✅ Accessible: Semantic HTML
<button onClick={handleClick}>
  Submit
</button>

// Built-in accessibility:
// - Keyboard accessible (Enter/Space)
// - Screen reader announces as button
// - Focusable by default
// - Correct role and state

// ❌ Inaccessible: Div styled as button
<div onClick={handleClick} className="button">
  Submit
</div>

// Missing:
// - No keyboard support (must add manually)
// - Screen reader doesn't recognize as button
// - Not focusable (must add tabIndex)
// - Wrong role (div, not button)`}</code>
        </pre>

        <h3>ARIA: Enhancing, Not Replacing</h3>
        <p>
          ARIA attributes enhance semantic HTML when HTML alone isn't
          sufficient. They should never replace proper HTML semantics:
        </p>

        <pre>
          <code>{`// ✅ Correct: HTML + ARIA enhancement
<input
  id="email"
  type="email"
  aria-invalid={hasError}
  aria-describedby={errorId}
  aria-required="true"
/>

{error && (
  <div id={errorId} role="alert" aria-live="polite">
    {error}
  </div>
)}

// ARIA adds:
// - aria-invalid: Indicates validation state
// - aria-describedby: Links input to error message
// - aria-required: Indicates required field
// - role="alert": Announces error to screen readers
// - aria-live: Announces dynamic content changes

// ❌ Wrong: ARIA replacing HTML
<div role="button" tabIndex={0} onClick={handleClick}>
  Submit
</div>

// Should use <button> instead!
// ARIA should enhance, not replace semantics`}</code>
        </pre>

        <h3>Keyboard Navigation: Focus Management</h3>
        <p>
          Keyboard navigation requires careful focus management. Interactive
          elements must be focusable, and focus must be managed correctly:
        </p>

        <pre>
          <code>{`// Accessible button with keyboard support
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ onClick, disabled, children, ...props }, ref) => {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      // Enter or Space activates button
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (!disabled && onClick) {
          onClick(e as any);
        }
      }
    };

    return (
      <button
        ref={ref}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-disabled={disabled}
        // Focus indicator visible via CSS
        className={styles.button}
        {...props}
      >
        {children}
      </button>
    );
  }
);

// Key accessibility features:
// - Semantic <button> provides native keyboard support
// - Explicit keyboard handler for custom behavior
// - aria-disabled communicates state
// - Focus indicator visible (via CSS focus-visible)`}</code>
        </pre>

        <h3>Focus Trapping: Modal Dialogs</h3>
        <p>
          Modal dialogs must trap focus within the dialog and return focus when
          closed. This prevents keyboard users from navigating outside the
          modal:
        </p>

        <pre>
          <code>{`// Focus trap implementation for modal
const Dialog = ({ isOpen, onClose, children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element in dialog
      const focusableElements = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusableElements?.[0] as HTMLElement)?.focus();

      // Trap focus: prevent tabbing outside
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        
        const focusable = Array.from(focusableElements || []) as HTMLElement[];
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      };

      document.addEventListener('keydown', handleTab);
      return () => {
        document.removeEventListener('keydown', handleTab);
        // Return focus when modal closes
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen]);

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      // ... rest of dialog implementation
    >
      {children}
    </div>
  );
};`}</code>
        </pre>

        <h3>Form Accessibility: Label Association</h3>
        <p>
          Form inputs must be properly associated with labels. This enables
          screen readers to announce the input's purpose:
        </p>

        <pre>
          <code>{`// Accessible form field with proper label association
export const TextField = React.forwardRef<HTMLInputElement, TextFieldProps>(
  ({ id, label, error, description, ...inputProps }, ref) => {
    const inputId = React.useId();
    const resolvedId = id ?? \`tf-\${inputId}\`;
    const descId = description ? \`\${resolvedId}-desc\` : undefined;
    const errId = error ? \`\${resolvedId}-err\` : undefined;
    
    // Combine all descriptions for aria-describedby
    const describedBy = [descId, errId]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className={styles.field}>
        {label && (
          <Label htmlFor={resolvedId}>
            {label}
          </Label>
        )}
        <Input
          id={resolvedId}
          ref={ref}
          aria-describedby={describedBy}
          aria-invalid={!!error}
          {...inputProps}
        />
        {description && (
          <div id={descId} className={styles.description}>
            {description}
          </div>
        )}
        {error && (
          <div id={errId} role="alert" className={styles.error}>
            {error}
          </div>
        )}
      </div>
    );
  }
);

// Accessibility features:
// - Label associated via htmlFor/id
// - aria-describedby links input to descriptions
// - aria-invalid indicates error state
// - role="alert" announces errors immediately
// - Error message has unique ID for reference`}</code>
        </pre>

        <h3>Screen Reader Announcements</h3>
        <p>
          Dynamic content changes must be announced to screen readers. Use{' '}
          <code>aria-live</code> regions to announce updates:
        </p>

        <pre>
          <code>{`// Live region for dynamic announcements
const Toast = ({ message, type }) => {
  return (
    <div
      role="alert"
      aria-live={type === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={styles.toast}
    >
      {message}
    </div>
  );
};

// aria-live values:
// - "polite": Announces when user is idle (non-critical)
// - "assertive": Announces immediately (critical)
// - aria-atomic: Announces entire region, not just changes

// Usage:
<Toast message="Form submitted successfully" type="success" />
// Screen reader announces: "Form submitted successfully"`}</code>
        </pre>

        <h3>Reduced Motion Support</h3>
        <p>
          Respect user motion preferences. Use CSS media queries and JavaScript
          to disable animations for users who prefer reduced motion:
        </p>

        <pre>
          <code>{`// CSS: Respect prefers-reduced-motion
.button {
  transition: transform 0.2s ease;
}

@media (prefers-reduced-motion: reduce) {
  .button {
    transition: none;
  }
}

// JavaScript: Check preference
const prefersReducedMotion = window.matchMedia(
  '(prefers-reduced-motion: reduce)'
).matches;

// Conditionally apply animations
if (!prefersReducedMotion) {
  element.style.transition = 'transform 0.2s ease';
}

// React: Use context for motion preferences
const { prefersReducedMotion } = useReducedMotionContext();

const animationDuration = prefersReducedMotion ? 0 : 200;`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          These accessibility patterns don't exist in isolation. When a designer
          specifies contrast requirements, those constraints flow through tokens
          to components. When an engineer implements focus management, it
          enables keyboard users to navigate the entire system.
        </p>

        <p>
          Accessibility in code is not optional—it's a requirement. These
          patterns ensure that every user can access and use the system,
          regardless of their abilities or assistive technologies. This is
          accessibility as infrastructure: built-in, not bolted-on.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Fixing an Inaccessible Component',
    order: 7,
    content: (
      <>
        <p>Let's walk through fixing an inaccessible component step by step:</p>

        <h3>Step 1: Identify the Problem</h3>
        <p>Start with an inaccessible component:</p>
        <pre>
          <code>{`// ❌ Inaccessible: div as button
<div onClick={handleClick} className="button">
  Click me
</div>

// Problems identified:
// - Not keyboard accessible
// - Screen reader won't announce as button
// - No focus indicator
// - No disabled state handling
// - Touch target may be too small`}</code>
        </pre>

        <h3>Step 2: Audit with Accessibility Tools</h3>
        <p>Run automated accessibility tests:</p>
        <ul>
          <li>
            <strong>axe-core:</strong> Identifies missing semantic HTML
          </li>
          <li>
            <strong>Keyboard navigation:</strong> Tab key doesn't reach element
          </li>
          <li>
            <strong>Screen reader:</strong> VoiceOver/NVDA don't announce as
            button
          </li>
          <li>
            <strong>Contrast check:</strong> Text contrast may be insufficient
          </li>
        </ul>

        <h3>Step 3: Fix Semantic HTML</h3>
        <p>Replace div with semantic button element:</p>
        <pre>
          <code>{`// ✅ Step 1: Use semantic button
<button onClick={handleClick} className="button">
  Click me
</button>

// Benefits:
// - Native keyboard support (Enter/Space)
// - Screen reader announces as button
// - Proper focus management
// - Disabled state support`}</code>
        </pre>

        <h3>Step 4: Add Focus Management</h3>
        <p>Ensure visible focus indicator:</p>
        <pre>
          <code>{`// ✅ Step 2: Add visible focus indicator
.button {
  /* ... existing styles ... */
}

.button:focus-visible {
  outline: 2px solid var(--semantic-color-border-accent);
  outline-offset: 2px;
}

// Benefits:
// - Keyboard users can see focus
// - Meets WCAG 2.4.7 Focus Visible
// - Clear navigation feedback`}</code>
        </pre>

        <h3>Step 5: Ensure Proper ARIA</h3>
        <p>Add ARIA attributes when needed:</p>
        <pre>
          <code>{`// ✅ Step 3: Add ARIA for icon-only buttons
<button 
  onClick={handleClick}
  aria-label="Close dialog"
  className="button"
>
  <Icon name="close" aria-hidden="true" />
</button>

// For buttons with visible text, no aria-label needed:
<button onClick={handleClick} className="button">
  Close  {/* Visible text is sufficient */}
</button>

// Benefits:
// - Screen reader announces purpose
// - Icon-only buttons are accessible
// - Proper ARIA usage`}</code>
        </pre>

        <h3>Step 6: Handle Disabled State</h3>
        <p>Properly communicate disabled state:</p>
        <pre>
          <code>{`// ✅ Step 4: Handle disabled state
<button 
  onClick={handleClick}
  disabled={isDisabled}
  aria-disabled={isDisabled}
  className="button"
>
  Submit
</button>

// CSS handles disabled styling:
.button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

// Benefits:
// - Screen reader announces disabled state
// - Keyboard users can't activate disabled button
// - Visual indication of disabled state`}</code>
        </pre>

        <h3>Step 7: Ensure Touch Target Size</h3>
        <p>Verify minimum touch target size:</p>
        <pre>
          <code>{`// ✅ Step 5: Ensure minimum touch target
.button {
  min-height: 44px;  /* WCAG minimum */
  min-width: 44px;
  padding: var(--semantic-spacing-padding-button);
}

// If button is smaller, add padding:
.button--small {
  min-height: 44px;
  min-width: 44px;
  padding: var(--semantic-spacing-padding-button-small);
}

// Benefits:
// - Meets WCAG 2.5.5 Target Size
// - Accessible on touch devices
// - Easier to interact with`}</code>
        </pre>

        <h3>Step 8: Validate Accessibility</h3>
        <p>Test the fixed component:</p>
        <ul>
          <li>
            <strong>Keyboard navigation:</strong> Tab to button, press
            Enter/Space to activate
          </li>
          <li>
            <strong>Screen reader:</strong> Button announces correctly with
            purpose and state
          </li>
          <li>
            <strong>Focus indicator:</strong> Visible outline when focused
          </li>
          <li>
            <strong>Contrast:</strong> Text meets WCAG AA (4.5:1) or AAA (7:1)
            requirements
          </li>
          <li>
            <strong>Touch target:</strong> Minimum 44×44px size
          </li>
        </ul>

        <h3>Final Implementation</h3>
        <p>Complete accessible button component:</p>
        <pre>
          <code>{`// ✅ Complete accessible button
export const Button = ({ 
  onClick, 
  disabled = false,
  children,
  ariaLabel,
  ...props 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-disabled={disabled}
      aria-label={ariaLabel}
      className={styles.button}
      {...props}
    >
      {children}
    </button>
  );
};

// CSS with accessibility built-in:
.button {
  min-height: 44px;
  min-width: 44px;
  padding: var(--semantic-spacing-padding-button);
  background: var(--semantic-color-action-background-primary);
  color: var(--semantic-color-action-foreground-primary);
  border: none;
  border-radius: var(--semantic-shape-radius-button);
  font-size: var(--semantic-typography-size-button);
  cursor: pointer;
  
  &:focus-visible {
    outline: 2px solid var(--semantic-color-border-accent);
    outline-offset: 2px;
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  &:hover:not(:disabled) {
    background: var(--semantic-color-action-background-primary-hover);
  }
}

// Benefits:
// - Fully keyboard accessible
// - Screen reader compatible
// - Meets WCAG 2.1 Level AA
// - Touch-friendly
// - Accessible by default`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>This accessibility fix demonstrates:</p>
        <ul>
          <li>
            <strong>Systemic approach:</strong> Accessibility built into
            component architecture, not added later
          </li>
          <li>
            <strong>Standards compliance:</strong> Meets WCAG 2.1 Level AA
            requirements
          </li>
          <li>
            <strong>Universal access:</strong> Works for keyboard, screen
            reader, and touch users
          </li>
          <li>
            <strong>Maintainability:</strong> Accessible patterns become
            reusable system components
          </li>
        </ul>
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
        <p>Accessibility involves tradeoffs:</p>
        <ul>
          <li>
            <strong>Aesthetic vs. Accessibility:</strong> Some design choices
            conflict with accessibility requirements. The system must prioritize
            accessibility while finding creative solutions that maintain design
            intent.
          </li>
          <li>
            <strong>Complexity vs. Clarity:</strong> More accessible interfaces
            sometimes require more verbose markup or additional interactions.
            The system must balance simplicity with accessibility.
          </li>
          <li>
            <strong>Platform Differences:</strong> Different platforms have
            different accessibility requirements. The system must provide
            consistent patterns while respecting platform conventions.
          </li>
        </ul>
        <p>
          The key is making accessibility a first-class constraint, not an
          optional consideration.
        </p>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'accessibility-anti-patterns',
    title: 'Accessibility Anti-Patterns & Common Mistakes',
    order: 8.5,
    content: (
      <>
        <p>
          Understanding accessibility anti-patterns helps avoid common mistakes
          that create barriers for users:
        </p>

        <h3>1. Divs and Spans as Interactive Elements</h3>
        <p>
          <strong>The Problem:</strong> Using non-semantic elements for
          interactive controls.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: div as button
<div onClick={handleClick} className="button">
  Click me
</div>

// Problems:
// - Not keyboard accessible (no tabIndex)
// - Screen reader doesn't recognize as button
// - No native keyboard support (Enter/Space)
// - Missing role and state information
// - Requires manual implementation of all accessibility

// ✅ Correct: semantic button element
<button onClick={handleClick} className="button">
  Click me
</button>

// Benefits:
// - Keyboard accessible by default
// - Screen reader announces as button
// - Native keyboard support (Enter/Space)
// - Proper role and state semantics
// - Accessible by default`}</code>
        </pre>

        <h3>2. Missing Labels</h3>
        <p>
          <strong>The Problem:</strong> Form inputs without associated labels.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: input without label
<input type="email" placeholder="Email" />

// Problems:
// - Screen reader can't identify purpose
// - No association between label and input
// - Placeholder text disappears on focus
// - Violates WCAG 2.1 Label requirement

// ✅ Correct: label association
<label htmlFor="email">Email</label>
<input id="email" type="email" />

// Or with aria-label:
<input 
  type="email" 
  aria-label="Email address"
/>

// Benefits:
// - Screen reader announces purpose
// - Clear association between label and input
// - Label persists when input has focus
// - WCAG compliant`}</code>
        </pre>

        <h3>3. Poor Focus Management</h3>
        <p>
          <strong>The Problem:</strong> Missing or invisible focus indicators.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: removing focus outline
.button:focus {
  outline: none;
}

// Problems:
// - Keyboard users can't see focus
// - No visual indication of focus position
// - Violates WCAG 2.4.7 Focus Visible
// - Creates navigation barriers

// ✅ Correct: visible focus indicator
.button:focus-visible {
  outline: 2px solid var(--semantic-color-border-accent);
  outline-offset: 2px;
}

// Benefits:
// - Clear focus indication
// - Keyboard users can navigate
// - WCAG compliant
// - Accessible navigation`}</code>
        </pre>

        <h3>4. ARIA Overuse</h3>
        <p>
          <strong>The Problem:</strong> Using ARIA to replace semantic HTML.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: ARIA replacing HTML
<div role="button" tabIndex={0} onClick={handleClick}>
  Submit
</div>

// Problems:
// - Should use <button> instead
// - Requires manual keyboard handling
// - More code than semantic HTML
// - ARIA should enhance, not replace

// ✅ Correct: semantic HTML with ARIA enhancement
<button 
  onClick={handleClick}
  aria-label="Submit form"
>
  Submit
</button>

// Benefits:
// - Native button semantics
// - Built-in keyboard support
// - ARIA adds context, doesn't replace
// - Less code, better accessibility`}</code>
        </pre>

        <h3>5. Insufficient Color Contrast</h3>
        <p>
          <strong>The Problem:</strong> Text and UI elements with low contrast
          ratios.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: low contrast
.button {
  background: #cccccc;  /* Light gray */
  color: #ffffff;       /* White */
}

// Contrast ratio: ~1.8:1 (fails WCAG AA)
// Problems:
// - Hard to read for low vision users
// - Fails WCAG 2.1 contrast requirements
// - Creates visual barriers
// - May violate accessibility laws

// ✅ Correct: sufficient contrast
.button {
  background: #0055ff;   /* Blue */
  color: #ffffff;       /* White */
}

// Contrast ratio: ~4.5:1 (meets WCAG AA)
// Benefits:
// - Readable for all users
// - WCAG compliant
// - Legal compliance
// - Better UX for everyone`}</code>
        </pre>

        <h3>6. Missing Keyboard Navigation</h3>
        <p>
          <strong>The Problem:</strong> Interactive elements not accessible via
          keyboard.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: mouse-only interaction
<div 
  className="dropdown"
  onMouseEnter={showMenu}
  onMouseLeave={hideMenu}
>
  Menu
</div>

// Problems:
// - Keyboard users can't access
// - No keyboard alternative
// - Creates navigation barriers
// - Violates WCAG 2.1.1 Keyboard

// ✅ Correct: keyboard accessible
<button
  className="dropdown"
  onClick={toggleMenu}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      toggleMenu();
    }
  }}
  aria-expanded={isOpen}
  aria-haspopup="true"
>
  Menu
</button>

// Benefits:
// - Keyboard accessible
// - All users can interact
// - WCAG compliant
// - Better UX`}</code>
        </pre>

        <h3>7. Missing Error Messages</h3>
        <p>
          <strong>The Problem:</strong> Form errors not communicated to screen
          readers.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: visual-only error
<input type="email" className={hasError ? 'error' : ''} />
{hasError && (
  <span className="error-text">Invalid email</span>
)}

// Problems:
// - Screen reader doesn't announce error
// - No association between input and error
// - Error state not communicated
// - Violates WCAG 3.3.1 Error Identification

// ✅ Correct: accessible error messaging
<input
  type="email"
  aria-invalid={hasError}
  aria-describedby={errorId}
/>
{hasError && (
  <span id={errorId} role="alert" className="error-text">
    Invalid email
  </span>
)}

// Benefits:
// - Screen reader announces error
// - Clear association via aria-describedby
// - Error state communicated
// - WCAG compliant`}</code>
        </pre>

        <h3>8. Missing Alt Text</h3>
        <p>
          <strong>The Problem:</strong> Images without alternative text.
        </p>
        <pre>
          <code>{`// ❌ Anti-pattern: missing alt text
<img src="chart.png" />

// Problems:
// - Screen reader can't describe image
// - Decorative images not marked
// - Informative images inaccessible
// - Violates WCAG 1.1.1 Non-text Content

// ✅ Correct: appropriate alt text
// Informative image:
<img src="chart.png" alt="Revenue increased 25% in Q4" />

// Decorative image:
<img src="decoration.png" alt="" role="presentation" />

// Benefits:
// - Screen reader describes content
// - Decorative images don't clutter
// - Informative images accessible
// - WCAG compliant`}</code>
        </pre>

        <h3>Warning Signs</h3>
        <p>Watch for these indicators of accessibility problems:</p>
        <ul>
          <li>
            <strong>No keyboard navigation:</strong> Interactive elements can't
            be accessed via keyboard
          </li>
          <li>
            <strong>Missing focus indicators:</strong> No visible focus outline
            when navigating with keyboard
          </li>
          <li>
            <strong>Low contrast:</strong> Text and UI elements fail contrast
            ratio requirements
          </li>
          <li>
            <strong>Missing labels:</strong> Form inputs without associated
            labels or aria-label
          </li>
          <li>
            <strong>ARIA misuse:</strong> Using ARIA to replace semantic HTML
            instead of enhancing it
          </li>
          <li>
            <strong>No error announcements:</strong> Form errors not announced
            to screen readers
          </li>
          <li>
            <strong>Missing alt text:</strong> Images without alternative text
            descriptions
          </li>
          <li>
            <strong>No reduced motion support:</strong> Animations play even
            when users prefer reduced motion
          </li>
        </ul>

        <h3>Recovery Strategies</h3>
        <p>If you recognize these patterns, here's how to recover:</p>
        <ul>
          <li>
            <strong>Audit with screen readers:</strong> Test with NVDA, JAWS, or
            VoiceOver to identify issues
          </li>
          <li>
            <strong>Keyboard-only testing:</strong> Navigate entire interface
            using only keyboard
          </li>
          <li>
            <strong>Automated testing:</strong> Use tools like axe-core, WAVE,
            or Lighthouse to catch issues
          </li>
          <li>
            <strong>Fix semantic HTML:</strong> Replace divs/spans with proper
            semantic elements
          </li>
          <li>
            <strong>Add proper labels:</strong> Ensure all inputs have
            associated labels
          </li>
          <li>
            <strong>Test contrast:</strong> Verify all text meets WCAG contrast
            requirements
          </li>
          <li>
            <strong>Review ARIA usage:</strong> Ensure ARIA enhances, doesn't
            replace semantic HTML
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'accessibility-health-metrics',
    title: 'Warning Signs & Accessibility Health',
    order: 8.75,
    content: (
      <>
        <p>
          Monitor accessibility health to ensure inclusive design is maintained:
        </p>

        <h3>Quality Metrics</h3>
        <p>
          <strong>Accessibility Violations:</strong> Number of WCAG violations
          per component.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero violations—all components accessible
          </li>
          <li>
            <strong>Warning:</strong> 1-2 violations per component—needs
            attention
          </li>
          <li>
            <strong>Critical:</strong> {'>'}3 violations—accessibility not
            prioritized
          </li>
        </ul>

        <p>
          <strong>Keyboard Navigation Coverage:</strong> Percentage of
          interactive elements keyboard accessible.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> 100% coverage—all elements accessible
          </li>
          <li>
            <strong>Warning:</strong> 90-99% coverage—some gaps
          </li>
          <li>
            <strong>Critical:</strong> {'<'}90% coverage—keyboard accessibility
            failing
          </li>
        </ul>

        <h3>Compliance Metrics</h3>
        <p>
          <strong>WCAG AA Compliance:</strong> Percentage of pages/components
          meeting WCAG 2.1 AA.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}95% compliance—almost all components
            compliant
          </li>
          <li>
            <strong>Warning:</strong> 80-95% compliance—some non-compliant
            components
          </li>
          <li>
            <strong>Critical:</strong> {'<'}80% compliance—system not accessible
          </li>
        </ul>

        <p>
          <strong>Screen Reader Support:</strong> Percentage of components
          tested with screen readers.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}90% tested—comprehensive testing
          </li>
          <li>
            <strong>Warning:</strong> 70-90% tested—some gaps
          </li>
          <li>
            <strong>Critical:</strong> {'<'}70% tested—insufficient testing
          </li>
        </ul>

        <h3>Regression Metrics</h3>
        <p>
          <strong>Accessibility Regressions:</strong> Number of new violations
          per release.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero regressions—accessibility maintained
          </li>
          <li>
            <strong>Warning:</strong> 1-2 regressions—needs attention
          </li>
          <li>
            <strong>Critical:</strong> {'>'}3 regressions—accessibility breaking
          </li>
        </ul>

        <p>
          <strong>Contrast Ratio Failures:</strong> Number of components with
          insufficient contrast.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero failures—all meet contrast
            requirements
          </li>
          <li>
            <strong>Warning:</strong> 1-3 failures—some contrast issues
          </li>
          <li>
            <strong>Critical:</strong> {'>'}3 failures—widespread contrast
            problems
          </li>
        </ul>

        <h3>Early Warning Signs</h3>
        <p>Watch for these indicators of accessibility problems:</p>
        <ul>
          <li>
            <strong>Increasing violations:</strong> More violations over time
            indicates lack of accessibility focus
          </li>
          <li>
            <strong>Missing alt text:</strong> Images without alt text indicate
            accessibility not prioritized
          </li>
          <li>
            <strong>Keyboard navigation gaps:</strong> Elements not keyboard
            accessible indicate missing implementation
          </li>
          <li>
            <strong>Low contrast:</strong> Text failing contrast checks
            indicates design/implementation gaps
          </li>
          <li>
            <strong>ARIA misuse:</strong> Using ARIA incorrectly indicates
            knowledge gaps
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'accessibility-migration-strategies',
    title: 'Accessibility Migration & Evolution Strategies',
    order: 8.9,
    content: (
      <>
        <p>Improving accessibility requires systematic migration strategies:</p>

        <h3>Incremental Accessibility Improvements</h3>
        <p>Fix accessibility issues incrementally:</p>
        <ol>
          <li>
            <strong>Audit:</strong> Run automated accessibility scans (axe-core,
            Lighthouse)
          </li>
          <li>
            <strong>Prioritize:</strong> Focus on critical violations first
            (WCAG AA requirements)
          </li>
          <li>
            <strong>Fix systematically:</strong> Address one component type at a
            time
          </li>
          <li>
            <strong>Test:</strong> Verify fixes with screen readers and keyboard
            navigation
          </li>
          <li>
            <strong>Document:</strong> Record patterns and solutions for future
            reference
          </li>
        </ol>

        <h3>Component Accessibility Migration</h3>
        <p>Migrate components from inaccessible to accessible:</p>
        <pre>
          <code>{`// Phase 1: Fix semantic HTML
// Before:
<div onClick={handleClick}>Click me</div>

// After:
<button onClick={handleClick}>Click me</button>

// Phase 2: Add accessibility attributes
<button 
  onClick={handleClick}
  aria-label="Submit form"
  aria-busy={isLoading}
>
  {isLoading ? 'Loading...' : 'Click me'}
</button>

// Phase 3: Ensure keyboard support
// Button element already has native keyboard support

// Phase 4: Add focus management
.button:focus-visible {
  outline: 2px solid var(--semantic-color-border-accent);
  outline-offset: 2px;
}

// Phase 5: Test with assistive technologies`}</code>
        </pre>

        <h3>Accessibility Regression Prevention</h3>
        <p>Prevent accessibility regressions:</p>
        <ul>
          <li>
            <strong>Automated testing:</strong> Run accessibility tests in CI/CD
          </li>
          <li>
            <strong>Component contracts:</strong> Require accessibility props in
            component APIs
          </li>
          <li>
            <strong>Code reviews:</strong> Include accessibility in review
            checklist
          </li>
          <li>
            <strong>Documentation:</strong> Document accessibility requirements
            per component
          </li>
        </ul>

        <h3>Accessibility Testing Strategy</h3>
        <p>Implement comprehensive accessibility testing:</p>
        <pre>
          <code>{`// Automated accessibility tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});

// Manual keyboard testing checklist:
// - Tab to component
// - Enter/Space activates component
// - Focus indicator visible
// - Screen reader announces correctly

// Screen reader testing:
// - Test with VoiceOver (macOS/iOS)
// - Test with NVDA (Windows)
// - Test with JAWS (Windows)
// - Verify all announcements are correct`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'cross-platform-accessibility',
    title: 'Cross-Platform Accessibility Considerations',
    order: 8.95,
    content: (
      <>
        <p>
          Accessibility requirements and implementations vary across platforms:
        </p>

        <h3>Platform-Specific Accessibility APIs</h3>
        <p>Each platform has its own accessibility API:</p>
        <ul>
          <li>
            <strong>Web:</strong> ARIA attributes, semantic HTML, keyboard
            navigation
          </li>
          <li>
            <strong>iOS:</strong> Accessibility labels, traits, hints
            (VoiceOver)
          </li>
          <li>
            <strong>Android:</strong> Content descriptions, accessibility
            actions (TalkBack)
          </li>
          <li>
            <strong>React Native:</strong> Accessibility props that map to
            platform APIs
          </li>
        </ul>

        <h3>Consistent Accessibility Patterns</h3>
        <p>Maintain consistent accessibility patterns across platforms:</p>
        <pre>
          <code>{`// Shared accessibility contract
interface AccessibleComponent {
  accessibilityLabel: string;
  accessibilityHint?: string;
  accessibilityRole: 'button' | 'link' | 'text' | 'image';
  accessibilityState?: {
    disabled?: boolean;
    selected?: boolean;
    checked?: boolean;
  };
}

// Web implementation
<button
  aria-label={accessibilityLabel}
  aria-describedby={accessibilityHint ? hintId : undefined}
  role={accessibilityRole}
  aria-disabled={accessibilityState?.disabled}
>
  {children}
</button>

// iOS implementation (SwiftUI)
Button(action: onPress) {
  Text(children)
}
.accessibilityLabel(accessibilityLabel)
.accessibilityHint(accessibilityHint ?? "")
.accessibilityRole(.button)
.accessibilityState(.disabled(isDisabled))

// Android implementation (Kotlin)
button.contentDescription = accessibilityLabel
button.hint = accessibilityHint
button.stateDescription = accessibilityState?.description`}</code>
        </pre>

        <h3>Platform-Specific Requirements</h3>
        <p>Adapt to platform-specific accessibility requirements:</p>
        <ul>
          <li>
            <strong>Touch targets:</strong> iOS (44pt minimum), Android (48dp
            minimum), Web (44px minimum)
          </li>
          <li>
            <strong>Screen readers:</strong> VoiceOver (iOS), TalkBack
            (Android), NVDA/JAWS/VoiceOver (Web)
          </li>
          <li>
            <strong>Keyboard navigation:</strong> Web (Tab, Enter, Space), iOS
            (external keyboard), Android (external keyboard)
          </li>
          <li>
            <strong>Dynamic type:</strong> iOS (Dynamic Type), Android (Font
            scaling), Web (zoom, font-size adjustment)
          </li>
        </ul>

        <h3>Cross-Platform Testing</h3>
        <p>Test accessibility across platforms:</p>
        <ul>
          <li>
            <strong>Automated testing:</strong> axe-core (Web), XCUITest (iOS),
            Espresso (Android)
          </li>
          <li>
            <strong>Manual testing:</strong> Screen readers on each platform
          </li>
          <li>
            <strong>Keyboard testing:</strong> Verify keyboard navigation works
            correctly
          </li>
          <li>
            <strong>Assistive technology testing:</strong> Test with platform
            assistive technologies
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'accessibility-case-studies',
    title: 'Real-World Accessibility Case Studies',
    order: 8.98,
    content: (
      <>
        <p>
          These case studies demonstrate accessibility improvements in practice:
        </p>

        <h3>Case Study 1: Component Accessibility Overhaul</h3>
        <p>
          <strong>Challenge:</strong> A form component library had 0%
          accessibility compliance—users couldn't complete forms with assistive
          technologies.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>Ran automated accessibility scan (axe-core, Lighthouse)</li>
          <li>Manual testing with screen readers (VoiceOver, NVDA)</li>
          <li>Keyboard-only testing across all form components</li>
          <li>Fixed primitives first (Input, Label, ErrorText)</li>
          <li>
            Updated compounds (TextField, SelectField) to use accessible
            primitives
          </li>
          <li>Added accessibility tests to CI/CD</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>Accessibility compliance: 0% → 100% WCAG AA</li>
          <li>Form completion rate for assistive tech users: 0% → 95%</li>
          <li>Zero accessibility regressions (CI/CD catches them)</li>
          <li>Team culture shifted to accessibility-first</li>
        </ul>

        <h3>Case Study 2: Keyboard Navigation Recovery</h3>
        <p>
          <strong>Challenge:</strong> Users couldn't navigate dashboard with
          keyboard—keyboard users abandoned the product.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>Mapped keyboard navigation paths</li>
          <li>Identified all interactive elements missing keyboard support</li>
          <li>Fixed focus management (tab order, focus trapping)</li>
          <li>Added visible focus indicators</li>
          <li>Tested complete keyboard workflows</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>Keyboard navigation coverage: 40% → 100%</li>
          <li>User complaints about keyboard navigation: 50/month → 0/month</li>
          <li>Keyboard user retention improved by 30%</li>
          <li>Better UX for all users (mouse, touch, keyboard)</li>
        </ul>

        <h3>Case Study 3: Screen Reader Support</h3>
        <p>
          <strong>Challenge:</strong> Screen reader users couldn't understand
          complex data visualizations and interactive components.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>Tested with actual screen reader users (user research)</li>
          <li>Added descriptive ARIA labels and live regions</li>
          <li>Implemented proper ARIA roles and states</li>
          <li>Added skip links and landmarks</li>
          <li>Provided alternative text formats for data visualizations</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>Screen reader user satisfaction: 2/10 → 9/10</li>
          <li>Task completion rate: 20% → 85%</li>
          <li>Accessibility complaints: 30/month → 1/month</li>
          <li>Legal compliance achieved (WCAG AA)</li>
        </ul>
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

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'wcag-understanding',
    label: 'I understand WCAG 2.1 Level AA requirements',
    description: 'Basic accessibility standards knowledge',
    required: true,
  },
  {
    id: 'contrast-validation',
    label: 'I validate color contrast using WCAG or APCA',
    description: 'Ensuring readable text',
    required: true,
  },
  {
    id: 'keyboard-navigation',
    label: 'I ensure all interactive elements are keyboard accessible',
    description: 'Keyboard navigation support',
    required: true,
  },
  {
    id: 'semantic-html',
    label: 'I use semantic HTML elements appropriately',
    description: 'Proper HTML semantics',
    required: true,
  },
  {
    id: 'aria-usage',
    label: 'I use ARIA attributes when HTML semantics are insufficient',
    description: 'ARIA for enhanced semantics',
    required: false,
  },
  {
    id: 'screen-reader-testing',
    label: 'I test with screen readers and assistive technologies',
    description: 'Manual accessibility testing',
    required: false,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'How does embedding accessibility at the token level differ from adding it at the component level? What are the benefits of each approach?',
    type: 'reflection',
  },
  {
    question:
      'Describe a scenario where a component might be visually accessible but not accessible to screen readers. How would you identify and fix this issue?',
    type: 'application',
  },
];

// Add cross-references
content.crossReferences = {
  concepts: [
    {
      slug: 'philosophy',
      title: 'Philosophy of Design Systems',
      description: 'Why accessibility is a system invariant',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'How tokens encode accessibility constraints',
      type: 'foundation',
    },
    {
      slug: 'component-architecture',
      title: 'Component Architecture',
      description: 'How components guarantee accessibility',
      type: 'foundation',
    },
  ],
  components: [
    {
      slug: 'button',
      component: 'Button',
      description: 'Accessible button implementation',
    },
    {
      slug: 'input',
      component: 'Input',
      description: 'Accessible form field implementation',
    },
  ],
  glossary: ['accessibility', 'wcag', 'aria', 'contrast'],
};

export const metadata = generateFoundationMetadata(pageMetadata);

export default function AccessibilityFoundationPage() {
  return <FoundationPage content={content} />;
}

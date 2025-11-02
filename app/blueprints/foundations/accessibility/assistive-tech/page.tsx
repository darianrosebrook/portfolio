/**
 * Foundation: Assistive Technology Support
 * Enhanced with educational template structure
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import Link from 'next/link';
import { createFoundationContent } from '../../_lib/contentBuilder';
import { FoundationPage } from '../../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Assistive Technology Support',
  description:
    'Best practices for supporting screen readers, keyboard navigation, ARIA, and other assistive technologies. Learn semantic HTML, ARIA usage, focus management, and landmarks.',
  slug: 'assistive-tech',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/accessibility/assistive-tech',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'assistive technology, screen readers, keyboard navigation, ARIA, semantic HTML, focus management',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['accessibility', 'philosophy'],
    next_units: ['standards', 'tokens'],
    assessment_required: false,
    estimated_reading_time: 18,
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
    expertise: [
      'Assistive Technology',
      'ARIA',
      'Screen Readers',
      'Keyboard Navigation',
    ],
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
    title: 'Why Assistive Technology Support Matters',
    order: 3,
    content: (
      <>
        <p>
          Supporting assistive technologies is crucial for creating inclusive
          experiences. Assistive technologies enable people with disabilities to
          interact with digital interfaces. When properly supported, these
          technologies transform inaccessible interfaces into usable ones. When
          unsupported, they create barriers that exclude users.
        </p>
        <p>Assistive technology support serves multiple critical functions:</p>
        <ul>
          <li>
            <strong>Screen Reader Support:</strong> Semantic HTML and ARIA
            enable screen readers to communicate interface structure and state
          </li>
          <li>
            <strong>Keyboard Navigation:</strong> Proper focus management
            enables keyboard-only users to navigate efficiently
          </li>
          <li>
            <strong>Voice Control:</strong> Semantic structure enables voice
            control tools to identify and interact with elements
          </li>
          <li>
            <strong>Switch Control:</strong> Logical tab order and focus
            management enable switch control users
          </li>
          <li>
            <strong>Screen Magnification:</strong> Proper semantic structure
            helps screen magnification tools maintain context
          </li>
        </ul>
        <p>
          A well-designed system treats assistive technology support as a
          fundamental requirement, not an optional enhancement. Building support
          into components from the start ensures accessible experiences for all
          users.
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
        <h3>Semantic HTML</h3>
        <p>Semantic HTML provides meaning to assistive technologies:</p>
        <ul>
          <li>
            <strong>Native elements:</strong> Use <code>&lt;button&gt;</code>,{' '}
            <code>&lt;input&gt;</code>, <code>&lt;nav&gt;</code>,{' '}
            <code>&lt;main&gt;</code> instead of generic{' '}
            <code>&lt;div&gt;</code>
          </li>
          <li>
            <strong>Element roles:</strong> Semantic elements communicate
            purpose to screen readers automatically
          </li>
          <li>
            <strong>Keyboard support:</strong> Native elements include built-in
            keyboard support
          </li>
          <li>
            <strong>State management:</strong> Native elements manage states
            (checked, disabled, required) automatically
          </li>
        </ul>
        <pre>
          <code>{`// Good: Semantic HTML
<button onClick={handleClick}>Submit</button>
<input type="text" aria-label="Email address" />
<nav aria-label="Main navigation">
  <a href="/">Home</a>
</nav>

// Bad: Generic divs
<div onClick={handleClick}>Submit</div>
<div role="textbox">Email address</div>
<div role="navigation">
  <a href="/">Home</a>
</div>`}</code>
        </pre>

        <h3>ARIA Roles and Attributes</h3>
        <p>
          ARIA supplements semantic HTML when native elements aren't sufficient:
        </p>
        <ul>
          <li>
            <strong>Roles:</strong> <code>role="button"</code>,{' '}
            <code>role="dialog"</code>, <code>role="alert"</code>
          </li>
          <li>
            <strong>Labels:</strong> <code>aria-label</code>,{' '}
            <code>aria-labelledby</code>
          </li>
          <li>
            <strong>Described by:</strong> <code>aria-describedby</code> for
            additional context
          </li>
          <li>
            <strong>States:</strong> <code>aria-expanded</code>,{' '}
            <code>aria-checked</code>, <code>aria-disabled</code>
          </li>
          <li>
            <strong>Live regions:</strong> <code>aria-live</code> for dynamic
            content updates
          </li>
        </ul>
        <pre>
          <code>{`// ARIA for custom components
<div
  role="button"
  tabIndex={0}
  aria-label="Close dialog"
  aria-pressed={isPressed}
  onClick={handleClick}
  onKeyDown={handleKeyDown}
>
  ×
</div>

// ARIA for dynamic content
<div aria-live="polite" aria-atomic="true">
  {loading ? 'Loading...' : 'Content loaded'}
</div>`}</code>
        </pre>

        <h3>Keyboard Navigation</h3>
        <p>
          Keyboard navigation enables efficient access without pointing devices:
        </p>
        <ul>
          <li>
            <strong>Tab order:</strong> Logical tab order matches visual order
          </li>
          <li>
            <strong>Focus indicators:</strong> Visible focus indicators show
            current focus location
          </li>
          <li>
            <strong>Keyboard shortcuts:</strong> Common shortcuts (Enter, Space,
            Escape) work as expected
          </li>
          <li>
            <strong>Focus trapping:</strong> Focus trapped within modals and
            dialogs
          </li>
          <li>
            <strong>Skip links:</strong> Skip links enable quick navigation to
            main content
          </li>
        </ul>
        <pre>
          <code>{`// Focus management
function Modal({ isOpen, onClose, children }) {
  const modalRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // Trap focus
      const firstFocusable = modalRef.current.querySelector(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      firstFocusable?.focus();
      
      // Return focus on close
      return () => {
        // Restore focus to trigger
      };
    }
  }, [isOpen]);
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      {children}
    </div>
  );
}`}</code>
        </pre>

        <h3>Screen Reader Support</h3>
        <p>Screen readers announce interface structure and state:</p>
        <ul>
          <li>
            <strong>Landmarks:</strong> Use <code>&lt;nav&gt;</code>,{' '}
            <code>&lt;main&gt;</code>, <code>&lt;aside&gt;</code> for structure
          </li>
          <li>
            <strong>Headings:</strong> Proper heading hierarchy enables
            navigation by heading
          </li>
          <li>
            <strong>Labels:</strong> All form inputs have associated labels
          </li>
          <li>
            <strong>Alternative text:</strong> Images have descriptive alt text
          </li>
          <li>
            <strong>Live regions:</strong> Dynamic content updates are announced
          </li>
        </ul>
        <pre>
          <code>{`// Screen reader-friendly structure
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/">Home</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

<main>
  <h1>Page Title</h1>
  <form>
    <label htmlFor="email">Email address</label>
    <input
      id="email"
      type="email"
      aria-describedby="email-hint"
      aria-required="true"
    />
    <span id="email-hint">We'll never share your email</span>
  </form>
</main>`}</code>
        </pre>

        <h3>Focus Management</h3>
        <p>Focus management ensures keyboard users can navigate efficiently:</p>
        <ul>
          <li>
            <strong>Focus order:</strong> Tab order matches visual order and
            logical flow
          </li>
          <li>
            <strong>Focus visibility:</strong> Focus indicators are clearly
            visible
          </li>
          <li>
            <strong>Focus restoration:</strong> Focus returns to trigger after
            closing modals
          </li>
          <li>
            <strong>Focus trapping:</strong> Focus trapped within modals and
            dialogs
          </li>
          <li>
            <strong>Focus delegation:</strong> Complex components delegate focus
            appropriately
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Assistive Technology Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Inclusivity Impact</h3>
        <p>Assistive technology support enables inclusivity:</p>
        <ul>
          <li>
            <strong>Accessibility:</strong> Enables users with disabilities to
            access interfaces
          </li>
          <li>
            <strong>Compliance:</strong> Meets legal requirements (ADA, Section
            508, WCAG)
          </li>
          <li>
            <strong>Broader reach:</strong> Expands potential user base
          </li>
        </ul>
        <p>Inclusive systems work for everyone, regardless of ability.</p>

        <h3>Usability Impact</h3>
        <p>Assistive technology support improves usability:</p>
        <ul>
          <li>
            <strong>Keyboard efficiency:</strong> Keyboard navigation speeds up
            power users
          </li>
          <li>
            <strong>Voice control:</strong> Semantic structure enables voice
            control
          </li>
          <li>
            <strong>Screen magnification:</strong> Proper structure helps
            magnification users maintain context
          </li>
        </ul>
        <p>
          Usable systems benefit all users, not just those using assistive
          technologies.
        </p>

        <h3>Maintainability Impact</h3>
        <p>
          Building assistive technology support into components improves
          maintainability:
        </p>
        <ul>
          <li>
            <strong>Consistent patterns:</strong> Standardized accessibility
            patterns reduce variation
          </li>
          <li>
            <strong>Automated testing:</strong> Accessibility can be tested
            automatically
          </li>
          <li>
            <strong>Documentation:</strong> Built-in accessibility is
            self-documenting
          </li>
        </ul>
        <p>
          Maintainable systems ensure accessibility is preserved as systems
          evolve.
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
          Assistive technology support bridges design intent and code
          implementation. Let's examine how accessibility features translate
          from design specifications to working code.
        </p>

        <h3>Design: Accessibility Annotations</h3>
        <p>Design tools can include accessibility annotations:</p>
        <pre>
          <code>{`// Figma: Accessibility annotations
Component: Button
  - Label: "Submit form"
  - Keyboard: Tab, Enter, Space
  - Screen reader: "Submit form, button"
  - Focus indicator: 2px solid blue outline

Component: Text Input
  - Label: "Email address"
  - Required: true
  - Error state: "Invalid email format"
  - Hint: "We'll never share your email"`}</code>
        </pre>

        <h3>Code: Semantic HTML Implementation</h3>
        <p>Code implements semantic HTML with ARIA:</p>
        <pre>
          <code>{`// Button component
function Button({ children, onClick, ariaLabel }) {
  return (
    <button
      onClick={onClick}
      aria-label={ariaLabel}
      className="button"
    >
      {children}
    </button>
  );
}

// Text input component
function TextInput({ label, required, error, hint }) {
  const id = useId();
  const hintId = \`\${id}-hint\`;
  const errorId = \`\${id}-error\`;
  
  return (
    <div>
      <label htmlFor={id}>
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      <input
        id={id}
        type="text"
        aria-required={required}
        aria-describedby={\`\${hintId} \${errorId}\`}
        aria-invalid={!!error}
      />
      {hint && <span id={hintId}>{hint}</span>}
      {error && <span id={errorId} role="alert">{error}</span>}
    </div>
  );
}`}</code>
        </pre>

        <h3>Code: Focus Management</h3>
        <p>Focus management ensures keyboard accessibility:</p>
        <pre>
          <code>{`// Modal with focus management
function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  
  useEffect(() => {
    if (isOpen) {
      // Store previous focus
      previousFocusRef.current = document.activeElement;
      
      // Focus first element
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      focusableElements[0]?.focus();
      
      // Trap focus
      const handleTab = (e) => {
        if (e.key !== 'Tab') return;
        
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      };
      
      modalRef.current.addEventListener('keydown', handleTab);
      
      return () => {
        modalRef.current.removeEventListener('keydown', handleTab);
        previousFocusRef.current?.focus();
      };
    }
  }, [isOpen]);
  
  if (!isOpen) return null;
  
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      ref={modalRef}
    >
      <h2 id="modal-title">{title}</h2>
      {children}
      <button onClick={onClose}>Close</button>
    </div>
  );
}`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-implemented assistive technology system ensures interfaces work
          for everyone. Semantic HTML provides meaning to screen readers. ARIA
          supplements HTML when native elements aren't sufficient. Focus
          management enables keyboard navigation. When these features are built
          into components from the start, accessibility becomes a natural part
          of the system, not an afterthought.
        </p>
        <p>
          Understanding assistive technology support helps practitioners create
          inclusive interfaces that work for all users, regardless of ability or
          input method.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building an Accessible Button Component',
    order: 7,
    content: (
      <>
        <p>
          Let's build an accessible button component that supports assistive
          technologies:
        </p>

        <h3>Step 1: Use Semantic HTML</h3>
        <p>Start with native button element:</p>
        <pre>
          <code>{`// Accessible button
function Button({ children, onClick, variant = 'primary' }) {
  return (
    <button
      onClick={onClick}
      className={\`button button--\${variant}\`}
    >
      {children}
    </button>
  );
}

// Benefits:
// - Native keyboard support (Enter, Space)
// - Built-in focus management
// - Screen reader announces as "button"`}</code>
        </pre>

        <h3>Step 2: Add ARIA Attributes</h3>
        <p>Add ARIA for additional context:</p>
        <pre>
          <code>{`// Button with ARIA
function Button({
  children,
  onClick,
  variant = 'primary',
  ariaLabel,
  ariaDescribedBy,
  disabled
}) {
  return (
    <button
      onClick={onClick}
      className={\`button button--\${variant}\`}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-disabled={disabled}
      disabled={disabled}
    >
      {children}
    </button>
  );
}`}</code>
        </pre>

        <h3>Step 3: Ensure Focus Visibility</h3>
        <p>Add visible focus indicators:</p>
        <pre>
          <code>{`// Button with focus styles
.button {
  padding: var(--semantic-spacing-padding-button);
  border-radius: var(--semantic-shape-control-radius-default);
  border: none;
  
  &:focus-visible {
    outline: 2px solid var(--semantic-color-border-focus);
    outline-offset: 2px;
  }
  
  &:focus:not(:focus-visible) {
    outline: none;
  }
}`}</code>
        </pre>

        <h3>Step 4: Handle Loading States</h3>
        <p>Communicate loading state to assistive technologies:</p>
        <pre>
          <code>{`// Button with loading state
function Button({ children, onClick, loading }) {
  return (
    <button
      onClick={onClick}
      aria-busy={loading}
      aria-live="polite"
      disabled={loading}
    >
      {loading ? (
        <>
          <span aria-hidden="true">Loading...</span>
          <span className="sr-only">Please wait</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Screen reader support:</strong> Button announced correctly
            with state
          </li>
          <li>
            <strong>Keyboard support:</strong> Full keyboard navigation support
          </li>
          <li>
            <strong>Focus visibility:</strong> Clear focus indicators for
            keyboard users
          </li>
          <li>
            <strong>State communication:</strong> Loading and disabled states
            communicated to assistive technologies
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'constraints-tradeoffs',
    title: 'Constraints & Tradeoffs',
    order: 8,
    content: (
      <>
        <h3>Common Challenges</h3>
        <p>Assistive technology support faces several challenges:</p>

        <h4>ARIA Complexity</h4>
        <p>ARIA can be complex and easy to misuse:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Overuse of ARIA can create confusion
          </li>
          <li>
            <strong>Solution:</strong> Use semantic HTML first, ARIA only when
            necessary
          </li>
          <li>
            <strong>Guideline:</strong> Prefer native elements over ARIA when
            possible
          </li>
        </ul>

        <h4>Screen Reader Variations</h4>
        <p>Different screen readers behave differently:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> VoiceOver, NVDA, JAWS have different
            behaviors
          </li>
          <li>
            <strong>Approach:</strong> Test with multiple screen readers, follow
            WCAG guidelines
          </li>
          <li>
            <strong>Tradeoff:</strong> Standardization vs. screen reader
            variations
          </li>
        </ul>

        <h4>Performance: Focus Management</h4>
        <p>Complex focus management can impact performance:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Focus trapping and restoration requires
            DOM queries
          </li>
          <li>
            <strong>Approach:</strong> Optimize focus queries, use refs,
            debounce where appropriate
          </li>
          <li>
            <strong>Tradeoff:</strong> Accessibility vs. performance
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Assistive technology support involves several tradeoffs:</p>

        <h4>Native Elements vs. Custom Components</h4>
        <ul>
          <li>
            <strong>Native elements:</strong> Built-in accessibility, but
            limited styling
          </li>
          <li>
            <strong>Custom components:</strong> Full styling control, but
            requires manual accessibility implementation
          </li>
          <li>
            <strong>Best practice:</strong> Use native elements when possible,
            enhance with ARIA when needed
          </li>
        </ul>

        <h4>ARIA Overuse vs. Underuse</h4>
        <ul>
          <li>
            <strong>ARIA overuse:</strong> Can create confusion, redundant
            information
          </li>
          <li>
            <strong>ARIA underuse:</strong> Missing context for assistive
            technologies
          </li>
          <li>
            <strong>Best practice:</strong> Use ARIA only when semantic HTML
            isn't sufficient
          </li>
        </ul>

        <h4>Accessibility Testing: Manual vs. Automated</h4>
        <ul>
          <li>
            <strong>Automated testing:</strong> Catches many issues, but misses
            context
          </li>
          <li>
            <strong>Manual testing:</strong> Provides context, but
            time-consuming
          </li>
          <li>
            <strong>Best practice:</strong> Use both—automated for regression,
            manual for validation
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'additional-resources',
    id: 'additional-resources',
    title: 'Additional Resources',
    order: 9,
    content: (
      <>
        <p>Continue learning about assistive technology support:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/accessibility/philosophy">
              Accessibility Philosophy
            </Link>
            : Foundational thinking about accessibility
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/standards">
              Accessibility Standards
            </Link>
            : WCAG guidelines and principles
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/tokens">
              Token-Level Accessibility
            </Link>
            : How tokens support accessibility
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/tooling">
              Accessibility Tooling
            </Link>
            : Tools for testing and validation
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#accessibility">Accessibility</Link>,{' '}
          <Link href="/blueprints/glossary#aria">ARIA</Link>,{' '}
          <Link href="/blueprints/glossary#screen-reader">Screen Reader</Link>
        </p>
      </>
    ),
  },
];

const content = createFoundationContent(pageMetadata, sections);

// Add cross-references
content.crossReferences = {
  concepts: [
    {
      slug: 'accessibility',
      title: 'Accessibility Philosophy',
      description: 'Foundational thinking about accessibility',
      type: 'foundation',
    },
    {
      slug: 'standards',
      title: 'Accessibility Standards',
      description: 'WCAG guidelines and principles',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Token-Level Accessibility',
      description: 'How tokens support accessibility',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['accessibility', 'aria', 'screen-reader'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'semantic-html-used',
    label: 'Semantic HTML used',
    description: 'Native HTML elements used instead of generic divs',
    required: true,
  },
  {
    id: 'aria-implemented',
    label: 'ARIA implemented',
    description: 'ARIA attributes used when semantic HTML insufficient',
    required: true,
  },
  {
    id: 'keyboard-navigation',
    label: 'Keyboard navigation supported',
    description: 'All interactive elements keyboard accessible',
    required: true,
  },
  {
    id: 'focus-management',
    label: 'Focus management implemented',
    description: 'Focus indicators visible and focus trapped in modals',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you use ARIA versus semantic HTML? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how focus management enables keyboard accessibility. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between native elements and custom components for accessibility? When would you choose each approach?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function AssistiveTechPage() {
  return <FoundationPage content={content} />;
}

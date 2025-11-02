/**
 * UX Pattern: Feedback & Status Patterns
 * Enhanced with educational template structure
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import Link from 'next/link';
import { createFoundationContent } from '../../foundations/_lib/contentBuilder';
import { FoundationPage } from '../../foundations/_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Feedback & Status Patterns',
  description:
    'Effective feedback patterns keep users informed about system status, progress, and outcomes. Learn patterns for notifications, loading states, error messages, and success confirmations.',
  slug: 'feedback',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/ux-patterns/feedback',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'feedback, notifications, loading states, error messages, status patterns, UX patterns',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['accessibility', 'tokens'],
    next_units: ['forms', 'dialogs'],
    assessment_required: false,
    estimated_reading_time: 15,
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
    expertise: ['Feedback Patterns', 'Status Communication', 'UX', 'Accessibility'],
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
    title: 'Why Feedback Patterns Matter',
    order: 3,
    content: (
      <>
        <p>
          Effective feedback patterns keep users informed about system status,
          progress, and outcomes. When properly implemented, feedback provides
          clarity and reassurance. When poorly implemented, feedback creates
          confusion and frustration.
        </p>
        <p>
          Feedback patterns serve multiple critical functions:
        </p>
        <ul>
          <li>
            <strong>Status Communication:</strong> Feedback communicates system
            state and progress
          </li>
          <li>
            <strong>Error Prevention:</strong> Feedback helps users avoid errors
            and correct mistakes
          </li>
          <li>
            <strong>Confirmation:</strong> Feedback confirms successful actions
            and outcomes
          </li>
          <li>
            <strong>Guidance:</strong> Feedback guides users through complex
            processes
          </li>
          <li>
            <strong>Accessibility:</strong> Proper feedback enables assistive
            technology users to understand system state
          </li>
        </ul>
        <p>
          Well-designed feedback patterns ensure users always understand what's
          happening and what to expect next.
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
        <h3>Feedback Types</h3>
        <p>
          Different feedback types serve different purposes:
        </p>
        <ul>
          <li>
            <strong>Success:</strong> Confirms successful actions
          </li>
          <li>
            <strong>Error:</strong> Communicates errors and failures
          </li>
          <li>
            <strong>Warning:</strong> Alerts users to potential issues
          </li>
          <li>
            <strong>Info:</strong> Provides general information
          </li>
          <li>
            <strong>Loading:</strong> Indicates progress and system activity
          </li>
        </ul>
        <pre>
          <code>{`// Feedback types
<Alert variant="success">
  Your changes have been saved successfully.
</Alert>

<Alert variant="error">
  Unable to save changes. Please try again.
</Alert>

<Alert variant="warning">
  You have unsaved changes. Are you sure you want to leave?
</Alert>

<Alert variant="info">
  New features are available. Check them out!
</Alert>

<Spinner label="Loading..." />
<ProgressBar value={60} label="Uploading..." />`}</code>
        </pre>

        <h3>Live Regions</h3>
        <p>
          ARIA live regions announce feedback to screen readers:
        </p>
        <ul>
          <li>
            <strong>aria-live:</strong> Announces changes to screen readers
          </li>
          <li>
            <strong>aria-atomic:</strong> Announces entire region or just
            changes
          </li>
          <li>
            <strong>aria-relevant:</strong> Specifies what changes to announce
          </li>
        </ul>
        <pre>
          <code>{`// Live region for feedback
<div
  role="status"
  aria-live="polite"
  aria-atomic="true"
  className="sr-only"
>
  {feedbackMessage}
</div>

// Live region attributes
aria-live="polite"  // Announces after current announcement
aria-live="assertive" // Interrupts current announcement
aria-atomic="true"  // Announces entire region
aria-atomic="false" // Announces only changes
aria-relevant="additions" // Announces additions
aria-relevant="text" // Announces text changes`}</code>
        </pre>

        <h3>Loading States</h3>
        <p>
          Loading states communicate progress and activity:
        </p>
        <ul>
          <li>
            <strong>Indeterminate:</strong> Unknown duration, general progress
          </li>
          <li>
            <strong>Determinate:</strong> Known duration, specific progress
          </li>
          <li>
            <strong>Skeleton:</strong> Placeholder content during loading
          </li>
          <li>
            <strong>Spinner:</strong> Animated indicator for short operations
          </li>
        </ul>
        <pre>
          <code>{`// Loading state patterns
// Indeterminate spinner
<Spinner label="Loading content..." />

// Determinate progress
<ProgressBar value={75} label="Uploading file..." />

// Skeleton loader
<Skeleton>
  <Skeleton.Header />
  <Skeleton.Body lines={3} />
</Skeleton>

// Inline loading
<Button loading={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</Button>`}</code>
        </pre>

        <h3>Toast Notifications</h3>
        <p>
          Toast notifications provide temporary feedback:
        </p>
        <ul>
          <li>
            <strong>Duration:</strong> Auto-dismiss after timeout
          </li>
          <li>
            <strong>Position:</strong> Consistent placement (top-right,
            bottom-right)
          </li>
          <li>
            <strong>Queue:</strong> Manage multiple notifications
          </li>
          <li>
            <strong>Action:</strong> Optional action buttons
          </li>
        </ul>
        <pre>
          <code>{`// Toast notification
<Toast
  variant="success"
  duration={5000}
  onDismiss={handleDismiss}
>
  Changes saved successfully
</Toast>

// Toast queue
const toasts = [
  { id: 1, message: 'Saved', variant: 'success' },
  { id: 2, message: 'Error', variant: 'error' },
];

<ToastContainer>
  {toasts.map(toast => (
    <Toast key={toast.id} {...toast} />
  ))}
</ToastContainer>`}</code>
        </pre>

        <h3>Error Messages</h3>
        <p>
          Error messages guide users to correct issues:
        </p>
        <ul>
          <li>
            <strong>Clear language:</strong> Use plain, understandable language
          </li>
          <li>
            <strong>Actionable:</strong> Tell users what to do next
          </li>
          <li>
            <strong>Specific:</strong> Explain what went wrong
          </li>
          <li>
            <strong>Accessible:</strong> Associate errors with form fields
          </li>
        </ul>
        <pre>
          <code>{`// Accessible error message
<TextField
  id="email"
  label="Email"
  error={errors.email}
  aria-describedby="email-error"
/>
{errors.email && (
  <div id="email-error" role="alert" aria-live="polite">
    {errors.email}
  </div>
)}

// Error message best practices
✓ "Password must be at least 8 characters"
✗ "Invalid input"

✓ "Please enter a valid email address"
✗ "Error"`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Feedback Patterns Shape System Success',
    order: 5,
    content: (
      <>
        <h3>User Experience Impact</h3>
        <p>
          Feedback patterns improve user experience:
        </p>
        <ul>
          <li>
            <strong>Clarity:</strong> Users understand system state and
            outcomes
          </li>
          <li>
            <strong>Confidence:</strong> Feedback confirms actions and reduces
            uncertainty
          </li>
          <li>
            <strong>Error recovery:</strong> Clear feedback helps users recover
            from errors
          </li>
        </ul>
        <p>
          Effective feedback patterns enhance user experience by providing
          clarity and reassurance.
        </p>

        <h3>Accessibility Impact</h3>
        <p>
          Feedback patterns improve accessibility:
        </p>
        <ul>
          <li>
            <strong>Screen reader support:</strong> Live regions announce
            feedback to screen readers
          </li>
          <li>
            <strong>Error association:</strong> Errors associated with form fields
            enable screen reader navigation
          </li>
          <li>
            <strong>Status communication:</strong> Clear status communication
            helps all users understand system state
          </li>
        </ul>
        <p>
          Accessible feedback patterns ensure all users understand system state
          and outcomes.
        </p>

        <h3>System Consistency Impact</h3>
        <p>
          Consistent feedback patterns improve system consistency:
        </p>
        <ul>
          <li>
            <strong>Predictable behavior:</strong> Users understand feedback
            patterns across system
          </li>
          <li>
            <strong>Reusable components:</strong> Feedback components enable
            consistent implementation
          </li>
          <li>
            <strong>Design system alignment:</strong> Feedback aligns with
            design system tokens and patterns
          </li>
        </ul>
        <p>
          Consistent feedback patterns ensure predictable, maintainable system
          behavior.
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
          Feedback patterns bridge design intent and code implementation. Let's
          examine how feedback requirements translate from design specifications
          to working code.
        </p>

        <h3>Design: Feedback Specifications</h3>
        <p>
          Design specifications define feedback requirements:
        </p>
        <pre>
          <code>{`// Design specifications
Feedback Requirements:
  - Success: Green background, checkmark icon
  - Error: Red background, error icon
  - Warning: Yellow background, warning icon
  - Info: Blue background, info icon
  - Duration: 5 seconds for toasts
  - Position: Top-right corner
  - Animation: Slide in from right, fade out`}</code>
        </pre>

        <h3>Code: Feedback Component Implementation</h3>
        <p>
          Code implements feedback with live regions:
        </p>
        <pre>
          <code>{`// Alert component with live region
export function Alert({ variant, children, onDismiss }) {
  const icons = {
    success: <CheckIcon />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />,
  };

  return (
    <div
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={\`alert alert--\${variant}\`}
    >
      {icons[variant]}
      <div className="alert-content">{children}</div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          className="alert-dismiss"
        >
          ×
        </button>
      )}
    </div>
  );
}`}</code>
        </pre>

        <h3>Design: Loading State Specifications</h3>
        <p>
          Design defines loading state requirements:
        </p>
        <pre>
          <code>{`// Loading state specifications
Loading Requirements:
  - Spinner: Circular, animated
  - Progress: Bar with percentage
  - Skeleton: Placeholder content
  - Duration: Show after 200ms delay
  - Label: Always provide accessible label`}</code>
        </pre>

        <h3>Code: Loading State Implementation</h3>
        <p>
          Code implements loading states with accessibility:
        </p>
        <pre>
          <code>{`// Loading spinner with accessibility
export function Spinner({ label }) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={label}
    >
      <div className="spinner" aria-hidden="true">
        <svg viewBox="0 0 24 24">
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="2"
            fill="none"
            strokeDasharray="60"
            strokeDashoffset="30"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              values="0 12 12;360 12 12"
              dur="1s"
              repeatCount="indefinite"
            />
          </circle>
        </svg>
      </div>
      <span className="sr-only">{label}</span>
    </div>
  );
}`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-implemented feedback pattern ensures users understand system
          state and outcomes. Live regions announce feedback to screen readers.
          Error messages guide users to correct issues. Loading states communicate
          progress. When feedback patterns are built with accessibility and user
          experience in mind, they create interfaces that keep users informed and
          confident.
        </p>
        <p>
          Understanding feedback patterns helps practitioners create interfaces
          that communicate clearly and enable users to complete tasks effectively.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building Accessible Feedback System',
    order: 7,
    content: (
      <>
        <p>
          Let's build an accessible feedback system from scratch:
        </p>

        <h3>Step 1: Create Alert Component</h3>
        <p>
          Create alert component with live regions:
        </p>
        <pre>
          <code>{`// Alert component
export function Alert({ variant, children, onDismiss }) {
  const icons = {
    success: <CheckIcon />,
    error: <ErrorIcon />,
    warning: <WarningIcon />,
    info: <InfoIcon />,
  };

  return (
    <div
      role="alert"
      aria-live={variant === 'error' ? 'assertive' : 'polite'}
      aria-atomic="true"
      className={\`alert alert--\${variant}\`}
    >
      {icons[variant]}
      <div className="alert-content">{children}</div>
      {onDismiss && (
        <button onClick={onDismiss} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}`}</code>
        </pre>

        <h3>Step 2: Create Toast System</h3>
        <p>
          Create toast notification system:
        </p>
        <pre>
          <code>{`// Toast system
const [toasts, setToasts] = useState([]);

function showToast(message, variant = 'info') {
  const id = Date.now();
  setToasts([...toasts, { id, message, variant }]);
  
  setTimeout(() => {
    setToasts(toasts.filter(toast => toast.id !== id));
  }, 5000);
}

function ToastContainer() {
  return (
    <div className="toast-container" aria-live="polite">
      {toasts.map(toast => (
        <Toast key={toast.id} {...toast} />
      ))}
    </div>
  );
}`}</code>
        </pre>

        <h3>Step 3: Associate Errors with Form Fields</h3>
        <p>
          Associate error messages with form fields:
        </p>
        <pre>
          <code>{`// Form field with error
<TextField
  id="email"
  label="Email"
  error={errors.email}
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>
{errors.email && (
  <div
    id="email-error"
    role="alert"
    aria-live="polite"
    className="error-message"
  >
    {errors.email}
  </div>
)}`}</code>
        </pre>

        <h3>Step 4: Add Loading States</h3>
        <p>
          Add loading states with accessibility:
        </p>
        <pre>
          <code>{`// Loading state component
export function LoadingState({ label }) {
  return (
    <div role="status" aria-live="polite" aria-label={label}>
      <Spinner aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </div>
  );
}`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Accessibility:</strong> Full screen reader support via live
            regions
          </li>
          <li>
            <strong>User experience:</strong> Clear feedback for all user actions
          </li>
          <li>
            <strong>Consistency:</strong> Predictable feedback patterns across
            system
          </li>
          <li>
            <strong>Maintainability:</strong> Reusable feedback components
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
        <p>
          Feedback patterns face several challenges:
        </p>

        <h4>Live Region Announcing</h4>
        <p>
          Live regions can be noisy:
        </p>
        <ul>
          <li>
            <strong>Problem:</strong> Too many announcements overwhelm users
          </li>
          <li>
            <strong>Solution:</strong> Use polite announcements, debounce rapid
            updates
          </li>
          <li>
            <strong>Guideline:</strong> Only announce important feedback, not
            every state change
          </li>
        </ul>

        <h4>Toast Queue Management</h4>
        <p>
          Managing multiple toasts can be complex:
        </p>
        <ul>
          <li>
            <strong>Challenge:</strong> Displaying multiple toasts without
            overwhelming users
          </li>
          <li>
            <strong>Approach:</strong> Limit visible toasts, queue others,
            stack vertically
          </li>
          <li>
            <strong>Tradeoff:</strong> Simplicity vs. functionality
          </li>
        </ul>

        <h4>Error Message Timing</h4>
        <p>
          Timing error messages requires care:
        </p>
        <ul>
          <li>
            <strong>Challenge:</strong> When to show errors (on blur, on
            submit, immediately)
          </li>
          <li>
            <strong>Approach:</strong> Show on blur for validation, on submit
            for required fields
          </li>
          <li>
            <strong>Tradeoff:</strong> User experience vs. error prevention
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>
          Feedback patterns involve several tradeoffs:
        </p>

        <h4>Polite vs. Assertive Announcements</h4>
        <ul>
          <li>
            <strong>Polite:</strong> Less disruptive, but may be missed
          </li>
          <li>
            <strong>Assertive:</strong> More noticeable, but can interrupt
          </li>
          <li>
            <strong>Best practice:</strong> Use assertive for errors, polite
            for success
          </li>
        </ul>

        <h4>Auto-Dismiss vs. Manual Dismiss</h4>
        <ul>
          <li>
            <strong>Auto-dismiss:</strong> Less clutter, but may be missed
          </li>
          <li>
            <strong>Manual dismiss:</strong> User control, but requires action
          </li>
          <li>
            <strong>Best practice:</strong> Auto-dismiss success, manual
            dismiss errors
          </li>
        </ul>

        <h4>Inline vs. Toast Feedback</h4>
        <ul>
          <li>
            <strong>Inline:</strong> Contextual, but takes space
          </li>
          <li>
            <strong>Toast:</strong> Non-intrusive, but less contextual
          </li>
          <li>
            <strong>Best practice:</strong> Inline for form errors, toast for
            general feedback
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
        <p>
          Continue learning about feedback patterns:
        </p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/accessibility/philosophy">
              Accessibility Philosophy
            </Link>
            : Foundation of accessible design
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/assistive-tech">
              Assistive Technology Support
            </Link>
            : ARIA live regions
          </li>
          <li>
            <Link href="/blueprints/ux-patterns/dialogs">
              Dialog Patterns
            </Link>
            : Related dialog patterns
          </li>
          <li>
            <Link href="/blueprints/ux-patterns/forms">
              Forms Patterns
            </Link>
            : Form feedback patterns
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#feedback">Feedback</Link>,{' '}
          <Link href="/blueprints/glossary#aria">ARIA</Link>,{' '}
          <Link href="/blueprints/glossary#live-region">Live Region</Link>
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
      slug: 'philosophy',
      title: 'Accessibility Philosophy',
      description: 'Foundation of accessible design',
      type: 'foundation',
    },
    {
      slug: 'assistive-tech',
      title: 'Assistive Technology Support',
      description: 'ARIA live regions',
      type: 'foundation',
    },
    {
      slug: 'dialogs',
      title: 'Dialog Patterns',
      description: 'Related dialog patterns',
      type: 'pattern',
    },
  ],
  components: [],
  glossary: ['feedback', 'aria', 'live-region'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'live-regions-implemented',
    label: 'Live regions implemented',
    description: 'Feedback uses ARIA live regions for screen reader announcements',
    required: true,
  },
  {
    id: 'error-association',
    label: 'Error association',
    description: 'Errors are associated with form fields using aria-describedby',
    required: true,
  },
  {
    id: 'loading-labels',
    label: 'Loading labels',
    description: 'Loading states have accessible labels',
    required: true,
  },
  {
    id: 'toast-queue',
    label: 'Toast queue',
    description: 'Toast notifications are properly queued and managed',
    required: false,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you use polite vs. assertive ARIA live regions? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how error messages ensure accessibility in forms. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between auto-dismiss and manual dismiss for toast notifications? How do you decide?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function FeedbackPage() {
  return <FoundationPage content={content} />;
}

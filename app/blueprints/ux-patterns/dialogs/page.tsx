/**
 * UX Pattern: Dialogs & Overlays
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
  title: 'Dialogs & Overlays Patterns',
  description:
    'Modal dialogs, popovers, and overlays require careful consideration for accessibility and user experience. Learn patterns for temporary UI elements that interrupt the main flow.',
  slug: 'dialogs',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/ux-patterns/dialogs',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'dialogs, modals, overlays, popovers, accessibility, focus management, UX patterns',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['accessibility', 'tokens'],
    next_units: ['feedback', 'forms'],
    assessment_required: false,
    estimated_reading_time: 16,
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
    expertise: ['Dialog Patterns', 'Accessibility', 'Focus Management', 'UX'],
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
    title: 'Why Dialog Patterns Matter',
    order: 3,
    content: (
      <>
        <p>
          Modal dialogs, popovers, and overlays require careful consideration
          for accessibility and user experience. When properly implemented,
          dialogs provide focused interaction without overwhelming users. When
          poorly implemented, they create barriers that frustrate users and
          exclude assistive technology users.
        </p>
        <p>Dialog patterns serve multiple critical functions:</p>
        <ul>
          <li>
            <strong>Focused Interaction:</strong> Dialogs focus user attention
            on specific tasks or information
          </li>
          <li>
            <strong>Context Preservation:</strong> Dialogs preserve underlying
            context while requiring user action
          </li>
          <li>
            <strong>Progressive Disclosure:</strong> Dialogs reveal information
            progressively without overwhelming users
          </li>
          <li>
            <strong>Accessibility:</strong> Proper dialogs enable keyboard and
            screen reader navigation
          </li>
          <li>
            <strong>User Control:</strong> Dialogs provide clear ways to dismiss
            or complete actions
          </li>
        </ul>
        <p>
          Well-designed dialog patterns balance user needs with system
          requirements, creating interfaces that are both functional and
          accessible.
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
        <h3>Dialog Types</h3>
        <p>Different dialog types serve different purposes:</p>
        <ul>
          <li>
            <strong>Modal dialogs:</strong> Block interaction with background
            content until dismissed
          </li>
          <li>
            <strong>Non-modal dialogs:</strong> Allow interaction with
            background content
          </li>
          <li>
            <strong>Popovers:</strong> Contextual information or actions
            attached to trigger elements
          </li>
          <li>
            <strong>Drawers:</strong> Slide-in panels for secondary actions or
            information
          </li>
        </ul>
        <pre>
          <code>{`// Modal dialog: Blocks background
<Modal open={isOpen} onClose={handleClose}>
  <Modal.Header>Confirm Action</Modal.Header>
  <Modal.Body>
    Are you sure you want to delete this item?
  </Modal.Body>
  <Modal.Footer>
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="danger" onClick={handleDelete}>
      Delete
    </Button>
  </Modal.Footer>
</Modal>

// Non-modal dialog: Allows background interaction
<Dialog modal={false} open={isOpen}>
  <Dialog.Content>Additional information</Dialog.Content>
</Dialog>

// Popover: Contextual information
<Popover>
  <Popover.Trigger>
    <Button>Learn More</Button>
  </Popover.Trigger>
  <Popover.Content>
    Helpful contextual information
  </Popover.Content>
</Popover>`}</code>
        </pre>

        <h3>Focus Management</h3>
        <p>Dialogs must manage focus properly:</p>
        <ul>
          <li>
            <strong>Focus trap:</strong> Keep focus within dialog when open
          </li>
          <li>
            <strong>Initial focus:</strong> Focus first focusable element when
            dialog opens
          </li>
          <li>
            <strong>Focus return:</strong> Return focus to trigger element when
            dialog closes
          </li>
          <li>
            <strong>Escape key:</strong> Close dialog when Escape key pressed
          </li>
        </ul>
        <pre>
          <code>{`// Focus trap implementation
const Dialog = ({ isOpen, onClose, children }) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus first focusable element
      const focusable = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable?.[0] as HTMLElement)?.focus();

      // Trap focus within dialog
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        
        const focusableElements = Array.from(focusable || []) as HTMLElement[];
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

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
    >
      {children}
    </div>
  );
};`}</code>
        </pre>

        <h3>ARIA Attributes</h3>
        <p>
          ARIA attributes communicate dialog state to assistive technologies:
        </p>
        <ul>
          <li>
            <strong>role="dialog":</strong> Identifies element as dialog
          </li>
          <li>
            <strong>aria-modal="true":</strong> Indicates modal dialog blocks
            background interaction
          </li>
          <li>
            <strong>aria-labelledby:</strong> References dialog title
          </li>
          <li>
            <strong>aria-describedby:</strong> References dialog description
          </li>
        </ul>
        <pre>
          <code>{`// Accessible dialog with ARIA
<div
  role="dialog"
  aria-modal="true"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">
    Are you sure you want to delete this item?
  </p>
  <button onClick={handleClose}>Cancel</button>
  <button onClick={handleConfirm}>Delete</button>
</div>`}</code>
        </pre>

        <h3>Overlay Behavior</h3>
        <p>Overlays provide visual separation and interaction control:</p>
        <ul>
          <li>
            <strong>Backdrop:</strong> Semi-transparent overlay behind dialog
          </li>
          <li>
            <strong>Click outside:</strong> Option to close dialog by clicking
            backdrop
          </li>
          <li>
            <strong>Scroll lock:</strong> Prevent background scrolling when
            modal open
          </li>
          <li>
            <strong>Z-index management:</strong> Ensure dialog appears above all
            content
          </li>
        </ul>
        <p>
          Proper overlay behavior balances user control with system
          requirements.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Dialog Patterns Shape System Success',
    order: 5,
    content: (
      <>
        <h3>User Experience Impact</h3>
        <p>Dialog patterns improve user experience:</p>
        <ul>
          <li>
            <strong>Focused interaction:</strong> Users focus on specific tasks
            without distraction
          </li>
          <li>
            <strong>Clear actions:</strong> Dialogs provide clear paths to
            complete or cancel actions
          </li>
          <li>
            <strong>Context preservation:</strong> Users maintain context while
            handling dialog tasks
          </li>
        </ul>
        <p>
          Effective dialog patterns enhance user experience by providing
          focused, clear interactions.
        </p>

        <h3>Accessibility Impact</h3>
        <p>Dialog patterns improve accessibility:</p>
        <ul>
          <li>
            <strong>Keyboard navigation:</strong> Focus management enables
            keyboard-only interaction
          </li>
          <li>
            <strong>Screen reader support:</strong> ARIA attributes enable
            screen reader navigation
          </li>
          <li>
            <strong>Focus control:</strong> Focus traps prevent navigation
            confusion
          </li>
        </ul>
        <p>
          Accessible dialog patterns enable all users to interact with dialogs
          effectively.
        </p>

        <h3>System Consistency Impact</h3>
        <p>Consistent dialog patterns improve system consistency:</p>
        <ul>
          <li>
            <strong>Predictable behavior:</strong> Users understand dialog
            behavior across system
          </li>
          <li>
            <strong>Reusable components:</strong> Dialog components enable
            consistent implementation
          </li>
          <li>
            <strong>Design system alignment:</strong> Dialogs align with design
            system tokens and patterns
          </li>
        </ul>
        <p>
          Consistent dialog patterns ensure predictable, maintainable system
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
          Dialog patterns bridge design intent and code implementation. Let's
          examine how dialog requirements translate from design specifications
          to working code.
        </p>

        <h3>Design: Dialog Specifications</h3>
        <p>Design specifications define dialog requirements:</p>
        <pre>
          <code>{`// Design specifications
Dialog Requirements:
  - Modal: Blocks background interaction
  - Size: 500px max-width, centered
  - Backdrop: rgba(0, 0, 0, 0.5), clickable
  - Header: Title, close button
  - Body: Scrollable content
  - Footer: Action buttons, right-aligned
  - Focus: Trap focus, return on close
  - Escape: Close on Escape key
  - Z-index: 1000 (above all content)`}</code>
        </pre>

        <h3>Code: Dialog Component Implementation</h3>
        <p>Code implements dialog with focus management:</p>
        <pre>
          <code>{`// Dialog component with focus management
export function Dialog({ open, onClose, children }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Focus first element
      const focusable = dialogRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      (focusable?.[0] as HTMLElement)?.focus();

      // Trap focus
      const handleTab = (e: KeyboardEvent) => {
        if (e.key !== 'Tab') return;
        const focusableElements = Array.from(focusable || []) as HTMLElement[];
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      };

      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };

      document.addEventListener('keydown', handleTab);
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.removeEventListener('keydown', handleTab);
        document.removeEventListener('keydown', handleEscape);
        previousFocusRef.current?.focus();
      };
    }
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="dialog-backdrop"
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000,
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          maxWidth: '500px',
          margin: 'auto',
          backgroundColor: 'white',
          borderRadius: '8px',
          marginTop: '10vh',
        }}
      >
        {children}
      </div>
    </div>
  );
}`}</code>
        </pre>

        <h3>Design: Dialog Variants</h3>
        <p>Design defines dialog variants:</p>
        <pre>
          <code>{`// Dialog variants
- Confirmation: Destructive actions
- Information: Display information
- Form: Input collection
- Alert: Critical information
- Progress: Long-running operations`}</code>
        </pre>

        <h3>Code: Dialog Variant Implementation</h3>
        <p>Code implements variants using composition:</p>
        <pre>
          <code>{`// Dialog with slot components
Dialog.Header = ({ children }) => (
  <div className="dialog-header">
    <h2>{children}</h2>
  </div>
);

Dialog.Body = ({ children }) => (
  <div className="dialog-body">
    {children}
  </div>
);

Dialog.Footer = ({ children }) => (
  <div className="dialog-footer">
    {children}
  </div>
);

// Usage
<Dialog open={isOpen} onClose={handleClose}>
  <Dialog.Header>Confirm Action</Dialog.Header>
  <Dialog.Body>
    Are you sure you want to delete this item?
  </Dialog.Body>
  <Dialog.Footer>
    <Button onClick={handleClose}>Cancel</Button>
    <Button variant="danger" onClick={handleDelete}>
      Delete
    </Button>
  </Dialog.Footer>
</Dialog>`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-implemented dialog pattern ensures users can interact with
          dialogs effectively. Focus management enables keyboard navigation.
          ARIA attributes enable screen reader navigation. Overlay behavior
          provides visual separation. When dialog patterns are built with
          accessibility and user experience in mind, they create interfaces that
          work for everyone.
        </p>
        <p>
          Understanding dialog patterns helps practitioners create interfaces
          that balance user needs with system requirements, ensuring both
          functionality and accessibility.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building an Accessible Dialog',
    order: 7,
    content: (
      <>
        <p>Let's build an accessible dialog component from scratch:</p>

        <h3>Step 1: Create Dialog Structure</h3>
        <p>Create dialog component with ARIA attributes:</p>
        <pre>
          <code>{`// Dialog component structure
export function Dialog({ open, onClose, title, children }) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  if (!open) return null;

  return (
    <div
      className="dialog-backdrop"
      onClick={onClose}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id={titleId}>{title}</h2>
        {children}
      </div>
    </div>
  );
}`}</code>
        </pre>

        <h3>Step 2: Add Focus Management</h3>
        <p>Add focus trap and return logic:</p>
        <pre>
          <code>{`// Add focus management
useEffect(() => {
  if (open) {
    const previousFocus = document.activeElement;
    const focusable = dialogRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    (focusable?.[0] as HTMLElement)?.focus();

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const focusableElements = Array.from(focusable || []) as HTMLElement[];
      const first = focusableElements[0];
      const last = focusableElements[focusableElements.length - 1];
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
      (previousFocus as HTMLElement)?.focus();
    };
  }
}, [open]);`}</code>
        </pre>

        <h3>Step 3: Add Escape Key Handling</h3>
        <p>Add Escape key to close dialog:</p>
        <pre>
          <code>{`// Add Escape key handling
useEffect(() => {
  if (open) {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }
}, [open, onClose]);`}</code>
        </pre>

        <h3>Step 4: Add Scroll Lock</h3>
        <p>Prevent background scrolling when modal open:</p>
        <pre>
          <code>{`// Add scroll lock
useEffect(() => {
  if (open) {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }
}, [open]);`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Accessibility:</strong> Full keyboard and screen reader
            support
          </li>
          <li>
            <strong>User experience:</strong> Clear focus management and escape
            handling
          </li>
          <li>
            <strong>Consistency:</strong> Predictable behavior across dialogs
          </li>
          <li>
            <strong>Maintainability:</strong> Reusable component implementation
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
        <p>Dialog patterns face several challenges:</p>

        <h4>Focus Management Complexity</h4>
        <p>Focus management can be complex:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Proper focus trapping requires careful
            implementation
          </li>
          <li>
            <strong>Solution:</strong> Use well-tested libraries or implement
            carefully with thorough testing
          </li>
          <li>
            <strong>Guideline:</strong> Test focus management with keyboard-only
            navigation
          </li>
        </ul>

        <h4>Nested Dialogs</h4>
        <p>Nested dialogs create complexity:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Managing focus and z-index with nested
            dialogs
          </li>
          <li>
            <strong>Approach:</strong> Use dialog stack to manage nested
            dialogs, avoid nesting when possible
          </li>
          <li>
            <strong>Tradeoff:</strong> Complexity vs. user needs
          </li>
        </ul>

        <h4>Mobile Considerations</h4>
        <p>Mobile devices require special consideration:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Full-screen dialogs on mobile, touch
            interactions
          </li>
          <li>
            <strong>Approach:</strong> Use drawers on mobile, ensure touch
            targets are adequate
          </li>
          <li>
            <strong>Tradeoff:</strong> Consistency vs. platform optimization
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Dialog patterns involve several tradeoffs:</p>

        <h4>Modal vs. Non-Modal</h4>
        <ul>
          <li>
            <strong>Modal:</strong> Better focus control, but interrupts user
            flow
          </li>
          <li>
            <strong>Non-modal:</strong> Less disruptive, but requires careful
            focus management
          </li>
          <li>
            <strong>Best practice:</strong> Use modal for critical actions,
            non-modal for optional information
          </li>
        </ul>

        <h4>Click Outside to Close</h4>
        <ul>
          <li>
            <strong>Enabled:</strong> More flexible, but may cause accidental
            dismissals
          </li>
          <li>
            <strong>Disabled:</strong> Prevents accidental dismissals, but less
            flexible
          </li>
          <li>
            <strong>Best practice:</strong> Enable for non-critical dialogs,
            disable for destructive actions
          </li>
        </ul>

        <h4>Scroll Lock</h4>
        <ul>
          <li>
            <strong>Enabled:</strong> Prevents background scrolling, but may
            confuse users
          </li>
          <li>
            <strong>Disabled:</strong> Allows background scrolling, but may
            cause confusion
          </li>
          <li>
            <strong>Best practice:</strong> Enable for modal dialogs, disable
            for non-modal
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
        <p>Continue learning about dialog patterns:</p>
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
            : Focus management and ARIA
          </li>
          <li>
            <Link href="/blueprints/ux-patterns/feedback">
              Feedback Patterns
            </Link>
            : Related feedback patterns
          </li>
          <li>
            <Link href="/blueprints/ux-patterns/forms">Forms Patterns</Link>:
            Form dialogs and modals
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#dialog">Dialog</Link>,{' '}
          <Link href="/blueprints/glossary#modal">Modal</Link>,{' '}
          <Link href="/blueprints/glossary#focus">Focus Management</Link>
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
      description: 'Focus management and ARIA',
      type: 'foundation',
    },
    {
      slug: 'feedback',
      title: 'Feedback Patterns',
      description: 'Related feedback patterns',
      type: 'pattern',
    },
  ],
  components: [],
  glossary: ['dialog', 'modal', 'focus'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'focus-trap-implemented',
    label: 'Focus trap implemented',
    description: 'Focus is trapped within dialog when open',
    required: true,
  },
  {
    id: 'focus-return-implemented',
    label: 'Focus return implemented',
    description: 'Focus returns to trigger element when dialog closes',
    required: true,
  },
  {
    id: 'escape-key-handled',
    label: 'Escape key handled',
    description: 'Dialog closes when Escape key pressed',
    required: true,
  },
  {
    id: 'aria-attributes-set',
    label: 'ARIA attributes set',
    description:
      'Dialog has proper ARIA attributes (role, aria-modal, aria-labelledby)',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you use modal vs. non-modal dialogs? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how focus management ensures accessibility in dialogs. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between click-outside-to-close enabled and disabled? How do you decide?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function DialogsPage() {
  return <FoundationPage content={content} />;
}

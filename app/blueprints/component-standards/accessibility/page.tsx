import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Standards | Component Standards',
  description:
    'Ensure every component meets accessibility requirements and best practices. Learn WCAG compliance, ARIA patterns, and keyboard navigation.',
  keywords: [
    'Design System',
    'Accessibility',
    'WCAG',
    'ARIA',
    'Keyboard Navigation',
    'Screen Readers',
  ],
};

export default function AccessibilityStandardsPage() {
  return (
    <section>
      <article className="content">
        <h1>Accessibility Standards</h1>
        <p>
          Accessibility is not optional—it's a fundamental requirement for every
          component in your design system. Accessible components ensure that all
          users, regardless of ability, can effectively use your products. These
          standards provide the foundation for creating inclusive, compliant
          components.
        </p>

        <h2>Why Accessibility Matters</h2>
        <p>Accessible components:</p>
        <ul>
          <li>
            <strong>Legal Compliance:</strong> Meet WCAG 2.1 Level AA
            requirements
          </li>
          <li>
            <strong>User Inclusion:</strong> Serve users with disabilities
          </li>
          <li>
            <strong>Better UX:</strong> Improve experience for all users
          </li>
          <li>
            <strong>Business Value:</strong> Expand your user base
          </li>
        </ul>

        <h2>Core Requirements</h2>

        <h3>1. Semantic HTML</h3>
        <p>Use semantic HTML elements that convey meaning:</p>
        <pre>
          <code>{`// ❌ Bad: Generic elements
<div onClick={handleClick}>Click me</div>
<span role="button">Submit</span>

// ✅ Good: Semantic elements
<button onClick={handleClick}>Click me</button>
<button type="submit">Submit</button>`}</code>
        </pre>

        <h3>2. Keyboard Navigation</h3>
        <p>All interactive elements must be keyboard accessible:</p>
        <pre>
          <code>{`// ✅ Good: Keyboard accessible
<button 
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
>
  Click me
</button>

// Native button already handles keyboard - no extra code needed!
<button onClick={handleClick}>Click me</button>`}</code>
        </pre>

        <h3>3. ARIA Attributes</h3>
        <p>Use ARIA when HTML semantics aren't sufficient:</p>
        <pre>
          <code>{`// ✅ Good: ARIA for complex components
<div 
  role="dialog"
  aria-labelledby="dialog-title"
  aria-describedby="dialog-description"
>
  <h2 id="dialog-title">Confirm Action</h2>
  <p id="dialog-description">Are you sure you want to continue?</p>
</div>

// ✅ Good: ARIA for dynamic content
<div aria-live="polite" aria-atomic="true">
  {loading ? 'Loading...' : 'Content loaded'}
</div>`}</code>
        </pre>

        <h3>4. Color Contrast</h3>
        <p>Ensure sufficient color contrast for text:</p>
        <ul>
          <li>
            <strong>Normal text:</strong> 4.5:1 contrast ratio (WCAG AA)
          </li>
          <li>
            <strong>Large text:</strong> 3:1 contrast ratio (WCAG AA)
          </li>
          <li>
            <strong>UI components:</strong> 3:1 contrast ratio
          </li>
        </ul>

        <h3>5. Focus Management</h3>
        <p>Ensure focus is visible and properly managed:</p>
        <pre>
          <code>{`// ✅ Good: Visible focus indicator
.button:focus-visible {
  outline: 2px solid var(--semantic-color-border-focus);
  outline-offset: 2px;
}

// ✅ Good: Focus trapping in modals
function Modal({ isOpen, onClose, children }) {
  useEffect(() => {
    if (isOpen) {
      // Trap focus inside modal
      const focusableElements = modalRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      
      const handleTab = (e) => {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          } else if (!e.shiftKey && document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };
      
      firstElement?.focus();
      document.addEventListener('keydown', handleTab);
      return () => document.removeEventListener('keydown', handleTab);
    }
  }, [isOpen]);
  
  return <div ref={modalRef}>{children}</div>;
}`}</code>
        </pre>

        <h2>Component-Specific Guidelines</h2>

        <h3>Buttons</h3>
        <ul>
          <li>
            Use semantic <code>&lt;button&gt;</code> element
          </li>
          <li>Provide accessible label (text or aria-label)</li>
          <li>Indicate loading state with aria-busy</li>
          <li>Minimum 44x44px touch target</li>
        </ul>

        <h3>Form Controls</h3>
        <ul>
          <li>Associate labels with inputs using htmlFor/id</li>
          <li>Provide error messages with aria-describedby</li>
          <li>Use aria-required for required fields</li>
          <li>Announce validation errors to screen readers</li>
        </ul>

        <h3>Dialogs/Modals</h3>
        <ul>
          <li>Use role="dialog" or &lt;dialog&gt; element</li>
          <li>Provide aria-labelledby for title</li>
          <li>Trap focus inside modal</li>
          <li>Return focus to trigger when closed</li>
        </ul>

        <h2>Testing Requirements</h2>

        <h3>Automated Testing</h3>
        <p>Run automated accessibility tests:</p>
        <pre>
          <code>{`// jest-axe for unit tests
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

it('should have no accessibility violations', async () => {
  const { container } = render(<Button>Click me</Button>);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});`}</code>
        </pre>

        <h3>Manual Testing</h3>
        <p>Test with assistive technologies:</p>
        <ul>
          <li>
            <strong>Screen readers:</strong> VoiceOver (macOS/iOS), NVDA/JAWS
            (Windows)
          </li>
          <li>
            <strong>Keyboard only:</strong> Navigate without mouse
          </li>
          <li>
            <strong>Zoom:</strong> Test at 200% zoom
          </li>
          <li>
            <strong>High contrast:</strong> Test in high contrast mode
          </li>
        </ul>

        <h2>Common Pitfalls</h2>

        <h3>1. Missing Labels</h3>
        <pre>
          <code>{`// ❌ Bad: No label
<input type="text" />

// ✅ Good: Associated label
<label htmlFor="email">Email</label>
<input id="email" type="email" />`}</code>
        </pre>

        <h3>2. Keyboard Traps</h3>
        <pre>
          <code>{`// ❌ Bad: Focus can't escape
<div onKeyDown={(e) => e.preventDefault()}>
  {/* Focus trapped */}
</div>

// ✅ Good: Proper focus management
<div 
  onKeyDown={(e) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }}
>
  {/* Focus can escape */}
</div>`}</code>
        </pre>

        <h3>3. Insufficient Color Contrast</h3>
        <pre>
          <code>{`// ❌ Bad: Low contrast
.button {
  background: #ccc;
  color: #ddd; /* Contrast ratio: 1.2:1 */
}

// ✅ Good: Sufficient contrast
.button {
  background: #0066cc;
  color: #ffffff; /* Contrast ratio: 4.5:1 */
}`}</code>
        </pre>

        <h3>4. Missing ARIA Labels</h3>
        <pre>
          <code>{`// ❌ Bad: No indication of purpose
<button onClick={handleClose}>
  <Icon name="close" />
</button>

// ✅ Good: Clear label
<button 
  onClick={handleClose}
  aria-label="Close dialog"
>
  <Icon name="close" />
</button>`}</code>
        </pre>

        <h2>WCAG Compliance</h2>

        <h3>Level AA Requirements</h3>
        <p>All components must meet WCAG 2.1 Level AA:</p>
        <ul>
          <li>
            <strong>Perceivable:</strong> Text alternatives, captions, color
            contrast
          </li>
          <li>
            <strong>Operable:</strong> Keyboard accessible, no seizures, enough
            time
          </li>
          <li>
            <strong>Understandable:</strong> Readable, predictable, input
            assistance
          </li>
          <li>
            <strong>Robust:</strong> Compatible with assistive technologies
          </li>
        </ul>

        <h2>Related Resources</h2>
        <ul>
          <li>
            <Link href="/blueprints/foundations/accessibility/philosophy">
              Accessibility as System Infrastructure
            </Link>{' '}
            — Deep dive into accessibility philosophy
          </li>
          <li>
            <Link href="/blueprints/component-standards/props">
              Props & API Standards
            </Link>{' '}
            — How props support accessibility
          </li>
          <li>
            <a
              href="https://www.w3.org/WAI/WCAG21/quickref/"
              target="_blank"
              rel="noopener noreferrer"
            >
              WCAG 2.1 Quick Reference
            </a>{' '}
            — Official WCAG guidelines
          </li>
        </ul>
      </article>
    </section>
  );
}

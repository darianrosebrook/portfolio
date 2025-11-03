import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Usage Guidelines | Component Standards',
  description:
    "Provide dos and don'ts, usage examples, and contextual recommendations. Learn when and how to use components effectively.",
  keywords: [
    'Design System',
    'Component Usage',
    'Best Practices',
    'Guidelines',
    "Do and Don't",
  ],
};

export default function UsageStandardsPage() {
  return (
    <section>
      <article className="content">
        <h1>Usage Guidelines</h1>
        <p>
          Usage guidelines help teams use components correctly and consistently.
          Clear dos and don'ts prevent misuse, reduce support burden, and ensure
          components deliver their intended value. These guidelines bridge the
          gap between component capabilities and real-world application.
        </p>

        <h2>Why Usage Guidelines Matter</h2>
        <p>Well-defined usage guidelines:</p>
        <ul>
          <li>
            <strong>Prevent Misuse:</strong> Clear guidance reduces mistakes
          </li>
          <li>
            <strong>Enable Self-Service:</strong> Teams can use components
            without asking
          </li>
          <li>
            <strong>Maintain Consistency:</strong> Similar contexts use similar
            patterns
          </li>
          <li>
            <strong>Reduce Support:</strong> Fewer questions and issues
          </li>
        </ul>

        <h2>Guideline Structure</h2>

        <h3>1. When to Use</h3>
        <p>Describe appropriate use cases:</p>
        <pre>
          <code>{`/**
 * Button Usage Guidelines
 * 
 * ✅ Use Button for:
 * - Primary actions (Save, Submit, Confirm)
 * - Secondary actions (Cancel, Back)
 * - Destructive actions (Delete, Remove)
 * - Navigation actions (Learn More, View Details)
 * 
 * ❌ Don't use Button for:
 * - Text links (use Link component)
 * - Icon-only actions without labels (use IconButton)
 * - Toggle switches (use Switch component)
 * - Navigation menus (use NavLink component)
 */`}</code>
        </pre>

        <h3>2. Contextual Recommendations</h3>
        <p>Provide guidance for different contexts:</p>
        <pre>
          <code>{`/**
 * Button Context Guidelines
 * 
 * Forms:
 * - Use primary variant for submit button
 * - Use secondary variant for cancel button
 * - Place buttons at bottom right of form
 * - Use loading state during submission
 * 
 * Modals:
 * - Use primary variant for confirmation action
 * - Use ghost variant for cancel action
 * - Place buttons in footer
 * - Ensure keyboard navigation works
 * 
 * Toolbars:
 * - Use appropriate sizes for space constraints
 * - Group related actions
 * - Use icon buttons when space is limited
 */`}</code>
        </pre>

        <h3>3. Do's and Don'ts</h3>
        <p>Clear examples of correct and incorrect usage:</p>
        <pre>
          <code>{`/**
 * Button Do's and Don'ts
 * 
 * ✅ DO:
 * - Use descriptive labels ("Save Changes" not "Click")
 * - Provide loading states for async actions
 * - Use appropriate variants for action priority
 * - Ensure sufficient touch target size (44x44px)
 * 
 * ❌ DON'T:
 * - Use buttons for navigation (use Link)
 * - Override focus styles (breaks accessibility)
 * - Use multiple primary buttons on same screen
 * - Use unclear labels ("OK", "Yes", "No")
 */`}</code>
        </pre>

        <h2>Component-Specific Guidelines</h2>

        <h3>Buttons</h3>
        <div style={{ marginBottom: '2rem' }}>
          <h4>✅ Do</h4>
          <ul>
            <li>Use descriptive labels that indicate action outcome</li>
            <li>Use primary variant for main action on screen</li>
            <li>Provide loading states for async actions</li>
            <li>Use appropriate size for context</li>
          </ul>
          <h4>❌ Don't</h4>
          <ul>
            <li>Use buttons for navigation (use Link component)</li>
            <li>Use multiple primary buttons on same screen</li>
            <li>Use unclear labels ("OK", "Click here")</li>
            <li>Remove focus styles (breaks accessibility)</li>
          </ul>
        </div>

        <h3>Form Controls</h3>
        <div style={{ marginBottom: '2rem' }}>
          <h4>✅ Do</h4>
          <ul>
            <li>Always associate labels with inputs</li>
            <li>Provide helpful error messages</li>
            <li>Use appropriate input types (email, tel, url)</li>
            <li>Group related fields logically</li>
          </ul>
          <h4>❌ Don't</h4>
          <ul>
            <li>Use placeholder text as label</li>
            <li>Hide validation errors until submit</li>
            <li>Use generic "Error" messages</li>
            <li>Require formatting users must guess</li>
          </ul>
        </div>

        <h3>Modals/Dialogs</h3>
        <div style={{ marginBottom: '2rem' }}>
          <h4>✅ Do</h4>
          <ul>
            <li>Use for critical confirmations</li>
            <li>Provide clear title and description</li>
            <li>Include primary and secondary actions</li>
            <li>Trap focus and manage keyboard navigation</li>
          </ul>
          <h4>❌ Don't</h4>
          <ul>
            <li>Use for non-critical information (use Toast)</li>
            <li>Nest modals within modals</li>
            <li>Use modals for navigation</li>
            <li>Block user from closing modal</li>
          </ul>
        </div>

        <h2>Composition Guidelines</h2>

        <h3>When to Compose</h3>
        <p>Use composition for complex use cases:</p>
        <pre>
          <code>{`// ✅ Good: Compose for complex cases
<Card>
  <Card.Header>
    <Card.Title>User Profile</Card.Title>
    <Card.Actions>
      <Button variant="ghost" size="sm">Edit</Button>
    </Card.Actions>
  </Card.Header>
  <Card.Body>
    <TextField label="Name" />
    <TextField label="Email" />
  </Card.Body>
  <Card.Footer>
    <Button variant="primary">Save</Button>
    <Button variant="secondary">Cancel</Button>
  </Card.Footer>
</Card>

// ❌ Bad: Trying to handle everything with props
<Card 
  title="User Profile"
  hasEditButton
  fields={[...]}
  hasFooter
  footerActions={[...]}
/>`}</code>
        </pre>

        <h2>Accessibility Guidelines</h2>

        <h3>Required Accessibility Practices</h3>
        <ul>
          <li>
            <strong>Keyboard Navigation:</strong> All interactive elements must
            be keyboard accessible
          </li>
          <li>
            <strong>Focus Management:</strong> Focus should be visible and
            properly managed
          </li>
          <li>
            <strong>Screen Reader Support:</strong> Components must be announced
            correctly
          </li>
          <li>
            <strong>Color Contrast:</strong> Meet WCAG AA contrast requirements
          </li>
        </ul>

        <h2>Performance Guidelines</h2>

        <h3>Optimization Best Practices</h3>
        <ul>
          <li>
            <strong>Lazy Loading:</strong> Load heavy components on demand
          </li>
          <li>
            <strong>Memoization:</strong> Memoize expensive computations
          </li>
          <li>
            <strong>Code Splitting:</strong> Split large component bundles
          </li>
          <li>
            <strong>Virtualization:</strong> Use for long lists and tables
          </li>
        </ul>

        <h2>Content Guidelines</h2>

        <h3>Labeling Best Practices</h3>
        <pre>
          <code>{`// ✅ Good: Clear, descriptive labels
<Button>Save Changes</Button>
<Button variant="danger">Delete Account</Button>
<Input label="Email Address" placeholder="you@example.com" />

// ❌ Bad: Vague, unclear labels
<Button>OK</Button>
<Button variant="danger">Delete</Button>
<Input placeholder="Enter text" />`}</code>
        </pre>

        <h2>Common Mistakes</h2>

        <h3>1. Over-Customization</h3>
        <pre>
          <code>{`// ❌ Bad: Customizing too much
<Button 
  style={{
    borderRadius: '50px',
    backgroundColor: '#ff0000',
    fontSize: '20px',
    padding: '30px'
  }}
>
  Click me
</Button>

// ✅ Good: Use system variants
<Button variant="primary" size="lg">
  Click me
</Button>`}</code>
        </pre>

        <h3>2. Ignoring Context</h3>
        <pre>
          <code>{`// ❌ Bad: Wrong component for context
<Button onClick={() => router.push('/about')}>
  Learn More
</Button>

// ✅ Good: Use appropriate component
<Link href="/about">Learn More</Link>`}</code>
        </pre>

        <h3>3. Missing Error Handling</h3>
        <pre>
          <code>{`// ❌ Bad: No error state
<TextField label="Email" />

// ✅ Good: Proper error handling
<TextField 
  label="Email"
  error={errors.email}
  hint="We'll never share your email"
/>`}</code>
        </pre>

        <h2>Documentation Requirements</h2>

        <h3>Required Sections</h3>
        <p>Every component's usage guidelines should include:</p>
        <ul>
          <li>
            <strong>When to Use:</strong> Appropriate use cases
          </li>
          <li>
            <strong>When Not to Use:</strong> Inappropriate use cases
          </li>
          <li>
            <strong>Do's and Don'ts:</strong> Clear examples
          </li>
          <li>
            <strong>Code Examples:</strong> Real-world usage patterns
          </li>
          <li>
            <strong>Common Mistakes:</strong> What to avoid
          </li>
          <li>
            <strong>Accessibility:</strong> Accessibility considerations
          </li>
        </ul>

        <h2>Related Resources</h2>
        <ul>
          <li>
            <Link href="/blueprints/component-standards/props">
              Props & API Standards
            </Link>{' '}
            — Understanding component APIs
          </li>
          <li>
            <Link href="/blueprints/component-standards/accessibility">
              Accessibility Standards
            </Link>{' '}
            — Ensuring accessible usage
          </li>
          <li>
            <Link href="/blueprints/foundations/philosophy">
              Philosophy of Design Systems
            </Link>{' '}
            — Systems thinking for component usage
          </li>
        </ul>
      </article>
    </section>
  );
}

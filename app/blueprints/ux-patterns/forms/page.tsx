/**
 * UX Pattern: Input & Forms Patterns
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
  title: 'Input & Forms Patterns',
  description:
    'Forms are a critical part of user interaction. Learn best practices for form design, validation, accessibility, and user-friendly input patterns.',
  slug: 'forms',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/ux-patterns/forms',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'forms, input, validation, accessibility, form design, UX patterns',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['accessibility', 'tokens'],
    next_units: ['dialogs', 'feedback'],
    assessment_required: false,
    estimated_reading_time: 17,
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
    expertise: ['Form Patterns', 'Validation', 'Accessibility', 'UX'],
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
    title: 'Why Form Patterns Matter',
    order: 3,
    content: (
      <>
        <p>
          Forms are a critical part of user interaction. When properly
          implemented, forms enable efficient data collection and user
          satisfaction. When poorly implemented, forms create frustration and
          abandonment.
        </p>
        <p>Form patterns serve multiple critical functions:</p>
        <ul>
          <li>
            <strong>Data Collection:</strong> Forms enable structured data
            collection from users
          </li>
          <li>
            <strong>Validation:</strong> Forms validate input to prevent errors
            and ensure data quality
          </li>
          <li>
            <strong>Guidance:</strong> Forms guide users through complex
            processes
          </li>
          <li>
            <strong>Accessibility:</strong> Proper forms enable keyboard and
            screen reader navigation
          </li>
          <li>
            <strong>User Experience:</strong> Well-designed forms reduce
            friction and increase completion rates
          </li>
        </ul>
        <p>
          Well-designed form patterns balance user needs with system
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
        <h3>Label Association</h3>
        <p>Form inputs must be properly associated with labels:</p>
        <ul>
          <li>
            <strong>htmlFor/id:</strong> Connect label to input via htmlFor and
            id attributes
          </li>
          <li>
            <strong>aria-label:</strong> Use aria-label for icon-only inputs
          </li>
          <li>
            <strong>aria-labelledby:</strong> Use aria-labelledby for complex
            label structures
          </li>
          <li>
            <strong>Required indicators:</strong> Clearly indicate required
            fields
          </li>
        </ul>
        <pre>
          <code>{`// Accessible form field with label association
<TextField
  id="email"
  label="Email Address"
  required
  error={errors.email}
  description="We'll never share your email"
/>

// Implementation
export function TextField({ id, label, error, description, ...props }) {
  const inputId = useId();
  const resolvedId = id ?? \`field-\${inputId}\`;
  const descId = description ? \`\${resolvedId}-desc\` : undefined;
  const errId = error ? \`\${resolvedId}-err\` : undefined;
  
  const describedBy = [descId, errId]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="field">
      <label htmlFor={resolvedId}>
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      <input
        id={resolvedId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        {...props}
      />
      {description && (
        <div id={descId} className="description">
          {description}
        </div>
      )}
      {error && (
        <div id={errId} role="alert" className="error">
          {error}
        </div>
      )}
    </div>
  );
}`}</code>
        </pre>

        <h3>Error Association</h3>
        <p>Error messages must be associated with form fields:</p>
        <ul>
          <li>
            <strong>aria-describedby:</strong> Link error message to input
          </li>
          <li>
            <strong>aria-invalid:</strong> Indicate error state on input
          </li>
          <li>
            <strong>role="alert":</strong> Announce errors immediately to screen
            readers
          </li>
          <li>
            <strong>Clear language:</strong> Use plain, actionable error
            messages
          </li>
        </ul>
        <pre>
          <code>{`// Error association
<input
  id="email"
  aria-describedby="email-error"
  aria-invalid={!!errors.email}
/>
{errors.email && (
  <div
    id="email-error"
    role="alert"
    aria-live="polite"
  >
    {errors.email}
  </div>
)}

// Error message best practices
✓ "Password must be at least 8 characters"
✗ "Invalid input"

✓ "Please enter a valid email address"
✗ "Error"`}</code>
        </pre>

        <h3>Validation Timing</h3>
        <p>Validation timing affects user experience:</p>
        <ul>
          <li>
            <strong>On blur:</strong> Validate when user leaves field
          </li>
          <li>
            <strong>On submit:</strong> Validate all fields on form submission
          </li>
          <li>
            <strong>On change:</strong> Validate as user types (for specific
            patterns)
          </li>
          <li>
            <strong>Progressive:</strong> Show errors progressively, not all at
            once
          </li>
        </ul>
        <pre>
          <code>{`// Validation timing
const [errors, setErrors] = useState({});
const [touched, setTouched] = useState({});

// Validate on blur
const handleBlur = (field) => {
  setTouched({ ...touched, [field]: true });
  const error = validateField(field, values[field]);
  setErrors({ ...errors, [field]: error });
};

// Validate on submit
const handleSubmit = (e) => {
  e.preventDefault();
  const allErrors = validateForm(values);
  setErrors(allErrors);
  setTouched(Object.keys(values).reduce((acc, key) => {
    acc[key] = true;
    return acc;
  }, {}));
  
  if (Object.keys(allErrors).length === 0) {
    submitForm(values);
  }
};`}</code>
        </pre>

        <h3>Form Structure</h3>
        <p>Form structure affects usability and accessibility:</p>
        <ul>
          <li>
            <strong>Logical grouping:</strong> Group related fields together
          </li>
          <li>
            <strong>Fieldset:</strong> Use fieldset for groups of related fields
          </li>
          <li>
            <strong>Legend:</strong> Use legend for fieldset labels
          </li>
          <li>
            <strong>Progressive disclosure:</strong> Reveal fields progressively
            when appropriate
          </li>
        </ul>
        <pre>
          <code>{`// Form structure with fieldsets
<form onSubmit={handleSubmit}>
  <fieldset>
    <legend>Personal Information</legend>
    <TextField label="First Name" />
    <TextField label="Last Name" />
  </fieldset>
  
  <fieldset>
    <legend>Contact Information</legend>
    <TextField label="Email" type="email" />
    <TextField label="Phone" type="tel" />
  </fieldset>
  
  <button type="submit">Submit</button>
</form>`}</code>
        </pre>

        <h3>Input Types</h3>
        <p>Appropriate input types improve user experience:</p>
        <ul>
          <li>
            <strong>Semantic types:</strong> Use email, tel, url, date, etc.
          </li>
          <li>
            <strong>Mobile keyboards:</strong> Proper types trigger appropriate
            mobile keyboards
          </li>
          <li>
            <strong>Browser validation:</strong> Native browser validation for
            semantic types
          </li>
          <li>
            <strong>Accessibility:</strong> Screen readers understand semantic
            input types
          </li>
        </ul>
        <pre>
          <code>{`// Appropriate input types
<input type="email" /> // Email keyboard on mobile
<input type="tel" />   // Phone keyboard on mobile
<input type="url" />   // URL keyboard on mobile
<input type="date" />  // Date picker on mobile
<input type="number" /> // Number keyboard on mobile
<input type="password" /> // Password masking`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Form Patterns Shape System Success',
    order: 5,
    content: (
      <>
        <h3>User Experience Impact</h3>
        <p>Form patterns improve user experience:</p>
        <ul>
          <li>
            <strong>Reduced friction:</strong> Clear labels and validation
            reduce user errors
          </li>
          <li>
            <strong>Faster completion:</strong> Appropriate input types speed up
            data entry
          </li>
          <li>
            <strong>Clear guidance:</strong> Helpful descriptions guide users
            through forms
          </li>
        </ul>
        <p>
          Effective form patterns enhance user experience by reducing friction
          and increasing completion rates.
        </p>

        <h3>Accessibility Impact</h3>
        <p>Form patterns improve accessibility:</p>
        <ul>
          <li>
            <strong>Keyboard navigation:</strong> Proper form structure enables
            keyboard-only interaction
          </li>
          <li>
            <strong>Screen reader support:</strong> Label and error association
            enable screen reader navigation
          </li>
          <li>
            <strong>Error recovery:</strong> Clear error messages help users
            recover from mistakes
          </li>
        </ul>
        <p>
          Accessible form patterns ensure all users can complete forms
          effectively.
        </p>

        <h3>Data Quality Impact</h3>
        <p>Form patterns improve data quality:</p>
        <ul>
          <li>
            <strong>Validation:</strong> Client-side validation prevents invalid
            data submission
          </li>
          <li>
            <strong>Clear requirements:</strong> Required indicators and
            descriptions clarify expectations
          </li>
          <li>
            <strong>Error prevention:</strong> Appropriate input types prevent
            common errors
          </li>
        </ul>
        <p>
          Well-designed form patterns ensure high-quality data collection
          through validation and guidance.
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
          Form patterns bridge design intent and code implementation. Let's
          examine how form requirements translate from design specifications to
          working code.
        </p>

        <h3>Design: Form Specifications</h3>
        <p>Design specifications define form requirements:</p>
        <pre>
          <code>{`// Design specifications
Form Requirements:
  - Labels: Above inputs, required indicator (*)
  - Error messages: Below inputs, red text
  - Help text: Below inputs, gray text
  - Spacing: 16px between fields
  - Validation: Show on blur, validate on submit
  - Required fields: Marked with asterisk
  - Input types: Use semantic types (email, tel, etc.)`}</code>
        </pre>

        <h3>Code: Form Component Implementation</h3>
        <p>Code implements forms with accessibility:</p>
        <pre>
          <code>{`// Form field component
export function TextField({ id, label, error, description, required, ...props }) {
  const inputId = useId();
  const resolvedId = id ?? \`field-\${inputId}\`;
  const descId = description ? \`\${resolvedId}-desc\` : undefined;
  const errId = error ? \`\${resolvedId}-err\` : undefined;
  
  const describedBy = [descId, errId]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="field">
      <label htmlFor={resolvedId}>
        {label}
        {required && (
          <span aria-label="required" className="required">
            *
          </span>
        )}
      </label>
      <input
        id={resolvedId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        required={required}
        {...props}
      />
      {description && (
        <div id={descId} className="description">
          {description}
        </div>
      )}
      {error && (
        <div id={errId} role="alert" aria-live="polite" className="error">
          {error}
        </div>
      )}
    </div>
  );
}`}</code>
        </pre>

        <h3>Design: Validation Rules</h3>
        <p>Design defines validation rules:</p>
        <pre>
          <code>{`// Validation rules
Email:
  - Required
  - Valid email format
  - Error: "Please enter a valid email address"

Password:
  - Required
  - Minimum 8 characters
  - Contains uppercase, lowercase, number
  - Error: "Password must be at least 8 characters and contain uppercase, lowercase, and number"`}</code>
        </pre>

        <h3>Code: Validation Implementation</h3>
        <p>Code implements validation with clear error messages:</p>
        <pre>
          <code>{`// Validation functions
function validateEmail(email) {
  if (!email) return 'Email is required';
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/.test(password)) {
    return 'Password must contain uppercase, lowercase, and number';
  }
  return '';
}

// Form validation
const handleBlur = (field, value) => {
  const errors = { ...formErrors };
  switch (field) {
    case 'email':
      errors.email = validateEmail(value);
      break;
    case 'password':
      errors.password = validatePassword(value);
      break;
  }
  setFormErrors(errors);
};`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-implemented form pattern ensures users can complete forms
          effectively. Label association enables screen reader navigation. Error
          association guides users to correct issues. Validation prevents
          invalid data submission. When form patterns are built with
          accessibility and user experience in mind, they create interfaces that
          enable efficient data collection.
        </p>
        <p>
          Understanding form patterns helps practitioners create interfaces that
          balance user needs with system requirements, ensuring both
          functionality and accessibility.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building an Accessible Form',
    order: 7,
    content: (
      <>
        <p>Let's build an accessible form from scratch:</p>

        <h3>Step 1: Create Form Field Component</h3>
        <p>Create form field component with label association:</p>
        <pre>
          <code>{`// Form field component
export function TextField({ id, label, error, description, required, ...props }) {
  const inputId = useId();
  const resolvedId = id ?? \`field-\${inputId}\`;
  const descId = description ? \`\${resolvedId}-desc\` : undefined;
  const errId = error ? \`\${resolvedId}-err\` : undefined;
  
  const describedBy = [descId, errId]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="field">
      <label htmlFor={resolvedId}>
        {label}
        {required && <span aria-label="required">*</span>}
      </label>
      <input
        id={resolvedId}
        aria-describedby={describedBy}
        aria-invalid={!!error}
        required={required}
        {...props}
      />
      {description && (
        <div id={descId} className="description">
          {description}
        </div>
      )}
      {error && (
        <div id={errId} role="alert" aria-live="polite" className="error">
          {error}
        </div>
      )}
    </div>
  );
}`}</code>
        </pre>

        <h3>Step 2: Add Validation</h3>
        <p>Add validation with clear error messages:</p>
        <pre>
          <code>{`// Validation functions
function validateEmail(email) {
  if (!email) return 'Email is required';
  if (!/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(email)) {
    return 'Please enter a valid email address';
  }
  return '';
}

function validatePassword(password) {
  if (!password) return 'Password is required';
  if (password.length < 8) {
    return 'Password must be at least 8 characters';
  }
  if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)/.test(password)) {
    return 'Password must contain uppercase, lowercase, and number';
  }
  return '';
}`}</code>
        </pre>

        <h3>Step 3: Implement Form with Validation</h3>
        <p>Implement form with validation on blur and submit:</p>
        <pre>
          <code>{`// Form implementation
function SignupForm() {
  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    const error = field === 'email' 
      ? validateEmail(values[field])
      : validatePassword(values[field]);
    setErrors({ ...errors, [field]: error });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const allErrors = {
      email: validateEmail(values.email),
      password: validatePassword(values.password),
    };
    setErrors(allErrors);
    setTouched({ email: true, password: true });
    
    if (!allErrors.email && !allErrors.password) {
      submitForm(values);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        id="email"
        label="Email"
        type="email"
        required
        value={values.email}
        onChange={(e) => setValues({ ...values, email: e.target.value })}
        onBlur={() => handleBlur('email')}
        error={touched.email && errors.email}
        description="We'll never share your email"
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        required
        value={values.password}
        onChange={(e) => setValues({ ...values, password: e.target.value })}
        onBlur={() => handleBlur('password')}
        error={touched.password && errors.password}
        description="Must be at least 8 characters"
      />
      <button type="submit">Sign Up</button>
    </form>
  );
}`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Accessibility:</strong> Full keyboard and screen reader
            support
          </li>
          <li>
            <strong>User experience:</strong> Clear validation and error
            messages
          </li>
          <li>
            <strong>Data quality:</strong> Validation prevents invalid data
            submission
          </li>
          <li>
            <strong>Maintainability:</strong> Reusable form field component
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
        <p>Form patterns face several challenges:</p>

        <h4>Validation Complexity</h4>
        <p>Complex validation can be difficult to manage:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Many validation rules create complexity
          </li>
          <li>
            <strong>Solution:</strong> Use validation libraries, keep rules
            simple and clear
          </li>
          <li>
            <strong>Guideline:</strong> Validate progressively, show errors when
            helpful
          </li>
        </ul>

        <h4>Error Message Timing</h4>
        <p>Timing error messages requires care:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> When to show errors (on blur, on submit,
            immediately)
          </li>
          <li>
            <strong>Approach:</strong> Show on blur for validation, on submit
            for required fields
          </li>
          <li>
            <strong>Tradeoff:</strong> User experience vs. error prevention
          </li>
        </ul>

        <h4>Complex Forms</h4>
        <p>Complex forms can overwhelm users:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Many fields create cognitive load
          </li>
          <li>
            <strong>Approach:</strong> Use progressive disclosure, group related
            fields, break into steps
          </li>
          <li>
            <strong>Tradeoff:</strong> Simplicity vs. functionality
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Form patterns involve several tradeoffs:</p>

        <h4>Client-Side vs. Server-Side Validation</h4>
        <ul>
          <li>
            <strong>Client-side:</strong> Faster feedback, but can be bypassed
          </li>
          <li>
            <strong>Server-side:</strong> Secure, but slower feedback
          </li>
          <li>
            <strong>Best practice:</strong> Use both: client-side for UX,
            server-side for security
          </li>
        </ul>

        <h4>Inline vs. Toast Error Messages</h4>
        <ul>
          <li>
            <strong>Inline:</strong> Contextual, but takes space
          </li>
          <li>
            <strong>Toast:</strong> Non-intrusive, but less contextual
          </li>
          <li>
            <strong>Best practice:</strong> Inline for field errors, toast for
            form-level errors
          </li>
        </ul>

        <h4>Progressive vs. All-at-Once Validation</h4>
        <ul>
          <li>
            <strong>Progressive:</strong> Less overwhelming, but may miss errors
          </li>
          <li>
            <strong>All-at-once:</strong> Comprehensive, but overwhelming
          </li>
          <li>
            <strong>Best practice:</strong> Progressive during input, all at
            once on submit
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
        <p>Continue learning about form patterns:</p>
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
            : Label association and ARIA
          </li>
          <li>
            <Link href="/blueprints/ux-patterns/feedback">
              Feedback Patterns
            </Link>
            : Form feedback patterns
          </li>
          <li>
            <Link href="/blueprints/ux-patterns/dialogs">Dialog Patterns</Link>:
            Form dialogs and modals
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#form">Form</Link>,{' '}
          <Link href="/blueprints/glossary#validation">Validation</Link>,{' '}
          <Link href="/blueprints/glossary#aria">ARIA</Link>
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
      description: 'Label association and ARIA',
      type: 'foundation',
    },
    {
      slug: 'feedback',
      title: 'Feedback Patterns',
      description: 'Form feedback patterns',
      type: 'pattern',
    },
  ],
  components: [],
  glossary: ['form', 'validation', 'aria'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'label-association',
    label: 'Label association',
    description: 'All form fields have associated labels via htmlFor/id',
    required: true,
  },
  {
    id: 'error-association',
    label: 'Error association',
    description:
      'Errors are associated with form fields using aria-describedby',
    required: true,
  },
  {
    id: 'validation-implemented',
    label: 'Validation implemented',
    description: 'Form validation implemented with clear error messages',
    required: true,
  },
  {
    id: 'semantic-input-types',
    label: 'Semantic input types',
    description: 'Form fields use appropriate semantic input types',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you validate forms on blur vs. on submit? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how label association ensures accessibility in forms. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between client-side and server-side validation? How do you balance them?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function FormsPage() {
  return <FoundationPage content={content} />;
}

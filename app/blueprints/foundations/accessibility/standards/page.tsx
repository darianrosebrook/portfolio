/**
 * Foundation: Accessibility Standards & Principles
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
  title: 'Accessibility Standards & Principles',
  description:
    'Understand how WCAG 2.1+, APCA, and the POUR model shape accessible, inclusive design systems. Learn compliance levels, success criteria, and practical implementation guidelines.',
  slug: 'standards',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/accessibility/standards',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'WCAG, APCA, POUR model, accessibility standards, compliance, inclusive design',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y', 'governance'],
    prerequisites: ['accessibility', 'philosophy'],
    next_units: ['assistive-tech', 'tokens'],
    assessment_required: false,
    estimated_reading_time: 16,
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
    expertise: ['WCAG', 'APCA', 'Accessibility Standards', 'Compliance'],
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
    title: 'Why Accessibility Standards Matter',
    order: 3,
    content: (
      <>
        <p>
          Accessibility is a fundamental requirement, not an afterthought.
          Standards provide clear, measurable criteria for creating accessible
          experiences. They serve as benchmarks for compliance, guides for
          implementation, and frameworks for testing.
        </p>
        <p>Accessibility standards serve multiple critical functions:</p>
        <ul>
          <li>
            <strong>Legal Compliance:</strong> WCAG 2.1 AA is required by many
            laws and regulations (ADA, Section 508, EN 301 549)
          </li>
          <li>
            <strong>Clear Criteria:</strong> Standards provide measurable
            success criteria, not subjective guidelines
          </li>
          <li>
            <strong>Testing Framework:</strong> Standards enable automated and
            manual testing against clear criteria
          </li>
          <li>
            <strong>Universal Guidelines:</strong> Standards apply across
            platforms, technologies, and contexts
          </li>
          <li>
            <strong>Progressive Enhancement:</strong> Standards guide
            progressive enhancement from basic to advanced accessibility
          </li>
        </ul>
        <p>
          A well-designed system treats accessibility standards as requirements,
          not recommendations. Building compliance into components from the
          start ensures accessible experiences for all users.
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
        <h3>WCAG 2.1: Web Content Accessibility Guidelines</h3>
        <p>WCAG 2.1 provides comprehensive accessibility guidelines:</p>
        <ul>
          <li>
            <strong>Level A:</strong> Minimum requirements for basic
            accessibility
          </li>
          <li>
            <strong>Level AA:</strong> Standard for most organizations (legal
            requirement in many jurisdictions)
          </li>
          <li>
            <strong>Level AAA:</strong> Enhanced accessibility for specific
            contexts
          </li>
        </ul>
        <p>
          WCAG 2.1 is organized into four principles (POUR) and includes 78
          success criteria across three levels.
        </p>

        <h3>The POUR Model</h3>
        <p>POUR provides a framework for understanding accessibility:</p>
        <ul>
          <li>
            <strong>Perceivable:</strong> Users must be able to perceive
            information (text alternatives, captions, sufficient contrast)
          </li>
          <li>
            <strong>Operable:</strong> Users must be able to operate interface
            elements (keyboard accessible, no seizure triggers, sufficient time)
          </li>
          <li>
            <strong>Understandable:</strong> Users must be able to understand
            information (readable text, predictable functionality, input
            assistance)
          </li>
          <li>
            <strong>Robust:</strong> Content must be robust enough to work with
            assistive technologies (valid markup, compatible with current and
            future tools)
          </li>
        </ul>
        <p>
          POUR provides a mental model for thinking about accessibility across
          all aspects of interface design.
        </p>

        <h3>WCAG Success Criteria</h3>
        <p>Success criteria provide specific, testable requirements:</p>
        <ul>
          <li>
            <strong>1.4.3 Contrast (Minimum):</strong> Text has contrast ratio
            of at least 4.5:1 (AA) or 3:1 for large text
          </li>
          <li>
            <strong>2.1.1 Keyboard:</strong> All functionality available via
            keyboard
          </li>
          <li>
            <strong>2.4.7 Focus Visible:</strong> Keyboard focus indicator is
            visible
          </li>
          <li>
            <strong>3.2.4 Consistent Identification:</strong> Components with
            same functionality have consistent identification
          </li>
          <li>
            <strong>4.1.2 Name, Role, Value:</strong> All UI components have
            accessible name, role, and value
          </li>
        </ul>
        <p>Success criteria enable precise testing and validation.</p>

        <h3>APCA: Advanced Perceptual Contrast Algorithm</h3>
        <p>APCA provides improved contrast calculation:</p>
        <ul>
          <li>
            <strong>Perceptual accuracy:</strong> APCA considers how humans
            actually perceive contrast
          </li>
          <li>
            <strong>Context-aware:</strong> APCA considers text size, weight,
            and context
          </li>
          <li>
            <strong>Future standard:</strong> APCA may replace WCAG contrast
            ratios in future standards
          </li>
        </ul>
        <pre>
          <code>{`// WCAG 2.1 contrast calculation
// Simple ratio: (L1 + 0.05) / (L2 + 0.05)
// L1 = relative luminance of lighter color
// L2 = relative luminance of darker color
// Minimum: 4.5:1 for normal text, 3:1 for large text

// APCA contrast calculation
// More sophisticated, considers:
// - Text size
// - Font weight
// - Color context
// - Human perception

// Example: Same colors, different results
WCAG: 4.5:1 (passes)
APCA: Lc 75 (passes, but different threshold)`}</code>
        </pre>

        <h3>Compliance Levels</h3>
        <p>Understanding compliance levels helps prioritize work:</p>
        <ul>
          <li>
            <strong>Level A:</strong> Essential for basic accessibility (legal
            minimum in some jurisdictions)
          </li>
          <li>
            <strong>Level AA:</strong> Standard for most organizations (legal
            requirement in many jurisdictions)
          </li>
          <li>
            <strong>Level AAA:</strong> Enhanced accessibility (rarely required,
            difficult to achieve comprehensively)
          </li>
        </ul>
        <p>
          Most organizations target Level AA compliance, with selective AAA
          compliance where appropriate.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Standards Shape System Success',
    order: 5,
    content: (
      <>
        <h3>Compliance Impact</h3>
        <p>Standards enable legal compliance:</p>
        <ul>
          <li>
            <strong>Legal protection:</strong> WCAG 2.1 AA compliance protects
            against accessibility lawsuits
          </li>
          <li>
            <strong>Regulatory compliance:</strong> Many regulations require
            WCAG compliance (Section 508, EN 301 549)
          </li>
          <li>
            <strong>Contract requirements:</strong> Many contracts require
            accessibility compliance
          </li>
        </ul>
        <p>Compliance ensures legal protection and regulatory adherence.</p>

        <h3>Quality Impact</h3>
        <p>Standards improve quality:</p>
        <ul>
          <li>
            <strong>Clear criteria:</strong> Standards provide measurable
            success criteria
          </li>
          <li>
            <strong>Testing framework:</strong> Standards enable comprehensive
            testing
          </li>
          <li>
            <strong>Consistency:</strong> Standards ensure consistent
            accessibility across system
          </li>
        </ul>
        <p>Quality systems meet or exceed accessibility standards.</p>

        <h3>Inclusivity Impact</h3>
        <p>Standards enable inclusivity:</p>
        <ul>
          <li>
            <strong>Broader reach:</strong> Standards ensure interfaces work for
            diverse users
          </li>
          <li>
            <strong>Progressive enhancement:</strong> Standards guide
            progressive enhancement
          </li>
          <li>
            <strong>Future-proofing:</strong> Standards ensure compatibility
            with future assistive technologies
          </li>
        </ul>
        <p>Inclusive systems meet accessibility standards as a baseline.</p>
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
          Accessibility standards bridge design intent and code implementation.
          Let's examine how standards translate from guidelines to working code.
        </p>

        <h3>Design: Contrast Standards</h3>
        <p>Design tools validate contrast:</p>
        <pre>
          <code>{`// Figma: Contrast checking
Text: "Hello World"
  Background: #FFFFFF
  Text Color: #000000
  Contrast: 21:1 (WCAG AAA)
  
Text: "Hello World"
  Background: #CCCCCC
  Text Color: #666666
  Contrast: 2.5:1 (Fails WCAG AA)

// Design tokens enforce contrast
semantic.color.foreground.primary
  - Must meet WCAG AA (4.5:1) on semantic.color.background.surface`}</code>
        </pre>

        <h3>Code: Contrast Validation</h3>
        <p>Code validates contrast at build time:</p>
        <pre>
          <code>{`// Contrast validation function
function validateContrast(foreground, background) {
  const ratio = calculateContrastRatio(foreground, background);
  
  if (ratio < 4.5) {
    throw new Error(
      \`Contrast ratio \${ratio}:1 fails WCAG AA minimum (4.5:1)\`
    );
  }
  
  return ratio;
}

// Token validation
const tokens = {
  foreground: '#000000',
  background: '#FFFFFF'
};

validateContrast(tokens.foreground, tokens.background);
// Validates: 21:1 ✓

// Failing case
const badTokens = {
  foreground: '#CCCCCC',
  background: '#DDDDDD'
};

validateContrast(badTokens.foreground, badTokens.background);
// Error: Contrast ratio 1.2:1 fails WCAG AA minimum (4.5:1)`}</code>
        </pre>

        <h3>Code: Keyboard Accessibility</h3>
        <p>Code implements keyboard accessibility:</p>
        <pre>
          <code>{`// WCAG 2.1.1 Keyboard: All functionality via keyboard
function Button({ onClick, children }) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };
  
  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="button"
    >
      {children}
    </button>
  );
}

// WCAG 2.4.7 Focus Visible: Keyboard focus indicator
.button {
  &:focus-visible {
    outline: 2px solid var(--semantic-color-border-focus);
    outline-offset: 2px;
  }
}`}</code>
        </pre>

        <h3>Code: Name, Role, Value</h3>
        <p>Code implements accessible names, roles, and values:</p>
        <pre>
          <code>{`// WCAG 4.1.2 Name, Role, Value
function TextInput({ label, value, onChange }) {
  const id = useId();
  
  return (
    <div>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type="text"
        value={value}
        onChange={onChange}
        aria-required="true"
        aria-label={label}
        // Name: label provides accessible name
        // Role: input type="text" provides role
        // Value: value prop provides current value
      />
    </div>
  );
}`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A standards-compliant system ensures interfaces work for everyone.
          Contrast validation ensures readable text. Keyboard accessibility
          enables navigation without pointing devices. Accessible names, roles,
          and values enable assistive technologies to communicate interface
          structure. When standards are built into components from the start,
          compliance becomes a natural part of the system, not a retrofit.
        </p>
        <p>
          Understanding accessibility standards helps practitioners create
          compliant interfaces that work for all users and meet legal
          requirements.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building WCAG 2.1 AA Compliant Components',
    order: 7,
    content: (
      <>
        <p>Let's build a component that meets WCAG 2.1 AA standards:</p>

        <h3>Step 1: Ensure Contrast Compliance</h3>
        <p>Validate contrast ratios:</p>
        <pre>
          <code>{`// Contrast validation
function validateContrast(foreground, background) {
  const ratio = calculateContrastRatio(foreground, background);
  
  // WCAG AA: 4.5:1 for normal text, 3:1 for large text
  if (ratio < 4.5) {
    throw new Error(\`Contrast \${ratio}:1 fails WCAG AA\`);
  }
  
  return true;
}

// Token validation
const tokens = {
  foreground: '#1F2937', // Dark gray
  background: '#FFFFFF'  // White
};

validateContrast(tokens.foreground, tokens.background);
// Validates: 12.6:1 ✓`}</code>
        </pre>

        <h3>Step 2: Implement Keyboard Accessibility</h3>
        <p>Ensure all functionality is keyboard accessible:</p>
        <pre>
          <code>{`// Button with keyboard support
function Button({ onClick, children }) {
  const handleKeyDown = (e) => {
    // WCAG 2.1.1 Keyboard
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };
  
  return (
    <button
      onClick={onClick}
      onKeyDown={handleKeyDown}
      className="button"
    >
      {children}
    </button>
  );
}`}</code>
        </pre>

        <h3>Step 3: Provide Focus Indicators</h3>
        <p>Ensure focus is visible:</p>
        <pre>
          <code>{`// WCAG 2.4.7 Focus Visible
.button {
  &:focus-visible {
    outline: 2px solid var(--semantic-color-border-focus);
    outline-offset: 2px;
  }
  
  // Don't remove outline for mouse users
  &:focus:not(:focus-visible) {
    outline: none;
  }
}`}</code>
        </pre>

        <h3>Step 4: Implement Accessible Names</h3>
        <p>Provide accessible names for all components:</p>
        <pre>
          <code>{`// WCAG 4.1.2 Name, Role, Value
function IconButton({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className="icon-button"
    >
      <Icon name={icon} aria-hidden="true" />
      <span className="sr-only">{label}</span>
    </button>
  );
}

// Screen reader announces: "Close dialog, button"
// Visual users see: icon only`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Legal compliance:</strong> Meets WCAG 2.1 AA requirements
          </li>
          <li>
            <strong>Accessibility:</strong> Works with assistive technologies
          </li>
          <li>
            <strong>Testing:</strong> Clear success criteria for testing
          </li>
          <li>
            <strong>Maintainability:</strong> Standards provide clear guidelines
            for updates
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
        <p>Accessibility standards face several challenges:</p>

        <h4>Standards Complexity</h4>
        <p>WCAG can be complex and difficult to interpret:</p>
        <ul>
          <li>
            <strong>Problem:</strong> 78 success criteria can be overwhelming
          </li>
          <li>
            <strong>Solution:</strong> Prioritize Level AA, use testing tools,
            provide team training
          </li>
          <li>
            <strong>Guideline:</strong> Start with Level A, progress to Level AA
          </li>
        </ul>

        <h4>Contrast vs. Design</h4>
        <p>
          Meeting contrast requirements can conflict with design preferences:
        </p>
        <ul>
          <li>
            <strong>Challenge:</strong> Some designs may not meet contrast
            requirements
          </li>
          <li>
            <strong>Approach:</strong> Design with accessibility in mind, use
            contrast checkers during design
          </li>
          <li>
            <strong>Tradeoff:</strong> Design freedom vs. accessibility
            requirements
          </li>
        </ul>

        <h4>Standards Evolution</h4>
        <p>Standards evolve over time:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> WCAG 2.1, 2.2, future versions may have
            different requirements
          </li>
          <li>
            <strong>Approach:</strong> Monitor standards evolution, plan for
            updates, maintain backward compatibility
          </li>
          <li>
            <strong>Tradeoff:</strong> Stability vs. innovation
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Accessibility standards involve several tradeoffs:</p>

        <h4>Level AA vs. Level AAA</h4>
        <ul>
          <li>
            <strong>Level AA:</strong> Achievable, legally required in many
            jurisdictions, standard for most organizations
          </li>
          <li>
            <strong>Level AAA:</strong> Enhanced accessibility, difficult to
            achieve comprehensively, rarely required
          </li>
          <li>
            <strong>Best practice:</strong> Target Level AA, selectively achieve
            Level AAA where appropriate
          </li>
        </ul>

        <h4>WCAG vs. APCA</h4>
        <ul>
          <li>
            <strong>WCAG:</strong> Current standard, widely adopted, legal
            requirement
          </li>
          <li>
            <strong>APCA:</strong> Future standard, more accurate, not yet
            widely adopted
          </li>
          <li>
            <strong>Best practice:</strong> Use WCAG for compliance, consider
            APCA for improved accuracy
          </li>
        </ul>

        <h4>Compliance vs. Usability</h4>
        <ul>
          <li>
            <strong>Compliance:</strong> Meets standards, but may not be
            perfectly usable
          </li>
          <li>
            <strong>Usability:</strong> Exceeds standards, provides better user
            experience
          </li>
          <li>
            <strong>Best practice:</strong> Meet standards as baseline, exceed
            for better usability
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
        <p>Continue learning about accessibility standards:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/accessibility/philosophy">
              Accessibility Philosophy
            </Link>
            : Foundational thinking about accessibility
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/assistive-tech">
              Assistive Technology Support
            </Link>
            : How to support assistive technologies
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
          <Link href="/blueprints/glossary#wcag">WCAG</Link>,{' '}
          <Link href="/blueprints/glossary#accessibility">Accessibility</Link>,{' '}
          <Link href="/blueprints/glossary#compliance">Compliance</Link>
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
      slug: 'assistive-tech',
      title: 'Assistive Technology Support',
      description: 'How to support assistive technologies',
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
  glossary: ['wcag', 'accessibility', 'compliance'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'wcag-compliance',
    label: 'WCAG compliance',
    description: 'Components meet WCAG 2.1 AA success criteria',
    required: true,
  },
  {
    id: 'pour-principles',
    label: 'POUR principles followed',
    description:
      'Components follow Perceivable, Operable, Understandable, Robust principles',
    required: true,
  },
  {
    id: 'contrast-validated',
    label: 'Contrast validated',
    description: 'All color combinations meet WCAG contrast requirements',
    required: true,
  },
  {
    id: 'keyboard-accessible',
    label: 'Keyboard accessible',
    description: 'All functionality accessible via keyboard',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'What are the differences between WCAG Level A, AA, and AAA? When should you target each level?',
    type: 'reflection',
  },
  {
    question:
      'Explain how the POUR model applies to a specific component. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between WCAG and APCA contrast calculations? When would you choose each approach?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function AccessibilityStandardsPage() {
  return <FoundationPage content={content} />;
}

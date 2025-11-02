/**
 * UX Pattern: Navigation Patterns
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
  title: 'Navigation Patterns',
  description:
    'Navigation patterns are the foundation of user movement through your application. Learn best practices for menus, breadcrumbs, tabs, and other navigation components that help users find their way.',
  slug: 'navigation',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/ux-patterns/navigation',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'navigation, menus, breadcrumbs, tabs, navigation patterns, UX patterns',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['accessibility', 'tokens'],
    next_units: ['selection'],
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
    expertise: [
      'Navigation Patterns',
      'Information Architecture',
      'UX',
      'Accessibility',
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
    title: 'Why Navigation Patterns Matter',
    order: 3,
    content: (
      <>
        <p>
          Navigation patterns are the foundation of user movement through your
          application. When properly implemented, navigation enables users to
          find content and complete tasks efficiently. When poorly implemented,
          navigation creates confusion and frustration.
        </p>
        <p>Navigation patterns serve multiple critical functions:</p>
        <ul>
          <li>
            <strong>Orientation:</strong> Navigation helps users understand
            where they are in the application
          </li>
          <li>
            <strong>Discovery:</strong> Navigation enables users to discover
            available content and features
          </li>
          <li>
            <strong>Efficiency:</strong> Navigation provides shortcuts to common
            tasks and destinations
          </li>
          <li>
            <strong>Accessibility:</strong> Proper navigation enables keyboard
            and screen reader users to move through the application
          </li>
          <li>
            <strong>Consistency:</strong> Consistent navigation patterns create
            predictable user experiences
          </li>
        </ul>
        <p>
          Well-designed navigation patterns balance user needs with system
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
        <h3>Navigation Types</h3>
        <p>Different navigation types serve different purposes:</p>
        <ul>
          <li>
            <strong>Primary navigation:</strong> Main navigation menu, typically
            horizontal or vertical sidebar
          </li>
          <li>
            <strong>Secondary navigation:</strong> Contextual navigation within
            sections
          </li>
          <li>
            <strong>Breadcrumbs:</strong> Hierarchical path showing current
            location
          </li>
          <li>
            <strong>Tabs:</strong> Switch between related content sections
          </li>
          <li>
            <strong>Pagination:</strong> Navigate through sequential content
          </li>
        </ul>
        <pre>
          <code>{`// Primary navigation
<nav aria-label="Main navigation">
  <ul>
    <li><a href="/home">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li><a href="/about">About</a></li>
  </ul>
</nav>

// Breadcrumbs
<nav aria-label="Breadcrumb">
  <ol>
    <li><a href="/">Home</a></li>
    <li><a href="/products">Products</a></li>
    <li aria-current="page">Current Page</li>
  </ol>
</nav>

// Tabs
<div role="tablist" aria-label="Product categories">
  <button role="tab" aria-selected="true">Electronics</button>
  <button role="tab" aria-selected="false">Clothing</button>
  <button role="tab" aria-selected="false">Books</button>
</div>`}</code>
        </pre>

        <h3>ARIA Navigation</h3>
        <p>
          ARIA attributes communicate navigation structure to assistive
          technologies:
        </p>
        <ul>
          <li>
            <strong>role="navigation":</strong> Identifies navigation regions
          </li>
          <li>
            <strong>aria-label:</strong> Provides accessible name for navigation
          </li>
          <li>
            <strong>aria-current:</strong> Indicates current page in breadcrumbs
          </li>
          <li>
            <strong>role="tablist":</strong> Identifies tab navigation
          </li>
          <li>
            <strong>aria-selected:</strong> Indicates selected tab
          </li>
        </ul>
        <pre>
          <code>{`// Accessible navigation
<nav aria-label="Main navigation">
  <ul>
    <li>
      <a href="/home" aria-current="page">Home</a>
    </li>
    <li>
      <a href="/products">Products</a>
    </li>
  </ul>
</nav>

// Accessible tabs
<div role="tablist" aria-label="Product categories">
  <button
    role="tab"
    aria-selected="true"
    aria-controls="electronics-panel"
    id="electronics-tab"
  >
    Electronics
  </button>
  <div
    role="tabpanel"
    id="electronics-panel"
    aria-labelledby="electronics-tab"
  >
    Electronics content
  </div>
</div>`}</code>
        </pre>

        <h3>Keyboard Navigation</h3>
        <p>
          Keyboard navigation enables efficient movement through navigation:
        </p>
        <ul>
          <li>
            <strong>Arrow keys:</strong> Navigate through menu items or tabs
          </li>
          <li>
            <strong>Tab:</strong> Move between navigation elements
          </li>
          <li>
            <strong>Enter/Space:</strong> Activate selected item
          </li>
          <li>
            <strong>Escape:</strong> Close open menus or dropdowns
          </li>
        </ul>
        <pre>
          <code>{`// Keyboard navigation for tabs
const handleKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'ArrowRight') {
    e.preventDefault();
    const nextTab = tabs.findIndex(t => t === activeTab) + 1;
    if (nextTab < tabs.length) {
      setActiveTab(tabs[nextTab]);
    }
  }
  if (e.key === 'ArrowLeft') {
    e.preventDefault();
    const prevTab = tabs.findIndex(t => t === activeTab) - 1;
    if (prevTab >= 0) {
      setActiveTab(tabs[prevTab]);
    }
  }
  if (e.key === 'Home') {
    e.preventDefault();
    setActiveTab(tabs[0]);
  }
  if (e.key === 'End') {
    e.preventDefault();
    setActiveTab(tabs[tabs.length - 1]);
  }
};`}</code>
        </pre>

        <h3>Breadcrumb Patterns</h3>
        <p>Breadcrumbs provide hierarchical navigation context:</p>
        <ul>
          <li>
            <strong>Hierarchy:</strong> Show path from root to current page
          </li>
          <li>
            <strong>Current page:</strong> Indicate current page with
            aria-current
          </li>
          <li>
            <strong>Separators:</strong> Use consistent separators between
            breadcrumb items
          </li>
          <li>
            <strong>Truncation:</strong> Truncate long paths when necessary
          </li>
        </ul>
        <pre>
          <code>{`// Breadcrumb implementation
export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={item.href}>
            {index === items.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <a href={item.href}>{item.label}</a>
            )}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="separator">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}`}</code>
        </pre>

        <h3>Tab Patterns</h3>
        <p>Tabs enable switching between related content sections:</p>
        <ul>
          <li>
            <strong>Tab panel association:</strong> Connect tabs to panels via
            aria-controls and aria-labelledby
          </li>
          <li>
            <strong>Roving tabindex:</strong> Manage focus within tab list
          </li>
          <li>
            <strong>Keyboard navigation:</strong> Arrow keys navigate tabs,
            Enter/Space activates
          </li>
          <li>
            <strong>Content switching:</strong> Show/hide panels based on
            selected tab
          </li>
        </ul>
        <pre>
          <code>{`// Tab implementation
export function Tabs({ items }) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      <div role="tablist" aria-label="Product categories">
        {items.map((item, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={index === activeTab}
            aria-controls={\`tabpanel-\${index}\`}
            id={\`tab-\${index}\`}
            onClick={() => setActiveTab(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={index}
          role="tabpanel"
          id={\`tabpanel-\${index}\`}
          aria-labelledby={\`tab-\${index}\`}
          hidden={index !== activeTab}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Navigation Patterns Shape System Success',
    order: 5,
    content: (
      <>
        <h3>User Experience Impact</h3>
        <p>Navigation patterns improve user experience:</p>
        <ul>
          <li>
            <strong>Efficiency:</strong> Clear navigation enables users to find
            content quickly
          </li>
          <li>
            <strong>Orientation:</strong> Navigation helps users understand
            their location
          </li>
          <li>
            <strong>Discovery:</strong> Navigation enables users to discover
            available features
          </li>
        </ul>
        <p>
          Effective navigation patterns enhance user experience by enabling
          efficient movement through applications.
        </p>

        <h3>Accessibility Impact</h3>
        <p>Navigation patterns improve accessibility:</p>
        <ul>
          <li>
            <strong>Keyboard navigation:</strong> Proper navigation enables
            keyboard-only interaction
          </li>
          <li>
            <strong>Screen reader support:</strong> ARIA attributes enable
            screen reader navigation
          </li>
          <li>
            <strong>Skip links:</strong> Skip links enable users to bypass
            repetitive navigation
          </li>
        </ul>
        <p>
          Accessible navigation patterns ensure all users can move through
          applications effectively.
        </p>

        <h3>System Consistency Impact</h3>
        <p>Consistent navigation patterns improve system consistency:</p>
        <ul>
          <li>
            <strong>Predictable behavior:</strong> Users understand navigation
            patterns across system
          </li>
          <li>
            <strong>Reusable components:</strong> Navigation components enable
            consistent implementation
          </li>
          <li>
            <strong>Design system alignment:</strong> Navigation aligns with
            design system tokens and patterns
          </li>
        </ul>
        <p>
          Consistent navigation patterns ensure predictable, maintainable system
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
          Navigation patterns bridge design intent and code implementation.
          Let's examine how navigation requirements translate from design
          specifications to working code.
        </p>

        <h3>Design: Navigation Specifications</h3>
        <p>Design specifications define navigation requirements:</p>
        <pre>
          <code>{`// Design specifications
Navigation Requirements:
  - Primary nav: Horizontal, top of page
  - Active state: Underline, bold font
  - Hover state: Background color change
  - Breadcrumbs: Below primary nav, gray text
  - Current page: Bold, not clickable
  - Tabs: Horizontal, border-bottom for active`}</code>
        </pre>

        <h3>Code: Navigation Component Implementation</h3>
        <p>Code implements navigation with accessibility:</p>
        <pre>
          <code>{`// Navigation component
export function Navigation({ items, currentPath }) {
  return (
    <nav aria-label="Main navigation">
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={item.href === currentPath ? 'page' : undefined}
              className={item.href === currentPath ? 'active' : ''}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}`}</code>
        </pre>

        <h3>Design: Tab Specifications</h3>
        <p>Design defines tab requirements:</p>
        <pre>
          <code>{`// Tab specifications
Tab Requirements:
  - Horizontal tabs, border-bottom for active
  - Active tab: Bold, border-bottom 2px
  - Inactive tabs: Normal weight, no border
  - Hover: Background color change
  - Keyboard: Arrow keys navigate, Enter activates`}</code>
        </pre>

        <h3>Code: Tab Component Implementation</h3>
        <p>Code implements tabs with keyboard navigation:</p>
        <pre>
          <code>{`// Tab component with keyboard navigation
export function Tabs({ items }) {
  const [activeTab, setActiveTab] = useState(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab((prev) => (prev + 1) % items.length);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveTab((prev) => (prev - 1 + items.length) % items.length);
    }
    if (e.key === 'Home') {
      e.preventDefault();
      setActiveTab(0);
    }
    if (e.key === 'End') {
      e.preventDefault();
      setActiveTab(items.length - 1);
    }
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product categories"
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={index === activeTab}
            aria-controls={\`tabpanel-\${index}\`}
            id={\`tab-\${index}\`}
            onClick={() => setActiveTab(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={index}
          role="tabpanel"
          id={\`tabpanel-\${index}\`}
          aria-labelledby={\`tab-\${index}\`}
          hidden={index !== activeTab}
        >
          {item.content}
        </div>
      ))}
    </div>
  );
}`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-implemented navigation pattern ensures users can move through
          applications effectively. ARIA attributes enable screen reader
          navigation. Keyboard navigation enables efficient movement.
          Breadcrumbs provide orientation context. When navigation patterns are
          built with accessibility and user experience in mind, they create
          interfaces that enable efficient movement through applications.
        </p>
        <p>
          Understanding navigation patterns helps practitioners create
          interfaces that balance user needs with system requirements, ensuring
          both functionality and accessibility.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building Accessible Navigation',
    order: 7,
    content: (
      <>
        <p>Let's build an accessible navigation system from scratch:</p>

        <h3>Step 1: Create Navigation Component</h3>
        <p>Create navigation component with ARIA:</p>
        <pre>
          <code>{`// Navigation component
export function Navigation({ items, currentPath }) {
  return (
    <nav aria-label="Main navigation">
      <ul>
        {items.map((item) => (
          <li key={item.href}>
            <a
              href={item.href}
              aria-current={item.href === currentPath ? 'page' : undefined}
              className={item.href === currentPath ? 'active' : ''}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}`}</code>
        </pre>

        <h3>Step 2: Add Breadcrumbs</h3>
        <p>Add breadcrumb navigation:</p>
        <pre>
          <code>{`// Breadcrumb component
export function Breadcrumbs({ items }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol>
        {items.map((item, index) => (
          <li key={item.href}>
            {index === items.length - 1 ? (
              <span aria-current="page">{item.label}</span>
            ) : (
              <a href={item.href}>{item.label}</a>
            )}
            {index < items.length - 1 && (
              <span aria-hidden="true" className="separator">
                /
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}`}</code>
        </pre>

        <h3>Step 3: Add Tab Navigation</h3>
        <p>Add tab navigation with keyboard support:</p>
        <pre>
          <code>{`// Tab component
export function Tabs({ items }) {
  const [activeTab, setActiveTab] = useState(0);

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      setActiveTab((prev) => (prev + 1) % items.length);
    }
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      setActiveTab((prev) => (prev - 1 + items.length) % items.length);
    }
  };

  return (
    <div>
      <div
        role="tablist"
        aria-label="Product categories"
        onKeyDown={handleKeyDown}
      >
        {items.map((item, index) => (
          <button
            key={index}
            role="tab"
            aria-selected={index === activeTab}
            aria-controls={\`tabpanel-\${index}\`}
            id={\`tab-\${index}\`}
            onClick={() => setActiveTab(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      {items.map((item, index) => (
        <div
          key={index}
          role="tabpanel"
          id={\`tabpanel-\${index}\`}
          aria-labelledby={\`tab-\${index}\`}
          hidden={index !== activeTab}
        >
          {item.content}
        </div>
      ))}
    </div>
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
            <strong>User experience:</strong> Clear navigation and orientation
          </li>
          <li>
            <strong>Consistency:</strong> Predictable navigation patterns
          </li>
          <li>
            <strong>Maintainability:</strong> Reusable navigation components
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
        <p>Navigation patterns face several challenges:</p>

        <h4>Complex Navigation Structures</h4>
        <p>Complex navigation can be difficult to manage:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Many navigation items create complexity
          </li>
          <li>
            <strong>Solution:</strong> Use progressive disclosure, group related
            items, use secondary navigation
          </li>
          <li>
            <strong>Guideline:</strong> Keep primary navigation focused, use
            secondary for details
          </li>
        </ul>

        <h4>Mobile Navigation</h4>
        <p>Mobile devices require special consideration:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Limited screen space for navigation
          </li>
          <li>
            <strong>Approach:</strong> Use hamburger menu, drawer navigation,
            bottom navigation
          </li>
          <li>
            <strong>Tradeoff:</strong> Consistency vs. platform optimization
          </li>
        </ul>

        <h4>Active State Management</h4>
        <p>Managing active states requires care:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Determining which navigation item is
            active
          </li>
          <li>
            <strong>Approach:</strong> Use pathname matching, route-based active
            states
          </li>
          <li>
            <strong>Tradeoff:</strong> Simplicity vs. accuracy
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Navigation patterns involve several tradeoffs:</p>

        <h4>Horizontal vs. Vertical Navigation</h4>
        <ul>
          <li>
            <strong>Horizontal:</strong> Better for desktop, but limited space
          </li>
          <li>
            <strong>Vertical:</strong> More space, but takes vertical space
          </li>
          <li>
            <strong>Best practice:</strong> Horizontal for primary nav, vertical
            for secondary nav
          </li>
        </ul>

        <h4>Fixed vs. Scrollable Navigation</h4>
        <ul>
          <li>
            <strong>Fixed:</strong> Always visible, but takes screen space
          </li>
          <li>
            <strong>Scrollable:</strong> More content space, but navigation not
            always visible
          </li>
          <li>
            <strong>Best practice:</strong> Fixed for primary nav, scrollable
            for secondary nav
          </li>
        </ul>

        <h4>Breadcrumbs vs. Back Button</h4>
        <ul>
          <li>
            <strong>Breadcrumbs:</strong> Shows full path, but takes space
          </li>
          <li>
            <strong>Back button:</strong> Simple, but less context
          </li>
          <li>
            <strong>Best practice:</strong> Use breadcrumbs for deep
            hierarchies, back button for shallow
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
        <p>Continue learning about navigation patterns:</p>
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
            : ARIA and keyboard navigation
          </li>
          <li>
            <Link href="/blueprints/ux-patterns/selection">
              Selection Patterns
            </Link>
            : Related selection patterns
          </li>
          <li>
            <Link href="/blueprints/ux-patterns/forms">Forms Patterns</Link>:
            Form navigation patterns
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#navigation">Navigation</Link>,{' '}
          <Link href="/blueprints/glossary#breadcrumb">Breadcrumb</Link>,{' '}
          <Link href="/blueprints/glossary#tabs">Tabs</Link>
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
      description: 'ARIA and keyboard navigation',
      type: 'foundation',
    },
    {
      slug: 'selection',
      title: 'Selection Patterns',
      description: 'Related selection patterns',
      type: 'pattern',
    },
  ],
  components: [],
  glossary: ['navigation', 'breadcrumb', 'tabs'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'aria-navigation',
    label: 'ARIA navigation',
    description:
      'Navigation uses proper ARIA attributes (role="navigation", aria-label)',
    required: true,
  },
  {
    id: 'keyboard-navigation',
    label: 'Keyboard navigation',
    description: 'Navigation supports keyboard navigation (arrows, Tab, Enter)',
    required: true,
  },
  {
    id: 'current-page-indication',
    label: 'Current page indication',
    description: 'Current page is indicated with aria-current="page"',
    required: true,
  },
  {
    id: 'breadcrumbs-implemented',
    label: 'Breadcrumbs implemented',
    description: 'Breadcrumbs implemented for deep hierarchies',
    required: false,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you use horizontal vs. vertical navigation? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how ARIA attributes ensure accessibility in navigation. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between breadcrumbs and back buttons? How do you decide?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function NavigationPage() {
  return <FoundationPage content={content} />;
}

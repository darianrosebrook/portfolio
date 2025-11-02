/**
 * Foundation: Grid Systems
 * Enhanced with educational template structure
 */

import type {
  FoundationPageMetadata,
  FoundationSection,
} from '@/types/foundationContent';
import { generateFoundationMetadata } from '@/utils/metadata/foundationMetadata';
import Link from 'next/link';
import { createFoundationContent } from '../_lib/contentBuilder';
import { FoundationPage } from '../_lib/pageWrapper';

const pageMetadata: FoundationPageMetadata = {
  title: 'Grid Systems Foundations',
  description:
    'Learn how grid systems provide structure, consistency, and accessibility to layouts. Understand column systems, gutters, breakpoints, and responsive grid patterns.',
  slug: 'grid',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/grid',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'grid, columns, gutters, breakpoints, responsive design, layout',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['tokens', 'spacing'],
    next_units: ['layout'],
    assessment_required: false,
    estimated_reading_time: 13,
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
    expertise: ['Grid Systems', 'Responsive Design', 'Layout'],
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
    title: 'Why Grid Systems Matter',
    order: 3,
    content: (
      <>
        <p>
          Grid systems provide structure and consistency to layouts, helping
          organize content in a predictable and accessible way. When
          systematized properly, grids serve multiple critical functions:
        </p>
        <ul>
          <li>
            <strong>Structure:</strong> Grids create a predictable framework
            that organizes content and establishes visual hierarchy
          </li>
          <li>
            <strong>Alignment:</strong> Grid systems ensure consistent alignment
            across components and pages
          </li>
          <li>
            <strong>Responsiveness:</strong> Grids adapt to different screen
            sizes through breakpoints and flexible columns
          </li>
          <li>
            <strong>Accessibility:</strong> Grids maintain logical content order
            for screen readers and keyboard navigation
          </li>
          <li>
            <strong>Consistency:</strong> Grid systems create visual harmony
            across the entire interface
          </li>
        </ul>
        <p>
          A well-designed grid system treats structure as a design constraint
          that enables rather than restricts creativity. It provides a framework
          for consistent, accessible, and scalable layouts.
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
        <h3>Column Systems</h3>
        <p>
          Grid systems use columns to organize content. Common column counts
          include:
        </p>
        <ul>
          <li>
            <strong>12-column grid:</strong> Most versatile, divisible by 2, 3,
            4, and 6
          </li>
          <li>
            <strong>16-column grid:</strong> More granular control, divisible by
            2, 4, 8, and 16
          </li>
          <li>
            <strong>Flexible columns:</strong> Use CSS Grid or Flexbox for
            responsive column behavior
          </li>
        </ul>
        <p>
          The 12-column grid is the most widely adopted because it offers
          maximum flexibility while remaining easy to understand.
        </p>

        <h3>Gutter Systems</h3>
        <p>
          Gutters are the spaces between columns. They should align with your
          spacing system:
        </p>
        <ul>
          <li>
            <strong>Consistent gutters:</strong> Use spacing tokens for gutter
            widths (e.g., 16px, 24px, 32px)
          </li>
          <li>
            <strong>Responsive gutters:</strong> Gutters may scale with
            breakpoints (smaller on mobile, larger on desktop)
          </li>
          <li>
            <strong>Outer margins:</strong> Grid containers may have margins
            that differ from gutters
          </li>
        </ul>
        <p>
          Consistent gutters create visual rhythm and ensure content doesn't
          feel cramped or spread out.
        </p>

        <h3>Breakpoints</h3>
        <p>Breakpoints define when layouts change at different screen sizes:</p>
        <ul>
          <li>
            <strong>Mobile:</strong> 0-767px (single column or flexible grid)
          </li>
          <li>
            <strong>Tablet:</strong> 768px-1023px (2-4 columns)
          </li>
          <li>
            <strong>Desktop:</strong> 1024px+ (full grid system)
          </li>
        </ul>
        <p>
          Breakpoints should be content-driven—add them where content naturally
          needs to reflow, not at arbitrary device sizes.
        </p>

        <h3>8-Point Baseline Grid</h3>
        <p>The 8-point baseline grid aligns content vertically:</p>
        <ul>
          <li>
            <strong>Vertical rhythm:</strong> Content aligns to 8px increments
            for consistent spacing
          </li>
          <li>
            <strong>Integration:</strong> Works with horizontal grid systems to
            create cohesive layouts
          </li>
          <li>
            <strong>Accessibility:</strong> Ensures sufficient vertical spacing
            for readability
          </li>
        </ul>
        <p>
          The 8-point baseline grid complements column grids by ensuring
          vertical consistency.
        </p>

        <h3>Grid Tokenization</h3>
        <p>Grid systems should be tokenized for consistency and theming:</p>
        <pre>
          <code>{`// Grid tokens (conceptual example)
{
  "grid": {
    "columns": {
      "count": { "$type": "number", "$value": 12 },
      "gap": { "$type": "dimension", "$value": "{spacing.size.06}" }
    },
    "breakpoints": {
      "mobile": { "$type": "dimension", "$value": "0px" },
      "tablet": { "$type": "dimension", "$value": "768px" },
      "desktop": { "$type": "dimension", "$value": "1024px" }
    },
    "container": {
      "maxWidth": { "$type": "dimension", "$value": "1200px" },
      "padding": { "$type": "dimension", "$value": "{spacing.size.06}" }
    }
  }
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Grids Shape System Success',
    order: 5,
    content: (
      <>
        <h3>Accessibility Impact</h3>
        <p>Grid systems must maintain accessibility:</p>
        <ul>
          <li>
            <strong>Logical order:</strong> Content order in DOM should match
            visual order for screen readers
          </li>
          <li>
            <strong>Keyboard navigation:</strong> Grid layouts must support
            logical keyboard navigation flow
          </li>
          <li>
            <strong>Content reflow:</strong> Grids should adapt without hiding
            content or creating horizontal scroll
          </li>
          <li>
            <strong>Label proximity:</strong> Form labels should remain near
            inputs across breakpoints
          </li>
        </ul>
        <p>
          Accessible grids ensure all users can navigate and understand content
          regardless of device or assistive technology.
        </p>

        <h3>Responsive Design Impact</h3>
        <p>Grid systems enable responsive layouts:</p>
        <ul>
          <li>
            <strong>Mobile-first:</strong> Grids start with mobile constraints
            and enhance for larger screens
          </li>
          <li>
            <strong>Flexible columns:</strong> CSS Grid and Flexbox enable
            fluid, responsive column behavior
          </li>
          <li>
            <strong>Container queries:</strong> Modern grids can adapt based on
            container size, not just viewport
          </li>
        </ul>
        <p>
          Responsive grids ensure content works well across all devices and
          screen sizes.
        </p>

        <h3>Consistency Impact</h3>
        <p>Unified grid rules create visual consistency:</p>
        <ul>
          <li>
            <strong>Predictable layouts:</strong> Consistent grid systems create
            predictable visual patterns
          </li>
          <li>
            <strong>Team alignment:</strong> Shared grid system ensures
            designers and developers work from the same structure
          </li>
          <li>
            <strong>Maintainability:</strong> Tokenized grids enable system-wide
            updates through token changes
          </li>
        </ul>
        <p>
          Consistency ensures grids enhance rather than restrict design
          creativity, creating cohesive user experiences.
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
          Grid systems bridge design intent and code implementation. Let's
          examine how grid systems translate from design specifications to
          working code.
        </p>

        <h3>CSS Grid Implementation</h3>
        <p>CSS Grid provides the most flexible grid system:</p>
        <pre>
          <code>{`// 12-column grid with CSS Grid
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-size-06); // 16px gutter
  max-width: var(--container-max-width); // 1200px
  margin: 0 auto;
  padding: 0 var(--spacing-size-06);
}

// Grid item spanning columns
.grid-item {
  grid-column: span 12; // Full width on mobile
  
  @media (min-width: 768px) {
    grid-column: span 6; // Half width on tablet
  }
  
  @media (min-width: 1024px) {
    grid-column: span 4; // One-third width on desktop
  }
}`}</code>
        </pre>

        <h3>Flexbox Grid Implementation</h3>
        <p>Flexbox provides an alternative grid approach:</p>
        <pre>
          <code>{`// Flexbox grid
.flex-grid {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-size-06);
}

.flex-item {
  flex: 1 1 100%; // Full width on mobile
  
  @media (min-width: 768px) {
    flex: 1 1 calc(50% - var(--spacing-size-06)); // Half width on tablet
  }
  
  @media (min-width: 1024px) {
    flex: 1 1 calc(33.333% - var(--spacing-size-06)); // One-third on desktop
  }
}`}</code>
        </pre>

        <h3>Responsive Breakpoints</h3>
        <p>Breakpoints enable responsive grid behavior:</p>
        <pre>
          <code>{`// Breakpoint tokens
:root {
  --breakpoint-mobile: 0px;
  --breakpoint-tablet: 768px;
  --breakpoint-desktop: 1024px;
}

// Responsive grid
.grid {
  display: grid;
  grid-template-columns: 1fr; // Single column on mobile
  gap: var(--spacing-size-04); // Smaller gap on mobile
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr); // 2 columns on tablet
    gap: var(--spacing-size-06); // Larger gap on tablet
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(12, 1fr); // 12 columns on desktop
    gap: var(--spacing-size-06);
  }
}`}</code>
        </pre>

        <h3>Container Queries</h3>
        <p>Container queries enable component-based responsive design:</p>
        <pre>
          <code>{`// Container query grid
.card-grid {
  container-type: inline-size;
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--spacing-size-06);
}

// Grid adapts based on container size, not viewport
@container (min-width: 400px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@container (min-width: 800px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}`}</code>
        </pre>

        <h3>Grid Utilities</h3>
        <p>Grid utility classes provide common layout patterns:</p>
        <pre>
          <code>{`// Grid utility classes
.grid-1 { grid-column: span 1; }
.grid-2 { grid-column: span 2; }
.grid-3 { grid-column: span 3; }
.grid-4 { grid-column: span 4; }
.grid-6 { grid-column: span 6; }
.grid-12 { grid-column: span 12; }

// Responsive utilities
.grid-mobile-12 {
  grid-column: span 12;
  
  @media (min-width: 768px) {
    grid-column: span 6;
  }
  
  @media (min-width: 1024px) {
    grid-column: span 4;
  }
}`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-tokenized grid system ensures consistency between design and
          code. When designers specify grid layouts in Figma, those same layouts
          appear in code through tokens and utility classes. When grid systems
          need to change, updating tokens updates all components automatically.
          This is grid system as infrastructure: built-in consistency, not
          manual alignment.
        </p>
        <p>
          Understanding grid tokens helps practitioners create responsive,
          accessible layouts that work across all devices and screen sizes.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building a Responsive Card Grid',
    order: 7,
    content: (
      <>
        <p>
          Let's build a responsive card grid using grid tokens, demonstrating
          proper grid usage:
        </p>

        <h3>Step 1: Define Grid Tokens</h3>
        <p>Start with core grid tokens for columns and breakpoints:</p>
        <pre>
          <code>{`// Conceptual grid tokens
{
  "grid": {
    "columns": {
      "count": { "$type": "number", "$value": 12 },
      "gap": { "$type": "dimension", "$value": "{spacing.size.06}" }
    },
    "breakpoints": {
      "mobile": { "$type": "dimension", "$value": "0px" },
      "tablet": { "$type": "dimension", "$value": "768px" },
      "desktop": { "$type": "dimension", "$value": "1024px" }
    },
    "container": {
      "maxWidth": { "$type": "dimension", "$value": "1200px" },
      "padding": { "$type": "dimension", "$value": "{spacing.size.06}" }
    }
  }
}`}</code>
        </pre>

        <h3>Step 2: Create Grid Container</h3>
        <p>Build a grid container component:</p>
        <pre>
          <code>{`// Grid container
.grid-container {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  gap: var(--spacing-size-06);
  max-width: var(--container-max-width);
  margin: 0 auto;
  padding: 0 var(--spacing-size-06);
}`}</code>
        </pre>

        <h3>Step 3: Implement Card Grid</h3>
        <p>Create a responsive card grid:</p>
        <pre>
          <code>{`// Card grid component
.card-grid {
  display: grid;
  grid-template-columns: 1fr; // Single column on mobile
  gap: var(--spacing-size-04); // Smaller gap on mobile
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr); // 2 columns on tablet
    gap: var(--spacing-size-06);
  }
  
  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr); // 3 columns on desktop
    gap: var(--spacing-size-06);
  }
}

// Usage
<div className="card-grid">
  <Card />
  <Card />
  <Card />
  <Card />
</div>`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Responsiveness:</strong> Grid adapts to all screen sizes
          </li>
          <li>
            <strong>Consistency:</strong> All grids use the same spacing tokens
          </li>
          <li>
            <strong>Accessibility:</strong> Grid maintains logical content order
          </li>
          <li>
            <strong>Maintainability:</strong> Changing grid tokens updates all
            grids system-wide
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
        <p>Grid systems face several common challenges:</p>

        <h4>Over-Constraining Layouts</h4>
        <p>Rigid grid systems can limit creative layouts:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Strict column adherence can prevent
            organic, content-driven layouts
          </li>
          <li>
            <strong>Solution:</strong> Use grids as guides, not strict rules.
            Allow deviations when content demands it
          </li>
          <li>
            <strong>Guideline:</strong> Break grid rules when it improves
            usability or content presentation
          </li>
        </ul>

        <h4>Breakpoint Proliferation</h4>
        <p>Too many breakpoints create maintenance overhead:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Custom breakpoints for every component
            increase complexity
          </li>
          <li>
            <strong>Solution:</strong> Use a limited set of system-wide
            breakpoints, add component-specific ones only when necessary
          </li>
          <li>
            <strong>Requirement:</strong> Document all breakpoints and their
            usage
          </li>
        </ul>

        <h4>Container Query Browser Support</h4>
        <p>Container queries are relatively new:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Container queries require modern browser
            support
          </li>
          <li>
            <strong>Approach:</strong> Use container queries for progressive
            enhancement, provide fallbacks for older browsers
          </li>
          <li>
            <strong>Tradeoff:</strong> Container queries enable better component
            encapsulation but require browser support considerations
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Grid system design involves several tradeoffs:</p>

        <h4>CSS Grid vs. Flexbox</h4>
        <ul>
          <li>
            <strong>CSS Grid:</strong> Better for 2D layouts, explicit column
            control, but requires modern browser support
          </li>
          <li>
            <strong>Flexbox:</strong> Better for 1D layouts, excellent browser
            support, but less explicit column control
          </li>
          <li>
            <strong>Best practice:</strong> Use CSS Grid for page layouts,
            Flexbox for component layouts
          </li>
        </ul>

        <h4>Fixed vs. Fluid Grids</h4>
        <ul>
          <li>
            <strong>Fixed grids:</strong> Predictable column widths, easier to
            design for, but less flexible
          </li>
          <li>
            <strong>Fluid grids:</strong> Adapt to any screen size, more
            flexible, but harder to predict
          </li>
          <li>
            <strong>Best practice:</strong> Use fluid grids with max-width
            constraints for balance
          </li>
        </ul>

        <h4>12 vs. 16 Column Grids</h4>
        <ul>
          <li>
            <strong>12-column:</strong> More common, easier to divide, less
            granular control
          </li>
          <li>
            <strong>16-column:</strong> More granular control, better for
            complex layouts, less common
          </li>
          <li>
            <strong>Best practice:</strong> Use 12-column for most cases,
            16-column for specialized needs
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
        <p>Continue learning about grids and related foundations:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            How tokens structure grid systems
          </li>
          <li>
            <Link href="/blueprints/foundations/spacing">Spacing</Link>: How
            spacing integrates with grid systems
          </li>
          <li>
            <Link href="/blueprints/foundations/layout">Layout</Link>: How grids
            work with layout systems
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/philosophy">
              Accessibility Philosophy
            </Link>
            : Accessibility-first approach to grids
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#grid">Grid</Link>,{' '}
          <Link href="/blueprints/glossary#layout">Layout</Link>,{' '}
          <Link href="/blueprints/glossary#responsive">Responsive Design</Link>
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
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'How tokens structure grid systems',
      type: 'foundation',
    },
    {
      slug: 'spacing',
      title: 'Spacing',
      description: 'How spacing integrates with grid systems',
      type: 'foundation',
    },
    {
      slug: 'layout',
      title: 'Layout',
      description: 'How grids work with layout systems',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['grid', 'layout', 'responsive'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'grid-column-tokens',
    label: 'Grid column tokens defined',
    description: 'Grid column count and gap tokens are defined',
    required: true,
  },
  {
    id: 'grid-breakpoint-tokens',
    label: 'Breakpoint tokens defined',
    description: 'Breakpoint tokens for responsive grids are defined',
    required: true,
  },
  {
    id: 'grid-accessibility',
    label: 'Accessibility requirements met',
    description: 'Grid maintains logical content order for screen readers',
    required: true,
  },
  {
    id: 'grid-keyboard-navigation',
    label: 'Keyboard navigation supported',
    description: 'Grid layouts support logical keyboard navigation flow',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you break grid rules for content-driven layouts? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how grid tokens enable both responsive design and consistency. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between CSS Grid and Flexbox for grid systems? When would you choose each approach?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function GridFoundationPage() {
  return <FoundationPage content={content} />;
}

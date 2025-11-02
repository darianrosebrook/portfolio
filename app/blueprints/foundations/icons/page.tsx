/**
 * Foundation: Icon Systems
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
  title: 'Icon Foundations',
  description:
    'Learn how to create consistent, accessible icon systems with proper sizing, stroke weights, and semantic meaning. Understand icon tokenization, accessibility requirements, and implementation best practices.',
  slug: 'icons',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/icons',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'icons, iconography, accessibility, SVG, tokens, visual language',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens'],
    next_units: ['typography', 'spacing'],
    assessment_required: false,
    estimated_reading_time: 12,
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
    expertise: ['Icon Systems', 'Accessibility', 'Design Tokens'],
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
    title: 'Why Icons Matter',
    order: 3,
    content: (
      <>
        <p>
          Icons are a universal visual language in digital interfaces. They
          communicate meaning at a glance, transcend language barriers, and
          enable space-efficient interfaces. When systematized properly, icons
          serve multiple critical functions:
        </p>
        <ul>
          <li>
            <strong>Universal Recognition:</strong> Icons communicate concepts
            faster than text, leveraging visual memory and pattern recognition
          </li>
          <li>
            <strong>Space Efficiency:</strong> Icons convey meaning in compact
            spaces, enabling dense information displays without overwhelming
            users
          </li>
          <li>
            <strong>Brand Expression:</strong> Icon style contributes to brand
            personality—from minimalist and modern to detailed and expressive
          </li>
          <li>
            <strong>Accessibility:</strong> Icons supplement text labels,
            providing visual cues for users with different cognitive loads and
            reading abilities
          </li>
          <li>
            <strong>Internationalization:</strong> Icon systems reduce reliance
            on text, making interfaces more adaptable across languages and
            cultures
          </li>
        </ul>
        <p>
          A well-designed icon system treats icons as a structured vocabulary
          with consistent rules, rather than a collection of arbitrary symbols.
          This enables clarity, maintainability, and accessibility across the
          entire design system.
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
        <h3>Icon Sizing Scales</h3>
        <p>
          Icons must scale consistently across different contexts. Our system
          uses a standardized sizing scale based on common UI needs:
        </p>
        <ul>
          <li>
            <strong>Small (16px):</strong> Inline with text, dense interfaces,
            navigation items
          </li>
          <li>
            <strong>Medium (20px):</strong> Default size for most contexts,
            buttons, form fields
          </li>
          <li>
            <strong>Large (24px):</strong> Emphasized contexts, headers, feature
            highlights
          </li>
          <li>
            <strong>Extra Large (32px):</strong> Hero sections, empty states,
            major feature indicators
          </li>
        </ul>
        <p>
          These sizes align with our spacing system and ensure icons work
          harmoniously with text and other UI elements.
        </p>

        <h3>Stroke Consistency</h3>
        <p>
          Consistent stroke weight creates visual unity across the icon system.
          Our system uses a default stroke width of 1.5px:
        </p>
        <ul>
          <li>
            <strong>Single stroke weight:</strong> All icons use the same stroke
            width for visual consistency
          </li>
          <li>
            <strong>Grid alignment:</strong> Icons are designed on a grid system
            to ensure proper alignment and spacing
          </li>
          <li>
            <strong>Optical correction:</strong> Stroke weights may be adjusted
            optically for icons at different sizes while maintaining perceived
            consistency
          </li>
        </ul>
        <p>
          Consistent stroke weight helps users recognize icons as part of the
          same system, even when they appear in different contexts.
        </p>

        <h3>Icon Tokenization</h3>
        <p>
          Icons are tokenized for size, color, and spacing, following the same
          layered architecture as other design tokens:
        </p>
        <pre>
          <code>{`// Core icon tokens: primitive values
{
  "icon": {
    "size": {
      "sm": { "$type": "dimension", "$value": "16px" },
      "md": { "$type": "dimension", "$value": "20px" },
      "lg": { "$type": "dimension", "$value": "24px" },
      "xl": { "$type": "dimension", "$value": "32px" }
    },
    "strokeWidth": {
      "default": { "$type": "dimension", "$value": "1.5px" }
    }
  }
}

// Semantic icon tokens: purpose-driven usage
{
  "semantic": {
    "icon": {
      "size": {
        "inline": "{icon.size.sm}",
        "button": "{icon.size.md}",
        "feature": "{icon.size.lg}"
      },
      "color": {
        "default": "{color.text.secondary}",
        "interactive": "{color.text.primary}",
        "disabled": "{color.text.disabled}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Icon Families and Style Systems</h3>
        <p>
          Icon systems should maintain consistent visual style across all icons:
        </p>
        <ul>
          <li>
            <strong>Style consistency:</strong> All icons share the same visual
            language (outlined, filled, or hybrid)
          </li>
          <li>
            <strong>Geometric foundation:</strong> Icons are built on consistent
            geometric principles and grid systems
          </li>
          <li>
            <strong>Semantic clarity:</strong> Icons communicate meaning clearly
            without requiring explanation
          </li>
          <li>
            <strong>Cultural sensitivity:</strong> Icons avoid culturally
            specific metaphors that may not translate globally
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Icons Shape System Success',
    order: 5,
    content: (
      <>
        <h3>Accessibility Impact</h3>
        <p>
          Icons must be accessible to all users. This requires proper semantic
          meaning, contrast, and text alternatives:
        </p>
        <ul>
          <li>
            <strong>ARIA labels:</strong> Standalone icons require{' '}
            <code>aria-label</code> attributes to communicate meaning to screen
            readers
          </li>
          <li>
            <strong>Decorative icons:</strong> Purely decorative icons should
            use <code>aria-hidden="true"</code> to avoid cluttering screen
            reader output
          </li>
          <li>
            <strong>Contrast requirements:</strong> Icons must meet WCAG
            contrast ratios (3:1 for large icons, 4.5:1 for small icons) against
            their backgrounds
          </li>
          <li>
            <strong>Touch targets:</strong> Interactive icons must provide
            minimum 44×44px touch targets, even if the icon itself is smaller
          </li>
        </ul>
        <p>
          Accessibility isn't optional—it's a fundamental requirement that
          determines whether icons enhance or hinder usability.
        </p>

        <h3>Visual Consistency Impact</h3>
        <p>
          Consistent icon sizing and styling create visual harmony across the
          interface:
        </p>
        <ul>
          <li>
            <strong>Recognition:</strong> Consistent sizing helps users
            recognize icons as part of the same system
          </li>
          <li>
            <strong>Hierarchy:</strong> Size variations communicate importance
            and hierarchy without relying on color alone
          </li>
          <li>
            <strong>Alignment:</strong> Standardized sizing ensures icons align
            properly with text and other UI elements
          </li>
        </ul>
        <p>
          Visual consistency reduces cognitive load and makes interfaces feel
          more polished and professional.
        </p>

        <h3>Performance Impact</h3>
        <p>Icon implementation choices affect performance and bundle size:</p>
        <ul>
          <li>
            <strong>SVG optimization:</strong> Icons should be optimized SVGs
            with minimal path data
          </li>
          <li>
            <strong>Sprite systems:</strong> Icon sprites reduce HTTP requests
            and improve loading performance
          </li>
          <li>
            <strong>Tree-shaking:</strong> Icon systems should support
            tree-shaking to include only used icons in production bundles
          </li>
          <li>
            <strong>Lazy loading:</strong> Icons can be loaded on-demand for
            better initial page load performance
          </li>
        </ul>
        <p>
          Performance considerations ensure icons enhance rather than hinder
          user experience, especially on slower connections and devices.
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
          Icons bridge design intent and code implementation. Let's examine how
          icon systems translate from design specifications to working code.
        </p>

        <h3>Icon Token Structure</h3>
        <p>
          Icon tokens follow the same layered architecture as color and spacing
          tokens:
        </p>
        <pre>
          <code>{`// Core icon tokens: primitive values
{
  "icon": {
    "size": {
      "sm": { "$type": "dimension", "$value": "16px" },
      "md": { "$type": "dimension", "$value": "20px" },
      "lg": { "$type": "dimension", "$value": "24px" },
      "xl": { "$type": "dimension", "$value": "32px" }
    },
    "strokeWidth": {
      "default": { "$type": "dimension", "$value": "1.5px" }
    }
  }
}

// Semantic icon tokens: contextual usage
{
  "semantic": {
    "icon": {
      "size": {
        "inline": "{icon.size.sm}",
        "button": "{icon.size.md}",
        "header": "{icon.size.lg}",
        "hero": "{icon.size.xl}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Icon Component Implementation</h3>
        <p>
          The Icon component uses tokens for sizing and styling, ensuring
          consistency across the system:
        </p>
        <pre>
          <code>{`// Icon component with token-based sizing
import { IconDefinition } from '@awesome.me/kit-0ba7f5fefb/icons';
import styles from './Icon.module.scss';

export type IconProps = {
  icon: IconDefinition;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
  'aria-label'?: string;
  'aria-hidden'?: boolean;
};

const Icon = ({ 
  icon, 
  size = 'md',
  color = 'currentColor',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden 
}: IconProps) => {
  if (!icon) return null;
  
  const sizeMap = {
    sm: 'var(--icon-size-sm)',
    md: 'var(--icon-size-md)',
    lg: 'var(--icon-size-lg)',
    xl: 'var(--icon-size-xl)'
  };

  return (
    <span 
      className={styles.icon} 
      style={{ 
        width: sizeMap[size],
        height: sizeMap[size],
        color 
      }}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      data-icon="true"
    >
      <svg 
        viewBox={\`0 0 \${icon.icon[0]} \${icon.icon[1]}\`}
        fill="currentColor"
        strokeWidth="1.5"
      >
        <path d={icon.icon[4] as string} />
      </svg>
    </span>
  );
};

export default Icon;`}</code>
        </pre>

        <h3>Icon Usage in Components</h3>
        <p>
          Icons are integrated into components using semantic tokens for
          contextual sizing:
        </p>
        <pre>
          <code>{`// Button with icon using semantic tokens
<Button>
  <Icon icon={checkIcon} size="sm" aria-hidden="true" />
  Submit
</Button>

// Form field with icon
<div className={styles.field}>
  <Icon icon={searchIcon} size="md" aria-hidden="true" />
  <Input placeholder="Search..." />
      </div>

// Navigation item with icon
<nav>
  <a href="/dashboard">
    <Icon icon={dashboardIcon} size="md" aria-hidden="true" />
    Dashboard
  </a>
</nav>

// Standalone icon button (requires label)
<IconButton
  icon={settingsIcon}
  aria-label="Settings"
  size="lg"
/>`}</code>
        </pre>

        <h3>Icon Color and State</h3>
        <p>
          Icon colors adapt to context and state using semantic color tokens:
        </p>
        <pre>
          <code>{`// Icon colors from semantic tokens
.icon {
  color: var(--semantic-icon-color-default);
}

.icon--interactive {
  color: var(--semantic-icon-color-interactive);
}

.icon--disabled {
  color: var(--semantic-icon-color-disabled);
  opacity: 0.5;
}

// Icon in button states
.button:hover .icon {
  color: var(--semantic-icon-color-interactive);
}

.button:disabled .icon {
  color: var(--semantic-icon-color-disabled);
}`}</code>
        </pre>

        <h3>Accessibility Implementation</h3>
        <p>
          Proper accessibility ensures icons communicate meaning to all users:
        </p>
        <pre>
          <code>{`// Decorative icon (no meaning)
<Icon icon={decorativeIcon} aria-hidden="true" />

// Informative icon (requires label)
<Icon 
  icon={warningIcon} 
  aria-label="Warning"
/>

// Icon with visible text (icon is decorative)
<button>
  <Icon icon={saveIcon} aria-hidden="true" />
  Save
</button>

// Icon-only button (requires aria-label)
<IconButton
  icon={closeIcon}
  aria-label="Close dialog"
/>

// Icon with description
<div>
  <Icon icon={infoIcon} aria-label="Information" />
  <p id="icon-description">This feature requires a subscription.</p>
  <span aria-labelledby="icon-description">Learn more</span>
</div>`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-tokenized icon system ensures consistency between design and
          code. When designers specify icon sizes in Figma, those same sizes
          appear in code through tokens. When icon sizing needs to change,
          updating tokens updates all components automatically. This is icon
          system as infrastructure: built-in consistency, not manual alignment.
        </p>
        <p>
          Understanding icon tokens helps practitioners create interfaces with
          consistent visual language, maintain accessibility standards, and
          enable system-wide icon updates through token changes.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building an Icon System',
    order: 7,
    content: (
      <>
        <p>
          Let's build a complete icon system with proper tokenization,
          accessibility, and component integration:
        </p>

        <h3>Step 1: Define Icon Tokens</h3>
        <p>
          Start with core icon tokens that define sizing and stroke weights:
        </p>
        <pre>
          <code>{`// core/icon.tokens.json
{
  "icon": {
    "size": {
      "sm": { "$type": "dimension", "$value": "16px" },
      "md": { "$type": "dimension", "$value": "20px" },
      "lg": { "$type": "dimension", "$value": "24px" },
      "xl": { "$type": "dimension", "$value": "32px" }
    },
    "strokeWidth": {
      "default": { "$type": "dimension", "$value": "1.5px" }
    }
  }
}`}</code>
        </pre>

        <h3>Step 2: Create Semantic Icon Tokens</h3>
        <p>Define semantic tokens for contextual icon usage:</p>
        <pre>
          <code>{`// semantic/icon.tokens.json
{
  "semantic": {
    "icon": {
      "size": {
        "inline": "{icon.size.sm}",
        "button": "{icon.size.md}",
        "header": "{icon.size.lg}",
        "hero": "{icon.size.xl}"
      },
      "color": {
        "default": "{color.text.secondary}",
        "interactive": "{color.text.primary}",
        "disabled": "{color.text.disabled}",
        "success": "{color.status.success}",
        "error": "{color.status.error}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 3: Implement Icon Component</h3>
        <p>
          Build an Icon component that uses tokens and handles accessibility:
        </p>
        <pre>
          <code>{`// Icon component implementation
import { IconDefinition } from '@awesome.me/kit-0ba7f5fefb/icons';
import styles from './Icon.module.scss';

export type IconProps = {
  icon: IconDefinition;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: 'default' | 'interactive' | 'disabled' | 'success' | 'error';
  'aria-label'?: string;
  'aria-hidden'?: boolean;
  className?: string;
};

export const Icon = ({ 
  icon, 
  size = 'md',
  color = 'default',
  'aria-label': ariaLabel,
  'aria-hidden': ariaHidden = false,
  className
}: IconProps) => {
  if (!icon) return null;

  const sizeToken = \`var(--icon-size-\${size})\`;
  const colorToken = \`var(--semantic-icon-color-\${color})\`;

  // If no aria-label and not explicitly hidden, warn in dev
  if (process.env.NODE_ENV === 'development' && !ariaLabel && !ariaHidden) {
    console.warn(
      'Icon component requires either aria-label or aria-hidden="true"',
      icon
    );
  }

  return (
    <span 
      className={\`\${styles.icon} \${className || ''}\`}
      style={{ 
        width: sizeToken,
        height: sizeToken,
        color: colorToken
      }}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden || undefined}
      data-icon="true"
    >
      <svg 
        viewBox={\`0 0 \${icon.icon[0]} \${icon.icon[1]}\`}
        fill="currentColor"
        strokeWidth="var(--icon-stroke-width-default)"
        aria-hidden="true"
      >
        <path d={icon.icon[4] as string} />
      </svg>
    </span>
  );
};`}</code>
        </pre>

        <h3>Step 4: Use Icons in Components</h3>
        <p>Integrate icons into components with proper accessibility:</p>
        <pre>
          <code>{`// Button with icon
<Button>
  <Icon icon={checkIcon} size="sm" aria-hidden="true" />
  Save
</Button>

// Icon-only button (requires label)
<IconButton
  icon={closeIcon}
  aria-label="Close"
  size="md"
/>

// Form field with icon
<div className={styles.field}>
  <Icon 
    icon={searchIcon} 
    size="md" 
    aria-hidden="true"
    color="default"
  />
  <Input placeholder="Search..." />
</div>

// Status indicator with icon
<div className={styles.status}>
  <Icon 
    icon={successIcon} 
    size="md" 
    aria-label="Success"
    color="success"
  />
  <span>Changes saved</span>
</div>`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Consistency:</strong> All icons use the same sizing scale
            and tokens
          </li>
          <li>
            <strong>Accessibility:</strong> Accessibility requirements are
            enforced at the component level
          </li>
          <li>
            <strong>Maintainability:</strong> Changing icon sizes updates all
            icons system-wide through tokens
          </li>
          <li>
            <strong>Performance:</strong> Icons are optimized and only loaded
            when needed
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
          Icon systems face several common challenges that require careful
          consideration:
        </p>

        <h4>Over-Reliance on Icon-Only Buttons</h4>
        <p>
          Icon-only buttons can be inaccessible if not properly labeled. Always
          provide <code>aria-label</code> for icon-only interactive elements:
        </p>
        <ul>
          <li>
            <strong>Problem:</strong> Icon-only buttons without labels are
            inaccessible to screen reader users
          </li>
          <li>
            <strong>Solution:</strong> Always include <code>aria-label</code> or
            visible text for essential actions
          </li>
          <li>
            <strong>Exception:</strong> Decorative icons in buttons with visible
            text can use <code>aria-hidden="true"</code>
          </li>
        </ul>

        <h4>Accessibility Gaps</h4>
        <p>
          Icons must meet accessibility requirements for contrast and semantic
          meaning:
        </p>
        <ul>
          <li>
            <strong>Contrast:</strong> Icons must meet WCAG contrast ratios (3:1
            for large icons, 4.5:1 for small icons)
          </li>
          <li>
            <strong>Meaning:</strong> Icons cannot rely on color alone to convey
            meaning—pair with text or other visual cues
          </li>
          <li>
            <strong>Size:</strong> Interactive icons must provide sufficient
            touch targets (minimum 44×44px)
          </li>
        </ul>

        <h4>File Size Optimization</h4>
        <p>Icon libraries can significantly impact bundle size:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Including entire icon libraries bloats
            bundle size
          </li>
          <li>
            <strong>Solution:</strong> Use tree-shaking to include only used
            icons, or implement icon sprites
          </li>
          <li>
            <strong>Tradeoff:</strong> Sprite systems reduce HTTP requests but
            require careful management
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Icon system design involves several tradeoffs:</p>

        <h4>Custom vs. Icon Library</h4>
        <ul>
          <li>
            <strong>Custom icons:</strong> Full control over style and
            consistency, but requires design and maintenance resources
          </li>
          <li>
            <strong>Icon library:</strong> Faster implementation and broader
            coverage, but may lack consistency or require licensing
          </li>
        </ul>

        <h4>Single vs. Multiple Icon Styles</h4>
        <ul>
          <li>
            <strong>Single style:</strong> Maximum consistency, easier to
            maintain, but may limit expression
          </li>
          <li>
            <strong>Multiple styles:</strong> More expressive, but requires
            careful governance to prevent inconsistency
          </li>
        </ul>

        <h4>Filled vs. Outlined</h4>
        <ul>
          <li>
            <strong>Outlined:</strong> Lighter visual weight, works well at
            small sizes, modern aesthetic
          </li>
          <li>
            <strong>Filled:</strong> Higher visual weight, better for emphasis,
            traditional aesthetic
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
        <p>Continue learning about icon systems and related foundations:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            How tokens structure icon systems
          </li>
          <li>
            <Link href="/blueprints/foundations/typography">Typography</Link>:
            How icons integrate with text and typography
          </li>
          <li>
            <Link href="/blueprints/foundations/spacing">Spacing</Link>: How
            icon spacing creates visual rhythm
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/philosophy">
              Accessibility Philosophy
            </Link>
            : Accessibility-first approach to icon design
          </li>
          <li>
            <Link href="/blueprints/component-standards/component-complexity/primitives">
              Primitives
            </Link>
            : How icons function as primitive components
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#iconography">Iconography</Link>,{' '}
          <Link href="/blueprints/glossary#accessibility">Accessibility</Link>,{' '}
          <Link href="/blueprints/glossary#tokens">Design Tokens</Link>
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
      description: 'How tokens structure icon systems',
      type: 'foundation',
    },
    {
      slug: 'typography',
      title: 'Typography',
      description: 'How icons integrate with text',
      type: 'foundation',
    },
    {
      slug: 'spacing',
      title: 'Spacing',
      description: 'How icon spacing creates visual rhythm',
      type: 'foundation',
    },
  ],
  components: [
    {
      slug: 'icon',
      component: 'Icon',
      description: 'Primitive icon component',
      relatedConcepts: ['tokens', 'accessibility'],
    },
  ],
  glossary: ['iconography', 'accessibility', 'tokens'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'icon-size-tokens',
    label: 'Icon size tokens defined',
    description: 'Core icon size tokens (sm, md, lg, xl) are defined',
    required: true,
  },
  {
    id: 'icon-accessibility',
    label: 'Accessibility requirements met',
    description: 'Icons have proper aria-label or aria-hidden attributes',
    required: true,
  },
  {
    id: 'icon-contrast',
    label: 'Contrast requirements met',
    description: 'Icons meet WCAG contrast ratios against backgrounds',
    required: true,
  },
  {
    id: 'icon-touch-targets',
    label: 'Touch targets adequate',
    description: 'Interactive icons provide minimum 44×44px touch targets',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should an icon use aria-label versus aria-hidden? Provide examples of each use case.',
    type: 'reflection',
  },
  {
    question:
      'Explain how icon tokens enable both visual consistency and system-wide updates. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between using a custom icon set versus an icon library? When would you choose each approach?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function IconsFoundationPage() {
  return <FoundationPage content={content} />;
}

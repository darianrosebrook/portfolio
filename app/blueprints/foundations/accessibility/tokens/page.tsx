/**
 * Foundation: Token-Level Accessibility
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
  title: 'Token-Level Accessibility',
  description:
    'Learn how to create design tokens that support accessibility for color contrast, motion sensitivity, spacing for legibility, and focus states. Build accessibility into your system from the ground up.',
  slug: 'tokens',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/accessibility/tokens',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'accessibility tokens, contrast, reduced motion, focus states, touch targets, token-level accessibility',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'a11y'],
    prerequisites: ['tokens', 'accessibility', 'standards'],
    next_units: ['tooling', 'assistive-tech'],
    assessment_required: false,
    estimated_reading_time: 14,
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
    expertise: ['Accessibility Tokens', 'Token Architecture', 'WCAG'],
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
    title: 'Why Token-Level Accessibility Matters',
    order: 3,
    content: (
      <>
        <p>
          Building accessibility into your design system starts at the token
          level. Tokens are an excellent place to encode accessibility
          constraints. By putting these decisions at the foundation level, we
          ensure that every component inherits inclusive defaults.
        </p>
        <p>Token-level accessibility serves multiple critical functions:</p>
        <ul>
          <li>
            <strong>Default Accessibility:</strong> Tokens provide accessible
            defaults that components inherit automatically
          </li>
          <li>
            <strong>System-Wide Consistency:</strong> Accessibility constraints
            applied consistently across all components
          </li>
          <li>
            <strong>Validation:</strong> Tokens can be validated for
            accessibility compliance at build time
          </li>
          <li>
            <strong>Maintainability:</strong> Accessibility improvements update
            all components automatically through token changes
          </li>
          <li>
            <strong>Documentation:</strong> Tokens document accessibility
            decisions in a single source of truth
          </li>
        </ul>
        <p>
          A well-designed token system treats accessibility as a foundational
          constraint, not an afterthought. This ensures accessible experiences
          by default, not by exception.
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
        <h3>Contrast-Aware Color Tokens</h3>
        <p>Color tokens encode contrast requirements:</p>
        <ul>
          <li>
            <strong>Text tokens:</strong> Foreground colors that meet contrast
            requirements on their background tokens
          </li>
          <li>
            <strong>Background tokens:</strong> Background colors that support
            sufficient contrast with text tokens
          </li>
          <li>
            <strong>Border tokens:</strong> Border colors that meet contrast
            requirements
          </li>
          <li>
            <strong>State tokens:</strong> Hover, focus, active states that
            maintain contrast
          </li>
        </ul>
        <pre>
          <code>{`// Contrast-aware color tokens
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": {
          "$value": "{core.color.palette.neutral.900}",
          "$extensions": {
            "contrast": {
              "on": "{semantic.color.background.surface}",
              "ratio": "12.6:1",
              "wcag": "AAA"
            }
          }
        }
      },
      "background": {
        "surface": {
          "$value": "{core.color.palette.neutral.100}",
          "$extensions": {
            "contrast": {
              "supports": ["foreground.primary", "foreground.secondary"]
            }
          }
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Reduced Motion Tokens</h3>
        <p>Motion tokens respect user preferences:</p>
        <ul>
          <li>
            <strong>Duration tokens:</strong> Motion durations that can be
            reduced or disabled
          </li>
          <li>
            <strong>Easing tokens:</strong> Motion easing that respects reduced
            motion preferences
          </li>
          <li>
            <strong>Reduced motion overrides:</strong> Tokens for reduced motion
            mode
          </li>
        </ul>
        <pre>
          <code>{`// Reduced motion tokens
{
  "semantic": {
    "motion": {
      "duration": {
        "short": {
          "$value": "{core.motion.duration.short2}",
          "$extensions": {
            "reducedMotion": {
              "$value": "{core.motion.duration.instant}"
            }
          }
        }
      },
      "easing": {
        "standard": {
          "$value": "{core.motion.easing.standard}",
          "$extensions": {
            "reducedMotion": {
              "$value": "linear"
            }
          }
        }
      }
    }
  }
}

// CSS implementation
@media (prefers-reduced-motion: reduce) {
  :root {
    --semantic-motion-duration-short: var(--core-motion-duration-instant);
    --semantic-motion-easing-standard: linear;
  }
}`}</code>
        </pre>

        <h3>Touch Target Tokens</h3>
        <p>Spacing tokens enforce minimum touch target sizes:</p>
        <ul>
          <li>
            <strong>Minimum sizes:</strong> Touch targets meet WCAG minimum
            (44px × 44px)
          </li>
          <li>
            <strong>Padding tokens:</strong> Padding ensures sufficient touch
            target size
          </li>
          <li>
            <strong>Gap tokens:</strong> Gaps between interactive elements
            prevent accidental activation
          </li>
        </ul>
        <pre>
          <code>{`// Touch target tokens
{
  "semantic": {
    "spacing": {
      "touchTarget": {
        "minimum": {
          "$type": "dimension",
          "$value": "44px",
          "$extensions": {
            "accessibility": {
              "requirement": "WCAG 2.5.5 Target Size"
            }
          }
        }
      },
      "padding": {
        "button": {
          "$type": "dimension",
          "$value": "{core.spacing.size.04}",
          "$extensions": {
            "accessibility": {
              "minTouchTarget": "44px"
            }
          }
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Focus State Tokens</h3>
        <p>Focus tokens ensure visible focus indicators:</p>
        <ul>
          <li>
            <strong>Focus ring color:</strong> High-contrast focus ring color
          </li>
          <li>
            <strong>Focus ring width:</strong> Sufficient width for visibility
          </li>
          <li>
            <strong>Focus offset:</strong> Space between element and focus ring
          </li>
        </ul>
        <pre>
          <code>{`// Focus state tokens
{
  "semantic": {
    "color": {
      "border": {
        "focus": {
          "$value": "{core.color.palette.brand.primary.600}",
          "$extensions": {
            "contrast": {
              "on": "{semantic.color.background.surface}",
              "ratio": "4.5:1",
              "wcag": "AA"
            }
          }
        }
      }
    },
    "shape": {
      "focus": {
        "ring": {
          "width": {
            "$type": "borderWidth",
            "$value": "2px"
          },
          "offset": {
            "$type": "dimension",
            "$value": "2px"
          }
        }
      }
    }
  }
}

// CSS implementation
.button:focus-visible {
  outline: var(--semantic-shape-focus-ring-width) solid var(--semantic-color-border-focus);
  outline-offset: var(--semantic-shape-focus-ring-offset);
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Token-Level Accessibility Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Default Accessibility Impact</h3>
        <p>Token-level accessibility provides default accessibility:</p>
        <ul>
          <li>
            <strong>Inherited accessibility:</strong> Components inherit
            accessible defaults from tokens
          </li>
          <li>
            <strong>No opt-in required:</strong> Accessibility is built-in, not
            opt-in
          </li>
          <li>
            <strong>Reduced errors:</strong> Harder to create inaccessible
            components
          </li>
        </ul>
        <p>
          Default accessibility ensures accessible experiences without requiring
          teams to remember accessibility requirements.
        </p>

        <h3>Consistency Impact</h3>
        <p>Token-level accessibility ensures consistency:</p>
        <ul>
          <li>
            <strong>System-wide standards:</strong> Accessibility constraints
            applied consistently
          </li>
          <li>
            <strong>Predictable behavior:</strong> Components behave
            consistently across system
          </li>
          <li>
            <strong>Easier testing:</strong> Consistent patterns enable
            automated testing
          </li>
        </ul>
        <p>
          Consistent accessibility ensures predictable, testable experiences.
        </p>

        <h3>Maintainability Impact</h3>
        <p>Token-level accessibility improves maintainability:</p>
        <ul>
          <li>
            <strong>Single source of truth:</strong> Accessibility decisions
            documented in tokens
          </li>
          <li>
            <strong>Automatic updates:</strong> Token changes update all
            components automatically
          </li>
          <li>
            <strong>Validation:</strong> Tokens can be validated for
            accessibility at build time
          </li>
        </ul>
        <p>
          Maintainable accessibility ensures systems remain accessible as they
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
          Token-level accessibility bridges design intent and code
          implementation. Let's examine how accessibility tokens translate from
          design specifications to working code.
        </p>

        <h3>Design: Contrast Validation</h3>
        <p>Design tools validate contrast:</p>
        <pre>
          <code>{`// Figma: Contrast checking
Text Style: semantic.color.foreground.primary
  - Color: #1F2937
  - Contrast on semantic.color.background.surface: 12.6:1
  - WCAG: AAA ✓

Button Style: semantic.color.action.background.primary
  - Color: #2563EB
  - Contrast with semantic.color.foreground.inverse: 4.5:1
  - WCAG: AA ✓`}</code>
        </pre>

        <h3>Code: Token Validation</h3>
        <p>Code validates tokens at build time:</p>
        <pre>
          <code>{`// Token validation function
function validateContrastToken(token) {
  const foreground = token.$value;
  const background = token.$extensions.contrast.on;
  const ratio = calculateContrastRatio(foreground, background);
  
  if (ratio < 4.5) {
    throw new Error(
      \`Token \${token.$name} has contrast \${ratio}:1, fails WCAG AA\`
    );
  }
  
  return ratio;
}

// Build-time validation
const tokens = loadTokens();
tokens.forEach(token => {
  if (token.$extensions?.contrast) {
    validateContrastToken(token);
  }
});`}</code>
        </pre>

        <h3>Code: Reduced Motion Implementation</h3>
        <p>Code implements reduced motion support:</p>
        <pre>
          <code>{`// CSS with reduced motion support
:root {
  --semantic-motion-duration-short: var(--core-motion-duration-short2);
  --semantic-motion-easing-standard: var(--core-motion-easing-standard);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --semantic-motion-duration-short: var(--core-motion-duration-instant);
    --semantic-motion-easing-standard: linear;
  }
}

// Component uses tokens
.button {
  transition: background-color var(--semantic-motion-duration-short) var(--semantic-motion-easing-standard);
}

// Automatically respects reduced motion preference`}</code>
        </pre>

        <h3>Code: Focus State Implementation</h3>
        <p>Code implements focus states from tokens:</p>
        <pre>
          <code>{`// Focus state tokens
:root {
  --semantic-color-border-focus: var(--core-color-palette-brand-primary-600);
  --semantic-shape-focus-ring-width: 2px;
  --semantic-shape-focus-ring-offset: 2px;
}

// Component uses focus tokens
.button {
  &:focus-visible {
    outline: var(--semantic-shape-focus-ring-width) solid var(--semantic-color-border-focus);
    outline-offset: var(--semantic-shape-focus-ring-offset);
  }
}

// All components use same focus styling
// Consistent across system`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-implemented token-level accessibility system ensures accessible
          experiences by default. Contrast tokens validate color combinations.
          Reduced motion tokens respect user preferences. Touch target tokens
          enforce minimum sizes. Focus tokens ensure visible indicators. When
          accessibility is built into tokens, components inherit accessibility
          automatically. This is token-level accessibility as infrastructure:
          built-in accessibility, not opt-in compliance.
        </p>
        <p>
          Understanding token-level accessibility helps practitioners create
          systems with accessible defaults that work for all users.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building Accessible Token System',
    order: 7,
    content: (
      <>
        <p>
          Let's build an accessible token system with contrast, motion, and
          focus support:
        </p>

        <h3>Step 1: Define Contrast-Aware Color Tokens</h3>
        <p>Create color tokens with contrast validation:</p>
        <pre>
          <code>{`// semantic/color.tokens.json
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": {
          "$value": "{core.color.palette.neutral.900}",
          "$extensions": {
            "contrast": {
              "on": "{semantic.color.background.surface}",
              "ratio": "12.6:1",
              "wcag": "AAA"
            }
          }
        }
      },
      "background": {
        "surface": {
          "$value": "{core.color.palette.neutral.100}"
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 2: Create Reduced Motion Tokens</h3>
        <p>Add reduced motion support:</p>
        <pre>
          <code>{`// semantic/motion.tokens.json
{
  "semantic": {
    "motion": {
      "duration": {
        "short": {
          "$value": "{core.motion.duration.short2}",
          "$extensions": {
            "reducedMotion": {
              "$value": "{core.motion.duration.instant}"
            }
          }
        }
      },
      "easing": {
        "standard": {
          "$value": "{core.motion.easing.standard}",
          "$extensions": {
            "reducedMotion": {
              "$value": "linear"
            }
          }
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 3: Implement Focus State Tokens</h3>
        <p>Create focus state tokens:</p>
        <pre>
          <code>{`// semantic/shape.tokens.json
{
  "semantic": {
    "shape": {
      "focus": {
        "ring": {
          "width": {
            "$type": "borderWidth",
            "$value": "2px"
          },
          "offset": {
            "$type": "dimension",
            "$value": "2px"
          }
        }
      }
    },
    "color": {
      "border": {
        "focus": {
          "$value": "{core.color.palette.brand.primary.600}",
          "$extensions": {
            "contrast": {
              "on": "{semantic.color.background.surface}",
              "ratio": "4.5:1",
              "wcag": "AA"
            }
          }
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 4: Generate Accessible CSS</h3>
        <p>Generate CSS with accessibility support:</p>
        <pre>
          <code>{`// Generated CSS
:root {
  --semantic-color-foreground-primary: var(--core-color-palette-neutral-900);
  --semantic-color-background-surface: var(--core-color-palette-neutral-100);
  --semantic-motion-duration-short: var(--core-motion-duration-short2);
  --semantic-motion-easing-standard: var(--core-motion-easing-standard);
  --semantic-color-border-focus: var(--core-color-palette-brand-primary-600);
  --semantic-shape-focus-ring-width: 2px;
  --semantic-shape-focus-ring-offset: 2px;
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --semantic-motion-duration-short: var(--core-motion-duration-instant);
    --semantic-motion-easing-standard: linear;
  }
}

// Components use tokens
.button {
  color: var(--semantic-color-foreground-primary);
  background: var(--semantic-color-background-surface);
  transition: background-color var(--semantic-motion-duration-short) var(--semantic-motion-easing-standard);
  
  &:focus-visible {
    outline: var(--semantic-shape-focus-ring-width) solid var(--semantic-color-border-focus);
    outline-offset: var(--semantic-shape-focus-ring-offset);
  }
}`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Default accessibility:</strong> Components inherit
            accessible defaults
          </li>
          <li>
            <strong>User preferences:</strong> Reduced motion preferences
            respected automatically
          </li>
          <li>
            <strong>Consistency:</strong> Focus states consistent across system
          </li>
          <li>
            <strong>Validation:</strong> Tokens validated for accessibility at
            build time
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
        <p>Token-level accessibility faces several challenges:</p>

        <h4>Contrast Validation Complexity</h4>
        <p>Validating contrast across all token combinations is complex:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Many foreground/background combinations
            need validation
          </li>
          <li>
            <strong>Solution:</strong> Validate common combinations, document
            validation requirements
          </li>
          <li>
            <strong>Guideline:</strong> Validate token pairs at build time
          </li>
        </ul>

        <h4>Reduced Motion Implementation</h4>
        <p>Implementing reduced motion requires careful consideration:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Determining which motions should be
            reduced
          </li>
          <li>
            <strong>Approach:</strong> Reduce decorative motions, preserve
            essential feedback
          </li>
          <li>
            <strong>Tradeoff:</strong> Motion enhancement vs. accessibility
          </li>
        </ul>

        <h4>Token Proliferation</h4>
        <p>Accessibility tokens can increase token count:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> More tokens to maintain and document
          </li>
          <li>
            <strong>Approach:</strong> Use token extensions for metadata, keep
            core tokens simple
          </li>
          <li>
            <strong>Tradeoff:</strong> Token complexity vs. accessibility
            support
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Token-level accessibility involves several tradeoffs:</p>

        <h4>Validation: Build-Time vs. Runtime</h4>
        <ul>
          <li>
            <strong>Build-time validation:</strong> Catches issues early, but
            requires build setup
          </li>
          <li>
            <strong>Runtime validation:</strong> More flexible, but catches
            issues later
          </li>
          <li>
            <strong>Best practice:</strong> Use build-time validation for
            tokens, runtime validation for components
          </li>
        </ul>

        <h4>Contrast: Strict vs. Flexible</h4>
        <ul>
          <li>
            <strong>Strict validation:</strong> Ensures compliance, but may
            limit design options
          </li>
          <li>
            <strong>Flexible validation:</strong> More design freedom, but
            requires manual review
          </li>
          <li>
            <strong>Best practice:</strong> Validate common combinations
            strictly, document exceptions
          </li>
        </ul>

        <h4>Motion: Full vs. Reduced</h4>
        <ul>
          <li>
            <strong>Full motion:</strong> Enhanced experience, but may cause
            issues for some users
          </li>
          <li>
            <strong>Reduced motion:</strong> More accessible, but less engaging
          </li>
          <li>
            <strong>Best practice:</strong> Provide both, respect user
            preferences
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
        <p>Continue learning about token-level accessibility:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            Foundation of token systems
          </li>
          <li>
            <Link href="/blueprints/foundations/tokens/accessibility">
              Accessibility by Default
            </Link>
            : Implementation details
          </li>
          <li>
            <Link href="/blueprints/foundations/accessibility/standards">
              Accessibility Standards
            </Link>
            : WCAG guidelines and principles
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
          <Link href="/blueprints/glossary#tokens">Design Tokens</Link>,{' '}
          <Link href="/blueprints/glossary#accessibility">Accessibility</Link>,{' '}
          <Link href="/blueprints/glossary#contrast">Contrast</Link>
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
      description: 'Foundation of token systems',
      type: 'foundation',
    },
    {
      slug: 'accessibility',
      title: 'Accessibility by Default',
      description: 'Implementation details',
      type: 'foundation',
    },
    {
      slug: 'standards',
      title: 'Accessibility Standards',
      description: 'WCAG guidelines and principles',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['tokens', 'accessibility', 'contrast'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'contrast-tokens-defined',
    label: 'Contrast tokens defined',
    description: 'Color tokens include contrast validation extensions',
    required: true,
  },
  {
    id: 'reduced-motion-tokens',
    label: 'Reduced motion tokens defined',
    description: 'Motion tokens include reduced motion overrides',
    required: true,
  },
  {
    id: 'focus-tokens-defined',
    label: 'Focus tokens defined',
    description: 'Focus state tokens defined with sufficient contrast',
    required: true,
  },
  {
    id: 'touch-target-tokens',
    label: 'Touch target tokens defined',
    description: 'Spacing tokens enforce minimum touch target sizes',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'How do token-level accessibility constraints ensure accessible defaults? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how reduced motion tokens work. Provide a concrete example of implementation.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between strict and flexible contrast validation? How do you balance them?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function AccessibilityTokensPage() {
  return <FoundationPage content={content} />;
}

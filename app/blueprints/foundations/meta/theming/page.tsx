/**
 * Foundation: Theming Strategies
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
  title: 'Theming Strategies',
  description:
    'Explore techniques for supporting dark mode, brand variations, and context-aware styling. Understand alias tokens, layered token architecture, theme inheritance, and multi-brand strategies.',
  slug: 'theming',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/meta/theming',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'theming, dark mode, multi-brand, alias tokens, theme inheritance, token architecture',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'governance'],
    prerequisites: ['tokens', 'atomic-vs-semantic'],
    next_units: ['token-naming', 'system-vs-style'],
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
    expertise: ['Theming', 'Multi-Brand Systems', 'Token Architecture'],
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
    title: 'Why Theming Strategies Matter',
    order: 3,
    content: (
      <>
        <p>
          Effective theming strategies enable your design system to adapt to
          different contexts while maintaining consistency. When systematized
          properly, theming serves multiple critical functions:
        </p>
        <ul>
          <li>
            <strong>Dark Mode Support:</strong> Enables user preference-based
            theming without duplicating component code
          </li>
          <li>
            <strong>Multi-Brand Support:</strong> Same system supports multiple
            brands through theme variations
          </li>
          <li>
            <strong>Context-Aware Styling:</strong> Adapts to different contexts
            (marketing vs. product, consumer vs. enterprise)
          </li>
          <li>
            <strong>User Preferences:</strong> Supports accessibility
            preferences (high contrast, reduced motion)
          </li>
          <li>
            <strong>Rapid Iteration:</strong> Theme changes update all
            components automatically
          </li>
        </ul>
        <p>
          A well-designed theming system treats themes as variations of system
          logic, not overrides. This enables consistency, maintainability, and
          scalability across contexts.
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
        <h3>Alias Tokens and Layered Architecture</h3>
        <p>Theming relies on alias tokens that reference core values:</p>
        <ul>
          <li>
            <strong>Core tokens:</strong> Stable primitives that rarely change
          </li>
          <li>
            <strong>Semantic tokens:</strong> Purpose-driven aliases that enable
            theming
          </li>
          <li>
            <strong>Theme tokens:</strong> Brand-specific or mode-specific
            aliases
          </li>
        </ul>
        <p>
          Layered architecture enables themes without duplicating system logic.
        </p>

        <h3>Mode References: Light/Dark Support</h3>
        <p>
          Mode references enable light/dark theming through token extensions:
        </p>
        <pre>
          <code>{`// Semantic token with mode references
{
  "$type": "color",
  "$value": "{color.palette.neutral.600}",
  "$extensions": {
    "design": {
      "paths": {
        "light": "{color.palette.neutral.600}",
        "dark": "{color.palette.neutral.300}"
      }
    }
  }
}`}</code>
        </pre>
        <p>
          Mode references avoid duplication and keep intent attached to tokens.
        </p>

        <h3>Theme Inheritance</h3>
        <p>Themes inherit from base system logic:</p>
        <ul>
          <li>
            <strong>Base theme:</strong> Default theme that defines system
            structure
          </li>
          <li>
            <strong>Theme overrides:</strong> Brand-specific or mode-specific
            token overrides
          </li>
          <li>
            <strong>Inheritance chain:</strong> Theme → Semantic → Core
          </li>
        </ul>
        <p>
          Inheritance enables themes to override selectively while maintaining
          system structure.
        </p>

        <h3>Multi-Brand Strategies</h3>
        <p>Multi-brand systems use theme layers:</p>
        <ul>
          <li>
            <strong>System layer:</strong> Shared system logic (core tokens,
            constraints)
          </li>
          <li>
            <strong>Brand layer:</strong> Brand-specific style (colors, fonts,
            radius)
          </li>
          <li>
            <strong>Component layer:</strong> Components reference semantic
            tokens, not brand tokens directly
          </li>
        </ul>
        <p>
          Multi-brand strategies enable same components with different brand
          expressions.
        </p>

        <h3>Override Strategies</h3>
        <p>Different override strategies serve different needs:</p>
        <ul>
          <li>
            <strong>Selective override:</strong> Override specific tokens while
            inheriting others
          </li>
          <li>
            <strong>Complete override:</strong> Replace entire semantic layer
            for major brand differences
          </li>
          <li>
            <strong>Platform override:</strong> Override tokens for specific
            platforms (web, iOS, Android)
          </li>
        </ul>
        <p>
          Choose override strategies based on brand divergence and maintenance
          needs.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Theming Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Scalability Impact</h3>
        <p>Effective theming enables scalability:</p>
        <ul>
          <li>
            <strong>Multi-brand support:</strong> Same system supports multiple
            brands through themes
          </li>
          <li>
            <strong>Platform adaptation:</strong> Themes adapt to different
            platforms without code duplication
          </li>
          <li>
            <strong>Context adaptation:</strong> Themes adapt to different
            contexts (marketing vs. product)
          </li>
        </ul>
        <p>
          Scalable theming enables systems to serve multiple brands and contexts
          efficiently.
        </p>

        <h3>User Experience Impact</h3>
        <p>Theming improves user experience:</p>
        <ul>
          <li>
            <strong>User preferences:</strong> Dark mode and high contrast
            themes support user preferences
          </li>
          <li>
            <strong>Accessibility:</strong> Themes can enhance accessibility
            (high contrast, larger text)
          </li>
          <li>
            <strong>Brand consistency:</strong> Themes maintain brand identity
            across contexts
          </li>
        </ul>
        <p>
          User experience benefits from flexible theming that adapts to user
          needs.
        </p>

        <h3>Maintainability Impact</h3>
        <p>Well-structured theming improves maintainability:</p>
        <ul>
          <li>
            <strong>Single source of truth:</strong> Themes reference core
            tokens, not duplicate them
          </li>
          <li>
            <strong>Change propagation:</strong> Core token changes propagate to
            all themes
          </li>
          <li>
            <strong>Selective updates:</strong> Theme-specific changes only
            affect that theme
          </li>
        </ul>
        <p>
          Maintainable theming enables rapid iteration while maintaining
          consistency.
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
          Theming bridges design intent and code implementation. Let's examine
          how theming systems translate from design specifications to working
          code.
        </p>

        <h3>Mode References: Light/Dark Theming</h3>
        <p>Mode references enable light/dark theming:</p>
        <pre>
          <code>{`// Semantic token with mode references
{
  "$type": "color",
  "$value": "{color.palette.neutral.600}",
  "$extensions": {
    "design": {
      "paths": {
        "light": "{color.palette.neutral.600}",
        "dark": "{color.palette.neutral.300}"
      }
    }
  }
}

// Generated CSS with mode support
:root {
  --semantic-color-foreground-primary: var(--color-palette-neutral-600);
}

@media (prefers-color-scheme: dark) {
  :root {
    --semantic-color-foreground-primary: var(--color-palette-neutral-300);
  }
}

[data-theme="dark"] {
  --semantic-color-foreground-primary: var(--color-palette-neutral-300);
}`}</code>
        </pre>

        <h3>Multi-Brand Theming</h3>
        <p>Multi-brand systems use theme layers:</p>
        <pre>
          <code>{`// System layer: Core tokens (shared)
{
  "core": {
    "color": {
      "palette": {
        "blue": { "600": "#2563eb" },
        "green": { "600": "#059669" }
      }
    }
  }
}

// Brand A: Professional
{
  "semantic": {
    "color": {
      "brand": {
        "primary": "{core.color.palette.blue.600}"
      }
    }
  }
}

// Brand B: Playful
{
  "semantic": {
    "color": {
      "brand": {
        "primary": "{core.color.palette.green.600}"
      }
    }
  }
}

// Components reference semantic tokens
.button {
  background: var(--semantic-color-brand-primary);
  // Brand A: blue, Brand B: green
}`}</code>
        </pre>

        <h3>Theme Composition</h3>
        <p>Themes compose from multiple sources:</p>
        <pre>
          <code>{`// Base theme: Default values
{
  "base": {
    "color": {
      "foreground": {
        "primary": "{core.color.palette.neutral.900}"
      }
    }
  }
}

// Brand theme: Brand-specific overrides
{
  "brand": {
    "color": {
      "foreground": {
        "primary": "{core.color.palette.blue.600}"
      }
    }
  }
}

// Mode theme: Dark mode overrides
{
  "dark": {
    "color": {
      "foreground": {
        "primary": "{core.color.palette.neutral.100}"
      }
    }
  }
}

// Composition: Merge themes in order
// base → brand → mode
// Later themes override earlier themes`}</code>
        </pre>

        <h3>Runtime Theme Switching</h3>
        <p>Runtime theme switching enables user preferences:</p>
        <pre>
          <code>{`// Theme switching implementation
function setTheme(theme: 'light' | 'dark') {
  document.documentElement.setAttribute('data-theme', theme);
  
  // CSS variables automatically update
  // Components don't need to change
}

// CSS responds to data-theme attribute
[data-theme="dark"] {
  --semantic-color-foreground-primary: var(--color-palette-neutral-300);
  --semantic-color-background-surface: var(--color-palette-neutral-900);
}

// Components use semantic tokens
.button {
  color: var(--semantic-color-foreground-primary);
  background: var(--semantic-color-background-surface);
  // Automatically adapts to theme
}`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-structured theming system enables both consistency and
          flexibility. Components reference semantic tokens, not theme tokens
          directly. Themes override semantic tokens selectively. When themes
          change, components adapt automatically. This is theming as
          infrastructure: built-in adaptability, not manual overrides.
        </p>
        <p>
          Understanding theming strategies helps practitioners build systems
          that support multiple brands, modes, and contexts while maintaining
          consistency.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Building a Multi-Brand Dark Mode System',
    order: 7,
    content: (
      <>
        <p>
          Let's build a theming system that supports multiple brands and dark
          mode:
        </p>

        <h3>Step 1: Define Core Tokens</h3>
        <p>Create stable core tokens that all brands share:</p>
        <pre>
          <code>{`// Core tokens: Shared across all brands
{
  "core": {
    "color": {
      "palette": {
        "blue": {
          "600": "#2563eb",
          "400": "#60a5fa"
        },
        "green": {
          "600": "#059669",
          "400": "#34d399"
        },
        "neutral": {
          "100": "#f3f4f6",
          "300": "#d1d5db",
          "600": "#4b5563",
          "900": "#111827"
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 2: Create Semantic Tokens with Mode References</h3>
        <p>Build semantic tokens that support both light and dark modes:</p>
        <pre>
          <code>{`// Semantic tokens with mode references
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": {
          "$value": "{core.color.palette.neutral.900}",
          "$extensions": {
            "design": {
              "paths": {
                "light": "{core.color.palette.neutral.900}",
                "dark": "{core.color.palette.neutral.100}"
              }
            }
          }
        }
      },
      "background": {
        "surface": {
          "$value": "{core.color.palette.neutral.100}",
          "$extensions": {
            "design": {
              "paths": {
                "light": "{core.color.palette.neutral.100}",
                "dark": "{core.color.palette.neutral.900}"
              }
            }
          }
        }
      },
      "brand": {
        "primary": {
          "$value": "{core.color.palette.blue.600}",
          "$extensions": {
            "design": {
              "paths": {
                "light": "{core.color.palette.blue.600}",
                "dark": "{core.color.palette.blue.400}"
              }
            }
          }
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 3: Create Brand-Specific Overrides</h3>
        <p>Create brand themes that override semantic tokens:</p>
        <pre>
          <code>{`// Brand A: Professional (blue)
{
  "brand": {
    "color": {
      "brand": {
        "primary": "{core.color.palette.blue.600}"
      }
    }
  }
}

// Brand B: Playful (green)
{
  "brand": {
    "color": {
      "brand": {
        "primary": "{core.color.palette.green.600}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 4: Runtime Theme Application</h3>
        <p>Apply themes at runtime:</p>
        <pre>
          <code>{`// Theme application function
function applyTheme(brand: string, mode: 'light' | 'dark') {
  // Load base tokens
  const baseTokens = loadTokens('core');
  
  // Load semantic tokens with mode resolution
  const semanticTokens = loadTokens('semantic', { mode });
  
  // Load brand-specific overrides
  const brandTokens = loadTokens(\`brands/\${brand}\`);
  
  // Compose: base → semantic → brand
  const theme = composeTokens(baseTokens, semanticTokens, brandTokens);
  
  // Apply to CSS variables
  applyToCSS(theme);
  
  // Set data attribute for CSS selectors
  document.documentElement.setAttribute('data-theme', mode);
  document.documentElement.setAttribute('data-brand', brand);
}

// Usage
applyTheme('brand-a', 'light');  // Blue, light mode
applyTheme('brand-a', 'dark');   // Blue, dark mode
applyTheme('brand-b', 'light');  // Green, light mode`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Multi-brand:</strong> Same system supports multiple brands
          </li>
          <li>
            <strong>Dark mode:</strong> Automatic dark mode support through mode
            references
          </li>
          <li>
            <strong>Maintainability:</strong> Core changes propagate to all
            themes
          </li>
          <li>
            <strong>Flexibility:</strong> Brands can override selectively
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
        <p>Theming systems face several challenges:</p>

        <h4>Theme Proliferation</h4>
        <p>Too many themes create maintenance overhead:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Custom themes for every context increase
            complexity
          </li>
          <li>
            <strong>Solution:</strong> Limit theme count, use composition, share
            themes across contexts
          </li>
          <li>
            <strong>Guideline:</strong> Create themes only when necessary for
            brand or mode differences
          </li>
        </ul>

        <h4>Performance: Large Theme Files</h4>
        <p>Large theme files can impact performance:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Loading large theme files increases
            bundle size
          </li>
          <li>
            <strong>Approach:</strong> Use mode references instead of separate
            files when possible, lazy-load themes
          </li>
          <li>
            <strong>Tradeoff:</strong> Composition complexity vs. bundle size
          </li>
        </ul>

        <h4>Platform Differences</h4>
        <p>Themes may need platform-specific overrides:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> iOS, Android, and web platforms have
            different capabilities
          </li>
          <li>
            <strong>Approach:</strong> Use platform-specific theme overrides,
            maintain consistent visual appearance
          </li>
          <li>
            <strong>Tradeoff:</strong> Platform-specific tokens add complexity
            but improve consistency
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>Theming strategies involve several tradeoffs:</p>

        <h4>Mode References vs. Explicit Mode Files</h4>
        <ul>
          <li>
            <strong>Mode references:</strong> Less duplication, clearer intent,
            but requires runtime resolution
          </li>
          <li>
            <strong>Explicit mode files:</strong> Faster performance, simpler
            resolution, but more duplication
          </li>
          <li>
            <strong>Best practice:</strong> Use mode references for most cases,
            explicit files for performance-critical themes
          </li>
        </ul>

        <h4>Pre-Composed vs. Runtime Composition</h4>
        <ul>
          <li>
            <strong>Pre-composed themes:</strong> Faster runtime, simpler code,
            but more build-time complexity
          </li>
          <li>
            <strong>Runtime composition:</strong> More flexible, less
            duplication, but slower runtime
          </li>
          <li>
            <strong>Best practice:</strong> Pre-compose for production, runtime
            compose for development
          </li>
        </ul>

        <h4>Selective vs. Complete Override</h4>
        <ul>
          <li>
            <strong>Selective override:</strong> Less duplication, easier to
            maintain, but requires careful inheritance
          </li>
          <li>
            <strong>Complete override:</strong> More control, clearer
            separation, but more duplication
          </li>
          <li>
            <strong>Best practice:</strong> Use selective override for minor
            differences, complete override for major divergences
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
        <p>Continue learning about theming:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            Foundation of token systems
          </li>
          <li>
            <Link href="/blueprints/foundations/tokens/theming">
              Theming & Modes
            </Link>
            : Implementation details of theming
          </li>
          <li>
            <Link href="/blueprints/foundations/meta/system-vs-style">
              System vs Style
            </Link>
            : How system logic enables style expression
          </li>
          <li>
            <Link href="/blueprints/foundations/meta/atomic-vs-semantic">
              Atomic vs Semantic Tokens
            </Link>
            : How token architecture supports theming
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#theming">Theming</Link>,{' '}
          <Link href="/blueprints/glossary#tokens">Design Tokens</Link>,{' '}
          <Link href="/blueprints/glossary#brand">Brand</Link>
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
      slug: 'theming',
      title: 'Theming & Modes',
      description: 'Implementation details of theming',
      type: 'foundation',
    },
    {
      slug: 'system-vs-style',
      title: 'System vs Style',
      description: 'How system logic enables style expression',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['theming', 'tokens', 'brand'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'mode-references-defined',
    label: 'Mode references defined',
    description: 'Semantic tokens include mode references for light/dark',
    required: true,
  },
  {
    id: 'theme-inheritance-clear',
    label: 'Theme inheritance clear',
    description: 'Theme inheritance chain is clearly defined',
    required: true,
  },
  {
    id: 'override-strategy-defined',
    label: 'Override strategy defined',
    description: 'Strategy for theme overrides is defined',
    required: true,
  },
  {
    id: 'runtime-theming-supported',
    label: 'Runtime theming supported',
    description: 'Runtime theme switching is supported',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you use mode references versus explicit mode files? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how theming enables multi-brand systems. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between pre-composed and runtime-composed themes? When would you choose each approach?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function ThemingPage() {
  return <FoundationPage content={content} />;
}

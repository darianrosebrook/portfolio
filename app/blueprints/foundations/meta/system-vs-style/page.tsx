/**
 * Foundation: System vs Style
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
  title: 'System vs Style',
  description:
    'Learn how to balance foundational system logic with brand style layers for scalable, unique design systems. Understand how system principles enable style expression.',
  slug: 'system-vs-style',
  canonicalUrl:
    'https://darianrosebrook.com/blueprints/foundations/meta/system-vs-style',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords:
    'system logic, style, brand expression, foundational thinking, token architecture',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering', 'governance'],
    prerequisites: ['tokens', 'philosophy'],
    next_units: ['theming', 'atomic-vs-semantic'],
    assessment_required: false,
    estimated_reading_time: 15,
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
    expertise: ['Systems Thinking', 'Brand Strategy', 'Token Architecture'],
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
    title: 'Why System vs Style Matters',
    order: 3,
    content: (
      <>
        <p>
          A successful design system balances foundational system logic with
          brand style layers. This distinction elevates foundational thinking
          above aesthetic layering, enabling systems that scale effectively
          while preserving brand identity. Understanding this balance serves
          multiple critical functions:
        </p>
        <ul>
          <li>
            <strong>Scalability:</strong> System logic provides structure that
            enables style expression without breaking consistency
          </li>
          <li>
            <strong>Maintainability:</strong> Separating system from style makes
            it clear what changes require system updates vs. style updates
          </li>
          <li>
            <strong>Brand Expression:</strong> Style layers enable unique brand
            personality within system constraints
          </li>
          <li>
            <strong>Team Autonomy:</strong> Clear boundaries enable teams to
            express style within system rules
          </li>
          <li>
            <strong>Evolvability:</strong> System logic evolves slowly; style
            can evolve more rapidly
          </li>
        </ul>
        <p>
          A well-designed system treats style as a manifestation of system
          principles, not an override of them. This enables both consistency and
          creativity.
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
        <h3>System Logic: The Foundation</h3>
        <p>
          System logic encompasses the foundational principles that drive design
          decisions:
        </p>
        <ul>
          <li>
            <strong>Foundational tokens:</strong> Core primitives (palette
            ramps, spacing scales, type scales) that rarely change
          </li>
          <li>
            <strong>Constraints:</strong> Rules that govern system behavior
            (accessibility requirements, minimum sizes, contrast ratios)
          </li>
          <li>
            <strong>Invariants:</strong> Properties that must always be true
            (touch targets ≥ 44px, contrast ratios meet WCAG)
          </li>
          <li>
            <strong>Architecture:</strong> Structural decisions (token layers,
            component layers, composition patterns)
          </li>
          <li>
            <strong>Governance:</strong> Decision-making processes and
            boundaries
          </li>
        </ul>
        <p>
          System logic is stable, structural, and enables style expression
          rather than constraining it.
        </p>

        <h3>Style: The Expression Layer</h3>
        <p>Style encompasses brand expression and visual personality:</p>
        <ul>
          <li>
            <strong>Brand tokens:</strong> Values that express brand personality
            (specific colors, radius values, motion curves)
          </li>
          <li>
            <strong>Visual language:</strong> Aesthetic choices (rounded vs.
            sharp corners, bold vs. subtle shadows)
          </li>
          <li>
            <strong>Expression:</strong> Creative choices within system
            constraints
          </li>
          <li>
            <strong>Personality:</strong> Emotional tone and brand character
          </li>
        </ul>
        <p>
          Style is expressive, brand-specific, and operates within system
          constraints.
        </p>

        <h3>The Relationship</h3>
        <p>System logic enables style expression:</p>
        <ul>
          <li>
            <strong>System provides structure:</strong> Token architecture,
            component layers, constraints
          </li>
          <li>
            <strong>Style expresses within structure:</strong> Brand colors,
            visual personality, creative choices
          </li>
          <li>
            <strong>Style doesn't override system:</strong> Style operates
            within system boundaries
          </li>
          <li>
            <strong>System evolves slowly:</strong> System changes require
            careful consideration
          </li>
          <li>
            <strong>Style evolves more rapidly:</strong> Style can adapt to
            brand needs
          </li>
        </ul>
        <p>
          Understanding this relationship helps teams make decisions about where
          to invest effort and what can change independently.
        </p>

        <h3>Token Architecture: System Enables Style</h3>
        <p>Token architecture demonstrates how system enables style:</p>
        <pre>
          <code>{`// System Layer: Core primitives (stable, structural)
{
  "core": {
    "color": {
      "palette": {
        "blue": {
          "500": "#3b82f6",
          "600": "#2563eb"
        }
      }
    }
  }
}

// Style Layer: Brand expression (expressive, changeable)
{
  "semantic": {
    "color": {
      "brand": {
        "primary": "{core.color.palette.blue.600}"  // Brand A uses blue
      }
    }
  }
}

// Different brand, same system
{
  "semantic": {
    "color": {
      "brand": {
        "primary": "{core.color.palette.green.600}"  // Brand B uses green
      }
    }
  }
}

// System structure stays the same
// Style expression changes per brand`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How System vs Style Shapes System Success',
    order: 5,
    content: (
      <>
        <h3>Scalability Impact</h3>
        <p>Clear system/style separation enables scalability:</p>
        <ul>
          <li>
            <strong>Multi-brand support:</strong> System logic supports multiple
            brands through style layers
          </li>
          <li>
            <strong>Consistent structure:</strong> System logic ensures
            consistent structure across brands
          </li>
          <li>
            <strong>Style independence:</strong> Style can evolve without
            breaking system logic
          </li>
        </ul>
        <p>
          Scalable systems separate structure from expression, enabling both
          consistency and flexibility.
        </p>

        <h3>Maintainability Impact</h3>
        <p>Separating system from style improves maintainability:</p>
        <ul>
          <li>
            <strong>Change clarity:</strong> System changes require careful
            consideration; style changes can be more rapid
          </li>
          <li>
            <strong>Impact assessment:</strong> System changes affect all
            brands; style changes affect one brand
          </li>
          <li>
            <strong>Debt management:</strong> System debt is structural; style
            debt is aesthetic
          </li>
        </ul>
        <p>
          Maintainability ensures systems can evolve without breaking existing
          implementations.
        </p>

        <h3>Team Autonomy Impact</h3>
        <p>Clear boundaries enable team autonomy:</p>
        <ul>
          <li>
            <strong>System team:</strong> Owns system logic, foundational
            tokens, constraints
          </li>
          <li>
            <strong>Brand teams:</strong> Own style expression, brand tokens,
            visual personality
          </li>
          <li>
            <strong>Product teams:</strong> Compose solutions within system
            boundaries
          </li>
        </ul>
        <p>
          Team autonomy enables parallel work while maintaining system
          coherence.
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
          The system vs style distinction plays out differently in design tools
          versus code. Understanding this helps teams work effectively across
          both domains.
        </p>

        <h3>Design: System Logic in Figma</h3>
        <p>Design tools express system logic through:</p>
        <ul>
          <li>
            <strong>Component structure:</strong> How components are organized
            and composed
          </li>
          <li>
            <strong>Token variables:</strong> Core tokens that define system
            structure
          </li>
          <li>
            <strong>Constraints:</strong> Rules that govern component usage
          </li>
        </ul>
        <pre>
          <code>{`// Figma: System logic expressed through structure
Component Library
├── Primitives (Button, Input, Icon)
│   ├── Structure: Stable, accessible
│   └── Tokens: Core primitives
├── Compounds (TextField, Card)
│   ├── Structure: Composed from primitives
│   └── Tokens: Semantic tokens
└── Style Layer
    ├── Brand A: Blue primary, rounded corners
    └── Brand B: Green primary, sharp corners`}</code>
        </pre>

        <h3>Code: System Logic in Tokens</h3>
        <p>Code expresses system logic through token architecture:</p>
        <pre>
          <code>{`// System Layer: Core primitives (stable)
{
  "core": {
    "color": {
      "palette": {
        "blue": {
          "500": "#3b82f6",
          "600": "#2563eb"
        },
        "green": {
          "500": "#10b981",
          "600": "#059669"
        }
      }
    },
    "spacing": {
      "size": {
        "04": "8px",
        "06": "16px"
      }
    }
  }
}

// Style Layer: Brand expression (changeable)
{
  "semantic": {
    "color": {
      "brand": {
        "primary": "{core.color.palette.blue.600}"  // Brand A
      }
    },
    "spacing": {
      "padding": {
        "container": "{core.spacing.size.06}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Multi-Brand Example</h3>
        <p>Same system logic, different style expression:</p>
        <pre>
          <code>{`// Brand A: Professional, corporate
{
  "semantic": {
    "color": {
      "brand": {
        "primary": "{core.color.palette.blue.600}"
      }
    },
    "shape": {
      "radius": {
        "default": "{shape.radius.02}"  // Subtle rounding
      }
    }
  }
}

// Brand B: Playful, consumer
{
  "semantic": {
    "color": {
      "brand": {
        "primary": "{core.color.palette.green.600}"
      }
    },
    "shape": {
      "radius": {
        "default": "{shape.radius.04}"  // More rounding
      }
    }
  }
}

// System structure (core tokens) stays the same
// Style expression (semantic tokens) changes per brand`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          A well-separated system/style architecture enables both consistency
          and creativity. System logic provides structure that teams can rely
          on. Style layers enable brand expression within that structure. When
          brands need to evolve, style layers adapt without breaking system
          logic. This is system vs style as infrastructure: built-in
          flexibility, not rigid constraints.
        </p>
        <p>
          Understanding the system vs style distinction helps practitioners
          build systems that scale to multiple brands, maintain consistency, and
          enable creative expression.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Multi-Brand System',
    order: 7,
    content: (
      <>
        <p>
          Let's build a multi-brand system that demonstrates system vs style
          separation:
        </p>

        <h3>Step 1: Define System Logic</h3>
        <p>Create stable system logic that all brands share:</p>
        <pre>
          <code>{`// System Layer: Core primitives (stable)
{
  "core": {
    "color": {
      "palette": {
        "blue": {
          "500": "#3b82f6",
          "600": "#2563eb"
        },
        "green": {
          "500": "#10b981",
          "600": "#059669"
        },
        "neutral": {
          "50": "#f9fafb",
          "900": "#111827"
        }
      }
    },
    "spacing": {
      "size": {
        "04": "8px",
        "06": "16px"
      }
    },
    "shape": {
      "radius": {
        "02": "4px",
        "04": "16px"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 2: Create Style Layers</h3>
        <p>Create brand-specific style layers:</p>
        <pre>
          <code>{`// Brand A: Professional, corporate
{
  "semantic": {
    "color": {
      "brand": {
        "primary": "{core.color.palette.blue.600}"
      }
    },
    "shape": {
      "radius": {
        "default": "{shape.radius.02}"  // Subtle
      }
    }
  }
}

// Brand B: Playful, consumer
{
  "semantic": {
    "color": {
      "brand": {
        "primary": "{core.color.palette.green.600}"
      }
    },
    "shape": {
      "radius": {
        "default": "{shape.radius.04}"  // More rounded
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 3: Components Use Style Layer</h3>
        <p>Components reference style layer, not system layer:</p>
        <pre>
          <code>{`// Button component uses semantic tokens
.button {
  background: var(--semantic-color-brand-primary);
  border-radius: var(--semantic-shape-radius-default);
}

// Brand A: Blue, subtle rounding
// Brand B: Green, more rounding
// Same component code, different style expression`}</code>
        </pre>

        <h3>Benefits of This Approach</h3>
        <ul>
          <li>
            <strong>Multi-brand support:</strong> Same system supports multiple
            brands
          </li>
          <li>
            <strong>Consistent structure:</strong> All brands share system logic
          </li>
          <li>
            <strong>Style independence:</strong> Brands can evolve style
            independently
          </li>
          <li>
            <strong>System stability:</strong> System changes benefit all brands
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
        <p>System vs style separation faces several challenges:</p>

        <h4>System Rigidity</h4>
        <p>Over-constraining system logic can limit expression:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Too many system constraints prevent brand
            expression
          </li>
          <li>
            <strong>Solution:</strong> Constrain only what's necessary for
            consistency, allow flexibility for expression
          </li>
          <li>
            <strong>Guideline:</strong> Constrain structure, not expression
          </li>
        </ul>

        <h4>Style Divergence</h4>
        <p>Style layers can drift from system logic:</p>
        <ul>
          <li>
            <strong>Problem:</strong> Brand teams may bypass system logic to
            achieve style goals
          </li>
          <li>
            <strong>Solution:</strong> Clear governance, automated validation,
            regular audits
          </li>
          <li>
            <strong>Approach:</strong> Enable style expression within system
            boundaries
          </li>
        </ul>

        <h4>Balancing Flexibility with Constraints</h4>
        <p>Finding the right balance is difficult:</p>
        <ul>
          <li>
            <strong>Challenge:</strong> Too much flexibility reduces
            consistency; too many constraints reduce expression
          </li>
          <li>
            <strong>Approach:</strong> Constrain structure, allow style
            expression, validate compliance
          </li>
          <li>
            <strong>Tradeoff:</strong> Consistency vs. expression
          </li>
        </ul>

        <h3>Tradeoffs</h3>
        <p>System vs style separation involves several tradeoffs:</p>

        <h4>System-Heavy vs. Style-Heavy</h4>
        <ul>
          <li>
            <strong>System-heavy:</strong> More constraints, better consistency,
            but less expression
          </li>
          <li>
            <strong>Style-heavy:</strong> More expression, but harder to
            maintain consistency
          </li>
          <li>
            <strong>Best practice:</strong> Balance—constrain structure, enable
            style expression
          </li>
        </ul>

        <h4>Single Brand vs. Multi-Brand</h4>
        <ul>
          <li>
            <strong>Single brand:</strong> Less separation needed, simpler
            system
          </li>
          <li>
            <strong>Multi-brand:</strong> Clear separation essential, more
            complex system
          </li>
          <li>
            <strong>Best practice:</strong> Design for multi-brand even if
            single brand today
          </li>
        </ul>

        <h4>Stability vs. Evolution</h4>
        <ul>
          <li>
            <strong>System stability:</strong> System changes require careful
            consideration
          </li>
          <li>
            <strong>Style evolution:</strong> Style can evolve more rapidly
          </li>
          <li>
            <strong>Best practice:</strong> System evolves slowly, style evolves
            more rapidly
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
        <p>Continue learning about system vs style:</p>
        <ul>
          <li>
            <Link href="/blueprints/foundations/philosophy">Philosophy</Link>:
            Foundational thinking about design systems
          </li>
          <li>
            <Link href="/blueprints/foundations/tokens">Design Tokens</Link>:
            How tokens structure system vs style
          </li>
          <li>
            <Link href="/blueprints/foundations/meta/theming">
              Theming Strategies
            </Link>
            : How theming enables style expression
          </li>
          <li>
            <Link href="/blueprints/foundations/meta/atomic-vs-semantic">
              Atomic vs Semantic Tokens
            </Link>
            : How token architecture supports system vs style
          </li>
        </ul>
        <p>
          Related glossary terms:{' '}
          <Link href="/blueprints/glossary#system">System</Link>,{' '}
          <Link href="/blueprints/glossary#brand">Brand</Link>,{' '}
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
      slug: 'philosophy',
      title: 'Philosophy',
      description: 'Foundational thinking about design systems',
      type: 'foundation',
    },
    {
      slug: 'tokens',
      title: 'Design Tokens',
      description: 'How tokens structure system vs style',
      type: 'foundation',
    },
    {
      slug: 'theming',
      title: 'Theming Strategies',
      description: 'How theming enables style expression',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['system', 'brand', 'tokens'],
};

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'system-logic-defined',
    label: 'System logic defined',
    description:
      'Foundational system logic (tokens, constraints) is clearly defined',
    required: true,
  },
  {
    id: 'style-layer-defined',
    label: 'Style layer defined',
    description:
      'Style expression layer is clearly separated from system logic',
    required: true,
  },
  {
    id: 'boundaries-clear',
    label: 'Boundaries clear',
    description: 'Clear boundaries between system logic and style expression',
    required: true,
  },
  {
    id: 'governance-defined',
    label: 'Governance defined',
    description: 'Governance processes for system vs style changes are defined',
    required: true,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should a design decision be part of system logic versus style expression? Provide examples.',
    type: 'reflection',
  },
  {
    question:
      'Explain how system vs style separation enables multi-brand systems. Provide a concrete example.',
    type: 'application',
  },
  {
    question:
      'What are the tradeoffs between system-heavy and style-heavy approaches? How do you balance them?',
    type: 'reflection',
  },
];

export const metadata = generateFoundationMetadata(pageMetadata);

export default function SystemVsStylePage() {
  return <FoundationPage content={content} />;
}

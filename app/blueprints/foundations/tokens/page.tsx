/**
 * Foundation: Design Tokens
 * Enhanced with new educational template structure
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
  title: 'Design Tokens Foundations',
  description:
    'Design tokens are the language that allows designers and developers to describe decisions in a way that scales across time, platforms, and brands. Learn how tokens transform repeating decisions into a durable vocabulary.',
  slug: 'tokens',
  canonicalUrl: 'https://darianrosebrook.com/blueprints/foundations/tokens',
  published_at: new Date().toISOString(),
  modified_at: new Date().toISOString(),
  image: 'https://darianrosebrook.com/darianrosebrook.jpg',
  keywords: 'design tokens, tokens, semantic tokens, core tokens, theming',
  learning: {
    learning_level: 'foundation',
    role_relevance: ['design', 'engineering'],
    prerequisites: ['philosophy'],
    next_units: ['color', 'spacing'],
    assessment_required: false,
    estimated_reading_time: 20,
  },
  governance: {
    canonical_version: 'Token Architecture v3',
    alignment_status: 'aligned',
    last_review_date: new Date().toISOString(),
    next_review_date: new Date(
      Date.now() + 90 * 24 * 60 * 60 * 1000
    ).toISOString(),
  },
  author: {
    name: 'Darian Rosebrook',
    role: 'Staff Design Technologist, Design Systems Architect',
    expertise: ['Design Tokens', 'Design Systems', 'Token Architecture'],
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
    title: 'Why Tokens Matter',
    order: 3,
    content: (
      <>
        <p>
          Design tokens are more than variables. They are the language that
          allows designers and developers to describe decisions in a way that
          scales across time, platforms, and brands. When a system reaches a
          certain level of maturity, repeating decisions—what shade of neutral
          to use, what radius applies to a control, how long a motion easing
          should last— becomes a liability. Tokens transform those repeating
          decisions into a durable vocabulary. They are not the design itself,
          but the encoded reference points from which design can be consistently
          rebuilt, audited, and evolved.
        </p>
        <p>
          At their best, tokens are design memory. They capture past agreements
          so that every new contributor does not have to renegotiate basic
          choices. They also create an explicit surface for governance: when the
          system grows, we can ask whether a token still serves its purpose,
          whether its role is overloaded, or whether a new token is required.
          This provides a check against entropy. Rather than drifting into a
          patchwork of arbitrary overrides, the system evolves deliberately,
          with every token a stake in the ground for future reflection.
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
        <h3>The Layered Model</h3>
        <p>
          Our philosophy of tokens follows a layered approach. Each layer has a
          different degree of stability and serves a different audience:
        </p>
        <p>
          The <strong>core layer</strong> contains primitives—the building
          blocks like palette scales, spacing increments, type ramps, and motion
          durations. These rarely change across brands or products; they are the
          physics of our system.
        </p>
        <p>
          On top of this sits the <strong>semantic layer</strong>. Here tokens
          are given roles: foreground and background colors, states like danger
          or success, control sizes, or motion behaviors for interaction. This
          is the theming surface, where core values are aliased into meaningful
          roles. This layer is where brands diverge, where accessibility
          constraints are enforced, and where most product designers interact
          with the system.
        </p>
        <p>
          Finally, there is an optional <strong>component layer</strong>. Here
          tokens are applied to anatomy—button backgrounds, card shadows, input
          borders. These tokens alias back to semantic roles but give component
          teams a stable handle for customization without breaking the semantic
          contract.
        </p>

        <h3>Token Contract Model</h3>
        <p>
          We treat tokens as a contract. That contract binds our design
          intentions, our accessibility standards, and our engineering
          implementation together. It means that when a designer specifies{' '}
          <code>semantic.color.foreground.primary</code>, they are not picking a
          hex value, they are invoking a decision about hierarchy, contrast, and
          brand expression that has already been vetted. The token itself is not
          static: it can be remapped to a different palette entry, or tuned for
          light and dark modes, but its role and intent remain constant.
        </p>

        <h3>Aliases Over Duplication</h3>
        <p>
          Aliases are favored over duplication, because a single value of truth
          strengthens the contract. When you reference{' '}
          <code>{'{core.spacing.size.04}'}</code> rather than copying{' '}
          <code>8px</code>, you create a dependency that ensures consistency. If
          the base spacing scale changes, all aliases update automatically.
        </p>
      </>
    ),
  },
  {
    type: 'system-roles',
    id: 'system-roles',
    title: 'System Roles: How Tokens Shape System Success',
    order: 5,
    content: (
      <>
        <h3>Accessibility Impact</h3>
        <p>
          Tokens encode accessibility constraints at the lowest level. Contrast
          ratios, minimum touch target sizes, and motion preferences are built
          into token definitions. This means accessibility is enforced by
          design, not added as an afterthought.
        </p>

        <h3>Consistency Impact</h3>
        <p>
          Without tokens, a change to a brand color or a type ramp requires
          hunting down dozens of places where the same decision was repeated.
          With tokens, a single alias change cascades predictably across the
          system. What tokens offer is not just efficiency but a structural
          guarantee of consistency.
        </p>

        <h3>Governance Impact</h3>
        <p>
          Tokens create an explicit surface for governance. When the system
          grows, we can ask whether a token still serves its purpose, whether
          its role is overloaded, or whether a new token is required. This
          provides a check against entropy and enables deliberate evolution.
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
          Tokens bridge the gap between design intent and engineering
          implementation. Designers author tokens in tools like Figma or Tokens
          Studio. Developers consume tokens through generated CSS variables,
          SCSS modules, or TypeScript types. The same token serves both
          audiences, maintaining parity between design and code.
        </p>

        <h3>Token Architecture: Core → Semantic → Component</h3>
        <p>
          Tokens flow through three layers, each serving a different purpose and
          audience. Understanding this flow is essential for deep comprehension.
        </p>

        <p>
          <strong>Core Layer:</strong> Primitive values that rarely change
        </p>
        <pre>
          <code>{`// Core tokens: raw values, the physics of the system
{
  "core": {
    "spacing": {
      "size": {
        "02": "4px",
        "03": "6px",
        "04": "8px",
        "05": "12px",
        "06": "16px"
      }
    },
    "color": {
      "blue": {
        "500": "#3b82f6",
        "600": "#2563eb"
      }
    }
  }
}`}</code>
        </pre>

        <p>
          <strong>Semantic Layer:</strong> Purpose-driven aliases that enable
          theming
        </p>
        <pre>
          <code>{`// Semantic tokens: aliases that describe purpose
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": "{core.color.blue.600}",
        "secondary": "{core.color.gray.600}"
      },
      "background": {
        "primary": "{core.color.white}",
        "secondary": "{core.color.gray.50}"
      }
    },
    "spacing": {
      "gap": {
        "default": "{core.spacing.size.04}",
        "tight": "{core.spacing.size.02}",
        "loose": "{core.spacing.size.06}"
      }
    }
  }
}`}</code>
        </pre>

        <p>
          <strong>Component Layer:</strong> Component-specific tokens that alias
          back to semantics
        </p>
        <pre>
          <code>{`// Component tokens: component anatomy, aliases to semantic
{
  "prefix": "button",
  "tokens": {
    "color": {
      "background": {
        "default": "{semantic.color.action.background.primary.default}",
        "hover": "{semantic.interaction.background.hover}",
        "disabled": "{semantic.color.action.background.primary.disabled}"
      },
      "foreground": {
        "default": "{semantic.color.foreground.inverse}",
        "disabled": "{semantic.color.foreground.disabled}"
      }
    },
    "size": {
      "gap": {
        "default": "{core.spacing.size.04}",
        "small": "{core.spacing.size.03}"
      },
      "padding": {
        "small": "{core.spacing.size.03}",
        "large": "{core.spacing.size.05}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Transformation Pipeline: From JSON to CSS</h3>
        <p>
          The build process transforms token JSON into CSS variables that
          components can use. Here's how it works:
        </p>

        <p>
          <strong>Step 1: Reference Resolution</strong>
        </p>
        <pre>
          <code>{`// Token references like {semantic.color.foreground.primary}
// are resolved to CSS variable references

Input:  "{semantic.color.foreground.primary}"
Output: "var(--semantic-color-foreground-primary)"

// The resolver walks the token tree, resolving each reference
// This creates a dependency chain: component → semantic → core`}</code>
        </pre>

        <p>
          <strong>Step 2: CSS Variable Generation</strong>
        </p>
        <pre>
          <code>{`// Component tokens generate scoped CSS variables
// Button.tokens.json → Button.module.scss

:root {
  --button-color-background-default: var(--semantic-color-action-background-primary-default);
  --button-color-background-hover: var(--semantic-interaction-background-hover);
  --button-color-foreground-default: var(--semantic-color-foreground-inverse);
  --button-size-gap-default: var(--core-spacing-size-04);
  --button-size-padding-small: var(--core-spacing-size-03);
}

// Component SCSS uses these variables
.button {
  background: var(--button-color-background-default);
  color: var(--button-color-foreground-default);
  gap: var(--button-size-gap-default);
  padding: var(--button-size-padding-small);
  
  &:hover {
    background: var(--button-color-background-hover);
  }
}`}</code>
        </pre>

        <h3>Theming in Action</h3>
        <p>
          Because semantic tokens reference core values, changing themes is as
          simple as reassigning core values. The semantic layer acts as an
          abstraction that enables dynamic theming:
        </p>

        <pre>
          <code>{`// Light theme: semantic tokens reference light core values
:root {
  --semantic-color-foreground-primary: var(--core-color-gray-900);
  --semantic-color-background-primary: var(--core-color-white);
}

// Dark theme: semantic tokens reference dark core values
.dark {
  --semantic-color-foreground-primary: var(--core-color-gray-100);
  --semantic-color-background-primary: var(--core-color-gray-900);
}

// Components automatically adapt because they reference semantic tokens
// Changing .dark class on root updates all components

// This is why semantic naming matters:
// Value-based: color.gray.900 → locked to light theme
// Semantic: semantic.color.foreground.primary → adapts to theme`}</code>
        </pre>

        <h3>Build-Time Validation</h3>
        <p>
          The transformation pipeline validates tokens during build, ensuring
          system integrity:
        </p>

        <pre>
          <code>{`// Build process validates:
// 1. All references resolve (no broken links)
// 2. Token types are correct (color values are colors)
// 3. Accessibility constraints are met (contrast ratios)
// 4. Naming conventions are followed

// Example validation errors:
// ❌ "{semantic.color.invalid}" → Reference not found
// ❌ "{semantic.color.foreground.primary}: 123px" → Type mismatch (color vs spacing)
// ❌ Contrast ratio too low → Accessibility violation

// Build fails if validation fails, preventing broken tokens from reaching production`}</code>
        </pre>

        <h3>Design Tool Integration</h3>
        <p>
          The same token structure that powers code can be exported for design
          tools:
        </p>

        <pre>
          <code>{`// Tokens can be exported for Figma, Tokens Studio, etc.
// Designers use semantic tokens in Figma
// Developers use the same tokens in code
// Changes sync automatically through build process

// Example Figma export:
{
  "semantic.color.foreground.primary": {
    "value": "#1f2937",
    "type": "color",
    "description": "Primary text color"
  }
}

// Same token in code:
.button {
  color: var(--semantic-color-foreground-primary);
}

// Design and code stay in sync because they share the same source of truth`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>
          This transformation pipeline means that when a designer changes a
          semantic token in Figma, that change flows through the build process
          to automatically update every component using that token. This is
          systems thinking in practice: a single change propagates through the
          entire system, maintaining consistency automatically.
        </p>

        <p>
          The abstraction layers (core → semantic → component) enable powerful
          capabilities: theming, platform adaptation, accessibility enforcement,
          and system evolution. Understanding this pipeline is essential for
          making informed decisions about token structure and usage.
        </p>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'applied-example',
    title: 'Applied Example: Migrating from Hardcoded Values to Tokens',
    order: 7,
    content: (
      <>
        <p>
          Let's walk through migrating a component from hardcoded values to a
          token-based system:
        </p>

        <h3>Step 1: Audit Current State</h3>
        <p>Start by identifying all hardcoded values in a component:</p>
        <pre>
          <code>{`// ❌ Before: Hardcoded values
.button {
  background: #3b82f6;
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
}

// Audit reveals:
// - Background color: #3b82f6 (blue)
// - Text color: #ffffff (white)
// - Padding: 12px (vertical), 16px (horizontal)
// - Border radius: 8px
// - Font size: 16px
// - Font weight: 600`}</code>
        </pre>

        <h3>Step 2: Map to Core Tokens</h3>
        <p>Identify which core tokens represent these values:</p>
        <pre>
          <code>{`// Map hardcoded values to core tokens:
// #3b82f6 → core.color.blue.600
// #ffffff → core.color.white
// 12px → core.spacing.size.05
// 16px → core.spacing.size.06
// 8px → core.spacing.size.04
// 16px → core.typography.size.base
// 600 → core.typography.weight.semibold`}</code>
        </pre>

        <h3>Step 3: Create Semantic Tokens</h3>
        <p>Define semantic tokens that describe purpose, not appearance:</p>
        <pre>
          <code>{`// Create semantic tokens that describe purpose
{
  "semantic": {
    "color": {
      "action": {
        "background": {
          "primary": {
            "default": "{core.color.blue.600}",
            "hover": "{core.color.blue.700}",
            "disabled": "{core.color.gray.300}"
          }
        },
        "foreground": {
          "primary": {
            "default": "{core.color.white}",
            "disabled": "{core.color.gray.500}"
          }
        }
      }
    },
    "spacing": {
      "padding": {
        "button": {
          "vertical": "{core.spacing.size.05}",
          "horizontal": "{core.spacing.size.06}"
        }
      }
    },
    "shape": {
      "radius": {
        "button": "{core.spacing.size.04}"
      }
    },
    "typography": {
      "size": {
        "button": "{core.typography.size.base}",
        "weight": {
          "button": "{core.typography.weight.semibold}"
        }
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 4: Create Component Tokens</h3>
        <p>Define component-specific tokens that reference semantic tokens:</p>
        <pre>
          <code>{`// Component tokens reference semantic tokens
{
  "prefix": "button",
  "tokens": {
    "color": {
      "background": {
        "default": "{semantic.color.action.background.primary.default}",
        "hover": "{semantic.color.action.background.primary.hover}",
        "disabled": "{semantic.color.action.background.primary.disabled}"
      },
      "foreground": {
        "default": "{semantic.color.action.foreground.primary.default}",
        "disabled": "{semantic.color.action.foreground.primary.disabled}"
      }
    },
    "spacing": {
      "padding": {
        "vertical": "{semantic.spacing.padding.button.vertical}",
        "horizontal": "{semantic.spacing.padding.button.horizontal}"
      }
    },
    "shape": {
      "radius": {
        "default": "{semantic.shape.radius.button}"
      }
    },
    "typography": {
      "size": {
        "default": "{semantic.typography.size.button}"
      },
      "weight": {
        "default": "{semantic.typography.weight.button}"
      }
    }
  }
}`}</code>
        </pre>

        <h3>Step 5: Update Component Code</h3>
        <p>Replace hardcoded values with token references:</p>
        <pre>
          <code>{`// ✅ After: Token-based
.button {
  background: var(--button-color-background-default);
  color: var(--button-color-foreground-default);
  padding: 
    var(--button-spacing-padding-vertical) 
    var(--button-spacing-padding-horizontal);
  border-radius: var(--button-shape-radius-default);
  font-size: var(--button-typography-size-default);
  font-weight: var(--button-typography-weight-default);
  
  &:hover {
    background: var(--button-color-background-hover);
  }
  
  &:disabled {
    background: var(--button-color-background-disabled);
    color: var(--button-color-foreground-disabled);
  }
}

// Benefits:
// - All values come from tokens
// - System-wide updates possible
// - Theming enabled
// - Accessibility maintained through semantic layer`}</code>
        </pre>

        <h3>Step 6: Validate Migration</h3>
        <p>Verify the migration maintains functionality:</p>
        <ul>
          <li>
            <strong>Visual regression:</strong> Component looks identical
          </li>
          <li>
            <strong>Accessibility:</strong> Contrast ratios still meet WCAG AA
          </li>
          <li>
            <strong>Theme support:</strong> Can change theme by updating
            semantic tokens
          </li>
          <li>
            <strong>Build process:</strong> All token references resolve
            correctly
          </li>
        </ul>

        <h3>Step 7: Document Token Usage</h3>
        <p>Document which tokens the component uses and why:</p>
        <pre>
          <code>{`/**
 * Button Component Tokens
 * 
 * Uses semantic tokens for all values:
 * - semantic.color.action.*: Action-related colors
 * - semantic.spacing.padding.button.*: Button-specific padding
 * - semantic.shape.radius.button: Button border radius
 * - semantic.typography.size.button: Button text size
 * 
 * Component tokens reference semantic tokens, enabling:
 * - Theme changes without component code changes
 * - Consistent spacing across all buttons
 * - Accessibility-maintained contrast ratios
 */`}</code>
        </pre>

        <h3>Real-World Impact</h3>
        <p>This migration demonstrates token system benefits:</p>
        <ul>
          <li>
            <strong>System-wide updates:</strong> Changing semantic tokens
            updates all buttons
          </li>
          <li>
            <strong>Theming:</strong> Dark mode enabled by reassigning semantic
            tokens
          </li>
          <li>
            <strong>Consistency:</strong> All buttons use same token values
          </li>
          <li>
            <strong>Maintainability:</strong> Single source of truth for all
            values
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'constraints-tradeoffs',
    title: 'Constraints & Trade-offs',
    order: 8,
    content: (
      <>
        <p>Token systems involve important tradeoffs:</p>
        <ul>
          <li>
            <strong>Abstraction vs. Directness:</strong> Semantic tokens provide
            flexibility but require learning. Core tokens are more direct but
            lock in assumptions.
          </li>
          <li>
            <strong>Layering vs. Simplicity:</strong> Multiple token layers
            enable powerful theming but increase complexity. Single-layer
            systems are simpler but less flexible.
          </li>
          <li>
            <strong>Validation vs. Speed:</strong> Strict validation prevents
            errors but can slow iteration. Loose validation enables speed but
            risks inconsistency.
          </li>
        </ul>
        <p>
          The key is finding the right level of abstraction and validation for
          your system's maturity and team's needs.
        </p>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'token-anti-patterns',
    title: 'Token Anti-Patterns & Common Pitfalls',
    order: 8.5,
    content: (
      <>
        <p>
          Understanding token anti-patterns helps avoid common mistakes that
          undermine system integrity:
        </p>

        <h3>1. Value-Based Naming</h3>
        <p>
          <strong>The Problem:</strong> Naming tokens after their visual values
          instead of their purpose.
        </p>
        <pre>
          <code>{`// ❌ Value-based naming: locked to appearance
{
  "color": {
    "gray": {
      "900": "#111827",
      "800": "#1f2937",
      "700": "#374151"
    }
  }
}

// Problems:
// - Can't change gray.900 without breaking semantics
// - Dark mode requires different tokens
// - No theming capability
// - Value changes break all consumers

// ✅ Semantic naming: encodes purpose
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": "{core.color.gray.900}",
        "secondary": "{core.color.gray.700}"
      }
    }
  }
}

// Benefits:
// - Can reassign values for themes
// - Dark mode: change core mapping
// - Maintains semantic meaning
// - System-wide theming capability`}</code>
        </pre>

        <h3>2. Token Duplication</h3>
        <p>
          <strong>The Problem:</strong> Creating duplicate tokens instead of
          referencing existing ones.
        </p>
        <pre>
          <code>{`// ❌ Duplication: same value, different tokens
{
  "button": {
    "background": "#3b82f6"
  },
  "link": {
    "color": "#3b82f6"
  },
  "badge": {
    "background": "#3b82f6"
  }
}

// Problems:
// - Three places to update for one color change
// - Inconsistency risk (one gets updated, others don't)
// - No semantic relationship
// - System bloat

// ✅ Reference existing tokens
{
  "button": {
    "background": "{semantic.color.action.background.primary}"
  },
  "link": {
    "color": "{semantic.color.action.foreground.primary}"
  },
  "badge": {
    "background": "{semantic.color.action.background.primary}"
  }
}

// Benefits:
// - Single source of truth
// - Consistent across components
// - Semantic relationship clear
// - System-wide updates possible`}</code>
        </pre>

        <h3>3. Missing Semantic Layer</h3>
        <p>
          <strong>The Problem:</strong> Jumping directly from core to component
          tokens, skipping semantic abstraction.
        </p>
        <pre>
          <code>{`// ❌ Missing semantic layer: components reference core directly
{
  "prefix": "button",
  "tokens": {
    "background": "{core.color.blue.600}",
    "foreground": "{core.color.white}"
  }
}

// Problems:
// - Can't theme without changing core
// - Components locked to specific colors
// - Dark mode requires component changes
// - No abstraction for intent

// ✅ Semantic layer: components reference semantics
{
  "prefix": "button",
  "tokens": {
    "background": "{semantic.color.action.background.primary}",
    "foreground": "{semantic.color.foreground.inverse}"
  }
}

// Benefits:
// - Theme by reassigning semantic tokens
// - Components express intent, not appearance
// - Dark mode: change semantic → core mapping
// - System-wide theming capability`}</code>
        </pre>

        <h3>4. Inconsistent Naming Conventions</h3>
        <p>
          <strong>The Problem:</strong> Mixing naming patterns across the token
          system.
        </p>
        <pre>
          <code>{`// ❌ Inconsistent naming: mixed patterns
{
  "primaryColor": "#3b82f6",
  "bg-primary": "#ffffff",
  "text_color": "#111827",
  "borderColor": "#e5e7eb"
}

// Problems:
// - Hard to discover tokens
// - Unpredictable structure
// - Learning curve for each token
// - No clear mental model

// ✅ Consistent naming: clear patterns
{
  "semantic": {
    "color": {
      "foreground": {
        "primary": "{core.color.gray.900}",
        "secondary": "{core.color.gray.700}"
      },
      "background": {
        "primary": "{core.color.white}",
        "secondary": "{core.color.gray.50}"
      }
    }
  }
}

// Benefits:
// - Predictable structure
// - Easy to discover
// - Clear hierarchy
// - Consistent mental model`}</code>
        </pre>

        <h3>5. Hardcoded Values in Components</h3>
        <p>
          <strong>The Problem:</strong> Using hardcoded values instead of token
          references.
        </p>
        <pre>
          <code>{`// ❌ Hardcoded values: breaks token system
.button {
  background: #3b82f6;
  color: #ffffff;
  padding: 12px 16px;
  border-radius: 8px;
}

// Problems:
// - Can't theme or update globally
// - Inconsistent with design tokens
// - No relationship to system
// - Manual updates required

// ✅ Token references: part of system
.button {
  background: var(--semantic-color-action-background-primary);
  color: var(--semantic-color-foreground-inverse);
  padding: var(--semantic-spacing-padding-button);
  border-radius: var(--semantic-shape-radius-medium);
}

// Benefits:
// - Theme by changing tokens
// - Consistent with design system
// - System-wide updates automatic
// - Clear relationship to tokens`}</code>
        </pre>

        <h3>6. Platform-Specific Tokens Without Abstraction</h3>
        <p>
          <strong>The Problem:</strong> Creating platform-specific tokens
          without semantic abstraction.
        </p>
        <pre>
          <code>{`// ❌ Platform-specific without abstraction
{
  "web": {
    "spacing": {
      "buttonPadding": "12px"
    }
  },
  "ios": {
    "spacing": {
      "buttonPadding": "14pt"
    }
  }
}

// Problems:
// - Each platform needs separate tokens
// - No shared semantic meaning
// - Hard to maintain consistency
// - Platform changes require token updates

// ✅ Semantic abstraction with platform mapping
{
  "semantic": {
    "spacing": {
      "buttonPadding": "{core.spacing.size.05}"
    }
  },
  "platform": {
    "web": {
      "core.spacing.size.05": "12px"
    },
    "ios": {
      "core.spacing.size.05": "14pt"
    }
  }
}

// Benefits:
// - Shared semantic meaning
// - Platform-specific values in one place
// - Consistent across platforms
// - Easy to maintain`}</code>
        </pre>

        <h3>Warning Signs</h3>
        <p>Watch for these indicators of token system problems:</p>
        <ul>
          <li>
            <strong>Token duplication:</strong> Multiple tokens with the same
            value indicate missing references
          </li>
          <li>
            <strong>Hardcoded values:</strong> Components using hex codes or
            pixel values directly indicate token adoption failure
          </li>
          <li>
            <strong>Value-based names:</strong> Tokens named after colors or
            sizes indicate missing semantic layer
          </li>
          <li>
            <strong>Inconsistent structure:</strong> Mixed naming patterns
            indicate lack of governance
          </li>
          <li>
            <strong>Theming failures:</strong> Can't change themes without
            updating many tokens indicates missing abstraction
          </li>
          <li>
            <strong>Platform divergence:</strong> Different token values per
            platform without semantic mapping indicates poor abstraction
          </li>
        </ul>

        <h3>Recovery Strategies</h3>
        <p>If you recognize these patterns, here's how to recover:</p>
        <ul>
          <li>
            <strong>Audit token usage:</strong> Find all hardcoded values and
            duplicate tokens
          </li>
          <li>
            <strong>Establish semantic layer:</strong> Create semantic tokens
            that reference core tokens
          </li>
          <li>
            <strong>Enforce naming conventions:</strong> Use consistent patterns
            across all tokens
          </li>
          <li>
            <strong>Migrate gradually:</strong> Replace hardcoded values with
            token references incrementally
          </li>
          <li>
            <strong>Validate at build time:</strong> Add checks to prevent
            hardcoded values and broken references
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'token-health-metrics',
    title: 'Warning Signs & Token System Health',
    order: 8.75,
    content: (
      <>
        <p>
          Monitor token system health to catch problems before they impact the
          entire system:
        </p>

        <h3>Adoption Metrics</h3>
        <p>
          <strong>Token Usage Rate:</strong> Percentage of components using
          tokens vs. hardcoded values.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}95% token usage—almost all values use
            tokens
          </li>
          <li>
            <strong>Warning:</strong> 85-95% usage—some hardcoded values exist
          </li>
          <li>
            <strong>Critical:</strong> {'<'}85% usage—token system not adopted
          </li>
        </ul>

        <p>
          <strong>Semantic Token Adoption:</strong> Percentage of semantic
          tokens vs. core tokens in components.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}80% semantic tokens—components use
            semantic layer
          </li>
          <li>
            <strong>Warning:</strong> 60-80% semantic—some direct core usage
          </li>
          <li>
            <strong>Critical:</strong> {'<'}60% semantic—missing abstraction
            layer
          </li>
        </ul>

        <h3>Consistency Metrics</h3>
        <p>
          <strong>Token Duplication:</strong> Number of duplicate token values.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero duplicates—all tokens reference other
            tokens
          </li>
          <li>
            <strong>Warning:</strong> 1-5 duplicates—some missing references
          </li>
          <li>
            <strong>Critical:</strong> {'>'}5 duplicates—poor token architecture
          </li>
        </ul>

        <p>
          <strong>Naming Consistency:</strong> Adherence to naming conventions.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> 100% consistent—all tokens follow
            conventions
          </li>
          <li>
            <strong>Warning:</strong> 90-99% consistent—some violations
          </li>
          <li>
            <strong>Critical:</strong> {'<'}90% consistent—no naming standards
          </li>
        </ul>

        <h3>Quality Metrics</h3>
        <p>
          <strong>Broken References:</strong> Number of unresolved token
          references.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero broken references—all resolve
            correctly
          </li>
          <li>
            <strong>Warning:</strong> 1-3 broken—some missing tokens
          </li>
          <li>
            <strong>Critical:</strong> {'>'}3 broken—token system broken
          </li>
        </ul>

        <p>
          <strong>Validation Failures:</strong> Number of tokens failing
          validation (contrast, type, etc.).
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero validation failures—all tokens valid
          </li>
          <li>
            <strong>Warning:</strong> 1-2 failures—minor issues
          </li>
          <li>
            <strong>Critical:</strong> {'>'}2 failures—quality degradation
          </li>
        </ul>

        <h3>Architecture Metrics</h3>
        <p>
          <strong>Layer Violations:</strong> Components referencing wrong token
          layers.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> Zero violations—correct layer usage
          </li>
          <li>
            <strong>Warning:</strong> 1-3 violations—some incorrect usage
          </li>
          <li>
            <strong>Critical:</strong> {'>'}3 violations—architecture breaking
          </li>
        </ul>

        <p>
          <strong>Semantic Coverage:</strong> Percentage of design decisions
          represented by semantic tokens.
        </p>
        <ul>
          <li>
            <strong>Healthy:</strong> {'>'}90% coverage—comprehensive semantic
            layer
          </li>
          <li>
            <strong>Warning:</strong> 70-90% coverage—some gaps
          </li>
          <li>
            <strong>Critical:</strong> {'<'}70% coverage—missing semantic
            abstractions
          </li>
        </ul>

        <h3>Early Warning Signs</h3>
        <p>Watch for these indicators of token system problems:</p>
        <ul>
          <li>
            <strong>Increasing hardcoded values:</strong> Teams bypassing tokens
            indicates usability issues
          </li>
          <li>
            <strong>Token duplication:</strong> Same values defined multiple
            times indicates missing references
          </li>
          <li>
            <strong>Theming failures:</strong> Can't change themes indicates
            missing semantic layer
          </li>
          <li>
            <strong>Build failures:</strong> Broken references indicate
            validation gaps
          </li>
          <li>
            <strong>Inconsistent values:</strong> Same semantic token with
            different values indicates architecture problems
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'token-migration-strategies',
    title: 'Token Migration & Evolution Strategies',
    order: 8.9,
    content: (
      <>
        <p>
          Migrating token systems requires careful planning to maintain system
          integrity:
        </p>

        <h3>Hardcoded Values → Tokens</h3>
        <p>Migrate hardcoded values to tokens systematically:</p>
        <ol>
          <li>
            <strong>Audit:</strong> Find all hardcoded values in codebase
          </li>
          <li>
            <strong>Categorize:</strong> Group by type (color, spacing,
            typography)
          </li>
          <li>
            <strong>Create tokens:</strong> Add missing tokens to core layer
          </li>
          <li>
            <strong>Replace incrementally:</strong> Update components one at a
            time
          </li>
          <li>
            <strong>Validate:</strong> Ensure visual consistency after each
            change
          </li>
        </ol>

        <h3>Value-Based → Semantic Migration</h3>
        <p>Migrate from value-based to semantic naming:</p>
        <pre>
          <code>{`// Phase 1: Add semantic tokens alongside value-based
{
  "color": {
    "gray": {
      "900": "#111827"  // Keep existing
    }
  },
  "semantic": {
    "color": {
      "foreground": {
        "primary": "{color.gray.900}"  // Add semantic
      }
    }
  }
}

// Phase 2: Update components to use semantic
// Before:
background: var(--color-gray-900);

// After:
background: var(--semantic-color-foreground-primary);

// Phase 3: Deprecate value-based tokens
// Phase 4: Remove value-based tokens after migration`}</code>
        </pre>

        <h3>Token Refactoring</h3>
        <p>Refactor tokens without breaking components:</p>
        <ul>
          <li>
            <strong>Alias first:</strong> Create new token that aliases old one
          </li>
          <li>
            <strong>Update references:</strong> Gradually move components to new
            token
          </li>
          <li>
            <strong>Deprecate:</strong> Mark old token as deprecated
          </li>
          <li>
            <strong>Remove:</strong> Remove old token after migration complete
          </li>
        </ul>

        <h3>Token Versioning</h3>
        <p>Version tokens to enable safe evolution:</p>
        <pre>
          <code>{`// Token versions enable parallel evolution
{
  "v1": {
    "semantic": {
      "color": {
        "foreground": {
          "primary": "{core.color.gray.900}"
        }
      }
    }
  },
  "v2": {
    "semantic": {
      "color": {
        "foreground": {
          "primary": "{core.color.gray.950}"  // Updated value
        }
      }
    }
  }
}

// Components can opt into new version:
// Component using v1 tokens (stable)
.button {
  color: var(--v1-semantic-color-foreground-primary);
}

// Component using v2 tokens (new)
.button-v2 {
  color: var(--v2-semantic-color-foreground-primary);
}`}</code>
        </pre>

        <h3>Build-Time Validation</h3>
        <p>Use build-time checks to prevent regressions:</p>
        <ul>
          <li>
            <strong>Reference validation:</strong> Ensure all token references
            resolve
          </li>
          <li>
            <strong>Type checking:</strong> Verify token types match usage
          </li>
          <li>
            <strong>Accessibility:</strong> Validate contrast ratios
          </li>
          <li>
            <strong>Naming conventions:</strong> Enforce naming patterns
          </li>
        </ul>
      </>
    ),
  },
  {
    type: 'constraints-tradeoffs',
    id: 'token-validation-strategies',
    title: 'Token Validation Strategies',
    order: 8.97,
    content: (
      <>
        <p>Validate tokens to maintain quality and prevent errors:</p>

        <h3>Build-Time Validation</h3>
        <p>Validate tokens during build process:</p>
        <pre>
          <code>{`// Token validation schema
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "object",
  "properties": {
    "tokens": {
      "type": "object",
      "patternProperties": {
        "^[a-z]+\\.[a-z]+(\\.[a-z]+)*$": {
          "type": "object",
          "required": ["value", "type"],
          "properties": {
            "value": { "type": ["string", "number"] },
            "type": {
              "enum": ["color", "dimension", "fontFamily", "fontWeight"]
            }
          }
        }
      }
    }
  }
}

// Build-time validation script
import Ajv from 'ajv';
import tokenSchema from './token-schema.json';
import tokens from './tokens.json';

const ajv = new Ajv();
const validate = ajv.compile(tokenSchema);

if (!validate(tokens)) {
  console.error('Token validation failed:', validate.errors);
  process.exit(1);
}`}</code>
        </pre>

        <h3>Reference Validation</h3>
        <p>Ensure all token references resolve correctly:</p>
        <pre>
          <code>{`// Validate token references
function validateReferences(tokens) {
  const tokenPaths = new Set();
  
  // Collect all token paths
  function collectPaths(obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? \`\${path}.\${key}\` : key;
      if (value.value && value.type) {
        tokenPaths.add(currentPath);
      } else if (typeof value === 'object') {
        collectPaths(value, currentPath);
      }
    }
  }
  
  collectPaths(tokens);
  
  // Validate references
  function validateRefs(obj, path = '') {
    for (const [key, value] of Object.entries(obj)) {
      const currentPath = path ? \`\${path}.\${key}\` : key;
      if (value.value && typeof value.value === 'string' && value.value.startsWith('{')) {
        const ref = value.value.slice(1, -1); // Remove { }
        if (!tokenPaths.has(ref)) {
          throw new Error(\`Token reference \${ref} not found in \${currentPath}\`);
        }
      } else if (typeof value === 'object') {
        validateRefs(value, currentPath);
      }
    }
  }
  
  validateRefs(tokens);
}`}</code>
        </pre>

        <h3>Contrast Validation</h3>
        <p>Validate color contrast ratios for accessibility:</p>
        <pre>
          <code>{`// Contrast validation
import { contrast } from 'chroma-js';

function validateContrast(foreground, background) {
  const ratio = contrast(foreground, background);
  
  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  if (ratio < 4.5) {
    throw new Error(
      \`Contrast ratio \${ratio}:1 is below WCAG AA minimum (4.5:1)\`
    );
  }
  
  return ratio;
}

// Validate semantic color pairs
const semanticPairs = [
  ['semantic.color.foreground.primary', 'semantic.color.background.primary'],
  ['semantic.color.foreground.secondary', 'semantic.color.background.secondary'],
];

semanticPairs.forEach(([fg, bg]) => {
  const fgValue = getTokenValue(fg);
  const bgValue = getTokenValue(bg);
  validateContrast(fgValue, bgValue);
});`}</code>
        </pre>

        <h3>Naming Convention Validation</h3>
        <p>Enforce consistent naming conventions:</p>
        <pre>
          <code>{`// Naming convention validation
const namingPatterns = {
  core: /^core\\.(color|spacing|typography)\\.[a-z0-9]+(\\.[a-z0-9]+)*$/,
  semantic: /^semantic\\.(color|spacing|typography)\\.[a-z]+(\\.[a-z]+)*$/,
  component: /^[a-z]+\\.[a-z]+(\\.[a-z]+)*$/,
};

function validateNaming(tokenPath, layer) {
  const pattern = namingPatterns[layer];
  if (!pattern) {
    throw new Error(\`Unknown layer: \${layer}\`);
  }
  
  if (!pattern.test(tokenPath)) {
    throw new Error(
      \`Token \${tokenPath} does not match \${layer} naming convention\`
    );
  }
}`}</code>
        </pre>

        <h3>Type Validation</h3>
        <p>Validate token types match their values:</p>
        <pre>
          <code>{`// Type validation
function validateTokenType(value, type) {
  switch (type) {
    case 'color':
      // Validate hex, rgb, rgba, hsl, hsla, or named colors
      if (!/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(value) &&
          !/^rgba?\\(/i.test(value) &&
          !/^hsla?\\(/i.test(value) &&
          !/^[a-z]+$/i.test(value)) {
        throw new Error(\`Invalid color value: \${value}\`);
      }
      break;
    case 'dimension':
      // Validate px, pt, rem, em, etc.
      if (!/^\\d+(\\.\\d+)?(px|pt|rem|em|%)$/i.test(value)) {
        throw new Error(\`Invalid dimension value: \${value}\`);
      }
      break;
    case 'fontFamily':
      // Validate font family string
      if (typeof value !== 'string') {
        throw new Error(\`Invalid fontFamily value: \${value}\`);
      }
      break;
    default:
      throw new Error(\`Unknown token type: \${type}\`);
  }
}`}</code>
        </pre>
      </>
    ),
  },
  {
    type: 'applied-example',
    id: 'token-case-studies',
    title: 'Real-World Token Case Studies',
    order: 8.98,
    content: (
      <>
        <p>
          These case studies demonstrate token system migrations and evolution:
        </p>

        <h3>Case Study 1: Hardcoded Values → Tokens</h3>
        <p>
          <strong>Challenge:</strong> A product team needed to rebrand, but
          colors were hardcoded in 800+ files.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>Audited codebase—found 2,000+ hardcoded color values</li>
          <li>Created core color tokens from existing values</li>
          <li>Built semantic layer (foreground, background, action colors)</li>
          <li>Migrated component by component (started with most-used)</li>
          <li>Added build-time validation to prevent new hardcoded values</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>Migration completed in 4 months (team of 3)</li>
          <li>Rebranding took 2 hours (updated semantic tokens)</li>
          <li>Zero new hardcoded values added (validation caught them)</li>
          <li>
            Developer velocity improved (no more "what color should I use?")
          </li>
        </ul>

        <h3>Case Study 2: Value-Based → Semantic Migration</h3>
        <p>
          <strong>Challenge:</strong> Existing tokens used value-based naming
          (gray.900, blue.600), making theming impossible.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>Kept value-based tokens (backward compatibility)</li>
          <li>Created semantic tokens that referenced value-based</li>
          <li>Updated components to use semantic tokens incrementally</li>
          <li>Deprecated value-based tokens after migration</li>
          <li>Removed value-based tokens after 6-month grace period</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>Zero breaking changes during migration</li>
          <li>Dark mode enabled in 1 day (reassigned semantic tokens)</li>
          <li>Multi-brand support became possible</li>
          <li>System became more flexible and maintainable</li>
        </ul>

        <h3>Case Study 3: Token System Health Recovery</h3>
        <p>
          <strong>Challenge:</strong> Token system had 50+ duplicate values,
          broken references, and inconsistent naming.
        </p>
        <p>
          <strong>Process:</strong>
        </p>
        <ol>
          <li>
            Ran automated audit—found all duplicates and broken references
          </li>
          <li>Consolidated duplicates into single tokens</li>
          <li>
            Fixed broken references (created missing tokens or updated refs)
          </li>
          <li>Standardized naming conventions</li>
          <li>Added automated validation to prevent regressions</li>
        </ol>
        <p>
          <strong>Results:</strong>
        </p>
        <ul>
          <li>Zero duplicate values (all reference other tokens)</li>
          <li>Zero broken references (validation prevents them)</li>
          <li>100% naming convention compliance</li>
          <li>Token system health improved from 60% to 98%</li>
        </ul>
      </>
    ),
  },
  {
    type: 'cross-references',
    id: 'cross-references',
    title: 'Related Concepts',
    order: 10,
    content: null,
  },
  {
    type: 'assessment-prompt',
    id: 'assessment-prompt',
    title: 'Reflection Questions',
    order: 11,
    content: null,
  },
];

const content = createFoundationContent(pageMetadata, sections);

// Add verification checklist
content.verificationChecklist = [
  {
    id: 'token-layers',
    label:
      'I understand the difference between core, semantic, and component tokens',
    description: 'Understanding token layers',
    required: true,
  },
  {
    id: 'alias-usage',
    label: 'I use aliases instead of duplicating values',
    description: 'Creating single sources of truth',
    required: true,
  },
  {
    id: 'semantic-naming',
    label: 'I create semantic tokens that describe purpose, not appearance',
    description: 'Naming tokens by role, not value',
    required: true,
  },
  {
    id: 'token-validation',
    label: 'I validate tokens against schema and accessibility requirements',
    description: 'Ensuring token quality',
    required: false,
  },
];

// Add assessment prompts
content.assessmentPrompts = [
  {
    question:
      'When should you create a new semantic token versus reusing an existing one? What factors influence this decision?',
    type: 'reflection',
  },
  {
    question:
      'Explain how a single token change (e.g., updating a color value) propagates through the system. What dependencies make this possible?',
    type: 'application',
  },
];

// Add cross-references
content.crossReferences = {
  concepts: [
    {
      slug: 'philosophy',
      title: 'Philosophy of Design Systems',
      description: 'The systems thinking behind tokens',
      type: 'foundation',
    },
    {
      slug: 'color',
      title: 'Color Foundations',
      description: 'How tokens structure color systems',
      type: 'foundation',
    },
    {
      slug: 'spacing',
      title: 'Spacing & Layout',
      description: 'How tokens structure spacing systems',
      type: 'foundation',
    },
  ],
  components: [],
  glossary: ['token', 'semantic-token', 'alias'],
};

// Add deep dive links
sections.push({
  type: 'additional-resources',
  id: 'deep-dives',
  title: 'Deep Dives',
  order: 12,
  content: (
    <>
      <p>
        The following topics extend this primer into more specialized guidance:
      </p>
      <ul>
        <li>
          <Link href="/blueprints/foundations/tokens/core-vs-semantic">
            Core vs Semantic
          </Link>
          {' — How primitives power purpose-driven roles'}
        </li>
        <li>
          <Link href="/blueprints/foundations/tokens/token-naming">
            Token Naming & Hierarchy
          </Link>
          {' — Conventions for namespacing and discoverability'}
        </li>
        <li>
          <Link href="/blueprints/foundations/tokens/theming">
            Theming & Modes
          </Link>
          {' — Light/dark mode strategies'}
        </li>
        <li>
          <Link href="/blueprints/foundations/tokens/schema-validation">
            Schema & Validation
          </Link>
          {' — Ensuring token quality'}
        </li>
        <li>
          <Link href="/blueprints/foundations/tokens/build-outputs">
            Build Outputs
          </Link>
          {' — Generated CSS, SCSS, and TypeScript'}
        </li>
        <li>
          <Link href="/blueprints/foundations/tokens/accessibility">
            Accessibility by Default
          </Link>
          {' — Encoding a11y constraints'}
        </li>
      </ul>
    </>
  ),
});

export const metadata = generateFoundationMetadata(pageMetadata);

export default function TokensFoundationPage() {
  return <FoundationPage content={content} />;
}

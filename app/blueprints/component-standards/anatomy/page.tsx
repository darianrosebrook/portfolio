import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Component Anatomy Standards | Component Standards',
  description:
    'Break down components into their core parts for clarity and consistency. Learn how to document component anatomy and structure.',
  keywords: [
    'Design System',
    'Component Anatomy',
    'Component Structure',
    'Component Parts',
  ],
};

export default function AnatomyStandardsPage() {
  return (
    <section>
      <article className="content">
        <h1>Component Anatomy Standards</h1>
        <p>
          Component anatomy breaks down complex components into their core
          parts, making them easier to understand, document, and maintain. By
          identifying the essential elements and their relationships, we create
          a shared vocabulary and enable consistent implementation across teams.
        </p>

        <h2>Why Anatomy Matters</h2>
        <p>Documenting component anatomy provides:</p>
        <ul>
          <li>
            <strong>Clarity:</strong> Clear understanding of what makes up a
            component
          </li>
          <li>
            <strong>Consistency:</strong> Standardized terminology across teams
          </li>
          <li>
            <strong>Flexibility:</strong> Understanding parts enables
            composition and customization
          </li>
          <li>
            <strong>Documentation:</strong> Visual and textual reference for
            implementation
          </li>
        </ul>

        <h2>Anatomy Hierarchy</h2>

        <h3>1. Root Element</h3>
        <p>The outermost container that wraps all component parts:</p>
        <pre>
          <code>{`// Button root element
<button className="button" {...props}>
  {/* All parts contained within */}
</button>

// Card root element
<div className="card">
  {/* Card parts */}
</div>`}</code>
        </pre>

        <h3>2. Primary Parts</h3>
        <p>Essential elements that define the component's purpose:</p>
        <pre>
          <code>{`// Button primary parts
<button className="button">
  <span className="button__icon">{icon}</span> {/* Icon part */}
  <span className="button__text">{children}</span> {/* Text part */}
</button>

// Card primary parts
<div className="card">
  <div className="card__header">{title}</div> {/* Header part */}
  <div className="card__body">{content}</div> {/* Body part */}
  <div className="card__footer">{actions}</div> {/* Footer part */}
</div>`}</code>
        </pre>

        <h3>3. Optional Parts</h3>
        <p>Parts that may or may not be present based on props or state:</p>
        <pre>
          <code>{`// Button optional parts
<button className="button">
  {icon && <span className="button__icon">{icon}</span>} {/* Optional icon */}
  <span className="button__text">{children}</span>
  {loading && <span className="button__spinner" />} {/* Optional spinner */}
</button>

// Card optional parts
<div className="card">
  {image && <div className="card__image">{image}</div>} {/* Optional image */}
  <div className="card__body">{content}</div>
  {actions && <div className="card__footer">{actions}</div>} {/* Optional footer */}
</div>`}</code>
        </pre>

        <h2>Naming Conventions</h2>

        <h3>BEM-Style Naming</h3>
        <p>Use BEM (Block Element Modifier) naming for clarity:</p>
        <pre>
          <code>{`// Block: Component name
.button { }
.card { }

// Element: Part of component
.button__icon { }
.button__text { }
.card__header { }
.card__body { }

// Modifier: Variant or state
.button--primary { }
.button--disabled { }
.card--elevated { }`}</code>
        </pre>

        <h3>Semantic Naming</h3>
        <p>Use semantic names that describe purpose, not appearance:</p>
        <pre>
          <code>{`// ✅ Good: Semantic naming
.card__header { }
.card__body { }
.card__footer { }

// ❌ Bad: Appearance-based naming
.card__top { }
.card__middle { }
.card__bottom { }`}</code>
        </pre>

        <h2>Documentation Standards</h2>

        <h3>Required Documentation</h3>
        <p>Every component anatomy should include:</p>
        <ul>
          <li>
            <strong>Visual Diagram:</strong> Visual representation of parts
          </li>
          <li>
            <strong>Part List:</strong> List of all parts with descriptions
          </li>
          <li>
            <strong>Hierarchy:</strong> How parts relate to each other
          </li>
          <li>
            <strong>Required vs Optional:</strong> Which parts are always
            present vs conditional
          </li>
          <li>
            <strong>Code Examples:</strong> How parts map to code structure
          </li>
        </ul>

        <h3>Anatomy Structure Format</h3>
        <pre>
          <code>{`/**
 * Button Component Anatomy
 * 
 * Root: button.button
 * ├── Icon (optional): span.button__icon
 * ├── Text (required): span.button__text
 * └── Spinner (optional): span.button__spinner
 */
interface ButtonAnatomy {
  root: 'button';
  parts: {
    icon?: 'span.button__icon';
    text: 'span.button__text';
    spinner?: 'span.button__spinner';
  };
}`}</code>
        </pre>

        <h2>Layer-Specific Anatomy</h2>

        <h3>Primitives</h3>
        <p>Primitives have simple anatomy with minimal parts:</p>
        <pre>
          <code>{`// Button (Primitive)
Root: button
Parts:
  - text (required): Button label
  - icon (optional): Leading icon
  
// Simple structure, few parts`}</code>
        </pre>

        <h3>Compounds</h3>
        <p>Compounds coordinate multiple primitives:</p>
        <pre>
          <code>{`// TextField (Compound)
Root: div.field
Parts:
  - label (required): Label element
  - input (required): Input primitive
  - hint (optional): Helper text
  - error (optional): Error message
  
// Coordinates multiple primitives`}</code>
        </pre>

        <h3>Composers</h3>
        <p>Composers have complex anatomy with orchestrated parts:</p>
        <pre>
          <code>{`// Modal (Composer)
Root: div.modal
Parts:
  - overlay (required): Backdrop
  - container (required): Main modal container
    - header (optional): Title area
    - body (required): Content area
    - footer (optional): Action area
      - actions (optional): Button group
  
// Hierarchical structure with nested parts`}</code>
        </pre>

        <h2>Visual Documentation</h2>

        <h3>Anatomy Diagrams</h3>
        <p>Visual diagrams help teams understand component structure:</p>
        <ul>
          <li>
            <strong>Wireframe Style:</strong> Simple outlines showing part
            locations
          </li>
          <li>
            <strong>Labeled Parts:</strong> Clear labels connecting visual to
            code
          </li>
          <li>
            <strong>Hierarchy Trees:</strong> Tree structure showing
            relationships
          </li>
        </ul>

        <h2>Related Resources</h2>
        <ul>
          <li>
            <Link href="/blueprints/foundations/component-architecture">
              Component Architecture Basics
            </Link>{' '}
            — Understanding component layers and structure
          </li>
          <li>
            <Link href="/blueprints/component-standards/props">
              Props & API Standards
            </Link>{' '}
            — How props control component parts
          </li>
          <li>
            <Link href="/blueprints/component-standards/component-complexity">
              Component Complexity Methodology
            </Link>{' '}
            — Layer-specific anatomy patterns
          </li>
        </ul>
      </article>
    </section>
  );
}

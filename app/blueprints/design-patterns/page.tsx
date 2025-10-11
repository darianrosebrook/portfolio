'use client';

import React from 'react';
import {
  DocLayout,
  DocLayoutProvider,
  type DocSection as DocSectionType,
} from '@/ui/modules/DocLayout';
import styles from './page.module.scss';

const sections: DocSectionType[] = [
  {
    id: 'overview',
    title: 'Design Patterns',
    codeHighlight: {
      file: '/patterns/overview.ts',
      lines: [1, 25],
    },
  },
  {
    id: 'headless-logic',
    title: 'Headless Logic',
    codeHighlight: {
      file: '/patterns/headless-logic.ts',
      lines: [1, 40],
    },
  },
  {
    id: 'context-providers',
    title: 'Context Providers',
    codeHighlight: {
      file: '/patterns/context-providers.ts',
      lines: [1, 35],
    },
  },
  {
    id: 'slotting-composition',
    title: 'Slotting & Composition',
    codeHighlight: {
      file: '/patterns/slotting.ts',
      lines: [1, 30],
    },
  },
  {
    id: 'command-registry',
    title: 'Command Registry',
    codeHighlight: {
      file: '/patterns/command-registry.ts',
      lines: [1, 45],
    },
  },
  {
    id: 'schema-first',
    title: 'Schema-First Design',
    codeHighlight: {
      file: '/patterns/schema-first.ts',
      lines: [1, 35],
    },
  },
  {
    id: 'engine-adapters',
    title: 'Engine Adapters',
    codeHighlight: {
      file: '/patterns/engine-adapters.ts',
      lines: [1, 40],
    },
  },
  {
    id: 'validation-governance',
    title: 'Validation & Governance',
    codeHighlight: {
      file: '/patterns/validation.ts',
      lines: [1, 50],
    },
  },
];

export default function DesignPatternsPage() {
  return (
    <DocLayoutProvider
      sections={sections.map((section) => ({
        ...section,
        codeHighlight: {
          file: `/patterns/${section.id}.ts`,
          lines: [1, 10],
        },
      }))}
    >
      <div className={styles.container}>
        <DocLayout
          codeFiles={sections.reduce(
            (acc, section) => ({
              ...acc,
              [`/patterns/${section.id}.ts`]: section.codeHighlight?.file ?? '',
            }),
            {}
          )}
        >
          <div className={styles.content}>
            <section id="overview">
              <h2>Why Design Patterns Matter</h2>
              <p>
                Design systems succeed when they provide consistent, predictable
                patterns that teams can rely on. These patterns aren't just
                about code organization—they're about creating mental models
                that scale across teams, products, and time.
              </p>

              <div className={styles.patternGrid}>
                <div className={styles.patternCard}>
                  <h3>Headless Logic</h3>
                  <p>
                    Separate behavior from presentation for maximum flexibility
                    and testability.
                  </p>
                </div>
                <div className={styles.patternCard}>
                  <h3>Context Providers</h3>
                  <p>
                    Orchestrate complex state and behavior through React context
                    patterns.
                  </p>
                </div>
                <div className={styles.patternCard}>
                  <h3>Slotting & Composition</h3>
                  <p>
                    Build flexible, customizable components through strategic
                    slot placement.
                  </p>
                </div>
                <div className={styles.patternCard}>
                  <h3>Command Registry</h3>
                  <p>
                    Create consistent, discoverable APIs through command-based
                    patterns.
                  </p>
                </div>
                <div className={styles.patternCard}>
                  <h3>Schema-First Design</h3>
                  <p>
                    Define contracts that ensure consistency across
                    implementations.
                  </p>
                </div>
                <div className={styles.patternCard}>
                  <h3>Engine Adapters</h3>
                  <p>
                    Abstract vendor-specific implementations behind stable
                    interfaces.
                  </p>
                </div>
              </div>
            </section>

            <section id="headless-logic">
              <h2>Headless Logic Pattern</h2>
              <p>
                Headless logic separates the behavior and state management from
                the visual presentation. This pattern enables maximum
                flexibility while maintaining consistent behavior across
                different visual implementations.
              </p>

              <div className={styles.example}>
                <h3>When to Use Headless Logic</h3>
                <ul>
                  <li>Complex state management that needs to be shared</li>
                  <li>Behavior that should be testable in isolation</li>
                  <li>Components that need multiple visual variants</li>
                  <li>
                    Logic that should be reusable across different UI frameworks
                  </li>
                </ul>
              </div>

              <div className={styles.example}>
                <h3>Real Examples in Our System</h3>
                <ul>
                  <li>
                    <code>useOtp</code> - OTP input behavior and validation
                  </li>
                  <li>
                    <code>useWalkthrough</code> - Tour navigation and state
                    management
                  </li>
                  <li>
                    <code>useToolbar</code> - Dynamic toolbar layout and
                    overflow
                  </li>
                  <li>
                    <code>usePagination</code> - Page calculation and navigation
                    logic
                  </li>
                  <li>
                    <code>useRTE</code> - Rich text editor state and commands
                  </li>
                  <li>
                    <code>useField</code> - Form field validation and
                    associations
                  </li>
                </ul>
              </div>
            </section>

            <section id="context-providers">
              <h2>Context Provider Pattern</h2>
              <p>
                Context providers orchestrate complex state and behavior,
                providing a clean API for consuming components while maintaining
                encapsulation and performance.
              </p>

              <div className={styles.example}>
                <h3>Provider Benefits</h3>
                <ul>
                  <li>Centralized state management</li>
                  <li>Clean component APIs</li>
                  <li>Performance optimization through context boundaries</li>
                  <li>Easier testing and debugging</li>
                </ul>
              </div>

              <div className={styles.example}>
                <h3>Provider vs Direct Props</h3>
                <p>
                  Use providers when you have complex state that needs to be
                  shared across multiple components, or when the component tree
                  becomes unwieldy with prop drilling.
                </p>
              </div>
            </section>

            <section id="slotting-composition">
              <h2>Slotting & Composition Pattern</h2>
              <p>
                Slotting allows components to accept custom content in specific
                areas, enabling maximum flexibility while maintaining consistent
                structure and behavior.
              </p>

              <div className={styles.example}>
                <h3>Slot Design Principles</h3>
                <ul>
                  <li>Named slots for specific purposes</li>
                  <li>Default implementations for common cases</li>
                  <li>Clear boundaries between slots</li>
                  <li>Consistent naming conventions</li>
                </ul>
              </div>

              <div className={styles.example}>
                <h3>When to Slot vs Configure</h3>
                <p>
                  Use slots when you need to replace entire sections of UI. Use
                  configuration props for simple variations like colors, sizes,
                  or text content.
                </p>
              </div>
            </section>

            <section id="command-registry">
              <h2>Command Registry Pattern</h2>
              <p>
                Command registries provide a consistent, discoverable API for
                complex operations. They make behavior explicit and testable
                while enabling powerful composition patterns.
              </p>

              <div className={styles.example}>
                <h3>Command Benefits</h3>
                <ul>
                  <li>Consistent API surface</li>
                  <li>Easy to test and mock</li>
                  <li>Composable and extensible</li>
                  <li>Clear separation of concerns</li>
                </ul>
              </div>

              <div className={styles.example}>
                <h3>Registry Design</h3>
                <p>
                  Organize commands by domain (inline, block, list, etc.) and
                  provide clear naming conventions. Commands should be pure
                  functions that return success/failure.
                </p>
              </div>
            </section>

            <section id="schema-first">
              <h2>Schema-First Design</h2>
              <p>
                Schemas define the contract between different parts of your
                system, ensuring consistency and enabling powerful tooling and
                validation.
              </p>

              <div className={styles.example}>
                <h3>Schema Benefits</h3>
                <ul>
                  <li>Clear contracts between systems</li>
                  <li>Automatic validation and type safety</li>
                  <li>Better tooling and developer experience</li>
                  <li>Easier evolution and migration</li>
                </ul>
              </div>

              <div className={styles.example}>
                <h3>Schema Evolution</h3>
                <p>
                  Design schemas to be extensible. Use versioning strategies and
                  migration paths to handle breaking changes gracefully.
                </p>
              </div>
            </section>

            <section id="engine-adapters">
              <h2>Engine Adapter Pattern</h2>
              <p>
                Adapters abstract vendor-specific implementations behind stable
                interfaces, enabling you to swap implementations without
                changing your core logic.
              </p>

              <div className={styles.example}>
                <h3>When to Use Adapters</h3>
                <ul>
                  <li>Multiple implementation options</li>
                  <li>Vendor lock-in concerns</li>
                  <li>Testing and mocking needs</li>
                  <li>Performance optimization requirements</li>
                </ul>
              </div>

              <div className={styles.example}>
                <h3>Adapter Design</h3>
                <p>
                  Define a minimal, stable interface that captures the essential
                  behavior. Keep vendor-specific details in the adapter
                  implementation.
                </p>
              </div>
            </section>

            <section id="validation-governance">
              <h2>Validation & Governance</h2>
              <p>
                Automated validation ensures your design system maintains
                quality and consistency as it scales. Governance patterns help
                teams make the right decisions.
              </p>

              <div className={styles.example}>
                <h3>What to Validate</h3>
                <ul>
                  <li>Component structure and exports</li>
                  <li>Token usage and naming</li>
                  <li>Accessibility requirements</li>
                  <li>API contracts and schemas</li>
                </ul>
              </div>

              <div className={styles.example}>
                <h3>Governance Strategies</h3>
                <ul>
                  <li>Automated linting and testing</li>
                  <li>Design review processes</li>
                  <li>Documentation requirements</li>
                  <li>Breaking change policies</li>
                </ul>
              </div>
            </section>
          </div>
        </DocLayout>
      </div>
    </DocLayoutProvider>
  );
}

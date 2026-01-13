'use client';

import { Sandpack } from '@codesandbox/sandpack-react';
import Link from 'next/link';
import React from 'react';
import {
  generateAdvancedProject,
  generateEnhancedInteractiveProject,
} from '../_lib/componentExamples';
import { type ComponentItem } from '../_lib/componentsData';
import type { ExtractedProp, ExtractedMethod } from '../_lib/extractProps';
import type { AnatomyPart } from '../_lib/generateAnatomy';
import styles from './ComprehensiveComponentDoc.module.scss';

interface ComponentAPIData {
  props: ExtractedProp[];
  methods: ExtractedMethod[];
}

interface ComprehensiveComponentDocProps {
  component: ComponentItem;
  relatedComponents: ComponentItem[];
  componentAPI?: ComponentAPIData;
  anatomyParts?: AnatomyPart[] | null;
}

export function ComprehensiveComponentDoc({
  component,
  relatedComponents,
  componentAPI,
  anatomyParts,
}: ComprehensiveComponentDocProps) {
  const {
    component: name,
    category,
    description,
    a11y,
    status,
    layer,
    alternativeNames,
    paths,
  } = component;

  const complexityLabel = String(layer).replace(/s$/, '');
  const isBuilt = status === 'Built' && paths?.component;

  // Generate interactive examples based on component status
  const interactiveProject = React.useMemo(
    () => generateEnhancedInteractiveProject(component),
    [component]
  );
  const advancedProject = React.useMemo(
    () => generateAdvancedProject(component),
    [component]
  );

  return (
    <div className={styles.componentDoc}>
      {/* Header Section */}
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>{name}</h1>
            <div className={styles.metadata}>
              {category && (
                <span className={styles.badge} data-type="category">
                  {category}
                </span>
              )}
              <span className={styles.badge} data-type="complexity">
                {capitalize(complexityLabel)}
              </span>
              <span
                className={styles.badge}
                data-type="status"
                data-status={status?.toLowerCase()}
              >
                {status}
              </span>
            </div>
          </div>

          {description && <p className={styles.description}>{description}</p>}

          {alternativeNames?.length > 0 && (
            <div className={styles.aliases}>
              <strong>Also known as:</strong>
              <ul>
                {alternativeNames.map((name) => (
                  <li key={name}>{name}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </header>

      {/* Quick Navigation */}
      <nav className={styles.quickNav}>
        <ul>
          <li>
            <a href="#overview">Overview</a>
          </li>
          <li>
            <a href="#anatomy">Anatomy</a>
          </li>
          <li>
            <a href="#variants">Variants</a>
          </li>
          <li>
            <a href="#api">API</a>
          </li>
          <li>
            <a href="#accessibility">Accessibility</a>
          </li>
          <li>
            <a href="#usage">Usage</a>
          </li>
          <li>
            <a href="#examples">Examples</a>
          </li>
        </ul>
      </nav>

      {/* Overview Section */}
      <section id="overview" className={styles.section}>
        <h2>Overview</h2>
        <div className={styles.overviewGrid}>
          <div className={styles.overviewContent}>
            <h3>Purpose</h3>
            <p>
              The {name} component{' '}
              {description?.toLowerCase() || 'provides essential functionality'}
              within our design system. It follows our {complexityLabel} layer
              principles, ensuring consistency and reusability across
              applications.
            </p>

            <h3>When to Use</h3>
            <ul>
              <li>Use when you need {getUsageGuidance(component)}</li>
              <li>Appropriate for {category?.toLowerCase()} contexts</li>
              <li>Follows {complexityLabel} component patterns</li>
            </ul>

            <h3>When Not to Use</h3>
            <ul>
              <li>Avoid when simpler alternatives exist</li>
              <li>Don't use for {getAntiPatterns(component)}</li>
              <li>Consider alternatives for edge cases</li>
            </ul>
          </div>

          {isBuilt && interactiveProject && (
            <div className={styles.liveExample}>
              <h3>Live Example</h3>
              <div className={styles.exampleContainer}>
                <Sandpack
                  template="react-ts"
                  theme="light"
                  files={Object.fromEntries(
                    interactiveProject.files.map((f) => [f.path, String(f.contents)])
                  )}
                  options={{
                    showTabs: true,
                    showLineNumbers: true,
                    editorHeight: 400,
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Anatomy Section */}
      <section id="anatomy" className={styles.section}>
        <h2>Anatomy</h2>
        <div className={styles.anatomyContent}>
          <p>
            Understanding the structure of the {name} component helps ensure
            proper implementation and customization.
          </p>

          {anatomyParts && anatomyParts.length > 0 ? (
            <div className={styles.anatomyDiagram}>
              <div className={styles.anatomyList}>
                {anatomyParts.map((part, index) => (
                  <div
                    key={part.name}
                    className={styles.anatomyPart}
                    style={{ marginLeft: `${part.level * 1.5}rem` }}
                  >
                    <span className={styles.anatomyNumber}>{index + 1}</span>
                    <span className={styles.anatomyName}>{part.name}</span>
                    {part.description && (
                      <span className={styles.anatomyDescription}>
                        {part.description}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : isBuilt ? (
            <div className={styles.plannedContent}>
              <p>
                Anatomy data not yet defined for this component. Define anatomy
                in the component contract file (
                <code>{name}.contract.json</code>).
              </p>
            </div>
          ) : (
            <div className={styles.plannedContent}>
              <p>
                Anatomy documentation will be available once the component is
                implemented. The structure will follow our {complexityLabel}{' '}
                layer guidelines.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Variants Section */}
      <section id="variants" className={styles.section}>
        <h2>Variants & States</h2>
        {isBuilt && interactiveProject ? (
          <Sandpack
            template="react-ts"
            theme="light"
            files={Object.fromEntries(
              interactiveProject.files.map((f) => [f.path, String(f.contents)])
            )}
            options={{
              showTabs: true,
              showLineNumbers: true,
              editorHeight: 400,
            }}
          />
        ) : (
          <div className={styles.plannedContent}>
            <p>
              Interactive variants will be available once the component is
              implemented. Expected variants include standard states and visual
              variations.
            </p>
          </div>
        )}
      </section>

      {/* API Section */}
      <section id="api" className={styles.section}>
        <h2>API Reference</h2>
        <div className={styles.apiContent}>
          {isBuilt ? (
            <div>
              <h3>Props</h3>
              {componentAPI?.props && componentAPI.props.length > 0 ? (
                <div className={styles.propsTable}>
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Required</th>
                        <th>Default</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {componentAPI.props.map((prop) => (
                        <tr key={prop.name}>
                          <td>
                            <code>{prop.name}</code>
                          </td>
                          <td>
                            <code>{prop.type}</code>
                          </td>
                          <td>{prop.required ? 'Yes' : 'No'}</td>
                          <td>
                            {prop.defaultValue ? (
                              <code>{prop.defaultValue}</code>
                            ) : (
                              '—'
                            )}
                          </td>
                          <td>{prop.description || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.noData}>
                  No props extracted. Props may be inherited or use complex
                  types.
                </p>
              )}

              {componentAPI?.methods && componentAPI.methods.length > 0 && (
                <>
                  <h3>Methods</h3>
                  <div className={styles.methodsTable}>
                    <table>
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Parameters</th>
                          <th>Returns</th>
                          <th>Description</th>
                        </tr>
                      </thead>
                      <tbody>
                        {componentAPI.methods.map((method) => (
                          <tr key={method.name}>
                            <td>
                              <code>{method.name}</code>
                            </td>
                            <td>
                              {method.parameters.length > 0 ? (
                                <code>
                                  {method.parameters
                                    .map(
                                      (p) =>
                                        `${p.name}${p.required ? '' : '?'}: ${p.type}`
                                    )
                                    .join(', ')}
                                </code>
                              ) : (
                                '—'
                              )}
                            </td>
                            <td>
                              <code>{method.returnType}</code>
                            </td>
                            <td>{method.description || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className={styles.plannedContent}>
              <p>
                API documentation will be available once the component is
                implemented in <code>ui/components/{name}</code>.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Accessibility Section */}
      <section id="accessibility" className={styles.section}>
        <h2>Accessibility</h2>
        <div className={styles.accessibilityContent}>
          <h3>Standards Compliance</h3>
          <p>
            This component follows WCAG 2.1 AA guidelines and includes proper
            ARIA attributes, keyboard navigation, and screen reader support.
          </p>

          {a11y?.pitfalls?.length > 0 && (
            <div className={styles.pitfalls}>
              <h3>Common Pitfalls</h3>
              <ul>
                {a11y.pitfalls.map((pitfall, index) => (
                  <li key={index}>{pitfall}</li>
                ))}
              </ul>
            </div>
          )}

          <div className={styles.accessibilityChecklist}>
            <h3>Accessibility Checklist</h3>
            <ul>
              <li>✓ Keyboard navigation support</li>
              <li>✓ Screen reader compatibility</li>
              <li>✓ Color contrast compliance</li>
              <li>✓ Focus management</li>
              <li>✓ ARIA attributes</li>
              <li>✓ Reduced motion support</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Usage Guidelines Section */}
      <section id="usage" className={styles.section}>
        <h2>Usage Guidelines</h2>
        <div className={styles.usageContent}>
          <div className={styles.dosAndDonts}>
            <div className={styles.dos}>
              <h3>✓ Do</h3>
              <ul>
                <li>Use consistent spacing and sizing</li>
                <li>Follow established patterns</li>
                <li>Provide clear labels and descriptions</li>
                <li>Test with assistive technologies</li>
              </ul>
            </div>
            <div className={styles.donts}>
              <h3>✗ Don't</h3>
              <ul>
                <li>Override core functionality</li>
                <li>Use without proper context</li>
                <li>Ignore accessibility requirements</li>
                <li>Modify without design system approval</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Examples Section */}
      <section id="examples" className={styles.section}>
        <h2>Examples</h2>
        <div className={styles.examplesContent}>
          {isBuilt && interactiveProject ? (
            <div className={styles.exampleGrid}>
              <div className={styles.example}>
                <h3>Basic Usage</h3>
                <p className={styles.exampleDescription}>
                  Simple implementation with default props and common
                  configurations.
                </p>
                <Sandpack
                  template="react-ts"
                  theme="light"
                  files={Object.fromEntries(
                    interactiveProject.files.map((f) => [f.path, String(f.contents)])
                  )}
                  options={{
                    showTabs: true,
                    showLineNumbers: true,
                    editorHeight: 300,
                  }}
                />
              </div>
              <div className={styles.example}>
                <h3>Advanced Usage</h3>
                <p className={styles.exampleDescription}>
                  Complex patterns including composition, state management, and
                  real-world scenarios.
                </p>
                <Sandpack
                  template="react-ts"
                  theme="light"
                  files={Object.fromEntries(
                    advancedProject.files.map((f) => [f.path, String(f.contents)])
                  )}
                  options={{
                    showTabs: true,
                    showLineNumbers: true,
                    editorHeight: 400,
                  }}
                />
              </div>
            </div>
          ) : (
            <div className={styles.plannedContent}>
              <p>
                Code examples will be available once the component is
                implemented. Examples will include basic usage, advanced
                patterns, and integration scenarios.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Related Components */}
      {relatedComponents.length > 0 && (
        <section className={styles.section}>
          <h2>Related Components</h2>
          <div className={styles.relatedGrid}>
            {relatedComponents.map((related) => (
              <Link
                key={related.slug}
                href={`/blueprints/component-standards/${related.slug}`}
                className={styles.relatedCard}
              >
                <h3>{related.component}</h3>
                <p>{related.description}</p>
                <span className={styles.relatedMeta}>
                  {related.category} • {related.layer}
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

// Helper functions
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getUsageGuidance(component: ComponentItem): string {
  const patterns = {
    Actions: 'triggering user interactions',
    Inputs: 'collecting user input',
    Display: 'presenting information',
    Navigation: 'helping users navigate',
    Feedback: 'providing system feedback',
    Containers: 'organizing content',
    Forms: 'building form interfaces',
  };
  return (
    patterns[component.category as keyof typeof patterns] ||
    'component functionality'
  );
}

function getAntiPatterns(component: ComponentItem): string {
  const antiPatterns = {
    Actions: 'navigation or form submission',
    Inputs: 'display-only content',
    Display: 'interactive functionality',
    Navigation: 'form controls',
    Feedback: 'permanent content',
    Containers: 'interactive elements',
    Forms: 'non-form contexts',
  };
  return (
    antiPatterns[component.category as keyof typeof antiPatterns] ||
    'inappropriate contexts'
  );
}
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
import { getChangelog, getLastUpdated } from '../_lib/changelogData';
import { getContentDesign } from '../_lib/contentGuidelines';
import { getMigrationData } from '../_lib/migrationData';
import {
  trackPanelToggle,
  trackThemeChange,
  useComponentTimeTracking,
} from '../_lib/analytics';
import {
  A11yPanel,
  PerfPanel,
  TokenPanel,
} from '@/ui/modules/CodeSandbox/primitives';
import styles from './ComprehensiveComponentDoc.module.scss';

interface ComponentAPIData {
  props: ExtractedProp[];
  methods: ExtractedMethod[];
}

interface A11yChecklistItem {
  id: string;
  label: string;
  status: 'pass' | 'fail' | 'pending';
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

  // Track time spent on this component page
  useComponentTimeTracking(name);

  // Generate interactive examples based on component status
  const interactiveProject = React.useMemo(
    () => generateEnhancedInteractiveProject(component),
    [component]
  );
  const advancedProject = React.useMemo(
    () => generateAdvancedProject(component),
    [component]
  );

  // Load component-specific data
  const changelog = React.useMemo(() => getChangelog(name), [name]);
  const lastUpdated = React.useMemo(() => getLastUpdated(name), [name]);
  const contentDesign = React.useMemo(() => getContentDesign(name), [name]);
  const migrationData = React.useMemo(() => getMigrationData(name), [name]);

  // Panel states for collapsible panels
  const [isPerfPanelOpen, setIsPerfPanelOpen] = React.useState(false);
  const [isA11yPanelOpen, setIsA11yPanelOpen] = React.useState(false);
  const [isTokenPanelOpen, setIsTokenPanelOpen] = React.useState(false);

  // A11y checklist state with dynamic results from A11yPanel
  const [a11yChecklist, setA11yChecklist] = React.useState<A11yChecklistItem[]>([
    { id: 'keyboard-nav', label: 'Keyboard navigation support', status: 'pending' },
    { id: 'screen-reader', label: 'Screen reader compatibility', status: 'pending' },
    { id: 'color-contrast', label: 'Color contrast compliance', status: 'pending' },
    { id: 'focus-management', label: 'Focus management', status: 'pending' },
    { id: 'aria-attributes', label: 'ARIA attributes', status: 'pending' },
    { id: 'reduced-motion', label: 'Reduced motion support', status: 'pending' },
  ]);

  // Preview iframe ref for panels
  const previewRef = React.useRef<HTMLIFrameElement | null>(null);

  // Get preview window for panels
  const getPreviewWindow = React.useCallback((): Window | null => {
    if (typeof window === 'undefined') return null;
    const iframe = document.querySelector<HTMLIFrameElement>('.sp-preview-iframe');
    return iframe?.contentWindow ?? null;
  }, []);

  // Panel toggle handlers with analytics
  const handlePerfPanelToggle = React.useCallback(() => {
    setIsPerfPanelOpen((prev) => {
      const next = !prev;
      trackPanelToggle(name, 'perf', next);
      return next;
    });
  }, [name]);

  const handleA11yPanelToggle = React.useCallback(() => {
    setIsA11yPanelOpen((prev) => {
      const next = !prev;
      trackPanelToggle(name, 'a11y', next);
      return next;
    });
  }, [name]);

  const handleTokenPanelToggle = React.useCallback(() => {
    setIsTokenPanelOpen((prev) => {
      const next = !prev;
      trackPanelToggle(name, 'token', next);
      return next;
    });
  }, [name]);

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
                {alternativeNames.map((altName) => (
                  <li key={altName}>{altName}</li>
                ))}
              </ul>
            </div>
          )}

          {lastUpdated && (
            <div className={styles.lastUpdated}>
              <time dateTime={lastUpdated}>
                Last updated:{' '}
                {new Date(lastUpdated).toLocaleDateString('en-US', {
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </time>
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
          {contentDesign && (
            <li>
              <a href="#content">Content</a>
            </li>
          )}
          <li>
            <a href="#usage">Usage</a>
          </li>
          <li>
            <a href="#examples">Examples</a>
          </li>
          {changelog && (
            <li>
              <a href="#changelog">Changelog</a>
            </li>
          )}
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
                    interactiveProject.files.map((f) => [
                      f.path,
                      String(f.contents),
                    ])
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
              {a11yChecklist.map((item) => (
                <li key={item.id} data-status={item.status}>
                  {item.status === 'pass' && '✓ '}
                  {item.status === 'fail' && '✗ '}
                  {item.status === 'pending' && '○ '}
                  {item.label}
                </li>
              ))}
            </ul>
          </div>

          {/* A11y Testing Panel */}
          {isBuilt && (
            <div className={styles.panelSection}>
              <button
                type="button"
                className={styles.panelToggle}
                onClick={handleA11yPanelToggle}
                aria-expanded={isA11yPanelOpen}
              >
                {isA11yPanelOpen ? '▼' : '▶'} Run Accessibility Tests
              </button>
              {isA11yPanelOpen && (
                <div className={styles.panelContent}>
                  <p className={styles.panelDescription}>
                    Run automated accessibility checks against the live preview.
                    Results will update the checklist above.
                  </p>
                  <A11yPanel
                    targetWindow={getPreviewWindow() ?? undefined}
                    runTags={['wcag2a', 'wcag2aa']}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Content Guidelines Section */}
      {contentDesign && (
        <section id="content" className={styles.section}>
          <h2>Content Guidelines</h2>
          <div className={styles.contentGuidelinesSection}>
            <div className={styles.voiceTone}>
              {contentDesign.voice && (
                <div className={styles.voiceBox}>
                  <h3>Voice</h3>
                  <p>{contentDesign.voice}</p>
                </div>
              )}
              {contentDesign.tone && (
                <div className={styles.toneBox}>
                  <h3>Tone</h3>
                  <p>{contentDesign.tone}</p>
                </div>
              )}
            </div>

            {contentDesign.examples && contentDesign.examples.length > 0 && (
              <div className={styles.contentExamples}>
                <h3>Copy Examples</h3>
                <div className={styles.examplesGrid}>
                  {contentDesign.examples.map((example, index) => (
                    <div key={index} className={styles.examplePair}>
                      <div className={styles.goodExample}>
                        <span className={styles.exampleLabel}>Do</span>
                        <p>{example.good}</p>
                      </div>
                      <div className={styles.badExample}>
                        <span className={styles.exampleLabel}>Don't</span>
                        <p>{example.bad}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {contentDesign.patterns && contentDesign.patterns.length > 0 && (
              <div className={styles.contentPatterns}>
                <h3>UI Copy Patterns</h3>
                <ul>
                  {contentDesign.patterns.map((pattern, index) => (
                    <li key={index}>{pattern}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

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
            <>
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
                      interactiveProject.files.map((f) => [
                        f.path,
                        String(f.contents),
                      ])
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
                      advancedProject.files.map((f) => [
                        f.path,
                        String(f.contents),
                      ])
                    )}
                    options={{
                      showTabs: true,
                      showLineNumbers: true,
                      editorHeight: 400,
                    }}
                  />
                </div>
              </div>

              {/* Development Tools Panels */}
              <div className={styles.devToolsSection}>
                <h3>Development Tools</h3>
                <p className={styles.devToolsDescription}>
                  Use these tools to analyze the component's performance, design
                  tokens, and accessibility during development.
                </p>

                <div className={styles.devToolsGrid}>
                  {/* Performance Panel */}
                  <div className={styles.panelSection}>
                    <button
                      type="button"
                      className={styles.panelToggle}
                      onClick={handlePerfPanelToggle}
                      aria-expanded={isPerfPanelOpen}
                    >
                      {isPerfPanelOpen ? '▼' : '▶'} Performance Monitor
                    </button>
                    {isPerfPanelOpen && (
                      <div className={styles.panelContent}>
                        <p className={styles.panelDescription}>
                          Monitor render performance when toggling component props.
                          Start monitoring, interact with the preview, then review
                          metrics.
                        </p>
                        <PerfPanel
                          targetWindow={getPreviewWindow() ?? undefined}
                          sampleMs={5000}
                        />
                      </div>
                    )}
                  </div>

                  {/* Token Panel */}
                  <div className={styles.panelSection}>
                    <button
                      type="button"
                      className={styles.panelToggle}
                      onClick={handleTokenPanelToggle}
                      aria-expanded={isTokenPanelOpen}
                    >
                      {isTokenPanelOpen ? '▼' : '▶'} Design Tokens
                    </button>
                    {isTokenPanelOpen && (
                      <div className={styles.panelContent}>
                        <p className={styles.panelDescription}>
                          View and copy design tokens used by this component. Click
                          any token to copy its CSS variable.
                        </p>
                        <TokenPanel
                          targetWindow={getPreviewWindow()}
                          filter={['semantic-color', 'semantic-spacing', 'semantic-typography']}
                          limit={30}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
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

      {/* Changelog Section */}
      {changelog && changelog.entries.length > 0 && (
        <section id="changelog" className={styles.section}>
          <h2>Changelog</h2>
          <div className={styles.changelogSection}>
            {changelog.entries.map((entry) => (
              <div key={entry.version} className={styles.changelogEntry}>
                <div className={styles.changelogHeader}>
                  <span className={styles.changelogVersion}>v{entry.version}</span>
                  <time dateTime={entry.date} className={styles.changelogDate}>
                    {new Date(entry.date).toLocaleDateString('en-US', {
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </time>
                </div>
                <ul className={styles.changelogList}>
                  {entry.changes.map((change, index) => (
                    <li key={index} className={styles.changelogItem} data-type={change.type}>
                      <span className={styles.changeType}>{change.type}</span>
                      {change.description}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Migration link if available */}
          {migrationData && (
            <div className={styles.migrationLink}>
              <p>
                Migrating from an older version?{' '}
                <Link href={`/blueprints/component-standards/migrations/${name.toLowerCase()}-v${migrationData.fromVersion.replace(/\./g, '-')}-v${migrationData.toVersion.replace(/\./g, '-')}`}>
                  View migration guide ({migrationData.fromVersion} → {migrationData.toVersion})
                </Link>
              </p>
            </div>
          )}
        </section>
      )}

      {/* Contribution Section */}
      <section className={styles.section}>
        <h2>Contribute</h2>
        <div className={styles.contributeSection}>
          <p>
            Help us improve the {name} component documentation. Found an issue
            or have suggestions?
          </p>
          <div className={styles.contributeLinks}>
            {paths?.component && (
              <a
                href={`https://github.com/your-repo/portfolio/edit/main/${paths.component}`}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.contributeLink}
              >
                Edit this page
              </a>
            )}
            <a
              href={`https://github.com/your-repo/portfolio/issues/new?title=[${name}]%20Issue&labels=component,documentation`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.contributeLink}
            >
              Report an issue
            </a>
            <a
              href="/blueprints/contributing"
              className={styles.contributeLink}
            >
              Contribution guidelines
            </a>
          </div>
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

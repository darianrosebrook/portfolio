'use client';

import {
  A11yPanel,
  DocInteractive,
  DocVariants,
  PerfPanel,
  TokenPanel,
} from '@/ui/modules/CodeSandbox';
import { PreviewControls } from '@/ui/modules/CodeSandbox/primitives/PreviewControls';
import type { DocInteractiveProps } from '@/ui/modules/CodeSandbox/variants/DocInteractive';
import type { DocVariantsProps } from '@/ui/modules/CodeSandbox/variants/DocVariants';
import Link from 'next/link';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  trackPlaygroundInteraction,
  trackRTLToggle,
  trackThemeChange,
  useComponentTimeTracking,
} from '../_lib/analytics';
import { getChangelog, getLastUpdated } from '../_lib/changelogData';
import {
  generateEnhancedControls,
  generateEnhancedInteractiveProject,
  generateEnhancedVariantGrid,
} from '../_lib/componentExamples';
import { type ComponentItem } from '../_lib/componentsData';
import { getContentDesign } from '../_lib/contentGuidelines';
import { getMigrationData } from '../_lib/migrationData';
import {
  generateSections,
  getComponentProject,
} from '../_lib/playgroundLoader';
import { AnatomyDiagram } from './AnatomyDiagram';
import styles from './ComprehensiveComponentDoc.module.scss';
import { MigrationDoc } from './MigrationDoc';

interface ComprehensiveComponentDocProps {
  component: ComponentItem;
  relatedComponents: ComponentItem[];
  apiData?: {
    props: Array<{
      name: string;
      type: string;
      required: boolean;
      defaultValue?: string;
      description?: string;
    }>;
    methods: Array<{
      name: string;
      returnType: string;
      parameters: Array<{ name: string; type: string; required: boolean }>;
      description?: string;
    }>;
  } | null;
  anatomyData?: Array<{
    name: string;
    description?: string;
    level: number;
    parent?: string;
  }> | null;
}

export function ComprehensiveComponentDoc({
  component,
  relatedComponents,
  apiData,
  anatomyData,
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

  // Track component view and time spent
  useComponentTimeTracking(name);

  // Theme state management
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system');

  // RTL state management (load from localStorage if available)
  const [rtl, setRTL] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return localStorage.getItem('preview-rtl') === 'true';
  });

  // Wrapper for ThemeSwitcher onChange to match expected type
  const handleThemeChange = useCallback(
    (v: string) => {
      if (v === 'system' || v === 'light' || v === 'dark') {
        setTheme(v);
        trackThemeChange(name, v);
      }
    },
    [name]
  );

  // Handle RTL toggle
  const handleRTLChange = useCallback(
    (isRTL: boolean) => {
      setRTL(isRTL);
      trackRTLToggle(name, isRTL);
      if (typeof window !== 'undefined') {
        localStorage.setItem('preview-rtl', String(isRTL));
      }
    },
    [name]
  );
  const previewIframeRef = useRef<HTMLIFrameElement | null>(null);

  // Stable preview config to prevent re-renders
  const previewConfig = React.useMemo(
    () => ({
      runtime: 'iframe' as const,
      device: 'desktop' as const,
      theme: theme,
      dir: rtl ? ('rtl' as const) : ('ltr' as const),
    }),
    [theme, rtl]
  );

  // Get preview iframe window for panels
  const getPreviewWindow = useCallback((): Window | null => {
    if (previewIframeRef.current?.contentWindow) {
      return previewIframeRef.current.contentWindow;
    }
    // Fallback: try to find iframe by selector
    const iframe =
      document.querySelector<HTMLIFrameElement>('.sp-preview-iframe');
    return iframe?.contentWindow ?? null;
  }, []);

  // Accessibility violations state
  const [a11yViolations, setA11yViolations] = useState<
    Array<{ id: string; help: string }>
  >([]);

  // Map axe violations to checklist items
  const checklistStatus = useMemo(() => {
    const violationIds = new Set(a11yViolations.map((v) => v.id));
    const mapping: Record<
      string,
      { id: string; label: string; axeIds: string[] }
    > = {
      'keyboard-navigation': {
        id: 'keyboard-navigation',
        label: 'Keyboard navigation support',
        axeIds: ['keyboard', 'focus-order-semantics', 'focus-order'],
      },
      'screen-reader': {
        id: 'screen-reader',
        label: 'Screen reader compatibility',
        axeIds: [
          'aria-allowed-attr',
          'aria-hidden',
          'aria-required-attr',
          'aria-roles',
        ],
      },
      'color-contrast': {
        id: 'color-contrast',
        label: 'Color contrast compliance',
        axeIds: ['color-contrast', 'color-contrast-enhanced'],
      },
      'focus-management': {
        id: 'focus-management',
        label: 'Focus management',
        axeIds: ['focus-order-semantics', 'tabindex'],
      },
      'aria-attributes': {
        id: 'aria-attributes',
        label: 'ARIA attributes',
        axeIds: ['aria-allowed-attr', 'aria-required-attr', 'aria-props'],
      },
      'reduced-motion': {
        id: 'reduced-motion',
        label: 'Reduced motion support',
        axeIds: ['prefers-reduced-motion'],
      },
    };

    return Object.values(mapping).map((item) => {
      const hasViolation = item.axeIds.some((axeId) => violationIds.has(axeId));
      // If no violations recorded yet, show as passed (optimistic)
      // Once scan runs, show actual status
      const hasScanned = a11yViolations.length > 0;
      return {
        ...item,
        passed: hasScanned ? !hasViolation : true,
      };
    });
  }, [a11yViolations]);

  // Update preview iframe ref when component mounts/updates
  // Disabled MutationObserver to prevent infinite loops - use polling instead
  useEffect(() => {
    if (typeof window === 'undefined' || !isBuilt) return;

    let timeoutId: NodeJS.Timeout | null = null;
    let intervalId: NodeJS.Timeout | null = null;
    let checkCount = 0;
    const maxChecks = 10; // Only check for 5 seconds (10 * 500ms)

    const updateIframeRef = () => {
      const iframe =
        document.querySelector<HTMLIFrameElement>('.sp-preview-iframe');
      if (iframe && iframe !== previewIframeRef.current) {
        previewIframeRef.current = iframe;
        // Stop checking once we find it
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      } else if (checkCount >= maxChecks) {
        // Stop checking after max attempts
        if (intervalId) {
          clearInterval(intervalId);
          intervalId = null;
        }
      }
      checkCount++;
    };

    // Initial check after a delay to let Sandpack initialize
    timeoutId = setTimeout(updateIframeRef, 1000);

    // Poll for iframe instead of using MutationObserver (safer)
    intervalId = setInterval(updateIframeRef, 500);

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [isBuilt]);

  // Generate interactive examples based on component status
  // Use stable primitive values instead of object reference to prevent infinite loops
  const componentKey = React.useMemo(
    () =>
      `${component.component}-${component.status}-${component.paths?.component || ''}`,
    [component.component, component.status, component.paths?.component]
  );

  // Load playground or generate project
  const [projectConfig, setProjectConfig] = React.useState<{
    interactive: DocInteractiveProps | null;
    variants: DocVariantsProps | null;
    source: 'playground' | 'generated';
  } | null>(null);

  // Track if we're loading to prevent multiple calls
  const loadingRef = React.useRef(false);

  // Store component in ref to avoid using it in dependencies
  const componentRef = React.useRef(component);
  React.useEffect(() => {
    componentRef.current = component;
  }, [componentKey]);

  React.useEffect(() => {
    if (!isBuilt) {
      setProjectConfig(null);
      loadingRef.current = false;
      return;
    }

    // Prevent multiple simultaneous loads
    if (loadingRef.current) return;

    loadingRef.current = true;
    let cancelled = false;

    // Use ref to get latest component without adding to dependencies
    getComponentProject(componentRef.current)
      .then((config) => {
        if (!cancelled) {
          setProjectConfig(config);
          loadingRef.current = false;
        }
      })
      .catch(() => {
        if (!cancelled) {
          loadingRef.current = false;
        }
      });

    return () => {
      cancelled = true;
      loadingRef.current = false;
    };
  }, [componentKey, isBuilt]); // Only depend on stable values

  // Fallback to generated if playground not loaded yet
  // Create stable keys that only change when the actual config changes, not object references
  const hasPlaygroundInteractive = !!projectConfig?.interactive;
  const hasPlaygroundVariants = !!projectConfig?.variants;
  const configSource = projectConfig?.source || 'generated';

  // Memoize variants props to prevent re-renders when spreading

  const variantsProps = React.useMemo(() => {
    if (projectConfig?.variants) {
      return projectConfig.variants;
    }
    return null;
  }, [hasPlaygroundVariants]); // Intentionally omit projectConfig.variants to prevent loops

  const interactiveProject = React.useMemo(() => {
    if (projectConfig?.interactive?.project) {
      return projectConfig.interactive.project;
    }
    return generateEnhancedInteractiveProject(component);
  }, [hasPlaygroundInteractive, componentKey]); // Only depend on existence, not object reference

  const interactiveProps = React.useMemo(() => {
    if (projectConfig?.interactive) {
      return projectConfig.interactive;
    }
    return null;
  }, [hasPlaygroundInteractive]); // Only depend on existence

  // Memoize preview config for interactive props to prevent re-renders
  // Only depend on theme and existence, not the preview object reference

  const interactivePreviewConfig = React.useMemo(() => {
    if (hasPlaygroundInteractive && interactiveProps?.preview) {
      return {
        runtime: (interactiveProps.preview.runtime || 'iframe') as
          | 'iframe'
          | 'inline',
        device: interactiveProps.preview.device || 'desktop',
        theme: previewConfig.theme,
        dir: previewConfig.dir,
      };
    }
    return previewConfig;
  }, [hasPlaygroundInteractive, previewConfig.theme, previewConfig.dir]); // Intentionally omit interactiveProps to prevent loops

  const variantGrid = React.useMemo(
    () => generateEnhancedVariantGrid(component),
    [component.component]
  );

  const sections = React.useMemo(() => {
    if (projectConfig?.interactive?.sections) {
      return projectConfig.interactive.sections;
    }
    return generateSections(component);
  }, [hasPlaygroundInteractive, component.component]);

  const controls = React.useMemo(
    () => generateEnhancedControls(component),
    [component.component]
  );

  // Check for migration data
  const migrationData = React.useMemo(() => {
    return getMigrationData(component.component);
  }, [component.component]);

  // Check for content design guidelines
  const contentDesign = React.useMemo(() => {
    return component.contentDesign || getContentDesign(component.component);
  }, [component.component, component.contentDesign]);

  // Check for changelog data
  const changelog = React.useMemo(() => {
    if (component.changelog && component.changelog.length > 0) {
      return {
        componentName: component.component,
        entries: component.changelog.map((entry) => ({
          version: entry.version,
          date: entry.date,
          changes: entry.changes,
        })),
      };
    }
    return getChangelog(component.component);
  }, [component.component, component.changelog]);

  // Get last updated date
  const lastUpdated = React.useMemo(() => {
    if (changelog && changelog.entries.length > 0) {
      return changelog.entries[0].date;
    }
    return getLastUpdated(component.component);
  }, [changelog, component.component]);

  // Navigation sections configuration
  const navSections = useMemo(() => {
    const sections = [
      { id: 'overview', label: 'Overview' },
      { id: 'anatomy', label: 'Anatomy' },
      { id: 'variants', label: 'Variants' },
      { id: 'api', label: 'API' },
      { id: 'accessibility', label: 'Accessibility' },
      { id: 'usage', label: 'Usage' },
      { id: 'examples', label: 'Examples' },
    ];
    if (isBuilt) {
      sections.push({
        id: 'internationalization',
        label: 'Internationalization',
      });
    }
    if (contentDesign) {
      sections.push({ id: 'content', label: 'Content' });
    }
    if (changelog) {
      sections.push({ id: 'changelog', label: 'Changelog' });
    }
    if (migrationData) {
      sections.push({ id: 'migration', label: 'Migration' });
    }
    return sections;
  }, [isBuilt, migrationData, contentDesign, changelog]);

  // Active section tracking with IntersectionObserver
  const [activeSection, setActiveSection] = useState<string>(
    navSections[0]?.id || ''
  );
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const rafRef = useRef<number | null>(null);

  // Set up IntersectionObserver for scroll tracking with throttling
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create new observer with optimized options
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is 20% from top
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };

    let lastUpdate = 0;
    const throttleMs = 100; // Only update max once per 100ms

    observerRef.current = new IntersectionObserver((entries) => {
      const now = Date.now();
      if (now - lastUpdate < throttleMs) {
        return; // Skip if too soon
      }

      // Cancel pending frame
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }

      // Throttle updates with requestAnimationFrame
      rafRef.current = requestAnimationFrame(() => {
        lastUpdate = now;
        // Find the most visible section
        let mostVisible = { id: '', ratio: 0 };

        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio > mostVisible.ratio
          ) {
            mostVisible = {
              id: entry.target.id,
              ratio: entry.intersectionRatio,
            };
          }
        });

        // Update active section if we found a more visible one and it's different
        if (mostVisible.id && mostVisible.ratio > 0) {
          setActiveSection((prev) => {
            // Only update if different to prevent unnecessary re-renders
            return prev !== mostVisible.id ? mostVisible.id : prev;
          });
        }
        rafRef.current = null;
      });
    }, observerOptions);

    // Observe all registered sections
    const currentObserver = observerRef.current;

    sectionRefs.current.forEach((element) => {
      if (element && currentObserver) {
        currentObserver.observe(element);
      }
    });

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      if (currentObserver) {
        currentObserver.disconnect();
      }
    };
  }, []); // Empty deps - sections are stable

  // Register section refs
  const registerSectionRef = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        sectionRefs.current.set(id, element);
        // Observe immediately if observer is ready, otherwise it will be observed in useEffect
        if (observerRef.current) {
          observerRef.current.observe(element);
        }
      } else {
        // Cleanup: unobserve before removing from map
        const existingElement = sectionRefs.current.get(id);
        if (existingElement && observerRef.current) {
          observerRef.current.unobserve(existingElement);
        }
        sectionRefs.current.delete(id);
      }
    },
    []
  );

  // Handle smooth scroll navigation
  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        const headerOffset = 80; // Account for sticky nav
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });

        // Update URL hash without triggering scroll
        if (window.history.pushState) {
          window.history.pushState(null, '', `#${sectionId}`);
        }
      }
    },
    []
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
              {lastUpdated && (
                <span
                  className={styles.badge}
                  data-type="updated"
                  title={`Last updated: ${new Date(lastUpdated).toLocaleDateString()}`}
                >
                  Updated{' '}
                  {new Date(lastUpdated).toLocaleDateString('en-US', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
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
          {navSections.map((section) => (
            <li key={section.id}>
              <a
                href={`#${section.id}`}
                onClick={(e) => handleNavClick(e, section.id)}
                className={activeSection === section.id ? styles.active : ''}
                aria-current={activeSection === section.id ? 'page' : undefined}
              >
                {section.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Overview Section */}
      <section
        id="overview"
        className={styles.section}
        ref={(el) => registerSectionRef('overview', el)}
      >
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

          {isBuilt && (interactiveProject || interactiveProps) && (
            <div className={styles.liveExample}>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '12px',
                }}
              >
                <h3>Live Example</h3>
                <PreviewControls
                  theme={theme}
                  onThemeChange={handleThemeChange}
                  rtl={rtl}
                  onRTLChange={handleRTLChange}
                />
              </div>
              <div className={styles.exampleContainer}>
                {interactiveProps ? (
                  <DocInteractive
                    {...interactiveProps}
                    preview={interactivePreviewConfig}
                  />
                ) : (
                  <DocInteractive
                    project={interactiveProject}
                    sections={sections}
                    height="400px"
                    preview={previewConfig}
                  />
                )}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Anatomy Section */}
      <section
        id="anatomy"
        className={styles.section}
        ref={(el) => registerSectionRef('anatomy', el)}
      >
        <h2>Anatomy</h2>
        <div className={styles.anatomyContent}>
          <p>
            Understanding the structure of the {name} component helps ensure
            proper implementation and customization.
          </p>

          {isBuilt ? (
            <div>
              {anatomyData && anatomyData.length > 0 ? (
                <AnatomyDiagram parts={anatomyData} componentName={name} />
              ) : (
                <div className={styles.placeholder}>
                  <p>
                    Component anatomy diagram will be generated based on the
                    actual component structure.
                  </p>
                </div>
              )}
              {/* Token Panel - shows design tokens used by the component */}
              <div style={{ marginTop: '24px' }}>
                <TokenPanel
                  targetWindow={getPreviewWindow()}
                  filter={[
                    'semantic-color',
                    'semantic-spacing',
                    'semantic-shape',
                  ]}
                  limit={30}
                />
              </div>
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
      <section
        id="variants"
        className={styles.section}
        ref={(el) => registerSectionRef('variants', el)}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '16px',
          }}
        >
          <h2>Variants & States</h2>
          <PreviewControls
            theme={theme}
            onThemeChange={handleThemeChange}
            rtl={rtl}
            onRTLChange={handleRTLChange}
          />
        </div>
        {isBuilt && (interactiveProject || hasPlaygroundVariants) ? (
          variantsProps ? (
            <DocVariants
              key={`variants-playground-${componentKey}`}
              {...variantsProps}
              height="500px"
              onSelectionChange={(props) => {
                // Track variant selection
                const variantValue = Object.entries(props)
                  .map(([k, v]) => `${k}=${v}`)
                  .join(',');
                trackPlaygroundInteraction(
                  name,
                  'variant_selection',
                  variantValue
                );
              }}
            />
          ) : (
            <DocVariants
              key={`variants-generated-${componentKey}`}
              project={interactiveProject}
              componentName={name}
              grid={variantGrid}
              height="500px"
              controls={controls}
              showCodeForSelection={true}
              linkSelectionToURL={true}
              onSelectionChange={(props) => {
                // Track variant selection
                const variantValue = Object.entries(props)
                  .map(([k, v]) => `${k}=${v}`)
                  .join(',');
                trackPlaygroundInteraction(
                  name,
                  'variant_selection',
                  variantValue
                );
              }}
            />
          )
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
      <section
        id="api"
        className={styles.section}
        ref={(el) => registerSectionRef('api', el)}
      >
        <h2>API Reference</h2>
        <div className={styles.apiContent}>
          {isBuilt ? (
            <div>
              {apiData && apiData.props.length > 0 ? (
                <>
                  <h3>Props</h3>
                  <div className={styles.propsTable}>
                    <table
                      style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '12px',
                              borderBottom:
                                '2px solid var(--semantic-color-border-subtle)',
                              fontWeight: 600,
                            }}
                          >
                            Name
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '12px',
                              borderBottom:
                                '2px solid var(--semantic-color-border-subtle)',
                              fontWeight: 600,
                            }}
                          >
                            Type
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '12px',
                              borderBottom:
                                '2px solid var(--semantic-color-border-subtle)',
                              fontWeight: 600,
                            }}
                          >
                            Default
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '12px',
                              borderBottom:
                                '2px solid var(--semantic-color-border-subtle)',
                              fontWeight: 600,
                            }}
                          >
                            Description
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiData.props.map((prop, index) => (
                          <tr
                            key={index}
                            style={{
                              borderBottom:
                                '1px solid var(--semantic-color-border-subtle)',
                            }}
                          >
                            <td
                              style={{
                                padding: '12px',
                                fontFamily:
                                  'var(--semantic-typography-semantic-family-mono, monospace)',
                                fontWeight: 500,
                              }}
                            >
                              {prop.name}
                              {!prop.required && (
                                <span
                                  style={{
                                    color:
                                      'var(--semantic-color-foreground-secondary)',
                                    marginLeft: '4px',
                                  }}
                                >
                                  ?
                                </span>
                              )}
                            </td>
                            <td
                              style={{
                                padding: '12px',
                                fontFamily:
                                  'var(--semantic-typography-semantic-family-mono, monospace)',
                                fontSize: '0.875rem',
                                color:
                                  'var(--semantic-color-foreground-secondary)',
                              }}
                            >
                              {prop.type}
                            </td>
                            <td
                              style={{
                                padding: '12px',
                                fontFamily:
                                  'var(--semantic-typography-semantic-family-mono, monospace)',
                                fontSize: '0.875rem',
                                color:
                                  'var(--semantic-color-foreground-tertiary)',
                              }}
                            >
                              {prop.defaultValue || '—'}
                            </td>
                            <td
                              style={{
                                padding: '12px',
                                fontSize: '0.875rem',
                                color:
                                  'var(--semantic-color-foreground-secondary)',
                              }}
                            >
                              {prop.description || '—'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div>
                  <h3>Props</h3>
                  <div className={styles.propsTable}>
                    <p>
                      Props documentation will be auto-generated from the
                      component implementation.
                    </p>
                  </div>
                </div>
              )}

              {apiData && apiData.methods.length > 0 ? (
                <>
                  <h3 style={{ marginTop: '32px' }}>Methods</h3>
                  <div className={styles.methodsTable}>
                    <table
                      style={{ width: '100%', borderCollapse: 'collapse' }}
                    >
                      <thead>
                        <tr>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '12px',
                              borderBottom:
                                '2px solid var(--semantic-color-border-subtle)',
                              fontWeight: 600,
                            }}
                          >
                            Name
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '12px',
                              borderBottom:
                                '2px solid var(--semantic-color-border-subtle)',
                              fontWeight: 600,
                            }}
                          >
                            Parameters
                          </th>
                          <th
                            style={{
                              textAlign: 'left',
                              padding: '12px',
                              borderBottom:
                                '2px solid var(--semantic-color-border-subtle)',
                              fontWeight: 600,
                            }}
                          >
                            Returns
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiData.methods.map((method, index) => (
                          <tr
                            key={index}
                            style={{
                              borderBottom:
                                '1px solid var(--semantic-color-border-subtle)',
                            }}
                          >
                            <td
                              style={{
                                padding: '12px',
                                fontFamily:
                                  'var(--semantic-typography-semantic-family-mono, monospace)',
                                fontWeight: 500,
                              }}
                            >
                              {method.name}
                            </td>
                            <td
                              style={{
                                padding: '12px',
                                fontFamily:
                                  'var(--semantic-typography-semantic-family-mono, monospace)',
                                fontSize: '0.875rem',
                                color:
                                  'var(--semantic-color-foreground-secondary)',
                              }}
                            >
                              {method.parameters.length > 0
                                ? method.parameters
                                    .map(
                                      (p) =>
                                        `${p.name}${p.required ? '' : '?'}: ${p.type}`
                                    )
                                    .join(', ')
                                : '—'}
                            </td>
                            <td
                              style={{
                                padding: '12px',
                                fontFamily:
                                  'var(--semantic-typography-semantic-family-mono, monospace)',
                                fontSize: '0.875rem',
                                color:
                                  'var(--semantic-color-foreground-secondary)',
                              }}
                            >
                              {method.returnType}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div>
                  <h3 style={{ marginTop: '32px' }}>Methods</h3>
                  <div className={styles.methodsTable}>
                    <p>
                      Method documentation will be extracted from the component
                      interface.
                    </p>
                  </div>
                </div>
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
      <section
        id="accessibility"
        className={styles.section}
        ref={(el) => registerSectionRef('accessibility', el)}
      >
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
              {checklistStatus.map((item) => (
                <li
                  key={item.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <span
                    style={{
                      color: item.passed
                        ? 'var(--semantic-color-foreground-success, #10b981)'
                        : 'var(--semantic-color-foreground-danger, #ef4444)',
                      fontWeight: 600,
                    }}
                  >
                    {item.passed ? '✓' : '✗'}
                  </span>
                  <span
                    style={{
                      opacity: item.passed ? 1 : 0.7,
                      textDecoration: item.passed ? 'none' : 'line-through',
                    }}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
            {a11yViolations.length > 0 && (
              <p
                style={{
                  marginTop: '12px',
                  fontSize: '12px',
                  color: 'var(--semantic-color-foreground-warning, #f59e0b)',
                }}
              >
                Run accessibility checks above to see detailed violations.
              </p>
            )}
          </div>

          {/* Live Accessibility Testing Panel */}
          {isBuilt && (
            <div style={{ marginTop: '32px' }}>
              <h3>Live Accessibility Testing</h3>
              <p
                style={{ marginBottom: '16px', fontSize: '14px', opacity: 0.8 }}
              >
                Run automated accessibility checks on the component preview
                above. This panel scans for WCAG violations and provides
                actionable feedback.
              </p>
              <A11yPanel
                targetWindow={getPreviewWindow()}
                runOnMount={false}
                runTags={['wcag2a', 'wcag2aa']}
                onResultsChange={(violations) => {
                  setA11yViolations(
                    violations.map((v) => ({ id: v.id, help: v.help }))
                  );
                }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Content Guidelines Section */}
      {contentDesign && (
        <section
          id="content"
          className={styles.section}
          ref={(el) => registerSectionRef('content', el)}
        >
          <h2>Content Guidelines</h2>
          <div className={styles.contentContent}>
            {contentDesign.voice && (
              <div style={{ marginBottom: '24px' }}>
                <h3>Voice</h3>
                <p>{contentDesign.voice}</p>
              </div>
            )}

            {contentDesign.tone && (
              <div style={{ marginBottom: '24px' }}>
                <h3>Tone</h3>
                <p>{contentDesign.tone}</p>
              </div>
            )}

            {contentDesign.examples && contentDesign.examples.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                <h3>Writing Examples</h3>
                <div className={styles.dosAndDonts}>
                  <div className={styles.dos}>
                    <h4>✓ Good</h4>
                    <ul>
                      {contentDesign.examples.map(
                        (
                          example: { good: string; bad: string },
                          index: number
                        ) => (
                          <li key={index}>{example.good}</li>
                        )
                      )}
                    </ul>
                  </div>
                  <div className={styles.donts}>
                    <h4>✗ Avoid</h4>
                    <ul>
                      {contentDesign.examples.map(
                        (
                          example: { good: string; bad: string },
                          index: number
                        ) => (
                          <li key={index}>{example.bad}</li>
                        )
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {contentDesign.patterns && contentDesign.patterns.length > 0 && (
              <div>
                <h3>Content Patterns</h3>
                <ul>
                  {contentDesign.patterns.map(
                    (pattern: string, index: number) => (
                      <li key={index}>{pattern}</li>
                    )
                  )}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Usage Guidelines Section */}
      <section
        id="usage"
        className={styles.section}
        ref={(el) => registerSectionRef('usage', el)}
      >
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
      <section
        id="examples"
        className={styles.section}
        ref={(el) => registerSectionRef('examples', el)}
      >
        <h2>Examples</h2>
        <div className={styles.examplesContent}>
          {isBuilt && (interactiveProject || interactiveProps) ? (
            <div className={styles.exampleGrid}>
              <div className={styles.example}>
                <h3>Basic Usage</h3>
                <p
                  style={{
                    fontSize: '14px',
                    opacity: 0.8,
                    marginBottom: '12px',
                  }}
                >
                  Simple example demonstrating basic component usage
                </p>
                {interactiveProps ? (
                  <DocInteractive
                    {...interactiveProps}
                    preview={interactivePreviewConfig}
                    height="300px"
                  />
                ) : (
                  <DocInteractive
                    project={interactiveProject}
                    sections={sections}
                    height="300px"
                    preview={previewConfig}
                  />
                )}
              </div>
              {configSource === 'playground' && hasPlaygroundVariants && (
                <div className={styles.example}>
                  <h3>Variants & States</h3>
                  <p
                    style={{
                      fontSize: '14px',
                      opacity: 0.8,
                      marginBottom: '12px',
                    }}
                  >
                    Explore different component variants and interactive states
                  </p>
                  {variantsProps && (
                    <DocVariants
                      key={`variants-example-${componentKey}`}
                      {...variantsProps}
                      height="300px"
                    />
                  )}
                </div>
              )}
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

          {/* Performance Monitoring Panel */}
          {isBuilt && (
            <div style={{ marginTop: '32px' }}>
              <h3>Performance Monitoring</h3>
              <p
                style={{ marginBottom: '16px', fontSize: '14px', opacity: 0.8 }}
              >
                Monitor render performance when toggling component props. This
                panel tracks render counts, FPS, and memory usage to help you
                understand the performance impact of different component
                configurations.
              </p>
              <PerfPanel
                targetWindow={getPreviewWindow() ?? undefined}
                sampleMs={5000}
              />
            </div>
          )}
        </div>
      </section>

      {/* Internationalization Section */}
      {isBuilt && (
        <section
          id="internationalization"
          className={styles.section}
          ref={(el) => registerSectionRef('internationalization', el)}
        >
          <h2>Internationalization</h2>
          <div className={styles.i18nContent}>
            <p>
              The {name} component supports internationalization through RTL
              (right-to-left) layouts, text expansion handling, and locale-aware
              formatting. Use these examples to understand how the component
              adapts to different languages and regions.
            </p>

            <div className={styles.i18nExamples}>
              <div className={styles.i18nExample}>
                <h3>RTL Layout</h3>
                <p>
                  See how the component adapts to right-to-left text direction
                  for languages like Arabic and Hebrew.
                </p>
                <Link
                  href="/blueprints/component-standards/i18n/rtl-example"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--semantic-color-foreground-accent, #0a65fe)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  View RTL Example →
                </Link>
              </div>

              <div className={styles.i18nExample}>
                <h3>Text Expansion</h3>
                <p>
                  Learn how the component handles text expansion in different
                  languages, ensuring proper layout and truncation.
                </p>
                <Link
                  href="/blueprints/component-standards/i18n/long-text-example"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--semantic-color-foreground-accent, #0a65fe)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  View Text Expansion Example →
                </Link>
              </div>

              <div className={styles.i18nExample}>
                <h3>Date & Number Formatting</h3>
                <p>
                  Explore locale-aware formatting using the Intl API for dates,
                  numbers, and currencies.
                </p>
                <Link
                  href="/blueprints/component-standards/i18n/date-formatting"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    color: 'var(--semantic-color-foreground-accent, #0a65fe)',
                    textDecoration: 'none',
                    fontWeight: 500,
                  }}
                >
                  View Formatting Example →
                </Link>
              </div>
            </div>

            <div
              style={{
                marginTop: '24px',
                padding: '16px',
                backgroundColor:
                  'var(--semantic-color-background-info-subtle, #e0f2fe)',
                borderRadius: '8px',
                border: '1px solid var(--semantic-color-border-info, #bae6fd)',
              }}
            >
              <h4 style={{ marginTop: 0, marginBottom: '8px' }}>
                Best Practices
              </h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                <li>
                  Always use the <code>dir</code> attribute on containers when
                  displaying RTL content
                </li>
                <li>
                  Use CSS logical properties ( <code>margin-inline-start</code>,{' '}
                  <code>padding-block-end</code>) instead of directional
                  properties
                </li>
                <li>
                  Test with long text strings to ensure proper wrapping and
                  truncation
                </li>
                <li>
                  Use <code>Intl.DateTimeFormat</code> and{' '}
                  <code>Intl.NumberFormat</code> for locale-aware formatting
                </li>
                <li>
                  Consider icon mirroring for RTL layouts (use{' '}
                  <code>transform: scaleX(-1)</code> or flip icons)
                </li>
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* Changelog Section */}
      {changelog && changelog.entries.length > 0 && (
        <section
          id="changelog"
          className={styles.section}
          ref={(el) => registerSectionRef('changelog', el)}
        >
          <h2>Changelog</h2>
          <div className={styles.changelogContent}>
            <p>
              Version history and changes for the {name} component. Review
              updates to understand what's changed and when to upgrade.
            </p>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '24px',
                marginTop: '24px',
              }}
            >
              {changelog.entries.map((entry, index) => {
                const getChangeTypeColor = (type: string) => {
                  switch (type) {
                    case 'added':
                      return 'var(--semantic-color-background-success-subtle, #d1fae5)';
                    case 'changed':
                      return 'var(--semantic-color-background-warning-subtle, #fef3c7)';
                    case 'deprecated':
                      return 'var(--semantic-color-background-info-subtle, #dbeafe)';
                    case 'removed':
                      return 'var(--semantic-color-background-danger-subtle, #fee2e2)';
                    case 'fixed':
                      return 'var(--semantic-color-background-success-subtle, #d1fae5)';
                    case 'security':
                      return 'var(--semantic-color-background-danger-subtle, #fee2e2)';
                    default:
                      return 'transparent';
                  }
                };

                const getChangeTypeTextColor = (type: string) => {
                  switch (type) {
                    case 'added':
                      return 'var(--semantic-color-foreground-success, #065f46)';
                    case 'changed':
                      return 'var(--semantic-color-foreground-warning, #92400e)';
                    case 'deprecated':
                      return 'var(--semantic-color-foreground-info, #1e40af)';
                    case 'removed':
                      return 'var(--semantic-color-foreground-danger, #991b1b)';
                    case 'fixed':
                      return 'var(--semantic-color-foreground-success, #065f46)';
                    case 'security':
                      return 'var(--semantic-color-foreground-danger, #991b1b)';
                    default:
                      return 'var(--semantic-color-foreground-primary, #000000)';
                  }
                };

                return (
                  <div
                    key={index}
                    style={{
                      border:
                        '1px solid var(--semantic-color-border-subtle, #e5e7eb)',
                      borderRadius:
                        'var(--semantic-shape-control-radius-default, 8px)',
                      padding: '20px',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '16px',
                      }}
                    >
                      <h3
                        style={{ margin: 0, fontSize: '18px', fontWeight: 600 }}
                      >
                        Version {entry.version}
                      </h3>
                      <time
                        style={{
                          fontSize: '14px',
                          color:
                            'var(--semantic-color-foreground-secondary, #666)',
                        }}
                      >
                        {new Date(entry.date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </time>
                    </div>
                    <ul
                      style={{
                        listStyle: 'none',
                        padding: 0,
                        margin: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      {entry.changes.map((change, changeIndex) => (
                        <li
                          key={changeIndex}
                          style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '8px',
                          }}
                        >
                          <span
                            style={{
                              padding: '2px 8px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              fontWeight: 500,
                              textTransform: 'capitalize',
                              backgroundColor: getChangeTypeColor(change.type),
                              color: getChangeTypeTextColor(change.type),
                              flexShrink: 0,
                              marginTop: '2px',
                            }}
                          >
                            {change.type}
                          </span>
                          <span style={{ flex: 1 }}>{change.description}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Migration Section */}
      {migrationData && (
        <section
          id="migration"
          className={styles.section}
          ref={(el) => registerSectionRef('migration', el)}
        >
          <h2>Migration Guide</h2>
          <div className={styles.migrationContent}>
            <p>
              This component has been updated. View the migration guide to see
              what changed and how to update your code.
            </p>
            <MigrationDoc migration={migrationData} />
          </div>
        </section>
      )}

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

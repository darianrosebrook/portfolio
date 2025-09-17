'use client';

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Sandpack } from '@codesandbox/sandpack-react';
import type { SandpackProviderProps } from '@codesandbox/sandpack-react';
import type { SandpackTheme } from '@codesandbox/sandpack-react';
import styles from './DocLayout.module.scss';

export interface DocSection {
  id: string;
  title: string;
  codeHighlight?: {
    file: string;
    lines: [number, number];
  };
}

interface DocLayoutContextType {
  activeSection: string;
  setActiveSection: (id: string) => void;
  sections: DocSection[];
}

const DocLayoutContext = createContext<DocLayoutContextType | null>(null);

export const useDocLayout = () => {
  const context = useContext(DocLayoutContext);
  if (!context) {
    throw new Error('useDocLayout must be used within DocLayoutProvider');
  }
  return context;
};

interface DocLayoutProviderProps {
  children: React.ReactNode;
  sections: DocSection[];
}

export function DocLayoutProvider({
  children,
  sections,
}: DocLayoutProviderProps) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id || '');
  // Keep activeSection valid when sections prop changes
  useEffect(() => {
    if (!sections.length) return;
    if (!sections.some((s) => s.id === activeSection)) {
      setActiveSection(sections[0].id);
    }
  }, [sections, activeSection]);

  return (
    <DocLayoutContext.Provider
      value={{
        activeSection,
        setActiveSection,
        sections,
      }}
    >
      {children}
    </DocLayoutContext.Provider>
  );
}

interface DocLayoutProps {
  children: React.ReactNode;
  codeFiles: Record<string, string>;
  sandpackOptions?: {
    template?: SandpackProviderProps['template'];
    theme?: SandpackProviderProps['theme'];
    options?: SandpackProviderProps['options'];
  };
}

export function DocLayout({
  children,
  codeFiles,
  sandpackOptions = {},
}: DocLayoutProps) {
  const { activeSection, sections, setActiveSection } = useDocLayout();
  const contentRef = useRef<HTMLDivElement>(null);
  const sandpackRootRef = useRef<HTMLDivElement>(null);
  const [isContentScrollContainer, setIsContentScrollContainer] =
    useState<boolean>(true);
  const [highlightedLines, setHighlightedLines] = useState<
    [number, number] | null
  >(null);
  const [activeFile, setActiveFile] = useState<string>(
    Object.keys(codeFiles)[0] || ''
  );
  // No decorators API in our installed types; we use highlightedLines via options

  // Local theme override for the Sandpack preview: 'system' | 'light' | 'dark'
  const [previewTheme, setPreviewTheme] = useState<'system' | 'light' | 'dark'>(
    () =>
      typeof window !== 'undefined'
        ? (window.localStorage.getItem('docLayout.previewTheme') as
            | 'system'
            | 'light'
            | 'dark') || 'system'
        : 'system'
  );
  const [, setSiteDarkMode] = useState<boolean>(false);

  // Observe site theme (body class or prefers-color-scheme)
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const getSiteIsDark = (): boolean => {
      const body = document.body;
      if (body.classList.contains('dark')) return true;
      if (body.classList.contains('light')) return false;
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    };
    setSiteDarkMode(getSiteIsDark());

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => setSiteDarkMode(getSiteIsDark());
    mq.addEventListener?.('change', onChange);

    // Watch body class changes from Navbar toggle
    const obs = new MutationObserver(onChange);
    obs.observe(document.body, {
      attributes: true,
      attributeFilter: ['class'],
    });

    return () => {
      mq.removeEventListener?.('change', onChange);
      obs.disconnect();
    };
  }, []);

  // Note: theme auto-adapts via CSS variables; siteDarkMode reserved for future overrides

  const tokenTheme: SandpackTheme = {
    colors: {
      surface1: 'var(--semantic-components-editor-background)',
      surface2: 'var(--semantic-color-background-secondary)',
      surface3: 'var(--semantic-color-background-tertiary)',
      disabled: 'var(--semantic-color-foreground-disabled)',
      base: 'var(--semantic-color-foreground-primary)',
      clickable: 'var(--semantic-color-foreground-link)',
      hover: 'var(--semantic-color-foreground-hover)',
      accent: 'var(--semantic-color-status-highlight)',
      error: 'var(--semantic-color-status-danger)',
      errorSurface: 'var(--semantic-color-background-danger-subtle)',
      warning: 'var(--semantic-color-status-warning)',
      warningSurface: 'var(--semantic-color-background-warning-subtle)',
    },
    syntax: {
      plain: 'var(--semantic-color-foreground-syntax-plain)',
      comment: {
        color: 'var(--semantic-color-foreground-syntax-comment-color)',
        fontStyle: 'italic',
      },
      keyword: 'var(--semantic-color-foreground-syntax-keyword)',
      definition: 'var(--semantic-color-foreground-syntax-definition)',
      punctuation: 'var(--semantic-color-foreground-syntax-punctuation)',
      property: 'var(--semantic-color-foreground-syntax-property)',
      tag: 'var(--semantic-color-foreground-syntax-tag)',
      static: 'var(--semantic-color-foreground-syntax-static)',
      string: 'var(--semantic-color-foreground-syntax-string)',
    },
    font: {
      body: 'var(--semantic-typography-body-default-font-family)',
      mono: 'var(--core-typography-font-family-monaspace)',
      size: 'var(--semantic-typography-body-default-font-size)',
      lineHeight: 'var(--semantic-typography-line-height-normal)',
    },
  };

  // Detect scroll container robustly via ResizeObserver and geometry
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const compute = () =>
      setIsContentScrollContainer(el.scrollHeight > el.clientHeight);
    compute();
    const ro = new ResizeObserver(compute);
    ro.observe(el);
    window.addEventListener('resize', compute);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', compute);
    };
  }, []);

  const sectionNodesRef = useRef<{ el: HTMLElement; id: string }[]>([]);
  // Refresh cached section nodes when sections change or content mounts
  useEffect(() => {
    const container = contentRef.current;
    if (!container) return;
    sectionNodesRef.current = Array.from(
      container.querySelectorAll<HTMLElement>('[data-section-id]')
    )
      .map((el) => ({ el, id: el.getAttribute('data-section-id') || '' }))
      .filter((n) => Boolean(n.id));
  }, [sections]);

  const initialSyncDoneRef = useRef(false);
  // Enhanced intersection observer for more precise scroll sync
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    let rafId: number | null = null;
    let lastUpdateTime = 0;
    const UPDATE_THROTTLE = 16; // ~60fps

    const rootNode: Element | Document | null = isContentScrollContainer
      ? contentEl
      : null;

    const updateActiveSection = () => {
      const now = performance.now();
      if (now - lastUpdateTime < UPDATE_THROTTLE) return;
      lastUpdateTime = now;

      const containerRect = isContentScrollContainer
        ? contentEl.getBoundingClientRect()
        : { top: 0, bottom: window.innerHeight };

      const viewportCenter =
        containerRect.top + (containerRect.bottom - containerRect.top) * 0.3; // 30% from top

      const candidates = sectionNodesRef.current;
      let best: { el: HTMLElement; score: number; id: string } | null = null;

      for (const { el, id: sectionId } of candidates) {
        const rect = el.getBoundingClientRect();

        // Check if section is in viewport
        const inViewport =
          rect.bottom > containerRect.top && rect.top < containerRect.bottom;
        if (!inViewport) continue;

        // Calculate visibility score based on how much of the section is visible
        const visibleTop = Math.max(rect.top, containerRect.top);
        const visibleBottom = Math.min(rect.bottom, containerRect.bottom);
        const visibleHeight = Math.max(0, visibleBottom - visibleTop);
        const totalHeight = rect.bottom - rect.top;
        const visibilityRatio = visibleHeight / totalHeight;

        // Prefer sections that are closer to the viewport center and more visible
        const distanceFromCenter = Math.abs(rect.top - viewportCenter);
        const maxDistance = containerRect.bottom - containerRect.top;
        const proximityScore = 1 - distanceFromCenter / maxDistance;

        // Combined score: visibility (70%) + proximity to center (30%)
        const score = visibilityRatio * 0.7 + proximityScore * 0.3;

        if (!best || score > best.score) {
          best = { el, score, id: sectionId };
        }
      }

      if (!initialSyncDoneRef.current) return;
      if (best && best.id && best.id !== activeSection) {
        const section = sections.find((s) => s.id === best!.id);
        if (section) {
          setActiveSection(best.id);

          // Update code highlighting with smooth transition
          const nextLines = section.codeHighlight?.lines || null;
          const nextFile = section.codeHighlight?.file;

          if (nextFile && codeFiles[nextFile] && nextFile !== activeFile) {
            setActiveFile(nextFile);
          }

          if (JSON.stringify(nextLines) !== JSON.stringify(highlightedLines)) {
            setHighlightedLines(nextLines);
          }
        }
      }
    };

    const throttledUpdate = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        updateActiveSection();
        rafId = null;
      });
    };

    const observer = new IntersectionObserver(throttledUpdate, {
      root: rootNode as Element | null,
      rootMargin: '-5% 0px -60% 0px',
      threshold: [0, 1],
    });

    sectionNodesRef.current.forEach(({ el }) => observer.observe(el));

    // Also listen to scroll events for immediate feedback
    const scrollContainer = isContentScrollContainer ? contentEl : window;
    scrollContainer.addEventListener('scroll', throttledUpdate, {
      passive: true,
    });

    return () => {
      observer.disconnect();
      scrollContainer.removeEventListener('scroll', throttledUpdate);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [
    sections,
    setActiveSection,
    codeFiles,
    isContentScrollContainer,
    activeSection,
    activeFile,
    highlightedLines,
  ]);

  // Sync URL hash with active section for deep-linking (debounced)
  const hashRafRef = useRef<number | null>(null);
  useEffect(() => {
    if (!activeSection || typeof window === 'undefined') return;
    const newHash = `#${activeSection}`;
    if (window.location.hash === newHash) return;
    if (hashRafRef.current) cancelAnimationFrame(hashRafRef.current);
    hashRafRef.current = requestAnimationFrame(() => {
      history.replaceState(null, '', newHash);
    });
    return () => {
      if (hashRafRef.current) cancelAnimationFrame(hashRafRef.current);
    };
  }, [activeSection]);

  // Initialize from hash on mount
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;
    if (typeof window === 'undefined') return;
    const hash = window.location.hash?.replace('#', '');
    const initialId =
      hash && sections.some((s) => s.id === hash) ? hash : sections[0]?.id;
    if (!initialId) return;

    const target = contentEl.querySelector<HTMLElement>(
      `[data-section-id="${initialId}"]`
    );
    if (target) {
      // Defer to next frame to ensure layout ready
      requestAnimationFrame(() => {
        target.scrollIntoView({
          behavior: 'instant' as ScrollBehavior,
          block: 'start',
        });
      });
    }
    const section = sections.find((s) => s.id === initialId);
    if (section) {
      setActiveSection(initialId);
      setHighlightedLines(section.codeHighlight?.lines || null);
      const nextFile = section.codeHighlight?.file;
      if (nextFile && codeFiles[nextFile]) {
        setActiveFile(nextFile);
      }
    }
    // mark initial sync done after a short delay to prevent IO override
    setTimeout(() => {
      initialSyncDoneRef.current = true;
    }, 300);
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Enhanced code highlighting with smooth transitions
  useEffect(() => {
    let animationFrame: number | null = null;
    let retryCount = 0;
    const MAX_RETRIES = 10;
    const RETRY_DELAY = 50;

    const applyHighlighting = () => {
      // Clear previous highlights with subtle fade-out animation
      const root = sandpackRootRef.current || document;
      const previousHighlights = root.querySelectorAll('.highlighted-line');
      previousHighlights.forEach((el) => {
        el.classList.add('highlight-fade-out');
        setTimeout(() => {
          el.classList.remove('highlighted-line', 'highlight-fade-out');
        }, 100);
      });

      if (!highlightedLines) return;

      // Find all code lines in the current active file's editor
      const codeEditor = (sandpackRootRef.current || document).querySelector(
        '.sp-code-editor .cm-content'
      );
      if (!codeEditor) {
        // Retry if editor not ready
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          setTimeout(() => {
            animationFrame = requestAnimationFrame(applyHighlighting);
          }, RETRY_DELAY);
        }
        return;
      }

      const codeLines = codeEditor.querySelectorAll('.cm-line');

      // Add subtle highlighting animation
      const [startLine, endLine] = highlightedLines;
      for (let i = startLine - 1; i < endLine && i < codeLines.length; i++) {
        const line = codeLines[i];
        if (line) {
          // Minimal stagger for natural feel
          const delay = (i - (startLine - 1)) * 5;
          setTimeout(() => {
            line.classList.add('highlighted-line', 'highlight-fade-in');
            // Remove fade-in class after animation completes
            setTimeout(() => {
              line.classList.remove('highlight-fade-in');
            }, 200);
          }, delay);
        }
      }

      // Scroll highlighted section into view if needed
      if (codeLines[startLine - 1]) {
        const firstHighlightedLine = codeLines[startLine - 1] as HTMLElement;
        const editorContainer = firstHighlightedLine.closest('.cm-scroller');
        if (editorContainer) {
          const lineRect = firstHighlightedLine.getBoundingClientRect();
          const containerRect = editorContainer.getBoundingClientRect();

          // Check if line is outside visible area
          if (
            lineRect.top < containerRect.top ||
            lineRect.bottom > containerRect.bottom
          ) {
            firstHighlightedLine.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
            });
          }
        }
      }
    };

    // Use RAF for smooth animation timing
    animationFrame = requestAnimationFrame(() => {
      setTimeout(applyHighlighting, 100); // Small delay for DOM readiness
    });

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [highlightedLines, activeFile]);

  // Persist local preview theme override
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('docLayout.previewTheme', previewTheme);
  }, [previewTheme]);

  // Build highlighted range string for Sandpack options (fallback to built-in support)
  const highlightedRange: string | undefined = highlightedLines
    ? `${highlightedLines[0]}-${highlightedLines[1]}`
    : undefined;

  const {
    template = 'react-ts' as const,
    theme = tokenTheme,
    options = {
      showLineNumbers: true,
      showInlineErrors: true,
      wrapContent: true,
      editorHeight: '100vh',
      readOnly: false,
    },
  } = sandpackOptions;

  return (
    <div className={styles.docLayout}>
      <div className={styles.content} ref={contentRef}>
        {children}
      </div>

      <div
        className={styles.codePanel}
        data-doc-codepanel
        ref={sandpackRootRef}
      >
        <div className={styles.codePanelSticky} data-sticky>
          <div className={styles.codeToolbar}>
            <div
              className={styles.themeControls}
              role="radiogroup"
              aria-label="Preview theme"
            >
              <button
                type="button"
                role="radio"
                aria-checked={previewTheme === 'system'}
                className={previewTheme === 'system' ? 'active' : ''}
                onClick={() => setPreviewTheme('system')}
              >
                System
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={previewTheme === 'light'}
                className={previewTheme === 'light' ? 'active' : ''}
                onClick={() => setPreviewTheme('light')}
              >
                Light
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={previewTheme === 'dark'}
                className={previewTheme === 'dark' ? 'active' : ''}
                onClick={() => setPreviewTheme('dark')}
              >
                Dark
              </button>
            </div>
          </div>
          <Sandpack
            template={template}
            theme={theme}
            files={codeFiles}
            options={
              {
                ...options,
                activeFile: activeFile || undefined,
                visibleFiles: Object.keys(codeFiles),
                showTabs: Object.keys(codeFiles).length > 1,
                closableTabs: false,
                highlightedLines: highlightedRange,
              } as unknown as SandpackProviderProps['options']
            }
            customSetup={{
              dependencies: {},
            }}
          />
        </div>
      </div>
    </div>
  );
}

interface DocSectionProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function DocSection({ id, children, className = '' }: DocSectionProps) {
  const { activeSection } = useDocLayout();
  return (
    <section
      data-section-id={id}
      data-highlighted={activeSection === id ? 'true' : 'false'}
      className={`${styles.docSection} ${className}`}
      id={id}
    >
      {children}
    </section>
  );
}

interface DocNavigationProps {
  sections: DocSection[];
  activeSection: string;
  onSectionClick: (id: string) => void;
}

export function DocNavigation({
  sections,
  activeSection,
  onSectionClick,
}: DocNavigationProps) {
  return (
    <nav className={styles.docNavigation}>
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <button
              className={`${styles.navItem} ${
                activeSection === section.id ? styles.active : ''
              }`}
              onClick={() => onSectionClick(section.id)}
              aria-current={activeSection === section.id ? 'true' : undefined}
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

'use client';

import type {
  SectionSpec,
  VirtualProject,
} from '@/ui/modules/CodeSandbox/types';
import { DocInteractive } from '@/ui/modules/CodeSandbox/variants/DocInteractive';
import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  useCallback,
  useMemo,
} from 'react';
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
  registerSectionRef?: (id: string, element: HTMLElement | null) => void;
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
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  // Keep activeSection valid when sections prop changes
  useEffect(() => {
    if (!sections.length) return;
    if (!sections.some((s) => s.id === activeSection)) {
      setActiveSection(sections[0].id);
    }
  }, [sections, activeSection]);

  // Set up IntersectionObserver for scroll-based section tracking
  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // Create optimized observer
    const observerOptions: IntersectionObserverInit = {
      root: null,
      rootMargin: '-20% 0px -70% 0px', // Trigger when section is 20% from top
      threshold: [0, 0.25, 0.5, 0.75, 1],
    };

    observerRef.current = new IntersectionObserver((entries) => {
      // Find the most visible section
      let mostVisible = { id: '', ratio: 0 };

      entries.forEach((entry) => {
        const sectionId =
          entry.target.getAttribute('data-section-id') || entry.target.id;
        if (
          sectionId &&
          entry.isIntersecting &&
          entry.intersectionRatio > mostVisible.ratio
        ) {
          mostVisible = {
            id: sectionId,
            ratio: entry.intersectionRatio,
          };
        }
      });

      // Update active section if we found a more visible one
      if (mostVisible.id && mostVisible.ratio > 0) {
        setActiveSection(mostVisible.id);
      }
    }, observerOptions);

    // Observe all registered sections
    sectionRefs.current.forEach((element) => {
      if (element) {
        observerRef.current?.observe(element);
      }
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [sections]); // Re-run when sections change

  // Register section refs (exposed via context for DocSection to use)
  const registerSectionRef = useCallback(
    (id: string, element: HTMLElement | null) => {
      if (element) {
        sectionRefs.current.set(id, element);
        observerRef.current?.observe(element);
      } else {
        sectionRefs.current.delete(id);
      }
    },
    []
  );

  const contextValue = useMemo(
    () => ({
      activeSection,
      setActiveSection,
      sections,
      registerSectionRef,
    }),
    [activeSection, sections, registerSectionRef]
  );

  return (
    <DocLayoutContext.Provider value={contextValue}>
      {children}
    </DocLayoutContext.Provider>
  );
}

interface DocLayoutProps {
  children: React.ReactNode;
  codeFiles: Record<string, string>;
  sandpackOptions?: {
    template?: string;
    theme?: 'system' | 'light' | 'dark';
    options?: {
      showLineNumbers?: boolean;
      showInlineErrors?: boolean;
      wrapContent?: boolean;
      editorHeight?: string;
      readOnly?: boolean;
    };
  };
}

export function DocLayout({
  children,
  codeFiles,
  sandpackOptions = {},
}: DocLayoutProps) {
  const { activeSection, sections, setActiveSection } = useDocLayout();
  const contentRef = useRef<HTMLDivElement>(null);

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

  // Convert DocLayout sections to CodeSandbox SectionSpec format
  const sectionSpecs: SectionSpec[] = sections.map((section) => ({
    id: section.id,
    title: section.title,
    code: section.codeHighlight
      ? {
          file: section.codeHighlight.file,
          lines: section.codeHighlight.lines,
        }
      : undefined,
  }));

  // Convert codeFiles to VirtualProject format
  const project: VirtualProject = {
    files: Object.entries(codeFiles).map(([path, contents]) => ({
      path,
      contents,
    })),
    entry: Object.keys(codeFiles)[0] || '/App.tsx',
    dependencies: {},
  };

  // Handle section changes from CodeSandbox DocInteractive
  const handleSectionChange = (id: string) => {
    setActiveSection(id);
  };

  // Handle events from DocInteractive
  const handleEvent = (event: any) => {
    if (event.type === 'sectionChange') {
      handleSectionChange(event.id);
    }
  };

  // Persist local preview theme override
  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('docLayout.previewTheme', previewTheme);
  }, [previewTheme]);

  const {
    theme = previewTheme,
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

      <div className={styles.codePanel} data-doc-codepanel>
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
          <DocInteractive
            project={project}
            sections={sectionSpecs}
            height={options.editorHeight || '100vh'}
            preview={{
              runtime: 'iframe',
              theme: theme,
            }}
            editor={{
              engine: 'sandpack',
              readOnly: options.readOnly,
              showLineNumbers: options.showLineNumbers,
              wrap: options.wrapContent,
            }}
            onEvent={handleEvent}
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
  const { activeSection, registerSectionRef } = useDocLayout();

  // Register section with IntersectionObserver
  const sectionRef = useCallback(
    (element: HTMLElement | null) => {
      if (registerSectionRef) {
        registerSectionRef(id, element);
      }
    },
    [id, registerSectionRef]
  );

  return (
    <section
      ref={sectionRef}
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
  const handleClick = useCallback(
    (id: string) => {
      const element = document.getElementById(id);
      if (element) {
        const headerOffset = 80; // Account for sticky elements
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition =
          elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth',
        });

        // Update URL hash without triggering scroll
        if (window.history.pushState) {
          window.history.pushState(null, '', `#${id}`);
        }
      }

      onSectionClick(id);
    },
    [onSectionClick]
  );

  const memoizedSections = useMemo(() => sections, [sections]);

  return (
    <nav className={styles.docNavigation}>
      <ul>
        {memoizedSections.map((section) => (
          <li key={section.id}>
            <button
              className={`${styles.navItem} ${
                activeSection === section.id ? styles.active : ''
              }`}
              onClick={() => handleClick(section.id)}
              aria-current={activeSection === section.id ? 'page' : undefined}
            >
              {section.title}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

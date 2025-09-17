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
  setSections: (sections: DocSection[]) => void;
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
  const [sectionsState, setSections] = useState(sections);

  return (
    <DocLayoutContext.Provider
      value={{
        activeSection,
        setActiveSection,
        sections: sectionsState,
        setSections,
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
  const [isContentScrollContainer, setIsContentScrollContainer] =
    useState<boolean>(true);
  const [highlightedLines, setHighlightedLines] = useState<
    [number, number] | null
  >(null);
  const [activeFile, setActiveFile] = useState<string>(
    Object.keys(codeFiles)[0] || ''
  );
  // No decorators API in our installed types; we use highlightedLines via options

  // Detect whether `.content` acts as the scroll container (desktop) or the window does (mobile)
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;
    const computeIsScrollContainer = () => {
      const computed = getComputedStyle(contentEl);
      const overflowY = computed.overflowY;
      const maxHeight = computed.maxHeight;
      const isScrollable =
        (overflowY === 'auto' || overflowY === 'scroll') &&
        maxHeight !== 'none';
      setIsContentScrollContainer(isScrollable);
    };
    computeIsScrollContainer();
    // Re-evaluate on resize
    window.addEventListener('resize', computeIsScrollContainer);
    return () => window.removeEventListener('resize', computeIsScrollContainer);
  }, []);

  // Set up intersection observer for scroll sync
  useEffect(() => {
    const contentEl = contentRef.current;
    if (!contentEl) return;

    const rootNode: Element | Document | null = isContentScrollContainer
      ? contentEl
      : null;

    const observer = new IntersectionObserver(
      () => {
        // Determine the section whose top is closest to the top of the scroll container viewport
        const containerTop = isContentScrollContainer
          ? contentEl.getBoundingClientRect().top || 0
          : 0;
        const candidates = Array.from(
          contentEl.querySelectorAll<HTMLElement>('[data-section-id]')
        );
        let best: { el: HTMLElement; dist: number } | null = null;
        for (const el of candidates) {
          const rect = el.getBoundingClientRect();
          const distanceFromTop = Math.abs(rect.top - containerTop - 16); // bias slightly below top
          // Only consider elements that are at least partially visible within viewport
          const inView =
            rect.bottom >
              (isContentScrollContainer
                ? contentEl.getBoundingClientRect().top
                : 0) &&
            rect.top <
              (isContentScrollContainer
                ? contentEl.getBoundingClientRect().bottom
                : window.innerHeight);
          if (!inView) continue;
          if (!best || distanceFromTop < best.dist) {
            best = { el, dist: distanceFromTop };
          }
        }
        if (best) {
          const sectionId = best.el.getAttribute('data-section-id');
          if (sectionId) {
            const section = sections.find((s) => s.id === sectionId);
            if (section) {
              setHighlightedLines(section.codeHighlight?.lines || null);
              const nextFile = section.codeHighlight?.file;
              if (nextFile && codeFiles[nextFile]) {
                setActiveFile(nextFile);
              }
              if (sectionId !== activeSection) {
                setActiveSection(sectionId);
              }
            }
          }
        }
      },
      {
        root: rootNode as Element | null,
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.1, 0.3, 0.5, 0.7, 1],
      }
    );

    const sectionElements = contentEl.querySelectorAll('[data-section-id]');
    sectionElements.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [
    sections,
    setActiveSection,
    codeFiles,
    isContentScrollContainer,
    activeSection,
  ]);

  // Sync URL hash with active section for deep-linking
  useEffect(() => {
    if (!activeSection) return;
    const newHash = `#${activeSection}`;
    if (typeof window !== 'undefined' && window.location.hash !== newHash) {
      history.replaceState(null, '', newHash);
    }
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
    // run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Build highlighted range string for Sandpack options
  const highlightedRange = highlightedLines
    ? `${highlightedLines[0]}-${highlightedLines[1]}`
    : undefined;

  const {
    template = 'react-ts' as const,
    theme = 'light',
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
      <div className={styles.codePanel}>
        <div className={styles.codePanelSticky}>
          <Sandpack
            template={template}
            theme={theme}
            files={codeFiles}
            options={
              {
                ...options,
                activeFile: activeFile || undefined,
                highlightedLines: highlightedRange,
              } as unknown as SandpackProviderProps['options']
            }
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

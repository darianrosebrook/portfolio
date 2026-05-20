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
} from 'react';
import './DocLayout.css';

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
  // Resolve at render: if activeSection is no longer in sections, fall back to first
  const resolvedActiveSection =
    sections.some((s) => s.id === activeSection)
      ? activeSection
      : (sections[0]?.id ?? '');

  return (
    <DocLayoutContext.Provider
      value={{
        activeSection: resolvedActiveSection,
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
  const {
    activeSection: _activeSection,
    sections,
    setActiveSection,
  } = useDocLayout();
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
    <div data-ds-component="DocLayout" className="docLayout">
      <div className="content" ref={contentRef}>
        {children}
      </div>

      <div className="codePanel" data-doc-codepanel>
        <div className="codePanelSticky" data-sticky>
          <div className="codeToolbar">
            <div
              className="themeControls"
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
  const { activeSection } = useDocLayout();
  return (
    <section
      data-section-id={id}
      data-highlighted={activeSection === id ? 'true' : 'false'}
      className={`docSection ${className}`}
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
    <nav className="docNavigation">
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            <button
              className={`navItem ${
                activeSection === section.id ? 'active' : ''
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

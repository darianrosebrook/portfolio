import { describe, it, expect } from 'vitest';
import {
  extractProps,
  parsePropsFromContent,
} from '@/app/blueprints/component-standards/_lib/extractProps';

/**
 * Behavior pins for the props documentation extractor. The doc pages render
 * whatever this returns as the component's API table, so wrong output is
 * user-visible:
 *   - exact-name declaration preference: a compound component declaring
 *     SelectTriggerProps before SelectProps must document SelectProps
 *   - one-level local relative extends resolution: Toast (empty body,
 *     extends ./ToastViewport) and TextField (extends Omit<../Input, 'id'>)
 *     must include inherited members; external/alias extends stay skipped
 *   - documented limitations, pinned so they cannot change silently:
 *     inline destructured param types (Field) return [], and a component
 *     whose exported Props is a union alias (Button) documents its
 *     BaseProps subset only
 *
 * parsePropsFromContent is pure (content + injected import resolver) and is
 * the primary surface; extractProps end-to-end pins real files on disk.
 */

const UI_COMPONENTS = 'ui/components';

describe('parsePropsFromContent declaration selection', () => {
  it('prefers the exactly-named Props declaration over an earlier Props-suffixed one', () => {
    // Select declares trigger subcomponent props first in file order;
    // the component's own API table must document SelectProps.
    const content = `
import * as React from 'react';

export interface SelectTriggerProps {
  size?: 'small' | 'medium';
  value?: string;
}

export interface SelectSearchProps {
  placeholder?: string;
}

export interface SelectProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}
`;
    const props = parsePropsFromContent(content, 'Select');
    expect(props.map((p) => p.name)).toEqual(['children']);
  });

  it('falls back to BaseProps when the exported Props is a brace-less union alias', () => {
    // Button exports `type ButtonProps = ButtonAsButton | ButtonAsAnchor`
    // (no brace body). The base props are the documented surface.
    const content = `
import * as React from 'react';

interface ButtonBaseProps {
  size?: 'small' | 'medium';
  loading?: boolean;
}

interface ButtonAsButton {
  type?: 'button' | 'submit';
}

export type ButtonProps = ButtonAsButton | ButtonAsButton & { href: string };
`;
    const props = parsePropsFromContent(content, 'Button');
    expect(props.map((p) => p.name)).toEqual(['size', 'loading']);
  });

  it('falls back to the first Props-suffixed declaration when no name matches', () => {
    const content = `
export interface WidgetProps {
  tone?: 'quiet';
}
`;
    const props = parsePropsFromContent(content, 'Mystery');
    expect(props.map((p) => p.name)).toEqual(['tone']);
  });
});

describe('parsePropsFromContent extends resolution', () => {
  it('resolves an empty-body declaration extending a local relative interface', () => {
    // Toast.tsx: `export interface ToastProps extends ToastViewportProps {}`
    const content = `
import { ToastViewportProps } from './ToastViewport';

export interface ToastProps extends ToastViewportProps {}
`;
    const props = parsePropsFromContent(content, 'Toast', (specifier) => {
      if (specifier !== './ToastViewport') return null;
      return `
export interface ToastViewportProps extends React.HTMLAttributes<HTMLDivElement> {
  politeness?: 'polite' | 'assertive';
}
`;
    });
    expect(props.map((p) => p.name)).toContain('politeness');
  });

  it('unwraps Omit extends and drops the omitted keys', () => {
    // TextField.tsx: `export interface TextFieldProps extends Omit<InputProps, 'id'>`
    const content = `
import { Input, type InputProps } from '../Input';

export interface TextFieldProps extends Omit<InputProps, 'id'> {
  id?: string;
  label?: React.ReactNode;
}
`;
    const props = parsePropsFromContent(content, 'TextField', (specifier) => {
      if (specifier !== '../Input') return null;
      return `
export interface InputProps {
  invalid?: boolean;
  id?: string;
}
`;
    });
    const names = props.map((p) => p.name);
    expect(names).toContain('label'); // own
    expect(names).toContain('invalid'); // inherited
    expect(names).not.toContain('id'); // inherited copy suppressed by Omit; own wins anyway
  });

  it('prefers own members over inherited ones on name collision', () => {
    const content = `
import { BaseProps } from './Base';

export interface WidgetProps extends BaseProps {
  tone: 'loud';
}
`;
    const props = parsePropsFromContent(content, 'Widget', () => `
export interface BaseProps {
  tone: 'quiet';
  size?: string;
}
`);
    const tone = props.find((p) => p.name === 'tone');
    expect(tone?.type).toBe("'loud'");
    expect(props.map((p) => p.name)).toContain('size');
  });

  it('skips external and alias extends without throwing', () => {
    // Dialog extends OpenStateProps, DismissibleProps imported from '@/types/ui':
    // not resolvable locally, so the extraction stays partial by design.
    const content = `
import type { OpenStateProps } from '@/types/ui';

export interface DialogProps extends OpenStateProps {
  open?: boolean;
}
`;
    const props = parsePropsFromContent(content, 'Dialog');
    expect(props.map((p) => p.name)).toEqual(['open']);
  });

  it('does not recurse into the resolved file for its own extends (one level deep)', () => {
    const content = `
import { LevelTwoProps } from './LevelTwo';

export interface LevelOneProps extends LevelTwoProps {}
`;
    const props = parsePropsFromContent(content, 'LevelOne', (specifier) => {
      expect(specifier).toBe('./LevelTwo');
      return `
import { LevelThreeProps } from './LevelThree';

export interface LevelTwoProps extends LevelThreeProps {}
`;
    });
    expect(props).toEqual([]);
  });
});

describe('parsePropsFromContent documented limitations', () => {
  it('returns [] for an inline destructured param type (Field-shaped)', () => {
    const content = `
export function Field({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return null;
}
`;
    expect(parsePropsFromContent(content, 'Field')).toEqual([]);
  });

  it('returns [] when no Props-suffixed declaration exists', () => {
    expect(parsePropsFromContent('export const x = 1;\n', 'Nothing')).toEqual(
      []
    );
  });
});

describe('extractProps end-to-end against real component sources', () => {
  it('documents Select own props, not SelectTrigger props', () => {
    const props = extractProps(
      path.join(UI_COMPONENTS, 'Select'),
      'Select'
    );
    expect(props.map((p) => p.name)).toEqual(['children']);
  });

  it('resolves Toast props inherited from ToastViewport', () => {
    const props = extractProps(path.join(UI_COMPONENTS, 'Toast'), 'Toast');
    expect(props.length).toBeGreaterThan(0);
    expect(props.map((p) => p.name)).toContain('politeness');
  });

  it('resolves TextField own props plus Input inherited members', () => {
    const props = extractProps(
      path.join(UI_COMPONENTS, 'TextField'),
      'TextField'
    );
    const names = props.map((p) => p.name);
    expect(names).toEqual(
      expect.arrayContaining(['label', 'description', 'error', 'invalid'])
    );
  });

  it('documents the Button BaseProps subset without union-arm members', () => {
    const props = extractProps(path.join(UI_COMPONENTS, 'Button'), 'Button');
    const names = props.map((p) => p.name);
    expect(names).toEqual(
      expect.arrayContaining(['size', 'variant', 'loading'])
    );
    expect(names).not.toContain('as');
    expect(names).not.toContain('href');
  });

  it('returns [] for the Field inline-destructured limitation', () => {
    expect(extractProps(path.join(UI_COMPONENTS, 'Field'), 'Field')).toEqual(
      []
    );
  });

  it('returns [] for a nonexistent component path', () => {
    expect(extractProps('no/such/dir', 'Ghost')).toEqual([]);
  });
});

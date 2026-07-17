import fs from 'fs';
import path from 'path';
import type { ComponentItem } from './componentsData';

export type AnatomyPartType =
  | { kind: 'slot'; required?: boolean }
  | { kind: 'prop'; propName: string; propType: string }
  | { kind: 'part' }
  | { kind: 'root' };

export interface AnatomyPart {
  name: string;
  description?: string;
  level: number; // nesting level
  parent?: string;
  /** Derived classification used by the docs UI to label each row. */
  type?: AnatomyPartType;
}

export interface ContractPropMember {
  name: string;
  type: string;
  description: string;
  required?: boolean;
  default?: string | number | boolean;
  nodeKind?: 'node-ref' | 'icon-ref';
}

export interface ContractTokenResolution {
  resolvesTo: string;
  fallback: string;
  property?: string;
  layer?: 'core' | 'semantic';
}

export interface ComponentContract {
  name: string;
  layer: 'primitive' | 'compound' | 'composer';
  anatomy?: string[];
  variants?: Record<string, string[]>;
  states?: string[];
  slots?: Record<string, { required: boolean; selector?: string }>;
  a11y?: {
    role?: string;
    roles?: string[];
    labeling?: string[];
    keyboard?: Array<string | { key: string; when: string; then: string }>;
    apgPattern?: string | null;
    screenReader?: string[];
  };
  tokens?: Record<string, string[] | Record<string, ContractTokenResolution>>;
  props?: Record<string, { members?: ContractPropMember[]; extends?: string }>;
  channels?: Record<string, {
    value: string;
    onChange: string;
    defaultValue?: string;
    enabledBy?: string;
    valueType?: string;
    notes?: string;
  }>;
  types?: Record<string, { kind: 'union' | 'enum' | 'alias'; values?: string[]; alias?: string }>;
  stateMachine?: {
    transitions: Array<{ event: string; from?: string | string[]; to: string; guard?: string; effect?: string }>;
  };
  focus?: {
    strategy: 'trap' | 'roving' | 'auto' | 'manual' | 'none';
    orientation?: 'horizontal' | 'vertical' | 'both';
    initialFocus?: string;
    returnFocus?: boolean;
    wrap?: boolean;
    scrollLock?: boolean;
  };
  dismissal?: Array<'escape' | 'outsideClick' | 'blur' | 'routeChange' | 'triggerReclick' | 'userDismiss' | 'selection'>;
  motion?: {
    transitions?: Array<{ name: string; duration: string; easing: string; property?: string }>;
    reducedMotion?: 'respect' | 'ignore';
    reducedMotionStrategy?: string;
  };
  portal?: {
    enabled: boolean;
    defaultTarget?: string;
    positioning?: 'anchored' | 'fixed' | 'absolute';
    layering?: 'popover' | 'dialog' | 'tooltip' | 'auto';
    collision?: string;
    backdrop?: boolean;
  };
  relationships?: Array<{ from: string; to: string; attribute: string; when?: string }>;
  ssr?: { hydrateOn: 'interaction' | 'none' | 'load' };
  rtl?: { flipIcon: boolean };
}

function componentNameToPathSegment(name: string): string {
  return name.replace(/[^a-zA-Z0-9]/g, '');
}

function resolveUiPath(candidate: string): string | null {
  const normalized = candidate.replace(/\\/g, '/');
  const componentPrefix = 'ui/components/';
  const modulePrefix = 'ui/modules/';

  if (normalized.startsWith(componentPrefix)) {
    return path.join(
      /* turbopackIgnore: true */ process.cwd(),
      'ui',
      'components',
      normalized.slice(componentPrefix.length)
    );
  }

  if (normalized.startsWith(modulePrefix)) {
    return path.join(
      /* turbopackIgnore: true */ process.cwd(),
      'ui',
      'modules',
      normalized.slice(modulePrefix.length)
    );
  }

  return null;
}

export function resolveComponentPath(component: ComponentItem): string | null {
  const candidates = [
    component.paths?.component,
    path.join('ui/components', component.component),
    path.join('ui/components', componentNameToPathSegment(component.component)),
    path.join('ui/modules', component.component),
    path.join('ui/modules', componentNameToPathSegment(component.component)),
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    const absolutePath = resolveUiPath(candidate);
    if (!absolutePath) {
      continue;
    }

    if (fs.existsSync(absolutePath)) {
      return absolutePath;
    }
  }

  return component.paths?.component
    ? resolveUiPath(component.paths.component)
    : null;
}

export function resolveComponentContractPath(
  component: ComponentItem
): string | null {
  const componentPath = resolveComponentPath(component);
  if (!componentPath) {
    return null;
  }

  if (fs.existsSync(componentPath) && fs.statSync(componentPath).isDirectory()) {
    const componentName = path.basename(componentPath);
    return path.join(componentPath, `${componentName}.contract.json`);
  }

  const componentDir = path.dirname(componentPath);
  const componentName = path.basename(componentPath, path.extname(componentPath));
  return path.join(componentDir, `${componentName}.contract.json`);
}

/**
 * Get the component contract file data.
 */
export function getComponentContract(
  component: ComponentItem
): ComponentContract | null {
  if (!component.paths?.component) {
    return null;
  }

  try {
    const contractPath = resolveComponentContractPath(component);

    if (!contractPath || !fs.existsSync(contractPath)) {
      return null;
    }

    const content = fs.readFileSync(contractPath, 'utf8');
    return JSON.parse(content) as ComponentContract;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.warn(
        `Error reading contract for ${component.component}:`,
        error instanceof Error ? error.message : String(error)
      );
    }
    return null;
  }
}

function humanizePartName(name: string): string {
  return name
    .replace(/([A-Z])/g, ' $1')
    .replace(/[-_]/g, ' ')
    .trim()
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .replace(/^./, (c) => c.toUpperCase());
}

function defaultPartDescription(name: string): string {
  if (name === 'root') return 'Outermost container that hosts the component.';
  return `${humanizePartName(name)} region of the component.`;
}

function classifyPart(
  partName: string,
  contract: ComponentContract | null
): AnatomyPartType {
  if (partName === 'root') return { kind: 'root' };

  if (contract?.slots && partName in contract.slots) {
    return { kind: 'slot', required: contract.slots[partName].required };
  }

  if (contract?.props) {
    for (const propGroup of Object.values(contract.props)) {
      const member = propGroup.members?.find((m) => m.name === partName);
      if (member) {
        return { kind: 'prop', propName: member.name, propType: member.type };
      }
    }
  }

  return { kind: 'part' };
}

function describePart(
  partName: string,
  contract: ComponentContract | null
): string {
  if (contract?.slots?.[partName]?.selector) {
    return `Slot rendered into ${contract.slots[partName].selector}.`;
  }
  if (contract?.props) {
    for (const propGroup of Object.values(contract.props)) {
      const member = propGroup.members?.find((m) => m.name === partName);
      if (member?.description) return member.description;
    }
  }
  return defaultPartDescription(partName);
}

/**
 * Parse anatomy array into structured parts with hierarchy.
 *
 * The anatomy array is authored contract data and is treated as the source of
 * truth: every entry becomes a row. Each row's type (slot / prop / part / root)
 * is derived from the contract rather than guessed from the part name — so a
 * structural region whose name happens to contain a state word (e.g.
 * `interactive`, `focusable`, `loadingText`) is never silently dropped.
 * When a contract is provided, each part is also enriched with a description.
 */
export function parseAnatomy(
  anatomy: string[],
  contract: ComponentContract | null = null
): AnatomyPart[] {
  return anatomy.map((part) => {
    const isRoot = part === 'root';
    return {
      name: part,
      level: isRoot ? 0 : 1,
      parent: isRoot ? undefined : 'root',
      description: describePart(part, contract),
      type: classifyPart(part, contract),
    };
  });
}

/**
 * Get anatomy data for a component.
 */
export function getAnatomyData(component: ComponentItem): AnatomyPart[] | null {
  const contract = getComponentContract(component);
  if (!contract || !contract.anatomy) {
    return null;
  }

  return parseAnatomy(contract.anatomy, contract);
}

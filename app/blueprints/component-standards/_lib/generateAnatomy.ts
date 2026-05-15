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
  props?: Record<string, { members: ContractPropMember[] }>;
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
    const rawPath = component.paths.component;
    const absoluteRaw = path.isAbsolute(rawPath)
      ? rawPath
      : path.join(process.cwd(), rawPath);

    let contractPath: string;
    if (
      fs.existsSync(absoluteRaw) &&
      fs.statSync(absoluteRaw).isDirectory()
    ) {
      // paths.component points at a directory (e.g. ui/components/Dialog).
      const componentName = path.basename(absoluteRaw);
      contractPath = path.join(absoluteRaw, `${componentName}.contract.json`);
    } else {
      // paths.component points at a .tsx file.
      const componentDir = path.dirname(absoluteRaw);
      const componentName = path.basename(absoluteRaw, '.tsx');
      contractPath = path.join(componentDir, `${componentName}.contract.json`);
    }

    if (!fs.existsSync(contractPath)) {
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

const STATE_PATTERNS = [
  'hover',
  'focus',
  'active',
  'disabled',
  'loading',
  'isLoading',
  'selected',
  'checked',
  'open',
  'closed',
];

const SIZE_PATTERNS = ['small', 'medium', 'large', 'xsmall', 'xlarge'];

function isStructuralPart(part: string): boolean {
  const lower = part.toLowerCase();
  return (
    !STATE_PATTERNS.some((pattern) => lower.includes(pattern)) &&
    !SIZE_PATTERNS.includes(lower)
  );
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
 * Filters out state/variant names and focuses on structural parts.
 * When a contract is provided, each part is enriched with a description
 * and a derived type classification (slot / prop / part).
 */
export function parseAnatomy(
  anatomy: string[],
  contract: ComponentContract | null = null
): AnatomyPart[] {
  const structuralParts = anatomy.filter(isStructuralPart);

  return structuralParts.map((part) => {
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

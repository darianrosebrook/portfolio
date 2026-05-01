import fs from 'fs';
import path from 'path';
import type { ComponentItem } from './componentsData';

export interface AnatomyPart {
  name: string;
  description?: string;
  level: number; // nesting level
  parent?: string;
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
    const componentDir = path.dirname(component.paths.component);
    const componentName = path.basename(component.paths.component, '.tsx');
    const contractPath = path.join(
      process.cwd(),
      componentDir,
      `${componentName}.contract.json`
    );

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

/**
 * Parse anatomy array into structured parts with hierarchy.
 * Filters out state/variant names and focuses on structural parts.
 */
export function parseAnatomy(anatomy: string[]): AnatomyPart[] {
  const statePatterns = [
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

  const sizePatterns = ['small', 'medium', 'large', 'xsmall', 'xlarge'];

  // Filter out states, variants, and size modifiers
  const structuralParts = anatomy.filter(
    (part) =>
      !statePatterns.some((pattern) => part.toLowerCase().includes(pattern)) &&
      !sizePatterns.includes(part.toLowerCase())
  );

  // Map to AnatomyPart objects
  // For now, assume single level - could be enhanced with DOM parsing
  return structuralParts.map((part) => ({
    name: part,
    level: part === 'root' ? 0 : 1,
    parent: part === 'root' ? undefined : 'root',
  }));
}

/**
 * Get anatomy data for a component.
 */
export function getAnatomyData(component: ComponentItem): AnatomyPart[] | null {
  const contract = getComponentContract(component);
  if (!contract || !contract.anatomy) {
    return null;
  }

  return parseAnatomy(contract.anatomy);
}

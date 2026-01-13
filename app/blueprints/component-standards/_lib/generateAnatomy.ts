import fs from 'fs';
import path from 'path';
import type { ComponentItem } from './componentsData';

export interface AnatomyPart {
  name: string;
  description?: string;
  level: number; // nesting level
  parent?: string;
}

export interface ComponentContract {
  name: string;
  layer: string;
  anatomy: string[];
  variants: Record<string, unknown>;
  states: string[];
  slots: Record<string, unknown>;
  a11y: Record<string, unknown>;
  tokens: Record<string, string[]>;
  ssr: Record<string, unknown>;
  rtl: Record<string, unknown>;
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
  return structuralParts.map((part, index) => ({
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

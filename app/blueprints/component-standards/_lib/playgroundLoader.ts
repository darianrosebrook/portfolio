/**
 * Playground File Loader
 *
 * Provides type-safe loading of playground files with fallback to generated examples.
 * Playground files should export `*Interactive` and `*Variants` configurations.
 */

import type { DocInteractiveProps } from '@/ui/modules/CodeSandbox/variants/DocInteractive';
import type { DocVariantsProps } from '@/ui/modules/CodeSandbox/variants/DocVariants';
import type { SectionSpec } from '@/ui/modules/CodeSandbox/types';
import { generateEnhancedInteractiveProject } from './componentExamples';
import type { ComponentItem } from './componentsData';

/**
 * Attempts to load a playground file for a component.
 * Returns the playground config if found, null otherwise.
 */
export async function loadPlaygroundFile(componentName: string): Promise<{
  interactive?: DocInteractiveProps;
  variants?: DocVariantsProps;
} | null> {
  try {
    // Dynamically import playground file
    // Component names are PascalCase, files are lowercase
    const normalizedName = componentName.toLowerCase();
    const playgroundModule = await import(
      `@/docs/examples/${normalizedName}.playground.ts`
    );

    // Extract interactive and variants exports
    const interactiveKey = `${normalizedName}Interactive`;
    const variantsKey = `${normalizedName}Variants`;

    return {
      interactive: playgroundModule[interactiveKey] as
        | DocInteractiveProps
        | undefined,
      variants: playgroundModule[variantsKey] as DocVariantsProps | undefined,
    };
  } catch {
    // Playground file doesn't exist, return null
    return null;
  }
}

/**
 * Gets the best available project for a component.
 * Tries playground first, falls back to generated example.
 */
export async function getComponentProject(component: ComponentItem): Promise<{
  interactive: DocInteractiveProps | null;
  variants: DocVariantsProps | null;
  source: 'playground' | 'generated';
}> {
  const playground = await loadPlaygroundFile(component.component);

  if (playground?.interactive && playground?.variants) {
    return {
      interactive: playground.interactive,
      variants: playground.variants,
      source: 'playground',
    };
  }

  // Fallback to generated
  const generatedProject = generateEnhancedInteractiveProject(component);

  return {
    interactive: generatedProject
      ? {
          project: generatedProject,
          sections: generateSections(component),
          preview: {
            runtime: 'iframe',
            device: 'desktop',
            theme: 'system',
          },
        }
      : null,
    variants: null, // Variants will be generated separately
    source: 'generated',
  };
}

/**
 * Generates comprehensive sections for a component based on playground patterns.
 */
export function generateSections(component: ComponentItem): SectionSpec[] {
  const componentName = component.component.toLowerCase();
  const baseSections: SectionSpec[] = [
    {
      id: 'overview',
      title: 'Component Overview',
      code: {
        file: `/${component.component}.tsx`,
        lines: [1, 15] as [number, number],
        focus: true,
      },
    },
    {
      id: 'props',
      title: 'Props',
      code: {
        file: `/${component.component}.tsx`,
        lines: [1, 10] as [number, number],
      },
    },
    {
      id: 'basic-usage',
      title: 'Basic Usage',
      code: { file: '/App.tsx', lines: [1, 20] as [number, number] },
    },
  ];

  // Component-specific sections
  const componentSpecificSections: Record<string, SectionSpec[]> = {
    button: [
      {
        id: 'sizes',
        title: 'Sizes',
        code: { file: '/App.tsx', lines: [19, 23] as [number, number] },
      },
      {
        id: 'states',
        title: 'States',
        code: { file: '/App.tsx', lines: [25, 29] as [number, number] },
      },
      {
        id: 'styling',
        title: 'Styling',
        code: { file: `/Button.tsx`, lines: [16, 70] as [number, number] },
      },
    ],
    input: [
      {
        id: 'sizes',
        title: 'Sizes',
        code: { file: '/App.tsx', lines: [24, 32] as [number, number] },
      },
      {
        id: 'states',
        title: 'States',
        code: { file: '/App.tsx', lines: [20, 27] as [number, number] },
      },
      {
        id: 'styling',
        title: 'Styling',
        code: { file: `/Input.tsx`, lines: [16, 30] as [number, number] },
      },
    ],
    card: [
      {
        id: 'composition',
        title: 'Composition',
        code: { file: `/Card.tsx`, lines: [23, 40] as [number, number] },
      },
      {
        id: 'variants',
        title: 'Variants',
        code: { file: '/App.tsx', lines: [17, 23] as [number, number] },
      },
      {
        id: 'footer',
        title: 'With Footer',
        code: { file: '/App.tsx', lines: [25, 33] as [number, number] },
      },
    ],
    tooltip: [
      {
        id: 'positions',
        title: 'Positions',
        code: { file: '/App.tsx', lines: [13, 23] as [number, number] },
      },
      {
        id: 'variants',
        title: 'Variants',
        code: { file: '/App.tsx', lines: [25, 31] as [number, number] },
      },
    ],
    select: [
      {
        id: 'sizes',
        title: 'Sizes',
        code: { file: '/App.tsx', lines: [24, 32] as [number, number] },
      },
      {
        id: 'states',
        title: 'States',
        code: { file: '/App.tsx', lines: [34, 45] as [number, number] },
      },
    ],
  };

  const specificSections = componentSpecificSections[componentName] || [];

  return [...baseSections, ...specificSections];
}

import { type ComponentItem } from '../_lib/componentsData';
import { extractProps, extractMethods } from '../_lib/extractProps';
import path from 'path';

export interface ComponentAPI {
  props: Array<{
    name: string;
    type: string;
    required: boolean;
    defaultValue?: string;
    description?: string;
  }>;
  methods: Array<{
    name: string;
    returnType: string;
    parameters: Array<{ name: string; type: string; required: boolean }>;
    description?: string;
  }>;
}

/**
 * Get API documentation for a component.
 * This runs at build time or server-side.
 */
export function getComponentAPIData(
  component: ComponentItem
): ComponentAPI | null {
  if (!component.paths?.component) {
    return null;
  }

  try {
    // component.paths.component is like "ui/components/Button/Button.tsx"
    // We need to extract the component directory and name
    const componentDir = path.dirname(component.paths.component);
    const componentName = path.basename(component.paths.component, '.tsx');
    const componentPath = path.join(process.cwd(), componentDir);

    const props = extractProps(componentPath, componentName);
    const methods = extractMethods(componentPath, componentName);

    return {
      props,
      methods,
    };
  } catch (error) {
    console.warn(
      `Error getting API data for ${component.component}:`,
      error instanceof Error ? error.message : String(error)
    );
    return null;
  }
}


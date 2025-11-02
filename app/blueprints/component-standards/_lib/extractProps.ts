import fs from 'fs';
import path from 'path';

export interface ExtractedProp {
  name: string;
  type: string;
  required: boolean;
  defaultValue?: string;
  description?: string;
}

export interface ExtractedMethod {
  name: string;
  returnType: string;
  parameters: Array<{ name: string; type: string; required: boolean }>;
  description?: string;
}

/**
 * Extract props from a component's TypeScript file.
 * Uses regex-based parsing (simpler than full TypeScript compiler API).
 */
export function extractProps(
  componentPath: string,
  componentName: string
): ExtractedProp[] {
  const mainFile = path.join(componentPath, `${componentName}.tsx`);
  if (!fs.existsSync(mainFile)) {
    return [];
  }

  try {
    const content = fs.readFileSync(mainFile, 'utf8');
    const props: ExtractedProp[] = [];

    // Look for props interface - try BaseProps first, then Props
    // Handle multiline interfaces with proper matching
    const basePropsMatch = content.match(
      /(?:interface|type)\s+\w*BaseProps[^{]*\{([\s\S]*?)\}/
    );
    const propsMatch =
      basePropsMatch ||
      content.match(
        /(?:interface|type)\s+\w*Props[^{]*\{([\s\S]*?)\}/
      );

    if (!propsMatch) {
      return [];
    }

    // Get the full interface content, handling nested braces
    let propsContent = propsMatch[1];
    let braceCount = 0;
    let endIndex = 0;
    for (let i = 0; i < propsContent.length; i++) {
      if (propsContent[i] === '{') braceCount++;
      if (propsContent[i] === '}') {
        braceCount--;
        if (braceCount < 0) {
          endIndex = i;
          break;
        }
      }
    }
    if (endIndex > 0) {
      propsContent = propsContent.substring(0, endIndex);
    }

    // Extract JSDoc comments above the interface
    const interfaceJsdoc = content.match(
      /\/\*\*([\s\S]*?)\*+\/\s*(?:interface|type)\s+\w*Props/
    );

    // Parse each prop line
    const propLines = propsContent.split('\n').filter((line) => {
      const trimmed = line.trim();
      return (
        trimmed.length > 0 &&
        !trimmed.startsWith('//') &&
        !trimmed.startsWith('*') &&
        !trimmed.startsWith('/**') &&
        !trimmed.startsWith('*/')
      );
    });

    for (const line of propLines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === '{' || trimmed === '}') continue;

      // Skip extends clauses
      if (trimmed.startsWith('extends')) continue;

      // Match prop pattern: name?: type or name: type
      const propMatch = trimmed.match(/^(\w+)(\?)?\s*:\s*(.+?)(;|,)?$/);
      if (!propMatch) continue;

      const [, name, optional, typeRaw] = propMatch;
      const required = !optional;

      // Extract JSDoc for this prop
      let description: string | undefined;
      if (interfaceJsdoc) {
        const propJsdocRegex = new RegExp(
          `\\*\\s+@param\\s+${name}\\s+([^\\n]+)|\\*\\s+${name}\\s*[:-]\\s*([^\\n]+)`,
          'i'
        );
        const propJsdocMatch = interfaceJsdoc[0].match(propJsdocRegex);
        if (propJsdocMatch) {
          description = (propJsdocMatch[1] || propJsdocMatch[2] || '').trim();
        }
      }

      // Clean up type (remove extra whitespace, handle unions)
      const type = typeRaw.trim().replace(/\s+/g, ' ');

      // Look for default value in the code (may need to parse actual usage)
      let defaultValue: string | undefined;
      const defaultValueMatch = content.match(
        new RegExp(`${name}\\s*=\\s*([^,;\\n}]+)`, 'm')
      );
      if (defaultValueMatch) {
        defaultValue = defaultValueMatch[1].trim();
      }

      props.push({
        name,
        type,
        required,
        defaultValue: defaultValue || undefined,
        description,
      });
    }

    return props;
  } catch (error) {
    console.warn(
      `Error extracting props for ${componentName}:`,
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

/**
 * Extract methods from a component's TypeScript file.
 * Looks for exported functions or class methods.
 */
export function extractMethods(
  componentPath: string,
  componentName: string
): ExtractedMethod[] {
  const mainFile = path.join(componentPath, `${componentName}.tsx`);
  if (!fs.existsSync(mainFile)) {
    return [];
  }

  try {
    const content = fs.readFileSync(mainFile, 'utf8');
    const methods: ExtractedMethod[] = [];

    // Look for exported functions that might be methods
    // This is simplified - in a real implementation, use TypeScript compiler API
    const functionRegex =
      /(?:export\s+)?(?:async\s+)?function\s+(\w+)\s*\(([^)]*)\)\s*(?::\s*([^{]+))?\{/g;

    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      const [, name, params, returnType] = match;

      // Skip if it's the main component function
      if (name === componentName) continue;

      const parameters: ExtractedMethod['parameters'] = [];
      if (params && params.trim()) {
        const paramParts = params.split(',');
        for (const param of paramParts) {
          const paramMatch = param.trim().match(/^(\w+)(\?)?\s*:\s*(.+)$/);
          if (paramMatch) {
            const [, paramName, optional, paramType] = paramMatch;
            parameters.push({
              name: paramName,
              type: paramType.trim(),
              required: !optional,
            });
          }
        }
      }

      methods.push({
        name,
        returnType: returnType?.trim() || 'void',
        parameters,
      });
    }

    return methods;
  } catch (error) {
    console.warn(
      `Error extracting methods for ${componentName}:`,
      error instanceof Error ? error.message : String(error)
    );
    return [];
  }
}

/**
 * Get props and methods for a component.
 */
export function getComponentAPI(
  componentName: string,
  componentPath?: string
): {
  props: ExtractedProp[];
  methods: ExtractedMethod[];
} {
  // If no path provided, try to find it
  const resolvedPath =
    componentPath ||
    path.join(process.cwd(), 'ui/components', componentName);

  return {
    props: extractProps(resolvedPath, componentName),
    methods: extractMethods(resolvedPath, componentName),
  };
}


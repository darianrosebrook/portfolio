/**
 * {{componentName}} {{layer}} exports
 * 
 * Layer: {{layer}}
 * {{layerDescription}}
 */

{{#if isPrimitive}}
export { {{componentName}} as default, {{componentName}} } from './{{componentName}}';
export type { {{componentName}}Props, {{componentName}}Size } from './{{componentName}}';
{{/if}}

{{#if isCompound}}
export { 
  {{componentName}} as default, 
  {{componentName}},
  {{componentName}}Header,
  {{componentName}}Body,
  {{componentName}}Footer
} from './{{componentName}}';
export type { {{componentName}}Props } from './{{componentName}}';
{{/if}}

{{#if isComposer}}
// Main composer components
export { 
  {{componentName}} as default, 
  {{componentName}},
  {{componentName}}Trigger,
  {{componentName}}Content
} from './{{componentName}}';
export type { 
  {{componentName}}Props,
  {{componentName}}TriggerProps,
  {{componentName}}ContentProps
} from './{{componentName}}';

// Provider for orchestration
export { {{componentName}}Provider, use{{componentName}}Context } from './{{componentName}}Provider';
export type { {{componentName}}ProviderProps, {{componentName}}ContextValue } from './{{componentName}}Provider';

// Headless logic hook
export { use{{componentName}} } from './use{{componentName}}';
export type { Use{{componentName}}Options, Use{{componentName}}Return } from './use{{componentName}}';
{{/if}}

{{#if isAssembly}}
export { {{componentName}} as default, {{componentName}} } from './{{componentName}}';
export type { {{componentName}}Props, {{componentName}}Data } from './{{componentName}}';
{{/if}}

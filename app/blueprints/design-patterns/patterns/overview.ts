// Design Patterns Overview
// Essential patterns for building scalable, maintainable design systems

/**
 * Design systems succeed when they provide consistent, predictable patterns
 * that teams can rely on. These patterns aren't just about code organization—
 * they're about creating mental models that scale across teams, products, and time.
 */

// Pattern 1: Headless Logic
// Separate behavior from presentation for maximum flexibility
export interface HeadlessLogicPattern {
  // State management lives in custom hooks
  useComponentLogic: () => {
    state: any;
    actions: Record<string, Function>;
    queries: Record<string, Function>;
  };

  // UI components consume the logic
  Component: (props: { children: React.ReactNode }) => JSX.Element;
}

// Pattern 2: Context Providers
// Orchestrate complex state through React context
export interface ContextProviderPattern {
  Provider: (props: { children: React.ReactNode }) => JSX.Element;
  useContext: () => ComponentContext;
  // Context provides stable API for consumers
}

// Pattern 3: Slotting & Composition
// Build flexible components through strategic slot placement
export interface SlottingPattern {
  Component: {
    Root: (props: { children: React.ReactNode }) => JSX.Element;
    Header: (props: { children: React.ReactNode }) => JSX.Element;
    Content: (props: { children: React.ReactNode }) => JSX.Element;
    Footer: (props: { children: React.ReactNode }) => JSX.Element;
  };
}

// Pattern 4: Command Registry
// Create consistent, discoverable APIs
export interface CommandRegistryPattern {
  commands: {
    [domain: string]: {
      [action: string]: (...args: any[]) => boolean;
    };
  };
}

// Pattern 5: Schema-First Design
// Define contracts that ensure consistency
export interface SchemaFirstPattern {
  schema: {
    nodes: Record<string, NodeSpec>;
    marks: Record<string, MarkSpec>;
  };
  validation: (data: any) => ValidationResult;
}

// Pattern 6: Engine Adapters
// Abstract vendor-specific implementations
export interface EngineAdapterPattern {
  Engine: {
    mount: (host: HTMLElement, config: any) => EngineInstance;
    destroy: () => void;
  };
  Adapter: (engine: any) => Engine;
}

// Pattern 7: Validation & Governance
// Ensure quality and consistency at scale
export interface ValidationGovernancePattern {
  validators: {
    component: (component: any) => ValidationResult;
    tokens: (tokens: any) => ValidationResult;
    accessibility: (component: any) => ValidationResult;
  };
  governance: {
    review: (change: any) => ApprovalResult;
    migration: (from: any, to: any) => MigrationPlan;
  };
}

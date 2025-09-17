// Engine Adapter Pattern
// Abstract vendor-specific implementations behind stable interfaces

/**
 * Adapters abstract vendor-specific implementations behind stable interfaces,
 * enabling you to swap implementations without changing your core logic.
 */

// Example: Rich Text Editor Engine Adapter (from example5.md)
export interface EditorEngine {
  mount(
    host: HTMLElement,
    config: {
      schema: Schema;
      content: JSONDoc;
      onUpdate(doc: JSONDoc): void;
      onSelectionChange?(payload: Selection): void;
      plugins?: EnginePlugin[];
      readOnly?: boolean;
      spellcheck?: boolean;
    }
  ): { destroy(): void };

  // Commands — return boolean if handled
  cmd: {
    focus(): boolean;
    undo(): boolean;
    redo(): boolean;
    toggleMark(mark: 'bold' | 'italic' | 'underline' | 'code'): boolean;
    setBlock(
      type: 'paragraph' | 'heading1' | 'heading2' | 'blockquote'
    ): boolean;
    toggleList(type: 'bullet' | 'ordered' | 'task'): boolean;
    toggleCodeBlock(): boolean;
    link: {
      set(href: string, opts?: { title?: string; target?: string }): boolean;
      unset(): boolean;
    };
    insert: {
      text(text: string): boolean;
      hardBreak(): boolean;
      horizontalRule(): boolean;
      mention(user: { id: string; label: string }): boolean;
      emoji(shortcode: string): boolean;
      image(file: File | { src: string; alt?: string }): boolean;
    };
  };

  // Queries for UI state
  query: {
    isActive: (
      what:
        | { mark: 'bold' | 'italic' | 'underline' | 'code' }
        | { block: 'heading1' | 'heading2' | 'blockquote' | 'codeblock' }
        | { block: 'bullet' | 'ordered' | 'task' }
        | { link: 'link' }
    ) => boolean;
    can: (
      action: 'undo' | 'redo' | 'bold' | 'list-bullet' | 'codeblock'
    ) => boolean;
    selection(): Selection;
  };
}

export type JSONDoc = unknown; // engine-specific JSON; normalized at the boundary
export type EnginePlugin = unknown; // engine-specific plugin type
export interface Selection {
  empty: boolean;
  from: number;
  to: number;
}
export interface Schema {
  nodes: any;
  marks: any;
}

/**
 * Key Benefits of Engine Adapters:
 *
 * 1. Vendor Independence: Switch implementations without changing core logic
 * 2. Testing: Easy to mock and test with different engines
 * 3. Performance: Choose the best engine for your use case
 * 4. Future-Proofing: New engines can be added without breaking existing code
 * 5. Consistency: Same API regardless of underlying implementation
 */

// Example: ProseMirror Engine Adapter
export function createProseMirrorEngine(): EditorEngine {
  return {
    mount(host, config) {
      // ProseMirror-specific implementation
      const editor = new ProseMirrorEditor(host, {
        schema: config.schema,
        doc: config.content,
        plugins: config.plugins,
        editable: !config.readOnly,
        // ... other ProseMirror-specific config
      });

      editor.on('update', (doc) => {
        config.onUpdate(doc);
      });

      editor.on('selection-change', (selection) => {
        config.onSelectionChange?.(selection);
      });

      return {
        destroy: () => editor.destroy(),
      };
    },

    cmd: {
      focus: () => {
        // ProseMirror focus implementation
        return true;
      },
      undo: () => {
        // ProseMirror undo implementation
        return true;
      },
      redo: () => {
        // ProseMirror redo implementation
        return true;
      },
      toggleMark: (mark) => {
        // ProseMirror mark toggle implementation
        return true;
      },
      setBlock: (type) => {
        // ProseMirror block type implementation
        return true;
      },
      toggleList: (type) => {
        // ProseMirror list toggle implementation
        return true;
      },
      toggleCodeBlock: () => {
        // ProseMirror code block implementation
        return true;
      },
      link: {
        set: (href, opts) => {
          // ProseMirror link implementation
          return true;
        },
        unset: () => {
          // ProseMirror link removal implementation
          return true;
        },
      },
      insert: {
        text: (text) => {
          // ProseMirror text insertion implementation
          return true;
        },
        hardBreak: () => {
          // ProseMirror hard break implementation
          return true;
        },
        horizontalRule: () => {
          // ProseMirror horizontal rule implementation
          return true;
        },
        mention: (user) => {
          // ProseMirror mention implementation
          return true;
        },
        emoji: (shortcode) => {
          // ProseMirror emoji implementation
          return true;
        },
        image: (file) => {
          // ProseMirror image implementation
          return true;
        },
      },
    },

    query: {
      isActive: (what) => {
        // ProseMirror active state query implementation
        return false;
      },
      can: (action) => {
        // ProseMirror capability query implementation
        return true;
      },
      selection: () => {
        // ProseMirror selection query implementation
        return { empty: true, from: 0, to: 0 };
      },
    },
  };
}

// Example: Slate Engine Adapter
export function createSlateEngine(): EditorEngine {
  return {
    mount(host, config) {
      // Slate-specific implementation
      const editor = new SlateEditor(host, {
        schema: config.schema,
        initialValue: config.content,
        plugins: config.plugins,
        readOnly: config.readOnly,
        // ... other Slate-specific config
      });

      editor.on('change', (doc) => {
        config.onUpdate(doc);
      });

      editor.on('select', (selection) => {
        config.onSelectionChange?.(selection);
      });

      return {
        destroy: () => editor.destroy(),
      };
    },

    cmd: {
      focus: () => {
        // Slate focus implementation
        return true;
      },
      undo: () => {
        // Slate undo implementation
        return true;
      },
      redo: () => {
        // Slate redo implementation
        return true;
      },
      toggleMark: (mark) => {
        // Slate mark toggle implementation
        return true;
      },
      setBlock: (type) => {
        // Slate block type implementation
        return true;
      },
      toggleList: (type) => {
        // Slate list toggle implementation
        return true;
      },
      toggleCodeBlock: () => {
        // Slate code block implementation
        return true;
      },
      link: {
        set: (href, opts) => {
          // Slate link implementation
          return true;
        },
        unset: () => {
          // Slate link removal implementation
          return true;
        },
      },
      insert: {
        text: (text) => {
          // Slate text insertion implementation
          return true;
        },
        hardBreak: () => {
          // Slate hard break implementation
          return true;
        },
        horizontalRule: () => {
          // Slate horizontal rule implementation
          return true;
        },
        mention: (user) => {
          // Slate mention implementation
          return true;
        },
        emoji: (shortcode) => {
          // Slate emoji implementation
          return true;
        },
        image: (file) => {
          // Slate image implementation
          return true;
        },
      },
    },

    query: {
      isActive: (what) => {
        // Slate active state query implementation
        return false;
      },
      can: (action) => {
        // Slate capability query implementation
        return true;
      },
      selection: () => {
        // Slate selection query implementation
        return { empty: true, from: 0, to: 0 };
      },
    },
  };
}

/**
 * Adapter Design Principles:
 *
 * 1. Minimal Interface: Define only what you need, not what's possible
 * 2. Stable API: Don't change the interface unless absolutely necessary
 * 3. Error Handling: Provide consistent error handling across adapters
 * 4. Performance: Consider performance implications of the interface
 * 5. Testing: Make adapters easy to test and mock
 */

// Example: Adapter Factory Pattern
export class EditorEngineFactory {
  private static engines = new Map<string, () => EditorEngine>();

  static register(name: string, factory: () => EditorEngine) {
    this.engines.set(name, factory);
  }

  static create(name: string): EditorEngine {
    const factory = this.engines.get(name);
    if (!factory) {
      throw new Error(`Unknown engine: ${name}`);
    }
    return factory();
  }

  static getAvailableEngines(): string[] {
    return Array.from(this.engines.keys());
  }
}

// Register engines
EditorEngineFactory.register('prosemirror', createProseMirrorEngine);
EditorEngineFactory.register('slate', createSlateEngine);

// Example: Adapter Configuration
export interface AdapterConfig {
  engine: string;
  options: Record<string, any>;
  plugins: string[];
  features: string[];
}

export function createConfiguredEngine(config: AdapterConfig): EditorEngine {
  const engine = EditorEngineFactory.create(config.engine);

  // Apply configuration-specific modifications
  if (config.features.includes('collaboration')) {
    // Add collaboration plugins
  }

  if (config.features.includes('mentions')) {
    // Add mention plugins
  }

  return engine;
}

/**
 * When to Use Engine Adapters:
 *
 * Use Adapters when:
 * - You have multiple implementation options
 * - You want to avoid vendor lock-in
 * - You need to test with different implementations
 * - Performance requirements vary by use case
 * - You want to future-proof your architecture
 *
 * Use Direct Implementation when:
 * - You only have one implementation option
 * - Performance is critical and abstraction overhead is too much
 * - The implementation is simple and stable
 * - You don't need the flexibility of multiple engines
 */

// Example: Adapter Testing
export function createMockEngine(): EditorEngine {
  return {
    mount: jest.fn(() => ({ destroy: jest.fn() })),
    cmd: {
      focus: jest.fn(() => true),
      undo: jest.fn(() => true),
      redo: jest.fn(() => true),
      toggleMark: jest.fn(() => true),
      setBlock: jest.fn(() => true),
      toggleList: jest.fn(() => true),
      toggleCodeBlock: jest.fn(() => true),
      link: {
        set: jest.fn(() => true),
        unset: jest.fn(() => true),
      },
      insert: {
        text: jest.fn(() => true),
        hardBreak: jest.fn(() => true),
        horizontalRule: jest.fn(() => true),
        mention: jest.fn(() => true),
        emoji: jest.fn(() => true),
        image: jest.fn(() => true),
      },
    },
    query: {
      isActive: jest.fn(() => false),
      can: jest.fn(() => true),
      selection: jest.fn(() => ({ empty: true, from: 0, to: 0 })),
    },
  };
}

// Placeholder classes
class ProseMirrorEditor {
  constructor(host: HTMLElement, config: any) {}
  on(event: string, callback: Function) {}
  destroy() {}
}

class SlateEditor {
  constructor(host: HTMLElement, config: any) {}
  on(event: string, callback: Function) {}
  destroy() {}
}

// Placeholder for Jest
const jest = {
  fn: (implementation?: Function) => implementation || (() => {}),
};

// Command Registry Pattern
// Create consistent, discoverable APIs for complex operations

/**
 * Command registries provide a consistent, discoverable API for complex operations.
 * They make behavior explicit and testable while enabling powerful composition patterns.
 */

// Example: Rich Text Editor Commands (from example5.md)
export interface EditorEngine {
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
  query: {
    isActive: (
      what:
        | { mark: 'bold' | 'italic' | 'underline' | 'code' }
        | { block: 'heading1' | 'heading2' | 'blockquote' | 'codeblock' }
        | { list: 'bullet' | 'ordered' | 'task' }
        | { link: 'link' }
    ) => boolean;
    can: (
      action: 'undo' | 'redo' | 'bold' | 'list-bullet' | 'codeblock'
    ) => boolean;
    selection(): Selection;
  };
}

// Command facade that provides a stable API
export function buildCommandRegistry(engine: EditorEngine) {
  return {
    focus: () => engine.cmd.focus(),

    history: {
      undo: () => engine.cmd.undo(),
      redo: () => engine.cmd.redo(),
    },

    inline: {
      toggleBold: () => engine.cmd.toggleMark('bold'),
      toggleItalic: () => engine.cmd.toggleMark('italic'),
      toggleUnderline: () => engine.cmd.toggleMark('underline'),
      toggleCode: () => engine.cmd.toggleMark('code'),
    },

    block: {
      setParagraph: () => engine.cmd.setBlock('paragraph'),
      setHeading: (level: 1 | 2) =>
        engine.cmd.setBlock(level === 1 ? 'heading1' : 'heading2'),
      toggleBlockquote: () => engine.cmd.setBlock('blockquote'),
      toggleCodeBlock: () => engine.cmd.toggleCodeBlock(),
    },

    list: {
      toggleBullet: () => engine.cmd.toggleList('bullet'),
      toggleOrdered: () => engine.cmd.toggleList('ordered'),
      toggleTask: () => engine.cmd.toggleList('task'),
    },

    link: {
      set: (href: string, opts?: { title?: string; target?: string }) =>
        engine.cmd.link.set(href, opts),
      unset: () => engine.cmd.link.unset(),
    },

    insert: {
      hardBreak: () => engine.cmd.insert.hardBreak(),
      hr: () => engine.cmd.insert.horizontalRule(),
      text: (t: string) => engine.cmd.insert.text(t),
      mention: (u: { id: string; label: string }) =>
        engine.cmd.insert.mention(u),
      emoji: (s: string) => engine.cmd.insert.emoji(s),
      image: (f: File | { src: string; alt?: string }) =>
        engine.cmd.insert.image(f),
    },
  };
}

/**
 * Key Benefits of Command Registry:
 *
 * 1. Consistent API: All commands follow the same pattern
 * 2. Discoverability: Commands are organized by domain
 * 3. Testability: Commands can be easily mocked and tested
 * 4. Composability: Commands can be combined in different ways
 * 5. Extensibility: New commands can be added without breaking existing ones
 */

// Example: Toolbar Actions as Commands (from example3.md)
export interface ActionSpec {
  id: string;
  kind:
    | 'button'
    | 'toggle'
    | 'select'
    | 'search'
    | 'chip-filter'
    | 'separator'
    | 'custom';
  label?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  groupId?: string;
  priority?: 1 | 2 | 3;
  disabled?: boolean;
  hidden?: boolean;
  selected?: boolean;
  value?: any;
  shortcut?: string;
  render?: (ctx: ToolbarRenderCtx) => React.ReactNode;
  visibleWhen?: (ctx: ToolbarState) => boolean;
  onExecute?: (ctx: ToolbarState) => void;
  onToggle?: (next: boolean, ctx: ToolbarState) => void;
  onChange?: (value: any, ctx: ToolbarState) => void;
}

// Toolbar commands are organized by domain
export function createToolbarCommands() {
  return {
    // Navigation commands
    navigation: {
      goToPage: (page: number) => (ctx: ToolbarState) => {
        // Implementation
        return true;
      },
      goToNext: () => (ctx: ToolbarState) => {
        // Implementation
        return true;
      },
      goToPrevious: () => (ctx: ToolbarState) => {
        // Implementation
        return true;
      },
    },

    // Filter commands
    filter: {
      setStatus: (status: string) => (ctx: ToolbarState) => {
        // Implementation
        return true;
      },
      setAssignee: (assignee: string) => (ctx: ToolbarState) => {
        // Implementation
        return true;
      },
      clearFilters: () => (ctx: ToolbarState) => {
        // Implementation
        return true;
      },
    },

    // View commands
    view: {
      toggleDense: (dense: boolean) => (ctx: ToolbarState) => {
        // Implementation
        return true;
      },
      toggleSidebar: (visible: boolean) => (ctx: ToolbarState) => {
        // Implementation
        return true;
      },
      saveView: (name: string) => (ctx: ToolbarState) => {
        // Implementation
        return true;
      },
    },
  };
}

// Example: Pagination Commands (from example4.md)
export function createPaginationCommands() {
  return {
    navigation: {
      goToPage: (page: number) => (state: PaginationState) => {
        if (page < 1 || page > state.totalPages) return false;
        state.setPage(page);
        return true;
      },
      goToNext: () => (state: PaginationState) => {
        if (state.page >= state.totalPages) return false;
        state.setPage(state.page + 1);
        return true;
      },
      goToPrevious: () => (state: PaginationState) => {
        if (state.page <= 1) return false;
        state.setPage(state.page - 1);
        return true;
      },
      goToFirst: () => (state: PaginationState) => {
        state.setPage(1);
        return true;
      },
      goToLast: () => (state: PaginationState) => {
        state.setPage(state.totalPages);
        return true;
      },
    },

    settings: {
      setPageSize: (size: number) => (state: PaginationState) => {
        state.setPageSize(size);
        return true;
      },
      setCompact: (compact: boolean) => (state: PaginationState) => {
        state.setCompact(compact);
        return true;
      },
    },
  };
}

/**
 * Command Registry Design Principles:
 *
 * 1. Domain Organization: Group related commands together
 * 2. Consistent Naming: Use clear, predictable naming conventions
 * 3. Return Values: Commands should return success/failure status
 * 4. Pure Functions: Commands should be side-effect free when possible
 * 5. Composable: Commands should be easy to combine and extend
 */

// Example: Command Composition
export function createCompositeCommands() {
  const toolbarCommands = createToolbarCommands();
  const paginationCommands = createPaginationCommands();

  return {
    // Combine commands from different domains
    combined: {
      ...toolbarCommands,
      ...paginationCommands,
    },

    // Create higher-level commands that combine multiple actions
    workflows: {
      resetAndGoToFirst: () => (state: any) => {
        const clearResult = toolbarCommands.filter.clearFilters()(state);
        const goToFirstResult =
          paginationCommands.navigation.goToFirst()(state);
        return clearResult && goToFirstResult;
      },

      saveViewAndReset: (viewName: string) => (state: any) => {
        const saveResult = toolbarCommands.view.saveView(viewName)(state);
        const resetResult = toolbarCommands.filter.clearFilters()(state);
        return saveResult && resetResult;
      },
    },
  };
}

/**
 * When to Use Command Registry:
 *
 * Use Commands when:
 * - You have complex operations that need to be discoverable
 * - You want to enable keyboard shortcuts and automation
 * - You need to test behavior in isolation
 * - You want to support undo/redo functionality
 * - You need to compose operations in different ways
 *
 * Use Direct Function Calls when:
 * - Operations are simple and don't need to be discoverable
 * - Performance is critical and command overhead is too much
 * - Operations are tightly coupled to specific components
 * - You don't need the flexibility of a registry
 */

// Placeholder types
interface ToolbarRenderCtx {}
interface ToolbarState {}
interface PaginationState {
  page: number;
  totalPages: number;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setCompact: (compact: boolean) => void;
}
interface Selection {
  empty: boolean;
  from: number;
  to: number;
}

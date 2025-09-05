import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { TableOfContentsNodeView } from './TableOfContentsNodeView';

export interface TableOfContentsOptions {
  HTMLAttributes: Record<string, any>;
  /**
   * Maximum depth of headings to include in TOC
   */
  maxDepth: number;
  /**
   * Whether to show heading numbers
   */
  showNumbers: boolean;
  /**
   * Custom class for TOC container
   */
  tocClass: string;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    tableOfContents: {
      /**
       * Insert a table of contents
       */
      setTableOfContents: (
        options?: Partial<TableOfContentsOptions>
      ) => ReturnType;
      /**
       * Update the table of contents
       */
      updateTableOfContents: () => ReturnType;
    };
  }
}

/**
 * Table of Contents extension for Tiptap
 * Automatically generates TOC from document headings
 * Perfect for long case studies and articles
 *
 * @author @darianrosebrook
 */
export const TableOfContentsExtension = Node.create<TableOfContentsOptions>({
  name: 'tableOfContents',

  addOptions() {
    return {
      HTMLAttributes: {},
      maxDepth: 3,
      showNumbers: false,
      tocClass: 'table-of-contents',
    };
  },

  group: 'block',

  content: '',

  addAttributes() {
    return {
      maxDepth: {
        default: this.options.maxDepth,
        parseHTML: (element) =>
          parseInt(element.getAttribute('data-max-depth') || '3'),
        renderHTML: (attributes) => ({
          'data-max-depth': attributes.maxDepth,
        }),
      },
      showNumbers: {
        default: this.options.showNumbers,
        parseHTML: (element) =>
          element.getAttribute('data-show-numbers') === 'true',
        renderHTML: (attributes) => ({
          'data-show-numbers': attributes.showNumbers,
        }),
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="table-of-contents"]',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'table-of-contents',
        class: this.options.tocClass,
        'data-max-depth': node.attrs.maxDepth,
        'data-show-numbers': node.attrs.showNumbers,
      }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(TableOfContentsNodeView);
  },

  addCommands() {
    return {
      setTableOfContents:
        (options = {}) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              maxDepth: options.maxDepth ?? this.options.maxDepth,
              showNumbers: options.showNumbers ?? this.options.showNumbers,
            },
          });
        },
      updateTableOfContents:
        () =>
        ({ commands, editor }) => {
          // Find all TOC nodes and update them
          const { doc } = editor.state;
          const tocNodes: number[] = [];

          doc.descendants((node, pos) => {
            if (node.type.name === this.name) {
              tocNodes.push(pos);
            }
          });

          // Trigger update for each TOC node
          tocNodes.forEach((pos) => {
            const tr = editor.state.tr;
            tr.setNodeMarkup(pos, undefined, {
              ...editor.state.doc.nodeAt(pos)?.attrs,
              updated: Date.now(), // Force update
            });
            editor.view.dispatch(tr);
          });

          return true;
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-t': () => this.editor.commands.setTableOfContents(),
    };
  },
});

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface UniqueIdOptions {
  /**
   * Types of nodes to add unique IDs to
   */
  types: string[];
  /**
   * Function to generate unique IDs
   */
  generateId: (node: any) => string;
  /**
   * HTML attribute name for the ID
   */
  attributeName: string;
}

/**
 * Unique ID extension for Tiptap
 * Automatically adds unique IDs to specified node types (like headings)
 * Enables deep linking and table of contents functionality
 *
 * @author @darianrosebrook
 */
export const UniqueIdExtension = Extension.create<UniqueIdOptions>({
  name: 'uniqueId',

  addOptions() {
    return {
      types: ['heading'],
      generateId: (node) => {
        const text = node.textContent || '';
        return text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
      },
      attributeName: 'id',
    };
  },

  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          [this.options.attributeName]: {
            default: null,
            parseHTML: (element) =>
              element.getAttribute(this.options.attributeName),
            renderHTML: (attributes) => {
              if (!attributes[this.options.attributeName]) {
                return {};
              }
              return {
                [this.options.attributeName]:
                  attributes[this.options.attributeName],
              };
            },
          },
        },
      },
    ];
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: new PluginKey('uniqueId'),
        appendTransaction: (transactions, oldState, newState) => {
          const tr = newState.tr;
          let modified = false;

          // Check if any of the transactions modified the document
          const docChanged = transactions.some(
            (transaction) => transaction.docChanged
          );
          if (!docChanged) {
            return null;
          }

          // Find all nodes that need IDs
          newState.doc.descendants((node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentId = node.attrs[this.options.attributeName];
              const generatedId = this.options.generateId(node);

              // Only update if the ID is missing or different
              if (!currentId || currentId !== generatedId) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  [this.options.attributeName]: generatedId,
                });
                modified = true;
              }
            }
          });

          return modified ? tr : null;
        },
      }),
    ];
  },
});

import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import type { Node as ProseMirrorNode } from '@tiptap/pm/model';
import type { JSONContent } from '@tiptap/core';

export interface UniqueIdOptions {
  /**
   * Types of nodes to add unique IDs to
   */
  types: string[];
  /**
   * Function to generate unique IDs
   */
  generateId: (node: { textContent?: string } | ProseMirrorNode) => string;
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

          // Track counts for each generated id to avoid collisions
          const idCounts: Record<string, number> = {};

          // Find all nodes that need IDs in document order
          newState.doc.descendants((node, pos) => {
            if (this.options.types.includes(node.type.name)) {
              const currentId = node.attrs[this.options.attributeName] as
                | string
                | null;
              const baseId = this.options.generateId(node);
              const nextCount = (idCounts[baseId] ?? 0) + 1;
              idCounts[baseId] = nextCount;
              const candidateId =
                nextCount > 1 ? `${baseId}-${nextCount}` : baseId;

              // Only update if the ID is missing or different
              if (!currentId || currentId !== candidateId) {
                tr.setNodeMarkup(pos, undefined, {
                  ...node.attrs,
                  [this.options.attributeName]: candidateId,
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

  onBeforeCreate() {
    // Preprocess initial JSON content (if provided) to assign stable IDs
    const editor = this.editor;
    const content = editor?.options?.content;
    if (!content || typeof content !== 'object') {
      return;
    }

    const idCounts: Record<string, number> = {};

    const extractText = (node: JSONContent): string => {
      if (!node) return '';
      if (node.type === 'text' && typeof node.text === 'string') {
        return node.text;
      }
      const children = Array.isArray(node.content) ? node.content : [];
      let combined = '';
      for (const child of children) {
        combined += extractText(child);
      }
      return combined;
    };

    const processNode = (node: JSONContent) => {
      if (!node || typeof node !== 'object') return;

      if (node.type && this.options.types.includes(node.type)) {
        const textContent = extractText(node);
        const baseId = this.options.generateId({
          textContent: textContent ?? '',
        });
        const nextCount = (idCounts[baseId] ?? 0) + 1;
        idCounts[baseId] = nextCount;
        const candidateId = nextCount > 1 ? `${baseId}-${nextCount}` : baseId;

        node.attrs = {
          ...(node.attrs || {}),
          [this.options.attributeName]:
            node.attrs?.[this.options.attributeName] || candidateId,
        };
      }

      if (Array.isArray(node.content)) {
        for (const child of node.content) {
          processNode(child);
        }
      }
    };

    processNode(content);
    editor.options.content = content;
  },

  onCreate() {
    const { state, view } = this.editor;
    const tr = state.tr;
    let modified = false;

    const idCounts: Record<string, number> = {};

    state.doc.descendants((node, pos) => {
      if (this.options.types.includes(node.type.name)) {
        const currentId = node.attrs[this.options.attributeName] as
          | string
          | null;
        const baseId = this.options.generateId(node);
        const nextCount = (idCounts[baseId] ?? 0) + 1;
        idCounts[baseId] = nextCount;
        const candidateId = nextCount > 1 ? `${baseId}-${nextCount}` : baseId;

        if (!currentId || currentId !== candidateId) {
          tr.setNodeMarkup(pos, undefined, {
            ...node.attrs,
            [this.options.attributeName]: candidateId,
          });
          modified = true;
        }
      }
    });

    if (modified) {
      view.dispatch(tr);
    }
  },
});

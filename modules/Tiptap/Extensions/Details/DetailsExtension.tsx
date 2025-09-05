import { Node, mergeAttributes } from '@tiptap/core';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { DetailsNodeView } from './DetailsNodeView';

export interface DetailsOptions {
  HTMLAttributes: Record<string, any>;
}

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    details: {
      /**
       * Insert a details block
       */
      setDetails: (summary: string) => ReturnType;
      /**
       * Toggle a details block
       */
      toggleDetails: (summary: string) => ReturnType;
    };
  }
}

/**
 * Details extension for Tiptap
 * Creates collapsible content sections perfect for case studies
 *
 * @author @darianrosebrook
 */
export const DetailsExtension = Node.create<DetailsOptions>({
  name: 'details',

  addOptions() {
    return {
      HTMLAttributes: {},
    };
  },

  group: 'block',

  content: 'block+',

  addAttributes() {
    return {
      summary: {
        default: 'Details',
        parseHTML: (element) => element.getAttribute('data-summary'),
        renderHTML: (attributes) => {
          if (!attributes.summary) {
            return {};
          }
          return {
            'data-summary': attributes.summary,
          };
        },
      },
      open: {
        default: false,
        parseHTML: (element) => element.hasAttribute('open'),
        renderHTML: (attributes) => {
          if (!attributes.open) {
            return {};
          }
          return {
            open: attributes.open,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'details',
      },
    ];
  },

  renderHTML({ node, HTMLAttributes }) {
    const summary = node.attrs.summary || 'Details';

    return [
      'details',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        open: node.attrs.open,
        'data-summary': summary,
      }),
      ['summary', {}, summary],
      ['div', { class: 'details-content' }, 0],
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(DetailsNodeView);
  },

  addCommands() {
    return {
      setDetails:
        (summary: string) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              summary,
              open: false,
            },
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Add your content here...',
                  },
                ],
              },
            ],
          });
        },
      toggleDetails:
        (summary: string) =>
        ({ commands }) => {
          return commands.toggleNode(this.name, 'paragraph', {
            summary,
            open: false,
          });
        },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Shift-d': () => this.editor.commands.setDetails('Details'),
    };
  },
});

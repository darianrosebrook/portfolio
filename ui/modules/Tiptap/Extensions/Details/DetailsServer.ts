import { Node, mergeAttributes } from '@tiptap/core';

export interface DetailsOptions {
  HTMLAttributes: Record<string, any>;
}

/**
 * Server-safe Details node (no React NodeView)
 */
export const DetailsServer = Node.create<DetailsOptions>({
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
          if (!attributes.summary) return {};
          return { 'data-summary': attributes.summary };
        },
      },
      open: {
        default: false,
        parseHTML: (element) => element.hasAttribute('open'),
        renderHTML: (attributes) => {
          if (!attributes.open) return {};
          return { open: attributes.open };
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
});

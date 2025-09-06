import { Node, mergeAttributes } from '@tiptap/core';

export interface TableOfContentsOptions {
  HTMLAttributes: Record<string, any>;
  maxDepth: number;
  showNumbers: boolean;
  tocClass: string;
}

/**
 * Server-safe TableOfContents node (no React NodeView)
 */
export const TableOfContentsServer = Node.create<TableOfContentsOptions>({
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
        renderHTML: (attributes) => ({ 'data-max-depth': attributes.maxDepth }),
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
    // Leaf node: do not render a content hole (0). Render an empty container instead.
    return [
      'div',
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, {
        'data-type': 'table-of-contents',
        class: this.options.tocClass,
        'data-max-depth': node.attrs.maxDepth,
        'data-show-numbers': node.attrs.showNumbers,
      }),
    ];
  },
});

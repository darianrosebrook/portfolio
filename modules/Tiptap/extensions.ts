import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import { DetailsExtension } from './Extensions/Details/DetailsExtension';
import { TableOfContentsExtension } from './Extensions/TableOfContents/TableOfContentsExtension';
import { UniqueIdExtension } from './Extensions/UniqueId/UniqueIdExtension';
import { DragHandleExtension } from './Extensions/DragHandle/DragHandleExtension';

// import SlashCommand from './Extensions/SlashCommand';
// import CodeBlockComponent from './Extensions/CodeBlockExtended/CodeBlockComponent';
// import ImageExtended from './Extensions/ImageExtended/ImageExtended';

/**
 * Creates optimized Tiptap extensions configuration
 * This function was part of the bundle optimization to reduce initial load
 */
export const createExtensions = (_articleId?: string) => {
  return [
    StarterKit.configure({
      // Optimize by disabling unused features
      dropcursor: {
        color: 'var(--color-primary)',
        width: 2,
      },
    }),
    Image.configure({
      HTMLAttributes: {
        class: 'editor-image',
      },
    }),
    Underline,
    TextAlign.configure({
      types: ['heading', 'paragraph'],
    }),
    TextStyle,
    Color,
    Table.configure({
      resizable: true,
    }),
    TableRow,
    TableHeader,
    TableCell,
    Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') {
          return "What's the title?";
        }
        return 'Start writing or type "/" for commands...';
      },
    }),
    // Details extension for collapsible content sections
    DetailsExtension.configure({
      HTMLAttributes: {
        class: 'details-block',
      },
    }),
    // Table of Contents extension for auto-generating TOC
    TableOfContentsExtension.configure({
      HTMLAttributes: {
        class: 'table-of-contents-block',
      },
      maxDepth: 3,
      showNumbers: false,
    }),
    // Unique ID extension for adding IDs to headings
    UniqueIdExtension.configure({
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
    }),
    // Drag Handle extension for better content reordering
    DragHandleExtension.configure({
      draggableTypes: [
        'paragraph',
        'heading',
        'blockquote',
        'details',
        'tableOfContents',
      ],
      showDragHandles: true,
    }),
    // TODO: Re-enable extended features after fixing TypeScript issues
    // CodeBlockComponent,
    // SlashCommand.configure({
    //   articleId,
    // }),
  ];
};

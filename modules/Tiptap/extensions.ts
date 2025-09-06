import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import Color from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import { Table } from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableHeader from '@tiptap/extension-table-header';
import TableCell from '@tiptap/extension-table-cell';
import Dropcursor from '@tiptap/extension-dropcursor';
import Focus from '@tiptap/extension-focus';
import Link from '@tiptap/extension-link';
import Highlight from '@tiptap/extension-highlight';
import HorizontalRule from '@tiptap/extension-horizontal-rule';
import TaskList from '@tiptap/extension-task-list';
import TaskItem from '@tiptap/extension-task-item';
import { DetailsExtension } from './Extensions/Details/DetailsExtension';
import { TableOfContentsExtension } from './Extensions/TableOfContents/TableOfContentsExtension';
import { UniqueIdExtension } from './Extensions/UniqueId/UniqueIdExtension';
import { DragHandleExtension } from './Extensions/DragHandle/DragHandleExtension';
import { SlashCommand } from './Extensions/SlashCommand';
import { CodeBlockExtended } from './Extensions/CodeBlockExtended';
import { ImageExtended } from './Extensions/ImageExtended';
import { VideoExtended } from './Extensions/VideoExtended';

// import SlashCommand from './Extensions/SlashCommand';
// import CodeBlockComponent from './Extensions/CodeBlockExtended/CodeBlockComponent';
// import ImageExtended from './Extensions/ImageExtended/ImageExtended';

/**
 * Creates optimized Tiptap extensions configuration
 * This function was part of the bundle optimization to reduce initial load
 */
export const createExtensions = (articleId?: number) => {
  return [
    StarterKit.configure({ codeBlock: false }),
    Dropcursor.configure({
      color: 'var(--color-accent)',
      width: 2,
    }),
    Focus.configure({
      className: 'is-focused',
      mode: 'all',
    }),
    Link.configure({
      autolink: true,
      openOnClick: true,
      linkOnPaste: true,
      protocols: ['http', 'https', 'mailto'],
    }),
    Highlight,
    HorizontalRule,
    TaskList,
    TaskItem.configure({ nested: true }),
    ImageExtended.configure({
      bucket: 'article-images',
      getArticleId: () => articleId,
    }),
    VideoExtended.configure({
      bucket: 'article-videos',
      getArticleId: () => articleId,
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
        'image',
        'video',
      ],
      showDragHandles: true,
    }),
    CodeBlockExtended,
    SlashCommand,
  ];
};
